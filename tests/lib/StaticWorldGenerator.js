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
var _terrainFeatureRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticWorldGenerator = void 0;
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const TerrainFeatures_1 = require("@civ-clone/civ1-world/TerrainFeatures");
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
class StaticWorldGenerator extends Generator_1.default {
    constructor(terrainFeatureRegistry = TerrainFeatureRegistry_1.instance) {
        super(1, 24);
        _terrainFeatureRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _terrainFeatureRegistry, terrainFeatureRegistry);
    }
    generate() {
        const terrains = [
            [Terrains_1.Arctic],
            [Terrains_1.Arctic, TerrainFeatures_1.Seal],
            [Terrains_1.Desert],
            [Terrains_1.Desert, TerrainFeatures_1.Oasis],
            [Terrains_1.Forest],
            [Terrains_1.Forest, TerrainFeatures_1.Horse],
            [Terrains_1.Grassland],
            [Terrains_1.Grassland, TerrainFeatures_1.Shield],
            [Terrains_1.Hills],
            [Terrains_1.Hills, TerrainFeatures_1.Coal],
            [Terrains_1.Jungle],
            [Terrains_1.Jungle, TerrainFeatures_1.Gems],
            [Terrains_1.Mountains],
            [Terrains_1.Mountains, TerrainFeatures_1.Gold],
            [Terrains_1.Ocean],
            [Terrains_1.Ocean, TerrainFeatures_1.Fish],
            [Terrains_1.Plains],
            [Terrains_1.Plains, TerrainFeatures_1.Game],
            [Terrains_1.River],
            [Terrains_1.River, TerrainFeatures_1.Shield],
            [Terrains_1.Swamp],
            [Terrains_1.Swamp, TerrainFeatures_1.Oil],
            [Terrains_1.Tundra],
            [Terrains_1.Tundra, TerrainFeatures_1.Game],
        ];
        return new Promise((resolve) => {
            resolve(terrains.map(([TerrainType, ...features]) => this.getTerrainWithFeature(TerrainType, ...features)));
        });
    }
    getTerrainWithFeature(TerrainType, ...features) {
        const terrain = new TerrainType();
        features.forEach((Feature) => {
            __classPrivateFieldGet(this, _terrainFeatureRegistry).register(new Feature(terrain));
        });
        return terrain;
    }
}
exports.StaticWorldGenerator = StaticWorldGenerator;
_terrainFeatureRegistry = new WeakMap();
exports.default = StaticWorldGenerator;
//# sourceMappingURL=StaticWorldGenerator.js.map