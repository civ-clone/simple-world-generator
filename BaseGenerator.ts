import {
  Distribution,
  IDistribution,
} from '@civ-clone/core-world-generator/Rules/Distribution';
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
import DistributionGroups from '@civ-clone/core-world-generator/Rules/DistributionGroups';
import Terrain from '@civ-clone/core-terrain/Terrain';
import { instance as rngInstance } from '@civ-clone/core-random';

export type IOptions = {
  landCoverage?: number; // % of surface covered with land
  landSize?: number; // average "size" of landmass
  maxIterations?: number; // number of times a tile can be tested to change to land
  clusterChance?: number; // chance for adjacent tiles to cluster
  coverage?: number; // default total coverage of terrain type
  pathChance?: number; // default chance for directly adjacent tiles to be part of the path
  topologyId?: string; // the grid's shape, as `Generator`'s `topologyId` option ('square' by default)
};

export class BaseGenerator extends Generator implements IGenerator {
  private _landCoverage: number; // % of surface covered with land
  private _landSize: number; // average "size" of landmass
  private _maxIterations: number; // number of times a tile can be tested to change to land
  private _clusterChance: number; // chance for adjacent tiles to cluster
  private _coverage: number; // default total coverage of terrain type
  private _pathChance: number; // default chance for directly adjacent tiles to be part of the path
  private _map: Terrain[];
  private _randomNumberGenerator: () => number;
  private _ruleRegistry: RuleRegistry;
  private _terrainRegistry: TerrainRegistry;

  constructor(
    height: number = 100,
    width: number = 160,
    options: IOptions = {},
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    terrainRegistry: TerrainRegistry = terrainRegistryInstance,
    randomNumberGenerator: () => number = rngInstance
  ) {
    // `Generator` builds the grid from the `topologyId` option.
    super(height, width, options);

    const {
      landCoverage = 0.4, // % of surface covered with land
      landSize = 0.2, // average "size" of landmass
      maxIterations = 10, // number of times a tile can be tested to change to land
      clusterChance = 0.05, // chance for adjacent tiles to cluster
      coverage = 0.25, // default total coverage of terrain type
      pathChance = 0.05, // default chance for directly adjacent tiles to be part of the path
    } = options;

    this._landCoverage = landCoverage; // % of surface covered with land
    this._landSize = landSize; // average "size" of landmass
    this._maxIterations = maxIterations; // number of times a tile can be tested to change to land
    this._clusterChance = clusterChance; // chance for adjacent tiles to cluster
    this._coverage = coverage; // default total coverage of terrain type
    this._pathChance = pathChance; // default chance for directly adjacent tiles to be part of the path
    this._ruleRegistry = ruleRegistry;
    this._terrainRegistry = terrainRegistry;
    this._randomNumberGenerator = randomNumberGenerator;

    this._map = new Array(this.height() * this.width())
      .fill(0)
      .map(() => new Water());
  }

  async generateIslands(): Promise<void> {
    const height = this.height(),
      width = this.width(),
      maxIslandPercentage =
        this._landSize + this._randomNumberGenerator() * 0.2,
      landCoverage = this._landCoverage,
      maxIterations = this._maxIterations,
      maxIslandSize = Math.ceil(((height * width) / 100) * maxIslandPercentage),
      map: number[] = new Array(height * width).fill(0);

    while (
      map.length === 0 ||
      map.filter((value: number): boolean => value === 1).length / map.length <
        landCoverage
    ) {
      const seen: { [key: number]: number } = {},
        currentIsland: number[] = [],
        toProcess: number[] = [],
        seedTile: number = Math.floor(
          height * width * this._randomNumberGenerator()
        ),
        flagAsSeen: (id: number) => void = (id: number): void => {
          if (!(id in seen)) {
            seen[id] = 0;
          }

          seen[id]++;
        };

      map[seedTile] = 1;
      currentIsland.push(seedTile);

      flagAsSeen(seedTile);

      toProcess.push(...this.getNeighbours(seedTile));

      while (toProcess.length) {
        const currentTile = toProcess.shift() as number;
        // ,
        //   distance = this.distanceFrom(seedTile, currentTile),
        //   surroundingLand = this.getNeighbours(currentTile, false).filter(
        //     (n: number): boolean => map[n] === 1
        //   );

        if ((seen[currentTile] || 0) <= maxIterations) {
          if (
            this._randomNumberGenerator() > 0.3
            // maxIslandPercentage >= Math.sqrt(distance) * this._randomNumberGenerator() ||
            // surroundingLand.length * this._randomNumberGenerator() > 3
          ) {
            map[currentTile] = 1;
            currentIsland.push(currentTile);

            this.getNeighbours(currentTile)
              .filter((tile) => toProcess.indexOf(tile) === -1)
              .forEach((tile) => toProcess.push(tile));
          } else {
            this.getNeighbours(currentTile).forEach((tile) => {
              const index = toProcess.indexOf(tile);

              if (index > -1) {
                toProcess.splice(index, 1);
              }
            });
          }

          flagAsSeen(currentTile);
        }

        if (
          currentIsland.length > maxIslandSize ||
          map.filter((value: number): boolean => value === 1).length /
            map.length >=
            landCoverage
        ) {
          break;
        }
      }

      if (
        map.filter((value: number): boolean => value === 1).length /
          map.length >=
        landCoverage
      ) {
        break;
      }
    }

    this._map = map.map((value) => {
      if (value === 1) {
        return new Land();
      }

      return new Water();
    });
  }

