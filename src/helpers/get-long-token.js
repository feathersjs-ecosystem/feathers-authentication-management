"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var random_bytes_1 = __importDefault(require("./random-bytes"));
exports.default = (function (len) { return random_bytes_1.default(len); });
