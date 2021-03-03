"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _landCoverage, _landSize, _maxIterations, _clusterChance, _coverage, _pathChance, _map, _ruleRegistry, _terrainRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGenerator = void 0;
const Distribution_1 = require("@civ-clone/core-world-generator/Rules/Distribution");
const DistributionGroups_1 = require("@civ-clone/core-world-generator/Rules/DistributionGroups");
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
const Types_1 = require("@civ-clone/core-terrain/Types");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TerrainRegistry_1 = require("@civ-clone/core-terrain/TerrainRegistry");
const worker_threads_1 = require("worker_threads");
const getNeighbours_1 = require("@civ-clone/core-world-generator/lib/getNeighbours");
class BaseGenerator extends Generator_1.Generator {
    constructor(height = 100, width = 160, options = {}, ruleRegistry = RuleRegistry_1.instance, terrainRegistry = TerrainRegistry_1.instance) {
        super(height, width);
        _landCoverage.set(this, void 0); // % of surface covered with land
        _landSize.set(this, void 0); // average "size" of landmass
        _maxIterations.set(this, void 0); // number of times a tile can be tested to change to land
        _clusterChance.set(this, void 0); // chance for adjacent tiles to cluster
        _coverage.set(this, void 0); // default total coverage of terrain type
        _pathChance.set(this, void 0); // default chance for directly adjacent tiles to be part of the path
        _map.set(this, void 0);
        _ruleRegistry.set(this, void 0);
        _terrainRegistry.set(this, void 0);
        const { landCoverage = 0.4, // % of surface covered with land
        landSize = 0.2, // average "size" of landmass
        maxIterations = 20, // number of times a tile can be tested to change to land
        clusterChance = 0.05, // chance for adjacent tiles to cluster
        coverage = 0.1, // default total coverage of terrain type
        pathChance = 0.05, // default chance for directly adjacent tiles to be part of the path
         } = options;
        __classPrivateFieldSet(this, _landCoverage, landCoverage); // % of surface covered with land
        __classPrivateFieldSet(// % of surface covered with land
        this, _landSize, landSize); // average "size" of landmass
        __classPrivateFieldSet(// average "size" of landmass
        this, _maxIterations, maxIterations); // number of times a tile can be tested to change to land
        __classPrivateFieldSet(// number of times a tile can be tested to change to land
        this, _clusterChance, clusterChance); // chance for adjacent tiles to cluster
        __classPrivateFieldSet(// chance for adjacent tiles to cluster
        this, _coverage, coverage); // default total coverage of terrain type
        __classPrivateFieldSet(// default total coverage of terrain type
        this, _pathChance, pathChance); // default chance for directly adjacent tiles to be part of the path
        __classPrivateFieldSet(// default chance for directly adjacent tiles to be part of the path
        this, _ruleRegistry, ruleRegistry);
        __classPrivateFieldSet(this, _terrainRegistry, terrainRegistry);
        __classPrivateFieldSet(this, _map, new Array(this.height() * this.width())
            .fill(0)
            .map(() => new Types_1.Water()));
    }
    generateIslands() {
        return new Promise((resolve, reject) => {
            const worker = new worker_threads_1.Worker(__dirname + '/generateLand.js', {
                workerData: {
                    height: this.height(),
                    width: this.width(),
                    islandSize: __classPrivateFieldGet(this, _landSize) + Math.random() * 0.2,
                    landCoverage: __classPrivateFieldGet(this, _landCoverage),
                    maxIterations: __classPrivateFieldGet(this, _maxIterations),
                },
            });
            worker.on('error', (error) => reject(error));
            worker.on('messageerror', (error) => reject(error));
            worker.on('message', (mapData) => {
                __classPrivateFieldSet(this, _map, mapData.map((value) => {
                    if (value === 1) {
                        return new Types_1.Land();
                    }
                    return new Types_1.Water();
                }));
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
    generate() {
        return this.generateIslands().then(() => this.populateTerrain().then(() => __classPrivateFieldGet(this, _map)));
    }
    getNeighbours(index, directNeighbours = true) {
        return getNeighbours_1.default(this.height(), this.width(), index, directNeighbours);
    }
    populateTerrain() {
        return new Promise((resolve) => {
            const rules = __classPrivateFieldGet(this, _ruleRegistry).get(Distribution_1.Distribution);
            __classPrivateFieldGet(this, _ruleRegistry)
                .get(DistributionGroups_1.DistributionGroups)
                .filter((rule) => rule.validate())
                .map((rule) => {
                const result = rule.process();
                if (!result) {
                    throw new TypeError('Unexpected data from DistributionGroups.');
                }
                return result;
            })
                .forEach((group) => group.forEach((TerrainType) => rules
                .filter((rule) => rule.validate(TerrainType, __classPrivateFieldGet(this, _map)))
                .map((rule) => {
                const result = rule.process(TerrainType, __classPrivateFieldGet(this, _map));
                if (!result) {
                    throw new TypeError('Unexpected data from Distribution.');
                }
                return result;
            })
                .forEach((distribution) => distribution.forEach(({ cluster = false, clusterChance = __classPrivateFieldGet(this, _clusterChance), coverage = __classPrivateFieldGet(this, _coverage), fill = false, from = 0, path = false, pathChance = __classPrivateFieldGet(this, _pathChance), to = 1, }) => {
                const validIndices = Object.keys(__classPrivateFieldGet(this, _map))
                    .map((index) => parseInt(index, 10))
                    .filter((index) => 
                // @ts-ignore
                __classPrivateFieldGet(this, _map)[index] instanceof TerrainType.__proto__)
                    .filter((index) => index >= from * this.height() * this.width() &&
                    index <= to * this.height() * this.width());
                if (fill) {
                    validIndices.forEach((index) => {
                        __classPrivateFieldGet(this, _map)[index] = new TerrainType();
                    });
                    return;
                }
                let max = validIndices.length * coverage;
                while (max > 0) {
                    const currentIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
                    __classPrivateFieldGet(this, _map)[currentIndex] = new TerrainType();
                    max--;
                    if (cluster) {
                        const clusteredNeighbours = this.getNeighbours(currentIndex).filter((index) => !(__classPrivateFieldGet(this, _map)[index] instanceof TerrainType));
                        while (clusteredNeighbours.length) {
                            const index = clusteredNeighbours.shift();
                            if (clusterChance >=
                                Math.random() /
                                    this.distanceFrom(currentIndex, index)) {
                                __classPrivateFieldGet(this, _map)[index] = new TerrainType();
                                max--;
                                clusteredNeighbours.push(...this.getNeighbours(index)
                                    .filter((index) => !(__classPrivateFieldGet(this, _map)[index] instanceof TerrainType))
                                    .filter((index) => __classPrivateFieldGet(this, _map)[index] instanceof
                                    // @ts-ignore
                                    TerrainType.__proto__)
                                    .filter((index) => !clusteredNeighbours.includes(index)));
                            }
                        }
                    }
                    if (path) {
                        let index = currentIndex;
                        while (pathChance >= Math.random()) {
                            const candidates = this.getNeighbours(index).filter((index) => __classPrivateFieldGet(this, _map)[index] instanceof
                                // @ts-ignore
                                TerrainType.__proto__ &&
                                !(__classPrivateFieldGet(this, _map)[index] instanceof TerrainType));
                            index =
                                candidates[Math.floor(Math.random() * candidates.length)];
                            __classPrivateFieldGet(this, _map)[index] = new TerrainType();
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
_landCoverage = new WeakMap(), _landSize = new WeakMap(), _maxIterations = new WeakMap(), _clusterChance = new WeakMap(), _coverage = new WeakMap(), _pathChance = new WeakMap(), _map = new WeakMap(), _ruleRegistry = new WeakMap(), _terrainRegistry = new WeakMap();
exports.default = BaseGenerator;
//# sourceMappingURL=BaseGenerator.js.map