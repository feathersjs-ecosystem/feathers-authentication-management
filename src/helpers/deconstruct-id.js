"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("@feathersjs/errors");
function deconstructId(token) {
    if (!token.includes('___')) {
        throw new errors_1.BadRequest('Token is not in the correct format.', { errors: { $className: 'badParams' } });
    }
    return token.slice(0, token.indexOf('___'));
}
exports.default = deconstructId;
