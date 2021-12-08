"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentInfoHelper = void 0;
var Bowser = __importStar(require("bowser"));
var types_1 = require("./types");
var utils_1 = require("./utils");
var EnvironmentInfoHelper = /** @class */ (function () {
    function EnvironmentInfoHelper() {
    }
    EnvironmentInfoHelper.getEnvironmentInfo = function () {
        var browser = Bowser.getParser(window.navigator.userAgent);
        return {
            browserType: this.getBrowser(browser),
            browserVersion: this.getBrowserVersion(browser),
            isHttps: this.isHttps(),
            isBrowserAndSupportsServiceWorkers: this.supportsServiceWorkers(),
            requiresUserInteraction: this.requiresUserInteraction(browser),
            osName: browser.getOSName(),
            osVersion: browser.getOSVersion(),
            canTalkToServiceWorker: this.canTalkToServiceWorker(),
        };
    };
    EnvironmentInfoHelper.getBrowserVersion = function (browser) {
        return (0, utils_1.parseVersionString)(browser.getBrowserVersion());
    };
    EnvironmentInfoHelper.getBrowser = function (browser) {
        if (browser.isBrowser("chrome", true)) {
            return types_1.Browser.Chrome;
        }
        if (browser.isBrowser("msedge", true)) {
            return types_1.Browser.Edge;
        }
        if (browser.isBrowser("opera", true)) {
            return types_1.Browser.Opera;
        }
        if (browser.isBrowser("firefox", true)) {
            return types_1.Browser.Firefox;
        }
        // use existing safari detection to be consistent
        if (browser.isBrowser("safari", true)) {
            return types_1.Browser.Safari;
        }
        return types_1.Browser.Other;
    };
    EnvironmentInfoHelper.isHttps = function () {
        return window
            ? window.location && window.location.protocol === "https:"
            : false;
    };
    EnvironmentInfoHelper.supportsServiceWorkers = function () {
        return window.navigator && "serviceWorker" in window.navigator;
    };
    EnvironmentInfoHelper.requiresUserInteraction = function (browser) {
        // Firefox 72+ requires user-interaction
        if (this.getBrowser(browser) === "firefox" &&
            this.getBrowserVersion(browser) >= 72) {
            return true;
        }
        // Safari 12.1+ requires user-interaction
        if (this.getBrowser(browser) === "safari" && this.getBrowserVersion(browser) >= 12.1) {
            return true;
        }
        return false;
    };
    EnvironmentInfoHelper.canTalkToServiceWorker = function () {
        return !!window.isSecureContext;
    };
    return EnvironmentInfoHelper;
}());
exports.EnvironmentInfoHelper = EnvironmentInfoHelper;
//# sourceMappingURL=EnvironmentInfoHelper.js.map