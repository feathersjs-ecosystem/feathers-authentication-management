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
exports.verifySignupSetPasswordWithShortToken = exports.verifySignupSetPasswordWithLongToken = void 0;
var errors_1 = __importDefault(require("@feathersjs/errors"));
var debug_1 = __importDefault(require("debug"));
var ensure_obj_props_valid_1 = __importDefault(require("./helpers/ensure-obj-props-valid"));
var ensure_values_are_strings_1 = __importDefault(require("./helpers/ensure-values-are-strings"));
var get_user_data_1 = __importDefault(require("./helpers/get-user-data"));
var hash_password_1 = __importDefault(require("./helpers/hash-password"));
var notifier_1 = __importDefault(require("./helpers/notifier"));
var debug = debug_1.default('authLocalMgnt:verifySignupSetPassword');
function verifySignupSetPasswordWithLongToken(options, verifyToken, password, field, notifierOptions) {
    if (notifierOptions === void 0) { notifierOptions = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ensure_values_are_strings_1.default(verifyToken, password);
                    return [4 /*yield*/, verifySignupSetPassword(options, { verifyToken: verifyToken }, { verifyToken: verifyToken }, password, field, notifierOptions)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.verifySignupSetPasswordWithLongToken = verifySignupSetPasswordWithLongToken;
function verifySignupSetPasswordWithShortToken(options, verifyShortToken, identifyUser, password, field, notifierOptions) {
    if (notifierOptions === void 0) { notifierOptions = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ensure_values_are_strings_1.default(verifyShortToken, password);
                    ensure_obj_props_valid_1.default(identifyUser, options.identifyUserProps);
                    return [4 /*yield*/, verifySignupSetPassword(options, identifyUser, {
                            verifyShortToken: verifyShortToken
                        }, password, field, notifierOptions)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.verifySignupSetPasswordWithShortToken = verifySignupSetPasswordWithShortToken;
function verifySignupSetPassword(options, query, tokens, password, field, notifierOptions) {
    if (notifierOptions === void 0) { notifierOptions = {}; }
    return __awaiter(this, void 0, void 0, function () {
        function eraseVerifyPropsSetPassword(user, isVerified, verifyChanges, password, field) {
            return __awaiter(this, void 0, void 0, function () {
                var hashedPassword, patchToUser, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, hash_password_1.default(options.app, password, field)];
                        case 1:
                            hashedPassword = _a.sent();
                            patchToUser = Object.assign({}, verifyChanges || {}, {
                                isVerified: isVerified,
                                verifyToken: null,
                                verifyShortToken: null,
                                verifyExpires: null,
                                verifyChanges: {},
                                password: hashedPassword
                            });
                            return [4 /*yield*/, usersService.patch(user[usersServiceIdName], patchToUser, {})];
                        case 2:
                            result = _a.sent();
                            return [2 /*return*/, result];
                    }
                });
            });
        }
        var usersService, usersServiceIdName, users, user1, user2, user3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    debug('verifySignupSetPassword', query, tokens, password);
                    usersService = options.app.service(options.service);
                    usersServiceIdName = usersService.id;
                    return [4 /*yield*/, usersService.find({ query: query })];
                case 1:
                    users = _a.sent();
                    user1 = get_user_data_1.default(users, [
                        'isNotVerifiedOrHasVerifyChanges',
                        'verifyNotExpired'
                    ]);
                    if (!!Object.keys(tokens).every(function (key) { return tokens[key] === user1[key]; })) return [3 /*break*/, 3];
                    return [4 /*yield*/, eraseVerifyPropsSetPassword(user1, user1.isVerified, {}, password, field)];
                case 2:
                    _a.sent();
                    throw new errors_1.default.BadRequest('Invalid token. Get for a new one. (authLocalMgnt)', { errors: { $className: 'badParam' } });
                case 3: return [4 /*yield*/, eraseVerifyPropsSetPassword(user1, user1.verifyExpires > Date.now(), user1.verifyChanges || {}, password, field)];
                case 4:
                    user2 = _a.sent();
                    return [4 /*yield*/, notifier_1.default(options.notifier, 'verifySignupSetPassword', user2, notifierOptions)];
                case 5:
                    user3 = _a.sent();
                    return [2 /*return*/, options.sanitizeUserForClient(user3)];
            }
        });
    });
}
