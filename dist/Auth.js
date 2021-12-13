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
var axios_1 = __importDefault(require("axios"));
var query_string_1 = __importDefault(require("query-string"));
var Auth = /** @class */ (function () {
    function Auth(config, session, parent) {
        var baseURL = config.baseURL, useCookies = config.useCookies, refreshIntervalTime = config.refreshIntervalTime, clientStorage = config.clientStorage, clientStorageType = config.clientStorageType, ssr = config.ssr, autoLogin = config.autoLogin, appId = config.appId;
        this.parent = parent;
        this.useCookies = useCookies;
        this.refreshIntervalTime = refreshIntervalTime;
        this.clientStorage = clientStorage;
        this.clientStorageType = clientStorageType;
        this.tokenChangedFunctions = [];
        this.authChangedFunctions = [];
        this.refreshInterval;
        this.refreshSleepCheckInterval = 0;
        this.refreshIntervalSleepCheckLastSample = Date.now();
        this.sampleRate = 2000; // check every 2 seconds
        this.ssr = ssr;
        this.appId = appId;
        this.refreshTokenLock = false;
        this.baseURL = baseURL;
        this.loading = true;
        this.currentUser = null;
        this.currentSession = session;
        this.httpClient = axios_1.default.create({
            baseURL: this.baseURL + "/auth",
            timeout: 10000,
            withCredentials: this.useCookies,
        });
        // get refresh token from query param (from external OAuth provider callback)
        var refreshToken = null;
        if (!ssr) {
            try {
                var parsed = query_string_1.default.parse(window.location.search);
                refreshToken =
                    "refresh_token" in parsed ? parsed.refresh_token : null;
                if (refreshToken) {
                    var newURL = this._removeParam("refresh_token", window.location.href);
                    try {
                        window.history.pushState({}, document.title, newURL);
                    }
                    catch (_a) {
                        // noop
                        // window object not available
                    }
                }
            }
            catch (e) {
                // noop. `window` not available probably.
            }
        }
        // if empty string, then set it to null
        refreshToken = refreshToken ? refreshToken : null;
        if (autoLogin) {
            this._autoLogin(refreshToken);
        }
        else if (refreshToken) {
            this._setItem("nhostRefreshToken", refreshToken);
        }
    }
    Auth.prototype.generateApplicationIdHeader = function () {
        if (this.appId) {
            return {
                ApplicationId: "" + this.appId,
            };
        }
        else {
            return null;
        }
    };
    Auth.prototype.user = function () {
        return this.currentUser;
    };
    Auth.prototype.register = function (_a) {
        var email = _a.email, password = _a.password, _b = _a.options, options = _b === void 0 ? {} : _b;
        return __awaiter(this, void 0, void 0, function () {
            var userData, defaultRole, allowedRoles, registerOptions, data, res, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        userData = options.userData, defaultRole = options.defaultRole, allowedRoles = options.allowedRoles;
                        registerOptions = defaultRole || allowedRoles
                            ? {
                                default_role: defaultRole,
                                allowed_roles: allowedRoles,
                            }
                            : undefined;
                        data = {
                            email: email,
                            password: password,
                            cookie: this.useCookies,
                            user_data: userData,
                            register_options: registerOptions,
                        };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.httpClient.post("/register", data, this._generateAxiosHeaderConfig())];
                    case 2:
                        res = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        throw error_1;
                    case 4:
                        if (res.data.jwt_token) {
                            this._setSession(res.data);
                            return [2 /*return*/, { session: res.data, user: res.data.user }];
                        }
                        else {
                            // if AUTO_ACTIVATE_NEW_USERS is false
                            return [2 /*return*/, { session: null, user: res.data.user }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.login = function (_a) {
        var email = _a.email, password = _a.password, provider = _a.provider;
        return __awaiter(this, void 0, void 0, function () {
            var res, data, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (provider) {
                            window.location.href = this.baseURL + "/auth/providers/" + provider;
                            return [2 /*return*/, { session: null, user: null }];
                        }
                        data = {
                            email: email,
                            password: password,
                            cookie: this.useCookies,
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.httpClient.post("/login", data, this._generateAxiosHeaderConfig())];
                    case 2:
                        res = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        this._clearSession();
                        throw error_2;
                    case 4:
                        if ("mfa" in res.data) {
                            return [2 /*return*/, { session: null, user: null, mfa: { ticket: res.data.ticket } }];
                        }
                        if ("magicLink" in res.data) {
                            return [2 /*return*/, { session: null, user: null, magicLink: true }];
                        }
                        this._setSession(res.data);
                        return [2 /*return*/, { session: res.data, user: res.data.user }];
                }
            });
        });
    };
    Auth.prototype.logout = function (all) {
        if (all === void 0) { all = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, error_3;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 3, , 4]);
                        _b = (_a = this.httpClient).post;
                        _c = ["/logout",
                            {
                                all: all,
                            }];
                        _d = {
                            headers: __assign({}, this.generateApplicationIdHeader())
                        };
                        _e = {};
                        return [4 /*yield*/, this._getItem("nhostRefreshToken")];
                    case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.params = (_e.refresh_token = _f.sent(),
                                _e),
                                _d)]))];
                    case 2:
                        _f.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _f.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        this._clearSession();
                        return [2 /*return*/, { session: null, user: null }];
                }
            });
        });
    };
    Auth.prototype.onTokenChanged = function (fn) {
        var _this = this;
        this.tokenChangedFunctions.push(fn);
        // get index;
        var tokenChangedFunctionIndex = this.tokenChangedFunctions.length - 1;
        var unsubscribe = function () {
            try {
                // replace onTokenChanged with empty function
                _this.tokenChangedFunctions[tokenChangedFunctionIndex] = function () { };
            }
            catch (err) {
                console.warn("Unable to unsubscribe onTokenChanged function. Maybe you already did?");
            }
        };
        return unsubscribe;
    };
    Auth.prototype.onAuthStateChanged = function (fn) {
        var _this = this;
        this.authChangedFunctions.push(fn);
        // get index;
        var authStateChangedFunctionIndex = this.authChangedFunctions.length - 1;
        var unsubscribe = function () {
            try {
                // replace onAuthStateChanged with empty function
                _this.authChangedFunctions[authStateChangedFunctionIndex] = function () { };
            }
            catch (err) {
                console.warn("Unable to unsubscribe onAuthStateChanged function. Maybe you already did?");
            }
        };
        return unsubscribe;
    };
    Auth.prototype.isAuthenticated = function () {
        if (this.loading)
            return null;
        return this.currentSession.getSession() !== null;
    };
    Auth.prototype.isAuthenticatedAsync = function () {
        var _this = this;
        var isAuthenticated = this.isAuthenticated();
        return new Promise(function (resolve) {
            if (isAuthenticated !== null)
                resolve(isAuthenticated);
            else {
                var unsubscribe_1 = _this.onAuthStateChanged(function (isAuthenticated) {
                    resolve(isAuthenticated);
                    unsubscribe_1();
                });
            }
        });
    };
    Auth.prototype.getJWTToken = function () {
        var _a;
        return ((_a = this.currentSession.getSession()) === null || _a === void 0 ? void 0 : _a.jwt_token) || null;
    };
    Auth.prototype.getClaim = function (claim) {
        return this.currentSession.getClaim(claim);
    };
    Auth.prototype.refreshSession = function (initRefreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._refreshToken(initRefreshToken)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Auth.prototype.activate = function (ticket) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.get("/activate?ticket=" + ticket, this._generateAxiosHeaderConfig())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.changeEmail = function (new_email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/change-email", { new_email: new_email }, this._generateAxiosHeaderConfig())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.updateUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/updateUserData", { user: user }, this._generateAxiosHeaderConfig())];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Auth.prototype.requestEmailChange = function (new_email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/change-email/request", { new_email: new_email }, this._generateAxiosHeaderConfig())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.confirmEmailChange = function (ticket) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/change-email/change", {
                            ticket: ticket,
                        }, this._generateAxiosHeaderConfig())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.changePassword = function (oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/change-password", {
                            old_password: oldPassword,
                            new_password: newPassword,
                        }, this._generateAxiosHeaderConfig())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.requestPasswordChange = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            email: email,
                        };
                        // if (this.appId) data["app_id"] = this.appId;
                        return [4 /*yield*/, this.httpClient.post("/change-password/request", __assign({}, data), this._generateAxiosHeaderConfig())];
                    case 1:
                        // if (this.appId) data["app_id"] = this.appId;
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.confirmPasswordChange = function (newPassword, ticket) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/change-password/change", {
                            new_password: newPassword,
                            ticket: ticket,
                        }, this._generateAxiosHeaderConfig())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.MFAGenerate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/mfa/generate", {}, this._generateAxiosHeaderConfig())];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    Auth.prototype.MFAEnable = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/mfa/enable", {
                            code: code,
                        }, this._generateAxiosHeaderConfig())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.MFADisable = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/mfa/disable", {
                            code: code,
                        }, this._generateAxiosHeaderConfig())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.MFATotp = function (code, ticket) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.post("/mfa/totp", {
                            code: code,
                            ticket: ticket,
                            cookie: this.useCookies,
                        }, this._generateAxiosHeaderConfig())];
                    case 1:
                        res = _a.sent();
                        this._setSession(res.data);
                        return [2 /*return*/, { session: res.data, user: res.data.user }];
                }
            });
        });
    };
    Auth.prototype._removeParam = function (key, sourceURL) {
        var rtn = sourceURL.split("?")[0], param, params_arr = [], queryString = sourceURL.indexOf("?") !== -1 ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }
            if (params_arr.length > 0) {
                rtn = rtn + "?" + params_arr.join("&");
            }
        }
        return rtn;
    };
    Auth.prototype._setItem = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof value !== "string") {
                            console.error("value is not of type \"string\"");
                            return [2 /*return*/];
                        }
                        _a = this.clientStorageType;
                        switch (_a) {
                            case "web": return [3 /*break*/, 1];
                            case "custom": return [3 /*break*/, 2];
                            case "react-native": return [3 /*break*/, 2];
                            case "capacitor": return [3 /*break*/, 4];
                            case "expo-secure-storage": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 1:
                        if (typeof this.clientStorage.setItem !== "function") {
                            console.error("this.clientStorage.setItem is not a function");
                            return [3 /*break*/, 8];
                        }
                        this.clientStorage.setItem(key, value);
                        return [3 /*break*/, 8];
                    case 2:
                        if (typeof this.clientStorage.setItem !== "function") {
                            console.error("this.clientStorage.setItem is not a function");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, this.clientStorage.setItem(key, value)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 4:
                        if (typeof this.clientStorage.set !== "function") {
                            console.error("this.clientStorage.set is not a function");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, this.clientStorage.set({ key: key, value: value })];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        if (typeof this.clientStorage.setItemAsync !== "function") {
                            console.error("this.clientStorage.setItemAsync is not a function");
                            return [3 /*break*/, 8];
                        }
                        this.clientStorage.setItemAsync(key, value);
                        return [3 /*break*/, 8];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype._getItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.clientStorageType;
                        switch (_a) {
                            case "web": return [3 /*break*/, 1];
                            case "custom": return [3 /*break*/, 2];
                            case "react-native": return [3 /*break*/, 3];
                            case "capacitor": return [3 /*break*/, 5];
                            case "expo-secure-storage": return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 8];
                    case 1:
                        if (typeof this.clientStorage.getItem !== "function") {
                            console.error("this.clientStorage.getItem is not a function");
                            return [3 /*break*/, 9];
                        }
                        return [2 /*return*/, this.clientStorage.getItem(key)];
                    case 2: return [2 /*return*/, true];
                    case 3:
                        if (typeof this.clientStorage.getItem !== "function") {
                            console.error("this.clientStorage.getItem is not a function");
                            return [3 /*break*/, 9];
                        }
                        return [4 /*yield*/, this.clientStorage.getItem(key)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5:
                        if (typeof this.clientStorage.get !== "function") {
                            console.error("this.clientStorage.get is not a function");
                            return [3 /*break*/, 9];
                        }
                        return [4 /*yield*/, this.clientStorage.get({ key: key })];
                    case 6:
                        res = _b.sent();
                        return [2 /*return*/, res.value];
                    case 7:
                        if (typeof this.clientStorage.getItemAsync !== "function") {
                            console.error("this.clientStorage.getItemAsync is not a function");
                            return [3 /*break*/, 9];
                        }
                        return [2 /*return*/, this.clientStorage.getItemAsync(key)];
                    case 8: return [3 /*break*/, 9];
                    case 9: return [2 /*return*/, false];
                }
            });
        });
    };
    Auth.prototype._removeItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.clientStorageType;
                        switch (_a) {
                            case "web": return [3 /*break*/, 1];
                            case "custom": return [3 /*break*/, 2];
                            case "react-native": return [3 /*break*/, 2];
                            case "capacitor": return [3 /*break*/, 4];
                            case "expo-secure-storage": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 1:
                        if (typeof this.clientStorage.removeItem !== "function") {
                            console.error("this.clientStorage.removeItem is not a function");
                            return [3 /*break*/, 8];
                        }
                        return [2 /*return*/, this.clientStorage.removeItem(key)];
                    case 2:
                        if (typeof this.clientStorage.removeItem !== "function") {
                            console.error("this.clientStorage.removeItem is not a function");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, this.clientStorage.removeItem(key)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        if (typeof this.clientStorage.remove !== "function") {
                            console.error("this.clientStorage.remove is not a function");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, this.clientStorage.remove({ key: key })];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        if (typeof this.clientStorage.deleteItemAsync !== "function") {
                            console.error("this.clientStorage.deleteItemAsync is not a function");
                            return [3 /*break*/, 8];
                        }
                        this.clientStorage.deleteItemAsync(key);
                        return [3 /*break*/, 8];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype._generateHeaders = function () {
        var _a;
        if (this.useCookies)
            return null;
        return {
            Authorization: "Bearer " + ((_a = this.currentSession.getSession()) === null || _a === void 0 ? void 0 : _a.jwt_token),
        };
    };
    Auth.prototype._generateAxiosHeaderConfig = function () {
        var _a;
        if (this.useCookies)
            return {
                headers: __assign({}, this.generateApplicationIdHeader()),
            };
        var token = (_a = this.currentSession.getSession()) === null || _a === void 0 ? void 0 : _a.jwt_token;
        if (token) {
            return {
                headers: __assign({ Authorization: "Bearer " + token }, this.generateApplicationIdHeader()),
            };
        }
        else {
            return {
                headers: __assign({}, this.generateApplicationIdHeader()),
            };
        }
    };
    Auth.prototype._autoLogin = function (refreshToken) {
        if (this.ssr) {
            return;
        }
        this._refreshToken(refreshToken);
    };
    Auth.prototype._refreshToken = function (initRefreshToken) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var refreshToken, _b, res, error_4;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = initRefreshToken;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getItem("nhostRefreshToken")];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2:
                        refreshToken = _b;
                        if (!this.useCookies && !refreshToken) {
                            // place at end of call-stack to let frontend get `null` first (to match SSR)
                            setTimeout(function () {
                                _this._clearSession();
                            }, 0);
                            return [2 /*return*/];
                        }
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, 9, 10]);
                        // set lock to avoid two refresh token request being sent at the same time with the same token.
                        // If so, the last request will fail because the first request used the refresh token
                        if (this.refreshTokenLock) {
                            return [2 /*return*/];
                        }
                        this.refreshTokenLock = true;
                        return [4 /*yield*/, this.httpClient.get("/token/refresh", {
                                headers: __assign({}, this.generateApplicationIdHeader()),
                                params: {
                                    refresh_token: refreshToken,
                                },
                            })];
                    case 4:
                        // make refresh token request
                        res = _c.sent();
                        return [3 /*break*/, 10];
                    case 5:
                        error_4 = _c.sent();
                        if (!(((_a = error_4.response) === null || _a === void 0 ? void 0 : _a.status) === 401)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.logout()];
                    case 6:
                        _c.sent();
                        return [2 /*return*/];
                    case 7: return [2 /*return*/]; // silent fail
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        // release lock
                        this.refreshTokenLock = false;
                        return [7 /*endfinally*/];
                    case 10:
                        this._setSession(res.data);
                        this.tokenChanged();
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.tokenChanged = function () {
        for (var _i = 0, _a = this.tokenChangedFunctions; _i < _a.length; _i++) {
            var tokenChangedFunction = _a[_i];
            tokenChangedFunction();
        }
    };
    Auth.prototype.authStateChanged = function (state) {
        if (this.parent) {
            this.parent.notifications.getUserNotifications();
        }
        for (var _i = 0, _a = this.authChangedFunctions; _i < _a.length; _i++) {
            var authChangedFunction = _a[_i];
            authChangedFunction(state);
        }
    };
    Auth.prototype._clearSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // early exit
                if (this.isAuthenticated() === false) {
                    return [2 /*return*/];
                }
                clearInterval(this.refreshInterval);
                clearInterval(this.refreshSleepCheckInterval);
                this.currentSession.clearSession();
                this._removeItem("nhostRefreshToken");
                this.currentUser = null;
                this.loading = false;
                this.authStateChanged(false);
                return [2 /*return*/];
            });
        });
    };
    Auth.prototype._setSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var previouslyAuthenticated, JWTExpiresIn, refreshIntervalTime;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        previouslyAuthenticated = this.isAuthenticated();
                        this.currentSession.setSession(session);
                        this.currentUser = session.user;
                        if (!(!this.useCookies && session.refresh_token)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._setItem("nhostRefreshToken", session.refresh_token)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!previouslyAuthenticated) {
                            JWTExpiresIn = session.jwt_expires_in;
                            refreshIntervalTime = this.refreshIntervalTime
                                ? this.refreshIntervalTime
                                : Math.max(30 * 1000, JWTExpiresIn - 45000);
                            this.refreshInterval = setInterval(this._refreshToken.bind(this), refreshIntervalTime);
                            // refresh token after computer has been sleeping
                            // https://stackoverflow.com/questions/14112708/start-calling-js-function-when-pc-wakeup-from-sleep-mode
                            this.refreshIntervalSleepCheckLastSample = Date.now();
                            this.refreshSleepCheckInterval = setInterval(function () {
                                if (Date.now() - _this.refreshIntervalSleepCheckLastSample >=
                                    _this.sampleRate * 2) {
                                    _this._refreshToken();
                                }
                                _this.refreshIntervalSleepCheckLastSample = Date.now();
                            }, this.sampleRate);
                            this.authStateChanged(true);
                        }
                        this.loading = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    return Auth;
}());
exports.default = Auth;
//# sourceMappingURL=Auth.js.map