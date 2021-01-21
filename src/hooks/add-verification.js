"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __importDefault(require("@feathersjs/errors"));
var feathers_hooks_common_1 = require("feathers-hooks-common");
var helpers_1 = require("../helpers");
function addVerification(path) {
    return function (hook) {
        feathers_hooks_common_1.checkContext(hook, 'before', ['create', 'patch', 'update']);
        return Promise.resolve()
            .then(function () { return hook.app.service(path || 'authManagement').create({ action: 'options' }); })
            .then(function (options) { return Promise.all([
            options,
            helpers_1.getLongToken(options.longTokenLen),
            helpers_1.getShortToken(options.shortTokenLen, options.shortTokenDigits)
        ]); })
            .then(function (_a) {
            var _b = __read(_a, 3), options = _b[0], longToken = _b[1], shortToken = _b[2];
            // We do NOT add verification fields if the 3 following conditions are fulfilled:
            // - hook is PATCH or PUT
            // - user is authenticated
            // - user's identifyUserProps fields did not change
            if ((hook.method === 'patch' || hook.method === 'update') &&
                !!hook.params.user &&
                !options.identifyUserProps.some(helpers_1.ensureFieldHasChanged(hook.data, hook.params.user))) {
                return hook;
            }
            hook.data.isVerified = false;
            hook.data.verifyExpires = Date.now() + options.delay;
            hook.data.verifyToken = longToken;
            hook.data.verifyShortToken = shortToken;
            hook.data.verifyChanges = {};
            return hook;
        })
            .catch(function (err) {
            throw new errors_1.default.GeneralError(err);
        });
    };
}
exports.default = addVerification;
