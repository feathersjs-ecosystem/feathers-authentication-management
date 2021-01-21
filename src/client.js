// Wrapper for client interface to feathers-authenticate-management
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
function AuthManagement(app) {
    /*if (!(this instanceof AuthManagement)) {
      return new AuthManagement(app);
    }*/
    var _this = this;
    var authManagement = app.service('authManagement');
    this.checkUnique = function (identifyUser, ownId, ifErrMsg) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'checkUnique',
                        value: identifyUser,
                        ownId: ownId,
                        meta: { noErrMsg: ifErrMsg }
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.resendVerifySignup = function (identifyUser, notifierOptions) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'resendVerifySignup',
                        value: identifyUser,
                        notifierOptions: notifierOptions
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.verifySignupLong = function (verifyToken) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'verifySignupLong',
                        value: verifyToken
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.verifySignupShort = function (verifyShortToken, identifyUser) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'verifySignupShort',
                        value: { user: identifyUser, token: verifyShortToken }
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.sendResetPwd = function (identifyUser, notifierOptions) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'sendResetPwd',
                        value: identifyUser,
                        notifierOptions: notifierOptions
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.resetPwdLong = function (resetToken, password) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'resetPwdLong',
                        value: { token: resetToken, password: password }
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.resetPwdShort = function (resetShortToken, identifyUser, password) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'resetPwdShort',
                        value: { user: identifyUser, token: resetShortToken, password: password }
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.passwordChange = function (oldPassword, password, identifyUser) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'passwordChange',
                        value: { user: identifyUser, oldPassword: oldPassword, password: password }
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.identityChange = function (password, changesIdentifyUser, identifyUser) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authManagement.create({
                        action: 'identityChange',
                        value: { user: identifyUser, password: password, changes: changesIdentifyUser }
                    }, {})];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    this.authenticate = function (email, password, cb) { return __awaiter(_this, void 0, void 0, function () {
        var cbCalled;
        return __generator(this, function (_a) {
            cbCalled = false;
            return [2 /*return*/, app.authenticate({ type: 'local', email: email, password: password })
                    .then(function (result) {
                    var user = result.data;
                    if (!user || !user.isVerified) {
                        app.logout();
                        return cb(new Error(user ? 'User\'s email is not verified.' : 'No user returned.'));
                    }
                    if (cb) {
                        cbCalled = true;
                        return cb(null, user);
                    }
                    return user;
                })
                    .catch(function (err) {
                    if (!cbCalled) {
                        cb(err);
                    }
                })];
        });
    }); };
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = AuthManagement;
}
