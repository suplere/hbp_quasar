"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Auth_1 = __importDefault(require("./Auth"));
var Storage_1 = __importDefault(require("./Storage"));
var Notification_1 = __importDefault(require("./Notification"));
var UserSession_1 = __importDefault(require("./UserSession"));
var NhostClient = /** @class */ (function () {
    function NhostClient(config) {
        var _a, _b, _c, _d, _e;
        if (!config.baseURL)
            throw "Please specify a baseURL. More information at https://docs.nhost.io/libraries/nhost-js-sdk#setup.";
        // console.log("NHOST CONFIG", config)  
        this.baseURL = config.baseURL;
        this.appId = config.appId;
        this.ssr = (_a = config.ssr) !== null && _a !== void 0 ? _a : typeof window === "undefined";
        this.useCookies = (_b = config.useCookies) !== null && _b !== void 0 ? _b : false;
        this.autoLogin = (_c = config.autoLogin) !== null && _c !== void 0 ? _c : true;
        this.createStorage = (_d = config.createStorage) !== null && _d !== void 0 ? _d : true;
        this.handleNotifications = (_e = config.handleNotifications) !== null && _e !== void 0 ? _e : true;
        this.publicVapidKey = config.publicVapidKey ? config.publicVapidKey : null;
        // console.log("this.handleNotifications", this.handleNotifications);
        // console.log("this.publicVapidKey", this.publicVapidKey);
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
            appId: this.appId,
        }, this.session, this);
        // this.auth = new NhostAuth(authConfig, this.session);
        if (this.createStorage) {
            this.storage = new Storage_1.default({
                baseURL: this.appId ? this.baseURL + "/custom" : this.baseURL,
                useCookies: this.useCookies,
                appId: this.appId,
            }, this.session);
        }
        if (this.handleNotifications &&
            this.publicVapidKey &&
            this.publicVapidKey.length) {
            // console.log("CREATE NOTIFICATION MODULE");
            this.notifications = new Notification_1.default({
                baseURL: this.appId ? this.baseURL + "/custom" : this.baseURL,
                appId: this.appId,
                publicVapidKey: this.publicVapidKey,
            }, this.session);
        }
    }
    return NhostClient;
}());
exports.default = NhostClient;
//# sourceMappingURL=NhostClient.js.map