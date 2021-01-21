"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var add_verification_1 = __importDefault(require("./add-verification"));
var is_verified_1 = __importDefault(require("./is-verified"));
var remove_verification_1 = __importDefault(require("./remove-verification"));
exports.default = {
    addVerification: add_verification_1.default,
    isVerified: is_verified_1.default,
    removeVerification: remove_verification_1.default
};
