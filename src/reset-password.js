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
exports.resetPwdWithShortToken = exports.resetPwdWithLongToken = void 0;
var errors_1 = __importDefault(require("@feathersjs/errors"));
var debug_1 = __importDefault(require("debug"));
var compare_passwords_1 = __importDefault(require("./helpers/compare-passwords"));
var deconstruct_id_1 = __importDefault(require("./helpers/deconstruct-id"));
var ensure_obj_props_valid_1 = __importDefault(require("./helpers/ensure-obj-props-valid"));
var ensure_values_are_strings_1 = __importDefault(require("./helpers/ensure-values-are-strings"));
var get_user_data_1 = __importDefault(require("./helpers/get-user-data"));
var hash_password_1 = __importDefault(require("./helpers/hash-password"));
var notifier_1 = __importDefault(require("./helpers/notifier"));
var debug = debug_1.default('authLocalMgnt:resetPassword');
function resetPwdWithLongToken(options, resetToken, password, field, notifierOptions) {
    if (notifierOptions === void 0) { notifierOptions = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            ensure_values_are_strings_1.default(resetToken, password);
            return [2 /*return*/, resetPassword(options, { resetToken: resetToken }, { resetToken: resetToken }, password, field, notifierOptions)];
        });
    });
}
exports.resetPwdWithLongToken = resetPwdWithLongToken;
function resetPwdWithShortToken(options, resetShortToken, identifyUser, password, field, notifierOptions) {
    if (notifierOptions === void 0) { notifierOptions = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            ensure_values_are_strings_1.default(resetShortToken, password);
            ensure_obj_props_valid_1.default(identifyUser, options.identifyUserProps);
            return [2 /*return*/, resetPassword(options, identifyUser, { resetShortToken: resetShortToken }, password, field, notifierOptions)];
        });
    });
}
exports.resetPwdWithShortToken = resetPwdWithShortToken;
function resetPassword(options, query, tokens, password, field, notifierOptions) {
    if (notifierOptions === void 0) { notifierOptions = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var usersService, usersServiceIdName, users, id, checkProps, user1, tokenChecks, err_1, user2, _a, _b, _c, user3;
        var _d;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    debug('resetPassword', query, tokens, password);
                    usersService = options.app.service(options.service);
                    usersServiceIdName = usersService.id;
                    if (!tokens.resetToken) return [3 /*break*/, 2];
                    id = deconstruct_id_1.default(tokens.resetToken);
                    return [4 /*yield*/, usersService.get(id)];
                case 1:
                    users = _e.sent();
                    return [3 /*break*/, 5];
                case 2:
                    if (!tokens.resetShortToken) return [3 /*break*/, 4];
                    return [4 /*yield*/, usersService.find({ query: query })];
                case 3:
                    users = _e.sent();
                    return [3 /*break*/, 5];
                case 4: throw new errors_1.default.BadRequest('resetToken and resetShortToken are missing. (authLocalMgnt)', {
                    errors: { $className: 'missingToken' }
                });
                case 5:
                    checkProps = options.skipIsVerifiedCheck ? ['resetNotExpired'] : ['resetNotExpired', 'isVerified'];
                    user1 = get_user_data_1.default(users, checkProps);
                    tokenChecks = Object.keys(tokens).map(function (key) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (options.reuseResetToken) {
                                // Comparing token directly as reused resetToken is not hashed
                                if (tokens[key] !== user1[key]) {
                                    throw new errors_1.default.BadRequest('Reset Token is incorrect. (authLocalMgnt)', {
                                        errors: { $className: 'incorrectToken' }
                                    });
                                }
                            }
                            else {
                                return [2 /*return*/, compare_passwords_1.default(tokens[key], user1[key], function () {
                                        return new errors_1.default.BadRequest('Reset Token is incorrect. (authLocalMgnt)', {
                                            errors: { $className: 'incorrectToken' }
                                        });
                                    })];
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 8, , 13]);
                    return [4 /*yield*/, Promise.all(tokenChecks)];
                case 7:
                    _e.sent();
                    return [3 /*break*/, 13];
                case 8:
                    err_1 = _e.sent();
                    if (!(user1.resetAttempts > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, usersService.patch(user1[usersServiceIdName], {
                            resetAttempts: user1.resetAttempts - 1
                        })];
                case 9:
                    _e.sent();
                    throw err_1;
                case 10: return [4 /*yield*/, usersService.patch(user1[usersServiceIdName], {
                        resetToken: null,
                        resetAttempts: null,
                        resetShortToken: null,
                        resetExpires: null
                    })];
                case 11:
                    _e.sent();
                    throw new errors_1.default.BadRequest('Invalid token. Get for a new one. (authLocalMgnt)', {
                        errors: { $className: 'invalidToken' }
                    });
                case 12: return [3 /*break*/, 13];
                case 13:
                    _b = (_a = usersService).patch;
                    _c = [user1[usersServiceIdName]];
                    _d = {};
                    return [4 /*yield*/, hash_password_1.default(options.app, password, field)];
                case 14: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.password = _e.sent(),
                            _d.resetExpires = null,
                            _d.resetAttempts = null,
                            _d.resetToken = null,
                            _d.resetShortToken = null,
                            _d)]))];
                case 15:
                    user2 = _e.sent();
                    return [4 /*yield*/, notifier_1.default(options.notifier, 'resetPwd', user2, notifierOptions)];
                case 16:
                    user3 = _e.sent();
                    return [2 /*return*/, options.sanitizeUserForClient(user3)];
            }
        });
    });
}
