"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Auth_1 = __importDefault(require("./Auth"));
var Storage_1 = __importDefault(require("./Storage"));
var UserSession_1 = __importDefault(require("./UserSession"));
var NhostClient = /** @class */ (function () {
    function NhostClient(config) {
        var _a, _b, _c;
        if (!config.baseURL)
            throw "Please specify a baseURL. More information at https://docs.nhost.io/libraries/nhost-js-sdk#setup.";
        this.baseURL = config.baseURL;
        this.appId = config.appId;
        this.ssr = (_a = config.ssr) !== null && _a !== void 0 ? _a : typeof window === "undefined";
        this.useCookies = (_b = config.useCookies) !== null && _b !== void 0 ? _b : false;
        this.autoLogin = (_c = config.autoLogin) !== null && _c !== void 0 ? _c : true;
        this.session = new UserSession_1.default();
        // Default JWTExpiresIn is 15 minutes (900000 miliseconds)
        this.refreshIntervalTime = config.refreshIntervalTime || null;
        this.clientStorage = this.ssr
            ? {}
            : config.clientStorage || window.localStorage;
        this.clientStorageType = config.clientStorageType
            ? config.clientStorageType
            : "web";
        this.auth = new Auth_1.default({
            baseURL: this.appId ? this.baseURL + "/custom" : this.baseURL,
            useCookies: this.useCookies,
            refreshIntervalTime: this.refreshIntervalTime,
            clientStorage: this.clientStorage,
            clientStorageType: this.clientStorageType,
            ssr: this.ssr,
            autoLogin: this.autoLogin,
            appId: this.appId
        }, this.session);
        // this.auth = new NhostAuth(authConfig, this.session);
        this.storage = new Storage_1.default({
            baseURL: this.baseURL,
            useCookies: this.useCookies,
        }, this.session);
    }
    return NhostClient;
}());
exports.default = NhostClient;
//# sourceMappingURL=NhostClient.js.map