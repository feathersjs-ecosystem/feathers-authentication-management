"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __importDefault(require("@feathersjs/errors"));
var is_nullsy_1 = __importDefault(require("./helpers/is-nullsy"));
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('authLocalMgnt:checkUnique');
// This module is usually called from the UI to check username, email, etc. are unique.
function checkUnique(options, identifyUser, ownId, meta) {
    return __awaiter(this, void 0, void 0, function () {
        var usersService, usersServiceIdName, allProps, keys, i, ilen, prop, users, items, isNotUnique, err_1, errProps, errs_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    debug('checkUnique', identifyUser, ownId, meta);
                    usersService = options.app.service(options.service);
                    usersServiceIdName = usersService.id;
                    allProps = [];
                    keys = Object.keys(identifyUser).filter(function (key) { return !is_nullsy_1.default(identifyUser[key]); });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    i = 0, ilen = keys.length;
                    _b.label = 2;
                case 2:
                    if (!(i < ilen)) return [3 /*break*/, 5];
                    prop = keys[i];
                    return [4 /*yield*/, usersService.find({ query: (_a = {}, _a[prop] = identifyUser[prop].trim(), _a) })];
                case 3:
                    users = _b.sent();
                    items = Array.isArray(users) ? users : users.data;
                    isNotUnique = items.length > 1 ||
                        (items.length === 1 && items[0][usersServiceIdName] !== ownId);
                    allProps.push(isNotUnique ? prop : null);
                    _b.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_1 = _b.sent();
                    throw new errors_1.default.BadRequest(meta.noErrMsg ? null : 'checkUnique unexpected error.', { errors: { msg: err_1.message, $className: 'unexpected' } });
                case 7:
                    errProps = allProps.filter(function (prop) { return prop; });
                    if (errProps.length) {
                        errs_1 = {};
                        errProps.forEach(function (prop) { errs_1[prop] = 'Already taken.'; });
                        throw new errors_1.default.BadRequest(meta.noErrMsg ? null : 'Values already taken.', { errors: errs_1 });
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
exports.default = checkUnique;
