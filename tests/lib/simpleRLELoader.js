"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleRLELoader = void 0;
const Terrains_1 = require("@civ-clone/library-world/Terrains");
const TerrainFeatures_1 = require("@civ-clone/library-world/TerrainFeatures");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const Loader_1 = require("./Loader");
const World_1 = require("@civ-clone/core-world/World");
const simpleRLELoader = (ruleRegistry = RuleRegistry_1.instance, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance) => async (map, height, width) => {
    const terrainLookup = {
        A: Terrains_1.Arctic,
        D: Terrains_1.Desert,
        F: Terrains_1.Forest,
        G: Terrains_1.Grassland,
        H: Terrains_1.Hills,
        J: Terrains_1.Jungle,
        M: Terrains_1.Mountains,
        O: Terrains_1.Ocean,
        P: Terrains_1.Plains,
        R: Terrains_1.River,
        S: Terrains_1.Swamp,
        T: Terrains_1.Tundra,
    }, featureLookup = {
        c: TerrainFeatures_1.Coal,
        f: TerrainFeatures_1.Fish,
        a: TerrainFeatures_1.Game,
        e: TerrainFeatures_1.Gems,
        g: TerrainFeatures_1.Gold,
        h: TerrainFeatures_1.Horse,
        i: TerrainFeatures_1.Oasis,
        o: TerrainFeatures_1.Oil,
        s: TerrainFeatures_1.Seal,
        d: TerrainFeatures_1.Shield,
    }, data = (map.replace(/\s+/g, '').match(/(\d+|)([A-Z])([a-z]+|)/g) || []).flatMap((definition) => {
        const [, n, terrainIndex, featureIndices] = definition.match(/(\d+|)([A-Z])([a-z]+|)?/);
        return new Array(parseInt(n) || 1)
            .fill(0)
            .map(() => {
            const terrain = new terrainLookup[terrainIndex](), features = [...(featureIndices || [])].map((featureIndex) => new featureLookup[featureIndex](terrain)) || [];
            return [terrain, ...features];
        });
    }), world = new World_1.default(new Loader_1.default(height, width, data, terrainFeatureRegistry), ruleRegistry);
    await world.build();
    return world;
};
exports.simpleRLELoader = simpleRLELoader;
exports.default = exports.simpleRLELoader;
//# sourceMappingURL=simpleRLELoader.js.map