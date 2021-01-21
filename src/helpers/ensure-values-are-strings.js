"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("@feathersjs/errors");
function ensureValuesAreStrings() {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i] = arguments[_i];
    }
    if (!rest.every(function (str) { return typeof str === 'string'; })) {
        throw new errors_1.BadRequest('Expected string value. (authLocalMgnt)', { errors: { $className: 'badParams' } });
    }
}
exports.default = ensureValuesAreStrings;
