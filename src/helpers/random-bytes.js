"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
function randomBytes(len) {
    return new Promise(function (resolve, reject) {
        crypto_1.default.randomBytes(len, function (err, buf) { return err ? reject(err) : resolve(buf.toString('hex')); });
    });
}
exports.default = randomBytes;
