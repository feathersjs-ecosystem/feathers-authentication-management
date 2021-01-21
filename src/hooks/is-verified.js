"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("@feathersjs/errors");
var feathers_hooks_common_1 = require("feathers-hooks-common");
function isVerified() {
    return function (hook) {
        feathers_hooks_common_1.checkContext(hook, 'before');
        if (!hook.params.user || !hook.params.user.isVerified) {
            throw new errors_1.BadRequest('User\'s email is not yet verified.');
        }
    };
}
exports.default = isVerified;
