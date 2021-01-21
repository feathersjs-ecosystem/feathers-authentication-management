"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("@feathersjs/errors");
function ensureObjPropsValid(obj, props, allowNone) {
    var keys = Object.keys(obj);
    var valid = keys.every(function (key) { return props.includes(key) && typeof obj[key] === 'string'; });
    if (!valid || (keys.length === 0 && !allowNone)) {
        throw new errors_1.BadRequest('User info is not valid. (authLocalMgnt)', { errors: { $className: 'badParams' } });
    }
}
exports.default = ensureObjPropsValid;
