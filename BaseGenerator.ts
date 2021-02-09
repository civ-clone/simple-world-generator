import { Land, Water } from '@civ-clone/core-terrain/Types';
import Terrain from '@civ-clone/core-terrain/Terrain';
import {
  Generator,
  IGenerator,
} from '@civ-clone/core-world-generator/Generator';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Distribution,
  IDistribution,
  IDistributionRegistry,
} from '@civ-clone/core-world-generator/Rules/Distribution';
import {
  DistributionGroups,
  IDistributionGroupsRegistry,
} from '@civ-clone/core-world-generator/Rules/DistributionGroups';

export class BaseGenerator extends Generator implements IGenerator {
  #chanceToBecomeLand: number;
  #clusterChance: number;
  #coverage: number;
  #landCoverage: number;
  #landMassReductionScale: number;
  #map: Terrain[];
  #maxIterations: number;
  #pathChance: number;
  #ruleRegistry: RuleRegistry;

  constructor({
    coverage = 0.1,
    chanceToBecomeLand = 5,
    clusterChance = 0.05,
    height = 100,
    landCoverage = 0.66,
    landMassReductionScale = 3,
    maxIterations = 1,
    pathChance = 0.05,
    rulesRegistry = ruleRegistryInstance,
    width = 160,
  }: {
    coverage?: number;
    chanceToBecomeLand?: number;
    clusterChance?: number;
    height?: number;
    landCoverage?: number;
    landMassReductionScale?: number;
    maxIterations?: number;
    pathChance?: number;
    rulesRegistry?: RuleRegistry;
    width?: number;
  } = {}) {
    super(height, width);

    this.#chanceToBecomeLand = chanceToBecomeLand; // chance to become land
    this.#clusterChance = clusterChance; // chance for adjacent tiles to cluster
    this.#coverage = coverage; // total coverage of terrain type
    this.#landCoverage = landCoverage; // total coverage required
    this.#landMassReductionScale = landMassReductionScale;
    this.#maxIterations = maxIterations; // number of times a tile can be tested to change to land
    this.#pathChance = pathChance; // chance for directly adjacent tiles to be part of the path
    this.#ruleRegistry = rulesRegistry;

    this.#map = new Array(this.height() * this.width())
      .fill(0)
      .map(() => new Water());
  }

  generateLand(): Terrain[] {
    const seen: { [key: number]: number } = {},
      toProcess: number[] = [],
      seedTile: number = Math.floor(
        this.height() * this.width() * Math.random()
      ),
      flagAsSeen: (id: number) => void = (id: number): void => {
        if (!(id in seen)) {
          seen[id] = 0;
        }

        seen[id]++;
      };
    this.#map[seedTile] = new Land();

    flagAsSeen(seedTile);

    toProcess.push(...this.getNeighbours(seedTile));

    while (toProcess.length) {
      const currentTile = toProcess.shift() as number;

      if (!seen[currentTile] || seen[currentTile] < this.#maxIterations) {
        const distance = this.distanceFrom(seedTile, currentTile);

        if (
          this.#chanceToBecomeLand / distance >= Math.random() ||
          this.getNeighbours(currentTile, false).reduce(
            (total: number, n: number): number =>
              total + (this.#map[n] instanceof Land ? 1 : 0),
            0
          ) > 5
        ) {
          this.#map[currentTile] = new Land();

          toProcess.push(...this.getNeighbours(currentTile));
        }

        flagAsSeen(currentTile);
      }
    }

    const land = this.#map.filter(
      (tile: Terrain): boolean => tile instanceof Land
    ).length;
    if (land / this.#map.length >= this.#landCoverage) {
      return this.#map;
    }

    return this.generateLand();
  }

  generate(): Terrain[] {
    this.generateLand();
    this.populateTerrain();

    return this.#map;
  }

  getNeighbours(index: number, directNeighbours: boolean = true): number[] {
    const [x, y] = this.indexToCoords(index),
      n = this.coordsToIndex(x, y - 1),
      ne = this.coordsToIndex(x + 1, y - 1),
      e = this.coordsToIndex(x + 1, y),
      se = this.coordsToIndex(x + 1, y),
      s = this.coordsToIndex(x, y + 1),
      sw = this.coordsToIndex(x - 1, y + 1),
      w = this.coordsToIndex(x - 1, y),
      nw = this.coordsToIndex(x - 1, y - 1);
    return directNeighbours ? [n, e, s, w] : [n, ne, e, se, s, sw, w, nw];
  }

  populateTerrain(): void {
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
                          Math.random() / this.distanceFrom(currentIndex, index)
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
                                  !!clusteredNeighbours.includes(index)
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
  }
}

export default BaseGenerator;
