import {
  Distribution,
  IDistribution,
  IDistributionRegistry,
} from '@civ-clone/core-world-generator/Rules/Distribution';
import {
  DistributionGroups,
  IDistributionGroupsRegistry,
} from '@civ-clone/core-world-generator/Rules/DistributionGroups';
import {
  Generator,
  IGenerator,
} from '@civ-clone/core-world-generator/Generator';
import { Land, Water } from '@civ-clone/core-terrain/Types';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TerrainRegistry,
  instance as terrainRegistryInstance,
} from '@civ-clone/core-terrain/TerrainRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import { Worker } from 'worker_threads';
import getNeighbours from '@civ-clone/core-world-generator/lib/getNeighbours';

export type IOptions = {
  landCoverage?: number; // % of surface covered with land
  landSize?: number; // average "size" of landmass
  maxIterations?: number; // number of times a tile can be tested to change to land
  clusterChance?: number; // chance for adjacent tiles to cluster
  coverage?: number; // default total coverage of terrain type
  pathChance?: number; // default chance for directly adjacent tiles to be part of the path
};

export class BaseGenerator extends Generator implements IGenerator {
  #landCoverage: number; // % of surface covered with land
  #landSize: number; // average "size" of landmass
  #maxIterations: number; // number of times a tile can be tested to change to land
  #clusterChance: number; // chance for adjacent tiles to cluster
  #coverage: number; // default total coverage of terrain type
  #pathChance: number; // default chance for directly adjacent tiles to be part of the path
  #map: Terrain[];
  #ruleRegistry: RuleRegistry;
  #terrainRegistry: TerrainRegistry;

  constructor(
    height: number = 100,
    width: number = 160,
    options: IOptions = {},
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    terrainRegistry: TerrainRegistry = terrainRegistryInstance
  ) {
    super(height, width);

    const {
      landCoverage = 0.4, // % of surface covered with land
      landSize = 0.2, // average "size" of landmass
      maxIterations = 20, // number of times a tile can be tested to change to land
      clusterChance = 0.05, // chance for adjacent tiles to cluster
      coverage = 0.1, // default total coverage of terrain type
      pathChance = 0.05, // default chance for directly adjacent tiles to be part of the path
    } = options;

    this.#landCoverage = landCoverage; // % of surface covered with land
    this.#landSize = landSize; // average "size" of landmass
    this.#maxIterations = maxIterations; // number of times a tile can be tested to change to land
    this.#clusterChance = clusterChance; // chance for adjacent tiles to cluster
    this.#coverage = coverage; // default total coverage of terrain type
    this.#pathChance = pathChance; // default chance for directly adjacent tiles to be part of the path
    this.#ruleRegistry = ruleRegistry;
    this.#terrainRegistry = terrainRegistry;

    this.#map = new Array(this.height() * this.width())
      .fill(0)
      .map(() => new Water());
  }

