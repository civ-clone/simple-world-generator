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
var _FillGenerator_Terrain, _FillGenerator_height, _FillGenerator_width;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FillGenerator = void 0;
const Generator_1 = require("@civ-clone/core-world-generator/Generator");
const Types_1 = require("@civ-clone/core-terrain/Types");
class FillGenerator extends Generator_1.default {
    constructor(height, width, TerrainType = Types_1.Land) {
        super(height, width);
        _FillGenerator_Terrain.set(this, void 0);
        _FillGenerator_height.set(this, void 0);
        _FillGenerator_width.set(this, void 0);
        __classPrivateFieldSet(this, _FillGenerator_height, height, "f");
        __classPrivateFieldSet(this, _FillGenerator_width, width, "f");
        __classPrivateFieldSet(this, _FillGenerator_Terrain, TerrainType, "f");
    }
    generate() {
        return new Promise((resolve) => {
            resolve(new Array(__classPrivateFieldGet(this, _FillGenerator_height, "f") * __classPrivateFieldGet(this, _FillGenerator_width, "f"))
                .fill(0)
                .map(() => new (__classPrivateFieldGet(this, _FillGenerator_Terrain, "f"))()));
        });
    }
}
exports.FillGenerator = FillGenerator;
_FillGenerator_Terrain = new WeakMap(), _FillGenerator_height = new WeakMap(), _FillGenerator_width = new WeakMap();
exports.default = FillGenerator;
//# sourceMappingURL=FillGenerator.js.map