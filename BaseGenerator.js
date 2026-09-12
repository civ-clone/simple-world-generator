"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGenerator = void 0;
const Distribution_1 = require("@civ-clone/core-world-generator/Rules/Distribution");
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
const Types_1 = require("@civ-clone/core-terrain/Types");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TerrainRegistry_1 = require("@civ-clone/core-terrain/TerrainRegistry");
const DistributionGroups_1 = require("@civ-clone/core-world-generator/Rules/DistributionGroups");
const getNeighbours_1 = require("@civ-clone/core-world-generator/lib/getNeighbours");
const core_random_1 = require("@civ-clone/core-random");
class BaseGenerator extends Generator_1.Generator {
    constructor(height = 100, width = 160, options = {}, ruleRegistry = RuleRegistry_1.instance, terrainRegistry = TerrainRegistry_1.instance, randomNumberGenerator = core_random_1.instance) {
        super(height, width);
        const { landCoverage = 0.4, // % of surface covered with land
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
            .map(() => new Types_1.Water());
    }
    async generateIslands() {
        const height = this.height(), width = this.width(), maxIslandPercentage = this._landSize + this._randomNumberGenerator() * 0.2, landCoverage = this._landCoverage, maxIterations = this._maxIterations, maxIslandSize = Math.ceil(((height * width) / 100) * maxIslandPercentage), map = new Array(height * width).fill(0);
        while (map.length === 0 ||
            map.filter((value) => value === 1).length / map.length <
                landCoverage) {
            const seen = {}, currentIsland = [], toProcess = [], seedTile = Math.floor(height * width * this._randomNumberGenerator()), flagAsSeen = (id) => {
                if (!(id in seen)) {
                    seen[id] = 0;
                }
                seen[id]++;
            };
            map[seedTile] = 1;
            currentIsland.push(seedTile);
            flagAsSeen(seedTile);
            toProcess.push(...(0, getNeighbours_1.default)(height, width, seedTile));
            while (toProcess.length) {
                const currentTile = toProcess.shift();
                // ,
                //   distance = distanceFrom(height, width, seedTile, currentTile),
                //   surroundingLand = getNeighbours(height, width, currentTile, false).filter(
                //     (n: number): boolean => map[n] === 1
                //   );
                if ((seen[currentTile] || 0) <= maxIterations) {
                    if (this._randomNumberGenerator() > 0.3
                    // maxIslandPercentage >= Math.sqrt(distance) * this._randomNumberGenerator() ||
                    // surroundingLand.length * this._randomNumberGenerator() > 3
                    ) {
                        map[currentTile] = 1;
                        currentIsland.push(currentTile);
                        (0, getNeighbours_1.default)(height, width, currentTile)
                            .filter((tile) => toProcess.indexOf(tile) === -1)
                            .forEach((tile) => toProcess.push(tile));
                    }
                    else {
                        (0, getNeighbours_1.default)(height, width, currentTile).forEach((tile) => {
                            const index = toProcess.indexOf(tile);
                            if (index > -1) {
                                toProcess.splice(index, 1);
                            }
                        });
                    }
                    flagAsSeen(currentTile);
                }
                if (currentIsland.length > maxIslandSize ||
                    map.filter((value) => value === 1).length /
                        map.length >=
                        landCoverage) {
                    break;
                }
            }
            if (map.filter((value) => value === 1).length /
                map.length >=
                landCoverage) {
                break;
            }
        }
        this._map = map.map((value) => {
            if (value === 1) {
                return new Types_1.Land();
            }
            return new Types_1.Water();
        });
    }
    generate() {
        return this.generateIslands().then(() => this.populateTerrain().then(() => this._map));
    }
    getNeighbours(index, directNeighbours = true) {
        return (0, getNeighbours_1.default)(this.height(), this.width(), index, directNeighbours);
    }
    populateTerrain() {
        return new Promise((resolve) => {
            const rules = this._ruleRegistry.get(Distribution_1.Distribution);
            this._ruleRegistry
                .get(DistributionGroups_1.default)
                .filter((rule) => rule.validate())
                .map((rule) => {
                const result = rule.process();
                if (!result) {
                    throw new TypeError('Unexpected data from DistributionGroups.');
                }
                return result;
            })
                .forEach((group) => group.forEach((TerrainType) => rules
                .filter((rule) => rule.validate(TerrainType, this._map))
                .map((rule) => {
                const result = rule.process(TerrainType, this._map);
                if (!result) {
                    throw new TypeError('Unexpected data from Distribution.');
                }
                return result;
            })
                .forEach((distribution) => distribution.forEach(({ cluster = false, clusterChance = this._clusterChance, coverage = this._coverage, fill = false, from = 0, path = false, pathChance = this._pathChance, to = 1, }) => {
                const validIndices = Object.keys(this._map)
                    .map((index) => parseInt(index, 10))
                    .filter((index) => 
                // @ts-ignore
                this._map[index] instanceof TerrainType.__proto__)
                    .filter((index) => index >= from * this.height() * this.width() &&
                    index <= to * this.height() * this.width());
                if (fill) {
                    validIndices.forEach((index) => {
                        this._map[index] = new TerrainType();
                    });
                    return;
                }
                let max = validIndices.length * coverage;
                while (max > 0) {
                    const currentIndex = validIndices[Math.floor(this._randomNumberGenerator() * validIndices.length)];
                    this._map[currentIndex] = new TerrainType();
                    max--;
                    if (cluster) {
                        const clusteredNeighbours = this.getNeighbours(currentIndex).filter((index) => !(this._map[index] instanceof TerrainType));
                        while (clusteredNeighbours.length && max > 0) {
                            const index = clusteredNeighbours.shift();
                            if (clusterChance >=
                                this._randomNumberGenerator() /
                                    this.distanceFrom(currentIndex, index)) {
                                this._map[index] = new TerrainType();
                                max--;
                                clusteredNeighbours.push(...this.getNeighbours(index)
                                    .filter((index) => !(this._map[index] instanceof TerrainType))
                                    .filter((index) => this._map[index] instanceof
                                    // @ts-ignore
                                    TerrainType.__proto__)
                                    .filter((index) => !clusteredNeighbours.includes(index)));
                            }
                        }
                    }
                    if (path) {
                        let index = currentIndex;
                        while (pathChance >= this._randomNumberGenerator()) {
                            const candidates = this.getNeighbours(index).filter((index) => this._map[index] instanceof
                                // @ts-ignore
                                TerrainType.__proto__ &&
                                !(this._map[index] instanceof TerrainType));
                            index =
                                candidates[Math.floor(this._randomNumberGenerator() *
                                    candidates.length)];
                            this._map[index] = new TerrainType();
                            max--;
                        }
                    }
                }
            }))));
            resolve();
        });
    }
}
exports.BaseGenerator = BaseGenerator;
exports.default = BaseGenerator;
//# sourceMappingURL=BaseGenerator.js.map