  generateIslands(): Promise<void> {
    return new Promise<void>((resolve, reject): void => {
      const worker = new Worker(__dirname + '/generateLand.js', {
        workerData: {
          height: this.height(),
          width: this.width(),
          islandSize: this.#landSize + Math.random() * 0.2,
          landCoverage: this.#landCoverage,
          maxIterations: this.#maxIterations,
        },
      });

      worker.on('error', (error) => reject(error));
      worker.on('messageerror', (error) => reject(error));

      worker.on('message', (mapData: number[]) => {
        this.#map = mapData.map((value) => {
          if (value === 1) {
            return new Land();
          }

          return new Water();
        });

        resolve();
      });

      // while (
      //   this.#map.filter((tile: Terrain): boolean => tile instanceof Land)
      //     .length /
      //     this.#map.length <
      //   this.#landCoverage
      // ) {
      //
      //   const islandSize = this.#landSize + Math.random() * 0.2,
      //     seen: { [key: number]: number } = {},
      //     toProcess: number[] = [],
      //     seedTile: number = Math.floor(
      //       this.height() * this.width() * Math.random()
      //     ),
      //     flagAsSeen: (id: number) => void = (id: number): void => {
      //       if (!(id in seen)) {
      //         seen[id] = 0;
      //       }
      //
      //       seen[id]++;
      //     };
      //
      //   this.#map[seedTile] = new Land();
      //
      //   flagAsSeen(seedTile);
      //
      //   toProcess.push(...this.getNeighbours(seedTile));
      //
      //   while (toProcess.length) {
      //     const currentTile = toProcess.shift() as number,
      //       distance = this.distanceFrom(seedTile, currentTile),
      //       surroundingLand = this.getNeighbours(currentTile, false).filter(
      //         (n: number): boolean => this.#map[n] instanceof Land
      //       );
      //
      //     if ((seen[currentTile] || 0) <= this.#maxIterations) {
      //       if (
      //         islandSize >= Math.sqrt(distance) * Math.random() ||
      //         surroundingLand.length * Math.random() > 3
      //       ) {
      //         this.#map[currentTile] = new Land();
      //
      //         this.getNeighbours(currentTile)
      //           .filter((tile) => toProcess.indexOf(tile) === -1)
      //           .forEach((tile) => toProcess.push(tile));
      //       } else {
      //         this.getNeighbours(currentTile).forEach((tile) => {
      //           const index = toProcess.indexOf(tile);
      //
      //           if (index > -1) {
      //             toProcess.splice(index, 1);
      //           }
      //         });
      //       }
      //
      //       flagAsSeen(currentTile);
      //     }
      //
      //     if (
      //       this.#map.filter((tile: Terrain): boolean => tile instanceof Land)
      //         .length /
      //         this.#map.length >=
      //       this.#landCoverage
      //     ) {
      //       return resolve();
      //     }
      //   }
      // }
      //
      // resolve();
    });
  }

  generate(): Promise<Terrain[]> {
    return this.generateIslands().then(
      (): Promise<Terrain[]> =>
        this.populateTerrain().then((): Terrain[] => this.#map)
    );
  }

  getNeighbours(index: number, directNeighbours: boolean = true): number[] {
    return getNeighbours(this.height(), this.width(), index, directNeighbours);
  }

  populateTerrain(): Promise<void> {
    return new Promise<void>((resolve) => {
      const rules = (this.#ruleRegistry as IDistributionRegistry).get(
        Distribution
      );

      (this.#ruleRegistry as IDistributionGroupsRegistry)
        .get(DistributionGroups)
        .filter((rule: DistributionGroups): boolean => rule.validate())
        .map((rule: DistributionGroups): typeof Terrain[] => {
          const result = rule.process();

          if (!result) {
            throw new TypeError('Unexpected data from DistributionGroups.');
          }

          return result;
        })
        .forEach((group: typeof Terrain[]): void =>
          group.forEach((TerrainType: typeof Terrain): void =>
            rules
              .filter((rule: Distribution): boolean =>
                rule.validate(TerrainType, this.#map)
              )
              .map((rule: Distribution): IDistribution[] => {
                const result = rule.process(TerrainType, this.#map);

                if (!result) {
                  throw new TypeError('Unexpected data from Distribution.');
                }

                return result;
              })
              .forEach((distribution: IDistribution[]): void =>
                distribution.forEach(
                  ({
                    cluster = false,
                    clusterChance = this.#clusterChance,
                    coverage = this.#coverage,
                    fill = false,
                    from = 0,
                    path = false,
                    pathChance = this.#pathChance,
                    to = 1,
                  }) => {
                    const validIndices = Object.keys(this.#map)
                      .map((index: string): number => parseInt(index, 10))
                      .filter(
                        (index: number): boolean =>
                          // @ts-ignore
                          this.#map[index] instanceof TerrainType.__proto__
                      )
                      .filter(
                        (index: number): boolean =>
                          index >= from * this.height() * this.width() &&
                          index <= to * this.height() * this.width()
                      );

                    if (fill) {
                      validIndices.forEach((index: number): void => {
                        this.#map[index] = new TerrainType();
                      });

                      return;
                    }

                    let max: number = validIndices.length * coverage;

                    while (max > 0) {
                      const currentIndex: number =
                        validIndices[
                          Math.floor(Math.random() * validIndices.length)
                        ];

                      this.#map[currentIndex] = new TerrainType();
                      max--;

                      if (cluster) {
                        const clusteredNeighbours: number[] = this.getNeighbours(
                          currentIndex
                        ).filter(
                          (index: number): boolean =>
                            !(this.#map[index] instanceof TerrainType)
                        );
                        while (clusteredNeighbours.length) {
                          const index = clusteredNeighbours.shift() as number;

                          if (
                            clusterChance >=
                            Math.random() /
                              this.distanceFrom(currentIndex, index)
                          ) {
                            this.#map[index] = new TerrainType();
                            max--;

                            clusteredNeighbours.push(
                              ...this.getNeighbours(index)
                                .filter(
                                  (index: number): boolean =>
                                    !(this.#map[index] instanceof TerrainType)
                                )
                                .filter(
                                  (index: number): boolean =>
                                    this.#map[index] instanceof
                                    // @ts-ignore
                                    TerrainType.__proto__
                                )
                                .filter(
                                  (index: number): boolean =>
                                    !clusteredNeighbours.includes(index)
                                )
                            );
                          }
                        }
                      }

                      if (path) {
                        let index = currentIndex;

                        while (pathChance >= Math.random()) {
                          const candidates: number[] = this.getNeighbours(
                            index
                          ).filter(
                            (index: number): boolean =>
                              this.#map[index] instanceof
                                // @ts-ignore
                                TerrainType.__proto__ &&
                              !(this.#map[index] instanceof TerrainType)
                          );
                          index =
                            candidates[
                              Math.floor(Math.random() * candidates.length)
                            ];

                          this.#map[index] = new TerrainType();
                          max--;
                        }
                      }
                    }
                  }
                )
              )
          )
        );

      resolve();
    });
  }
}

export default BaseGenerator;
