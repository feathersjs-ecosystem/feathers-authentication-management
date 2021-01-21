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
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('authLocalMgnt:service');
var check_unique_1 = __importDefault(require("./check-unique"));
var identity_change_1 = __importDefault(require("./identity-change"));
var password_change_1 = __importDefault(require("./password-change"));
var resend_verify_signup_1 = __importDefault(require("./resend-verify-signup"));
var sanitize_user_for_client_1 = __importDefault(require("./helpers/sanitize-user-for-client"));
var send_reset_pwd_1 = __importDefault(require("./send-reset-pwd"));
var reset_password_1 = require("./reset-password");
var verify_signup_1 = require("./verify-signup");
var verify_signup_set_password_1 = require("./verify-signup-set-password");
var passwordField = 'password';
var optionsDefault = {
    app: null,
    service: '/users',
    path: 'authManagement',
    notifier: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    longTokenLen: 15,
    shortTokenLen: 6,
    shortTokenDigits: true,
    resetDelay: 1000 * 60 * 60 * 2,
    delay: 1000 * 60 * 60 * 24 * 5,
    resetAttempts: 0,
    reuseResetToken: false,
    identifyUserProps: ['email'],
    sanitizeUserForClient: sanitize_user_for_client_1.default
};
function authenticationLocalManagement(options1, docs) {
    if (options1 === void 0) { options1 = {}; }
    if (docs === void 0) { docs = {}; }
    debug('service being configured.');
    return function () {
        var options = Object.assign({}, optionsDefault, options1, { app: this });
        options.app.use(options.path, Object.assign(authLocalMgntMethods(options), { docs: docs }));
    };
}
exports.default = authenticationLocalManagement;
function authLocalMgntMethods(options) {
    return {
        create: function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, err_1, err_2, err_3, err_4, err_5, err_6, err_7, err_8, err_9, err_10, err_11;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            debug("create called. action=" + data.action);
                            _a = data.action;
                            switch (_a) {
                                case 'checkUnique': return [3 /*break*/, 1];
                                case 'resendVerifySignup': return [3 /*break*/, 4];
                                case 'verifySignupLong': return [3 /*break*/, 7];
                                case 'verifySignupShort': return [3 /*break*/, 10];
                                case 'verifySignupSetPasswordLong': return [3 /*break*/, 13];
                                case 'verifySignupSetPasswordShort': return [3 /*break*/, 16];
                                case 'sendResetPwd': return [3 /*break*/, 19];
                                case 'resetPwdLong': return [3 /*break*/, 22];
                                case 'resetPwdShort': return [3 /*break*/, 25];
                                case 'passwordChange': return [3 /*break*/, 28];
                                case 'identityChange': return [3 /*break*/, 31];
                                case 'options': return [3 /*break*/, 34];
                            }
                            return [3 /*break*/, 35];
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, check_unique_1.default(options, data.value, data.ownId || null, data.meta || {})];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            err_1 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_1)]; // support both async and Promise interfaces
                        case 4:
                            _b.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, resend_verify_signup_1.default(options, data.value, data.notifierOptions)];
                        case 5: return [2 /*return*/, _b.sent()];
                        case 6:
                            err_2 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_2)];
                        case 7:
                            _b.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, verify_signup_1.verifySignupWithLongToken(options, data.value, data.notifierOptions)];
                        case 8: return [2 /*return*/, _b.sent()];
                        case 9:
                            err_3 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_3)];
                        case 10:
                            _b.trys.push([10, 12, , 13]);
                            return [4 /*yield*/, verify_signup_1.verifySignupWithShortToken(options, data.value.token, data.value.user, data.notifierOptions)];
                        case 11: return [2 /*return*/, _b.sent()];
                        case 12:
                            err_4 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_4)];
                        case 13:
                            _b.trys.push([13, 15, , 16]);
                            return [4 /*yield*/, verify_signup_set_password_1.verifySignupSetPasswordWithLongToken(options, data.value.token, data.value.password, passwordField, data.notifierOptions)];
                        case 14: return [2 /*return*/, _b.sent()];
                        case 15:
                            err_5 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_5)];
                        case 16:
                            _b.trys.push([16, 18, , 19]);
                            return [4 /*yield*/, verify_signup_set_password_1.verifySignupSetPasswordWithShortToken(options, data.value.token, data.value.user, data.value.password, passwordField, data.notifierOptions)];
                        case 17: return [2 /*return*/, _b.sent()];
                        case 18:
                            err_6 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_6)];
                        case 19:
                            _b.trys.push([19, 21, , 22]);
                            return [4 /*yield*/, send_reset_pwd_1.default(options, data.value, passwordField, data.notifierOptions)];
                        case 20: return [2 /*return*/, _b.sent()];
                        case 21:
                            err_7 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_7)];
                        case 22:
                            _b.trys.push([22, 24, , 25]);
                            return [4 /*yield*/, reset_password_1.resetPwdWithLongToken(options, data.value.token, data.value.password, passwordField, data.notifierOptions)];
                        case 23: return [2 /*return*/, _b.sent()];
                        case 24:
                            err_8 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_8)];
                        case 25:
                            _b.trys.push([25, 27, , 28]);
                            return [4 /*yield*/, reset_password_1.resetPwdWithShortToken(options, data.value.token, data.value.user, data.value.password, passwordField, data.notifierOptions)];
                        case 26: return [2 /*return*/, _b.sent()];
                        case 27:
                            err_9 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_9)];
                        case 28:
                            _b.trys.push([28, 30, , 31]);
                            return [4 /*yield*/, password_change_1.default(options, data.value.user, data.value.oldPassword, data.value.password, passwordField, data.notifierOptions)];
                        case 29: return [2 /*return*/, _b.sent()];
                        case 30:
                            err_10 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_10)];
                        case 31:
                            _b.trys.push([31, 33, , 34]);
                            return [4 /*yield*/, identity_change_1.default(options, data.value.user, data.value.password, data.value.changes, passwordField)];
                        case 32: return [2 /*return*/, _b.sent()];
                        case 33:
                            err_11 = _b.sent();
                            return [2 /*return*/, Promise.reject(err_11)];
                        case 34: return [2 /*return*/, options];
                        case 35: throw new errors_1.default.BadRequest("Action '" + data.action + "' is invalid.", {
                            errors: { $className: 'badParams' }
                        });
                    }
                });
            });
        }
    };
}
