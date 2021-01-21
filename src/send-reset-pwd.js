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
var debug_1 = __importDefault(require("debug"));
var concat_id_and_hash_1 = __importDefault(require("./helpers/concat-id-and-hash"));
var ensure_obj_props_valid_1 = __importDefault(require("./helpers/ensure-obj-props-valid"));
var get_long_token_1 = __importDefault(require("./helpers/get-long-token"));
var get_short_token_1 = __importDefault(require("./helpers/get-short-token"));
var get_user_data_1 = __importDefault(require("./helpers/get-user-data"));
var hash_password_1 = __importDefault(require("./helpers/hash-password"));
var notifier_1 = __importDefault(require("./helpers/notifier"));
var debug = debug_1.default('authLocalMgnt:sendResetPwd');
function sendResetPwd(options, identifyUser, field, notifierOptions) {
    if (notifierOptions === void 0) { notifierOptions = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var usersService, usersServiceIdName, users, user1, user2, _a, _b, _c, _d, _e, user3, _f, _g, _h, _j, _k;
        var _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    debug('sendResetPwd');
                    usersService = options.app.service(options.service);
                    usersServiceIdName = usersService.id;
                    ensure_obj_props_valid_1.default(identifyUser, options.identifyUserProps);
                    return [4 /*yield*/, usersService.find({ query: identifyUser })];
                case 1:
                    users = _o.sent();
                    user1 = get_user_data_1.default(users, options.skipIsVerifiedCheck ? [] : ['isVerified']);
                    if (!
                    // Use existing token when it's not hashed,
                    (options.reuseResetToken && user1.resetToken && user1.resetToken.includes('___') &&
                        // and remaining time exceeds half of resetDelay
                        user1.resetExpires > Date.now() + options.resetDelay / 2)) 
                    // Use existing token when it's not hashed,
                    return [3 /*break*/, 3];
                    return [4 /*yield*/, notifier_1.default(options.notifier, 'sendResetPwd', user1, notifierOptions)];
                case 2:
                    _o.sent();
                    return [2 /*return*/, options.sanitizeUserForClient(user1)];
                case 3:
                    _b = (_a = Object).assign;
                    _c = [user1];
                    _l = {
                        resetExpires: Date.now() + options.resetDelay,
                        resetAttempts: options.resetAttempts
                    };
                    _d = concat_id_and_hash_1.default;
                    _e = [user1[usersServiceIdName]];
                    return [4 /*yield*/, get_long_token_1.default(options.longTokenLen)];
                case 4:
                    _l.resetToken = _d.apply(void 0, _e.concat([_o.sent()]));
                    return [4 /*yield*/, get_short_token_1.default(options.shortTokenLen, options.shortTokenDigits)];
                case 5:
                    user2 = _b.apply(_a, _c.concat([(_l.resetShortToken = _o.sent(),
                            _l)]));
                    return [4 /*yield*/, notifier_1.default(options.notifier, 'sendResetPwd', user2, notifierOptions)];
                case 6:
                    _o.sent();
                    _g = (_f = usersService).patch;
                    _h = [user2[usersServiceIdName]];
                    _m = {
                        resetExpires: user2.resetExpires,
                        resetAttempts: user2.resetAttempts
                    };
                    if (!options.reuseResetToken) return [3 /*break*/, 7];
                    _j = user2.resetToken;
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, hash_password_1.default(options.app, user2.resetToken, field)];
                case 8:
                    _j = _o.sent();
                    _o.label = 9;
                case 9:
                    _m.resetToken = _j;
                    if (!options.reuseResetToken) return [3 /*break*/, 10];
                    _k = user2.resetShortToken;
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, hash_password_1.default(options.app, user2.resetShortToken, field)];
                case 11:
                    _k = _o.sent();
                    _o.label = 12;
                case 12: return [4 /*yield*/, _g.apply(_f, _h.concat([(_m.resetShortToken = _k,
                            _m)]))];
                case 13:
                    user3 = _o.sent();
                    return [2 /*return*/, options.sanitizeUserForClient(user3)];
            }
        });
    });
}
exports.default = sendResetPwd;
