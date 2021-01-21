"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcryptjs_1 = __importDefault(require("bcryptjs"));
function comparePasswords(oldPassword, password, getError) {
    return new Promise(function (resolve, reject) {
        bcryptjs_1.default.compare(oldPassword, password, function (err, data1) {
            return (err || !data1) ? reject(getError() || err) : resolve(true);
        });
    });
}
exports.default = comparePasswords;
