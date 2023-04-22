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
var _StaticWorldGenerator_terrainFeatureRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticWorldGenerator = void 0;
const Terrains_1 = require("@civ-clone/library-world/Terrains");
const TerrainFeatures_1 = require("@civ-clone/library-world/TerrainFeatures");
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
class StaticWorldGenerator extends Generator_1.default {
    constructor(terrainFeatureRegistry = TerrainFeatureRegistry_1.instance) {
        super(1, 24);
        _StaticWorldGenerator_terrainFeatureRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _StaticWorldGenerator_terrainFeatureRegistry, terrainFeatureRegistry, "f");
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
            __classPrivateFieldGet(this, _StaticWorldGenerator_terrainFeatureRegistry, "f").register(new Feature(terrain));
        });
        return terrain;
    }
}
exports.StaticWorldGenerator = StaticWorldGenerator;
_StaticWorldGenerator_terrainFeatureRegistry = new WeakMap();
exports.default = StaticWorldGenerator;
//# sourceMappingURL=StaticWorldGenerator.js.map