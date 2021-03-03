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
var _Terrain, _height, _width;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FillGenerator = void 0;
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
const Types_1 = require("@civ-clone/core-terrain/Types");
class FillGenerator extends Generator_1.default {
    constructor(height, width, TerrainType = Types_1.Land) {
        super(height, width);
        _Terrain.set(this, void 0);
        _height.set(this, void 0);
        _width.set(this, void 0);
        __classPrivateFieldSet(this, _height, height);
        __classPrivateFieldSet(this, _width, width);
        __classPrivateFieldSet(this, _Terrain, TerrainType);
    }
    generate() {
        return new Promise((resolve) => {
            resolve(new Array(__classPrivateFieldGet(this, _height) * __classPrivateFieldGet(this, _width))
                .fill(0)
                .map(() => new (__classPrivateFieldGet(this, _Terrain))()));
        });
    }
}
exports.FillGenerator = FillGenerator;
_Terrain = new WeakMap(), _height = new WeakMap(), _width = new WeakMap();
exports.default = FillGenerator;
//# sourceMappingURL=FillGenerator.js.map