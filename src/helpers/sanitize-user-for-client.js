"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var clone_object_1 = __importDefault(require("./clone-object"));
function sanitizeUserForClient(user1) {
    var user = clone_object_1.default(user1);
    delete user.password;
    delete user.verifyExpires;
    delete user.verifyToken;
    delete user.verifyShortToken;
    delete user.verifyChanges;
    delete user.resetExpires;
    delete user.resetToken;
    delete user.resetShortToken;
    return user;
}
exports.default = sanitizeUserForClient;
