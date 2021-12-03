"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.createHasuraBackendPlus = exports.HBPInstance = void 0;
var jwt_decode_1 = __importDefault(require("jwt-decode"));
var NhostClient_1 = __importDefault(require("./NhostClient"));
function notAuthorized() {
    window.alert('You dont autorize to view this page.');
}
function notAuthenticated() {
    window.alert("Only for authenticated users!");
}
var HBPInstance = /** @class */ (function () {
    function HBPInstance(options, routerSettings) {
        var _this = this;
        if (routerSettings === void 0) { routerSettings = {}; }
        this.hasRole = function (role) {
            if (!_this.token)
                return false;
            return _this.claims["x-hasura-allowed-roles"].includes(role);
        };
        this.handleOnAuthStateChanged = function (status) { return __awaiter(_this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                this.authenticated = status;
                // store.commit("app/isAuthenticated", status);
                if (status) {
                    token = this.auth.getJWTToken();
                    this.token = token;
                    this.claims = (0, jwt_decode_1.default)(token)["https://hasura.io/jwt/claims"];
                    // store.commit("app/setAuthData", this.claims);
                    // store.dispatch("app/getUserSettings", this.claims);
                    //
                }
                else {
                    this.token = undefined;
                    this.claims = undefined;
                    // store.commit("app/setAuthData", null);
                    // store.dispatch("app/getUserSettings", null);
                }
                return [2 /*return*/, status];
            });
        }); };
        this.routerInitApp = function (to, from, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.auth.isAuthenticated() === null)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, new Promise(function (resolve) {
                                _this.auth.onAuthStateChanged(function (status) {
                                    resolve(status);
                                });
                            })];
                    case 1:
                        _a.authenticated = _b.sent();
                        _b.label = 2;
                    case 2:
                        next();
                        return [2 /*return*/];
                }
            });
        }); };
        this.routeAuthorizeGuard = function (router, store) { return function (to, from, next) {
            // Autorizace
            var isAuthenticated = _this.auth.isAuthenticated();
            if (to.matched.some(function (record) { return record.meta.requiresAuth; })) {
                if (isAuthenticated) {
                    if (to.matched.some(function (record) { return record.meta.role; })) {
                        var recordWithRole = to.matched.find(function (record) { return record.meta.role; });
                        if (_this.hasRole(recordWithRole.meta.role)) {
                            next();
                        }
                        else {
                            _this.notAuthorized();
                            next(_this.notAuthorizedPath);
                        }
                    }
                    else {
                        next();
                    }
                }
                else {
                    _this.notAuthenticated();
                    next(_this.loginPath);
                }
            }
            else if ((to.path === _this.registerPath && _this.auth.isAuthenticated()) ||
                (to.path === _this.loginPath && _this.auth.isAuthenticated())) {
                next(_this.afterLoginPath);
            }
            else {
                next();
            }
        }; };
        this.appId = options.appId ? options.appId : null;
        this.baseURL = options.baseURL;
        // console.log("APPID", options.appId, this.appId)
        // console.log("BASEURL", this.baseURL)
        var nhost = new NhostClient_1.default({
            baseURL: this.baseURL,
            useCookies: false,
            refreshIntervalTime: (options.refreshIntervalTime || 600) * 1000,
            appId: this.appId,
        });
        this.auth = nhost.auth;
        this.storage = nhost.storage;
        this.claims = undefined;
        this.authenticated = false;
        this.token = "";
        this.notAuthenticated = routerSettings.notAuthenticated
            ? routerSettings.notAuthenticated
            : notAuthenticated;
        this.notAuthorized = routerSettings.notAuthorized
            ? routerSettings.notAuthorized
            : notAuthorized;
        this.loginPath = routerSettings.loginPath
            ? routerSettings.loginPath
            : "/auth/login";
        this.registerPath = routerSettings.registerPath
            ? routerSettings.registerPath
            : "/auth/register";
        this.notAuthorizedPath = routerSettings.notAuthorizedPath
            ? routerSettings.notAuthorizedPath
            : "/admin/home";
        this.afterLoginPath = routerSettings.afterLoginPath
            ? routerSettings.afterLoginPath
            : "/admin/home";
    }
    HBPInstance.prototype.requestPasswordChange = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var error, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.auth.requestPasswordChange(email)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        error = err_1;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, {
                            error: error,
                        }];
                }
            });
        });
    };
    HBPInstance.prototype.changePassword = function (oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var error, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.auth.changePassword(oldPassword, newPassword)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        error = err_2;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, {
                            error: error
                        }];
                }
            });
        });
    };
    HBPInstance.prototype.confirmPasswordChange = function (ticket, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var error, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.auth.confirmPasswordChange(newPassword, ticket)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_3 = _a.sent();
                        error = err_3;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, {
                            error: error
                        }];
                }
            });
        });
    };
    HBPInstance.prototype.login = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var error, data, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        error = undefined;
                        return [4 /*yield*/, this.auth.login({ email: email, password: password })];
                    case 1:
                        data = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_4 = _a.sent();
                        error = err_4;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, {
                            data: data,
                            error: error,
                        }];
                }
            });
        });
    };
    HBPInstance.prototype.createUserWithEmail = function (email, password, additionalFields) {
        return __awaiter(this, void 0, void 0, function () {
            var error, data, userData, options, registerData, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userData = __assign({}, additionalFields);
                        options = {
                            userData: userData,
                        };
                        registerData = {
                            email: email,
                            password: password,
                            options: options,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        error = undefined;
                        return [4 /*yield*/, this.auth.register(registerData)];
                    case 2:
                        data = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_5 = _a.sent();
                        error = err_5;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, {
                            data: data,
                            error: error,
                        }];
                }
            });
        });
    };
    HBPInstance.prototype.logout = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var error, data, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        error = undefined;
                        return [4 /*yield*/, this.auth.logout(true)];
                    case 1:
                        data = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_6 = _a.sent();
                        error = err_6;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, {
                            data: data,
                            error: error,
                        }];
                }
            });
        });
    };
    return HBPInstance;
}());
exports.HBPInstance = HBPInstance;
var createHasuraBackendPlus = function (options, routerSettings) {
    return new HBPInstance(options, routerSettings);
};
exports.createHasuraBackendPlus = createHasuraBackendPlus;
//# sourceMappingURL=index.js.map