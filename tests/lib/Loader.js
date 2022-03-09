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
var _Loader_data, _Loader_height, _Loader_width, _Loader_terrainFeatureRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = void 0;
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
class Loader extends Generator_1.default {
    constructor(height, width, data, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance) {
        super(height, width);
        _Loader_data.set(this, void 0);
        _Loader_height.set(this, void 0);
        _Loader_width.set(this, void 0);
        _Loader_terrainFeatureRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _Loader_height, height, "f");
        __classPrivateFieldSet(this, _Loader_width, width, "f");
        __classPrivateFieldSet(this, _Loader_data, data, "f");
        __classPrivateFieldSet(this, _Loader_terrainFeatureRegistry, terrainFeatureRegistry, "f");
    }
    generate() {
        return new Promise((resolve) => {
            resolve(__classPrivateFieldGet(this, _Loader_data, "f").map(([terrain, ...features]) => {
                __classPrivateFieldGet(this, _Loader_terrainFeatureRegistry, "f").register(...features);
                return terrain;
            }));
        });
    }
}
exports.Loader = Loader;
_Loader_data = new WeakMap(), _Loader_height = new WeakMap(), _Loader_width = new WeakMap(), _Loader_terrainFeatureRegistry = new WeakMap();
exports.default = Loader;
//# sourceMappingURL=Loader.js.map