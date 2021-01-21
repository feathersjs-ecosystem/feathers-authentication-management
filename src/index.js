"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var service_1 = __importDefault(require("./service"));
var hooks_1 = __importDefault(require("./hooks"));
//@ts-ignore
service_1.default.hooks = hooks_1.default;
exports.default = service_1.default;
// commonjs
if (typeof module !== "undefined") {
    module.exports = Object.assign(service_1.default, module.exports);
}
