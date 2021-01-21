"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var is_nullsy_1 = __importDefault(require("./is-nullsy"));
// Verify that obj1 and obj2 have different 'field' field
// Returns false if either object is null/undefined
function ensureFieldHasChanged(obj1, obj2) {
    return is_nullsy_1.default(obj1) || is_nullsy_1.default(obj2)
        ? function () { return false; }
        : function (field) { return obj1[field] !== obj2[field]; };
}
exports.default = ensureFieldHasChanged;
