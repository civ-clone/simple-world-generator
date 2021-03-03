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
var _data, _height, _width, _terrainFeatureRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = void 0;
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
class Loader extends Generator_1.default {
    constructor(height, width, data, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance) {
        super(height, width);
        _data.set(this, void 0);
        _height.set(this, void 0);
        _width.set(this, void 0);
        _terrainFeatureRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _height, height);
        __classPrivateFieldSet(this, _width, width);
        __classPrivateFieldSet(this, _data, data);
        __classPrivateFieldSet(this, _terrainFeatureRegistry, terrainFeatureRegistry);
    }
    generate() {
        return new Promise((resolve) => {
            resolve(__classPrivateFieldGet(this, _data).map(([terrain, ...features]) => {
                __classPrivateFieldGet(this, _terrainFeatureRegistry).register(...features);
                return terrain;
            }));
        });
    }
}
exports.Loader = Loader;
_data = new WeakMap(), _height = new WeakMap(), _width = new WeakMap(), _terrainFeatureRegistry = new WeakMap();
exports.default = Loader;
//# sourceMappingURL=Loader.js.map