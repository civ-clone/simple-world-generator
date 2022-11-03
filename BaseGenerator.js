"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BaseGenerator_landCoverage, _BaseGenerator_landSize, _BaseGenerator_maxIterations, _BaseGenerator_clusterChance, _BaseGenerator_coverage, _BaseGenerator_pathChance, _BaseGenerator_map, _BaseGenerator_randomNumberGenerator, _BaseGenerator_ruleRegistry, _BaseGenerator_terrainRegistry;
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
    constructor(height = 100, width = 160, options = {}, ruleRegistry = RuleRegistry_1.instance, terrainRegistry = TerrainRegistry_1.instance, randomNumberGenerator = () => Math.random()) {
        super(height, width);
        _BaseGenerator_landCoverage.set(this, void 0); // % of surface covered with land
        _BaseGenerator_landSize.set(this, void 0); // average "size" of landmass
        _BaseGenerator_maxIterations.set(this, void 0); // number of times a tile can be tested to change to land
        _BaseGenerator_clusterChance.set(this, void 0); // chance for adjacent tiles to cluster
        _BaseGenerator_coverage.set(this, void 0); // default total coverage of terrain type
        _BaseGenerator_pathChance.set(this, void 0); // default chance for directly adjacent tiles to be part of the path
        _BaseGenerator_map.set(this, void 0);
        _BaseGenerator_randomNumberGenerator.set(this, void 0);
        _BaseGenerator_ruleRegistry.set(this, void 0);
        _BaseGenerator_terrainRegistry.set(this, void 0);
        const { landCoverage = 0.4, // % of surface covered with land
        landSize = 0.2, // average "size" of landmass
        maxIterations = 10, // number of times a tile can be tested to change to land
        clusterChance = 0.05, // chance for adjacent tiles to cluster
        coverage = 0.25, // default total coverage of terrain type
        pathChance = 0.05, // default chance for directly adjacent tiles to be part of the path
         } = options;
        __classPrivateFieldSet(this, _BaseGenerator_landCoverage, landCoverage, "f"); // % of surface covered with land
        __classPrivateFieldSet(this, _BaseGenerator_landSize, landSize, "f"); // average "size" of landmass
        __classPrivateFieldSet(this, _BaseGenerator_maxIterations, maxIterations, "f"); // number of times a tile can be tested to change to land
        __classPrivateFieldSet(this, _BaseGenerator_clusterChance, clusterChance, "f"); // chance for adjacent tiles to cluster
        __classPrivateFieldSet(this, _BaseGenerator_coverage, coverage, "f"); // default total coverage of terrain type
        __classPrivateFieldSet(this, _BaseGenerator_pathChance, pathChance, "f"); // default chance for directly adjacent tiles to be part of the path
        __classPrivateFieldSet(this, _BaseGenerator_ruleRegistry, ruleRegistry, "f");
        __classPrivateFieldSet(this, _BaseGenerator_terrainRegistry, terrainRegistry, "f");
        __classPrivateFieldSet(this, _BaseGenerator_randomNumberGenerator, randomNumberGenerator, "f");
        __classPrivateFieldSet(this, _BaseGenerator_map, new Array(this.height() * this.width())
            .fill(0)
            .map(() => new Types_1.Water()), "f");
    }
    generateIslands() {
        return new Promise((resolve, reject) => {
            const worker = new worker_threads_1.Worker(__dirname + '/generateLand.js', {
                workerData: {
                    height: this.height(),
                    width: this.width(),
                    islandSize: __classPrivateFieldGet(this, _BaseGenerator_landSize, "f") + __classPrivateFieldGet(this, _BaseGenerator_randomNumberGenerator, "f").call(this) * 0.2,
                    landCoverage: __classPrivateFieldGet(this, _BaseGenerator_landCoverage, "f"),
                    maxIterations: __classPrivateFieldGet(this, _BaseGenerator_maxIterations, "f"),
                },
            });
            worker.on('error', (error) => reject(error));
            worker.on('messageerror', (error) => reject(error));
            worker.on('message', (mapData) => {
                __classPrivateFieldSet(this, _BaseGenerator_map, mapData.map((value) => {
                    if (value === 1) {
                        return new Types_1.Land();
                    }
                    return new Types_1.Water();
                }), "f");
                resolve();
            });
        });
    }
    generate() {
        return this.generateIslands().then(() => this.populateTerrain().then(() => __classPrivateFieldGet(this, _BaseGenerator_map, "f")));
    }
    getNeighbours(index, directNeighbours = true) {
        return (0, getNeighbours_1.default)(this.height(), this.width(), index, directNeighbours);
    }
    populateTerrain() {
        return new Promise((resolve) => {
            const rules = __classPrivateFieldGet(this, _BaseGenerator_ruleRegistry, "f").get(Distribution_1.Distribution);
            __classPrivateFieldGet(this, _BaseGenerator_ruleRegistry, "f")
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
                .filter((rule) => rule.validate(TerrainType, __classPrivateFieldGet(this, _BaseGenerator_map, "f")))
                .map((rule) => {
                const result = rule.process(TerrainType, __classPrivateFieldGet(this, _BaseGenerator_map, "f"));
                if (!result) {
                    throw new TypeError('Unexpected data from Distribution.');
                }
                return result;
            })
                .forEach((distribution) => distribution.forEach(({ cluster = false, clusterChance = __classPrivateFieldGet(this, _BaseGenerator_clusterChance, "f"), coverage = __classPrivateFieldGet(this, _BaseGenerator_coverage, "f"), fill = false, from = 0, path = false, pathChance = __classPrivateFieldGet(this, _BaseGenerator_pathChance, "f"), to = 1, }) => {
                const validIndices = Object.keys(__classPrivateFieldGet(this, _BaseGenerator_map, "f"))
                    .map((index) => parseInt(index, 10))
                    .filter((index) => 
                // @ts-ignore
                __classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] instanceof TerrainType.__proto__)
                    .filter((index) => index >= from * this.height() * this.width() &&
                    index <= to * this.height() * this.width());
                if (fill) {
                    validIndices.forEach((index) => {
                        __classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] = new TerrainType();
                    });
                    return;
                }
                let max = validIndices.length * coverage;
                while (max > 0) {
                    const currentIndex = validIndices[Math.floor(__classPrivateFieldGet(this, _BaseGenerator_randomNumberGenerator, "f").call(this) * validIndices.length)];
                    __classPrivateFieldGet(this, _BaseGenerator_map, "f")[currentIndex] = new TerrainType();
                    max--;
                    if (cluster) {
                        const clusteredNeighbours = this.getNeighbours(currentIndex).filter((index) => !(__classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] instanceof TerrainType));
                        while (clusteredNeighbours.length && max > 0) {
                            const index = clusteredNeighbours.shift();
                            if (clusterChance >=
                                __classPrivateFieldGet(this, _BaseGenerator_randomNumberGenerator, "f").call(this) /
                                    this.distanceFrom(currentIndex, index)) {
                                __classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] = new TerrainType();
                                max--;
                                clusteredNeighbours.push(...this.getNeighbours(index)
                                    .filter((index) => !(__classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] instanceof TerrainType))
                                    .filter((index) => __classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] instanceof
                                    // @ts-ignore
                                    TerrainType.__proto__)
                                    .filter((index) => !clusteredNeighbours.includes(index)));
                            }
                        }
                    }
                    if (path) {
                        let index = currentIndex;
                        while (pathChance >= __classPrivateFieldGet(this, _BaseGenerator_randomNumberGenerator, "f").call(this)) {
                            const candidates = this.getNeighbours(index).filter((index) => __classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] instanceof
                                // @ts-ignore
                                TerrainType.__proto__ &&
                                !(__classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] instanceof TerrainType));
                            index =
                                candidates[Math.floor(__classPrivateFieldGet(this, _BaseGenerator_randomNumberGenerator, "f").call(this) *
                                    candidates.length)];
                            __classPrivateFieldGet(this, _BaseGenerator_map, "f")[index] = new TerrainType();
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
_BaseGenerator_landCoverage = new WeakMap(), _BaseGenerator_landSize = new WeakMap(), _BaseGenerator_maxIterations = new WeakMap(), _BaseGenerator_clusterChance = new WeakMap(), _BaseGenerator_coverage = new WeakMap(), _BaseGenerator_pathChance = new WeakMap(), _BaseGenerator_map = new WeakMap(), _BaseGenerator_randomNumberGenerator = new WeakMap(), _BaseGenerator_ruleRegistry = new WeakMap(), _BaseGenerator_terrainRegistry = new WeakMap();
exports.default = BaseGenerator;
//# sourceMappingURL=BaseGenerator.js.map