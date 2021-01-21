"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
function randomDigits(len) {
    var str = '';
    while (str.length < len) {
        str += parseInt('0x' + crypto_1.default.randomBytes(4).toString('hex')).toString();
    }
    return str.substr(0, len);
}
exports.default = randomDigits;
