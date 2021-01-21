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
var ensure_obj_props_valid_1 = __importDefault(require("./helpers/ensure-obj-props-valid"));
var get_long_token_1 = __importDefault(require("./helpers/get-long-token"));
var get_short_token_1 = __importDefault(require("./helpers/get-short-token"));
var get_user_data_1 = __importDefault(require("./helpers/get-user-data"));
var notifier_1 = __importDefault(require("./helpers/notifier"));
var debug = debug_1.default('authLocalMgnt:resendVerifySignup');
// {email}, {cellphone}, {verifyToken}, {verifyShortToken},
// {email, cellphone, verifyToken, verifyShortToken}
function resendVerifySignup(options, identifyUser, notifierOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var usersService, usersServiceIdName, users, user1, user2, _a, _b, _c, user3;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    debug('identifyUser=', identifyUser);
                    usersService = options.app.service(options.service);
                    usersServiceIdName = usersService.id;
                    ensure_obj_props_valid_1.default(identifyUser, options.identifyUserProps.concat('verifyToken', 'verifyShortToken'));
                    return [4 /*yield*/, usersService.find({ query: identifyUser })];
                case 1:
                    users = _e.sent();
                    user1 = get_user_data_1.default(users, ['isNotVerified']);
                    _b = (_a = usersService).patch;
                    _c = [user1[usersServiceIdName]];
                    _d = {
                        isVerified: false,
                        verifyExpires: Date.now() + options.delay
                    };
                    return [4 /*yield*/, get_long_token_1.default(options.longTokenLen)];
                case 2:
                    _d.verifyToken = _e.sent();
                    return [4 /*yield*/, get_short_token_1.default(options.shortTokenLen, options.shortTokenDigits)];
                case 3: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.verifyShortToken = _e.sent(),
                            _d)]))];
                case 4:
                    user2 = _e.sent();
                    return [4 /*yield*/, notifier_1.default(options.notifier, 'resendVerifySignup', user2, notifierOptions)];
                case 5:
                    user3 = _e.sent();
                    return [2 /*return*/, options.sanitizeUserForClient(user3)];
            }
        });
    });
}
exports.default = resendVerifySignup;
;