  generate(): Promise<Terrain[]> {
    return this.generateIslands().then(
      (): Promise<Terrain[]> =>
        this.populateTerrain().then((): Terrain[] => this._map)
    );
  }

  populateTerrain(): Promise<void> {
    return new Promise<void>((resolve) => {
      const rules = this._ruleRegistry.get(Distribution);

      this._ruleRegistry
        .get(DistributionGroups)
        .filter((rule: DistributionGroups): boolean => rule.validate())
        .map((rule: DistributionGroups): (typeof Terrain)[] => {
          const result = rule.process();

          if (!result) {
            throw new TypeError('Unexpected data from DistributionGroups.');
          }

          return result;
        })
        .forEach((group: (typeof Terrain)[]): void =>
          group.forEach((TerrainType: typeof Terrain): void =>
            rules
              .filter((rule: Distribution): boolean =>
                rule.validate(TerrainType, this._map)
              )
              .map((rule: Distribution): IDistribution[] => {
                const result = rule.process(TerrainType, this._map);

                if (!result) {
                  throw new TypeError('Unexpected data from Distribution.');
                }

                return result;
              })
              .forEach((distribution: IDistribution[]): void =>
                distribution.forEach(
                  ({
                    cluster = false,
                    clusterChance = this._clusterChance,
                    coverage = this._coverage,
                    fill = false,
                    from = 0,
                    path = false,
                    pathChance = this._pathChance,
                    to = 1,
                  }) => {
                    const validIndices = Object.keys(this._map)
                      .map((index: string): number => parseInt(index, 10))
                      .filter(
                        (index: number): boolean =>
                          // @ts-ignore
                          this._map[index] instanceof TerrainType.__proto__
                      )
                      .filter(
                        (index: number): boolean =>
                          index >= from * this.height() * this.width() &&
                          index <= to * this.height() * this.width()
                      );

                    if (fill) {
                      validIndices.forEach((index: number): void => {
                        this._map[index] = new TerrainType();
                      });

                      return;
                    }

                    let max: number = validIndices.length * coverage;

                    while (max > 0) {
                      const currentIndex: number =
                        validIndices[
                          Math.floor(
                            this._randomNumberGenerator() * validIndices.length
                          )
                        ];

                      this._map[currentIndex] = new TerrainType();
                      max--;

                      if (cluster) {
                        const clusteredNeighbours: number[] =
                          this.getNeighbours(currentIndex).filter(
                            (index: number): boolean =>
                              !(this._map[index] instanceof TerrainType)
                          );
                        while (clusteredNeighbours.length && max > 0) {
                          const index = clusteredNeighbours.shift() as number;

                          if (
                            clusterChance >=
                            this._randomNumberGenerator() /
                              this.distanceFrom(currentIndex, index)
                          ) {
                            this._map[index] = new TerrainType();
                            max--;

                            clusteredNeighbours.push(
                              ...this.getNeighbours(index)
                                .filter(
                                  (index: number): boolean =>
                                    !(this._map[index] instanceof TerrainType)
                                )
                                .filter(
                                  (index: number): boolean =>
                                    this._map[index] instanceof
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

                        while (pathChance >= this._randomNumberGenerator()) {
                          const candidates: number[] = this.getNeighbours(
                            index
                          ).filter(
                            (index: number): boolean =>
                              this._map[index] instanceof
                                // @ts-ignore
                                TerrainType.__proto__ &&
                              !(this._map[index] instanceof TerrainType)
                          );
                          index =
                            candidates[
                              Math.floor(
                                this._randomNumberGenerator() *
                                  candidates.length
                              )
                            ];

                          this._map[index] = new TerrainType();
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
