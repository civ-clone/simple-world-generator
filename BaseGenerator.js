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
var _chanceToBecomeLand, _clusterChance, _coverage, _landCoverage, _landMassReductionScale, _map, _maxIterations, _pathChance, _ruleRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGenerator = void 0;
const Types_1 = require("@civ-clone/core-terrain/Types");
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Distribution_1 = require("@civ-clone/core-world-generator/Rules/Distribution");
const DistributionGroups_1 = require("@civ-clone/core-world-generator/Rules/DistributionGroups");
class BaseGenerator extends Generator_1.Generator {
    constructor({ coverage = 0.1, chanceToBecomeLand = 5, clusterChance = 0.05, height = 100, landCoverage = 0.66, landMassReductionScale = 3, maxIterations = 1, pathChance = 0.05, rulesRegistry = RuleRegistry_1.instance, width = 160, } = {}) {
        super(height, width);
        _chanceToBecomeLand.set(this, void 0);
        _clusterChance.set(this, void 0);
        _coverage.set(this, void 0);
        _landCoverage.set(this, void 0);
        _landMassReductionScale.set(this, void 0);
        _map.set(this, void 0);
        _maxIterations.set(this, void 0);
        _pathChance.set(this, void 0);
        _ruleRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _chanceToBecomeLand, chanceToBecomeLand); // chance to become land
        __classPrivateFieldSet(// chance to become land
        this, _clusterChance, clusterChance); // chance for adjacent tiles to cluster
        __classPrivateFieldSet(// chance for adjacent tiles to cluster
        this, _coverage, coverage); // total coverage of terrain type
        __classPrivateFieldSet(// total coverage of terrain type
        this, _landCoverage, landCoverage); // total coverage required
        __classPrivateFieldSet(// total coverage required
        this, _landMassReductionScale, landMassReductionScale);
        __classPrivateFieldSet(this, _maxIterations, maxIterations); // number of times a tile can be tested to change to land
        __classPrivateFieldSet(// number of times a tile can be tested to change to land
        this, _pathChance, pathChance); // chance for directly adjacent tiles to be part of the path
        __classPrivateFieldSet(// chance for directly adjacent tiles to be part of the path
        this, _ruleRegistry, rulesRegistry);
        __classPrivateFieldSet(this, _map, new Array(this.height() * this.width())
            .fill(0)
            .map(() => new Types_1.Water()));
    }
    generateLand() {
        const seen = {}, toProcess = [], seedTile = Math.floor(this.height() * this.width() * Math.random()), flagAsSeen = (id) => {
            if (!(id in seen)) {
                seen[id] = 0;
            }
            seen[id]++;
        };
        __classPrivateFieldGet(this, _map)[seedTile] = new Types_1.Land();
        flagAsSeen(seedTile);
        toProcess.push(...this.getNeighbours(seedTile));
        while (toProcess.length) {
            const currentTile = toProcess.shift();
            if (!seen[currentTile] || seen[currentTile] < __classPrivateFieldGet(this, _maxIterations)) {
                const distance = this.distanceFrom(seedTile, currentTile);
                if (__classPrivateFieldGet(this, _chanceToBecomeLand) / distance >= Math.random() ||
                    this.getNeighbours(currentTile, false).reduce((total, n) => total + (__classPrivateFieldGet(this, _map)[n] instanceof Types_1.Land ? 1 : 0), 0) > 5) {
                    __classPrivateFieldGet(this, _map)[currentTile] = new Types_1.Land();
                    toProcess.push(...this.getNeighbours(currentTile));
                }
                flagAsSeen(currentTile);
            }
        }
        const land = __classPrivateFieldGet(this, _map).filter((tile) => tile instanceof Types_1.Land).length;
        if (land / __classPrivateFieldGet(this, _map).length >= __classPrivateFieldGet(this, _landCoverage)) {
            return __classPrivateFieldGet(this, _map);
        }
        return this.generateLand();
    }
    generate() {
        this.generateLand();
        this.populateTerrain();
        return __classPrivateFieldGet(this, _map);
    }
    getNeighbours(index, directNeighbours = true) {
        const [x, y] = this.indexToCoords(index), n = this.coordsToIndex(x, y - 1), ne = this.coordsToIndex(x + 1, y - 1), e = this.coordsToIndex(x + 1, y), se = this.coordsToIndex(x + 1, y), s = this.coordsToIndex(x, y + 1), sw = this.coordsToIndex(x - 1, y + 1), w = this.coordsToIndex(x - 1, y), nw = this.coordsToIndex(x - 1, y - 1);
        return directNeighbours ? [n, e, s, w] : [n, ne, e, se, s, sw, w, nw];
    }
    populateTerrain() {
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
                            Math.random() / this.distanceFrom(currentIndex, index)) {
                            __classPrivateFieldGet(this, _map)[index] = new TerrainType();
                            max--;
                            clusteredNeighbours.push(...this.getNeighbours(index)
                                .filter((index) => !(__classPrivateFieldGet(this, _map)[index] instanceof TerrainType))
                                .filter((index) => __classPrivateFieldGet(this, _map)[index] instanceof
                                // @ts-ignore
                                TerrainType.__proto__)
                                .filter((index) => !!clusteredNeighbours.includes(index)));
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
    }
}
exports.BaseGenerator = BaseGenerator;
_chanceToBecomeLand = new WeakMap(), _clusterChance = new WeakMap(), _coverage = new WeakMap(), _landCoverage = new WeakMap(), _landMassReductionScale = new WeakMap(), _map = new WeakMap(), _maxIterations = new WeakMap(), _pathChance = new WeakMap(), _ruleRegistry = new WeakMap();
exports.default = BaseGenerator;
//# sourceMappingURL=BaseGenerator.js.map