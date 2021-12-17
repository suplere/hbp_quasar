"use strict";
// Class for management notification settings - email + webpush
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
var EnvironmentInfoHelper_1 = require("./EnvironmentInfoHelper");
var utils_1 = require("./utils");
var Notification = /** @class */ (function () {
    function Notification(config, session) {
        var _this = this;
        var baseURL = config.baseURL, appId = config.appId, publicVapidKey = config.publicVapidKey;
        this.currentSession = session;
        this.currentSubscription = null;
        this.userEmailNotification = null;
        this.userSubscriptions = null;
        this.appId = appId;
        this.baseURL = baseURL;
        this.publicVapidKey = publicVapidKey;
        this.loading = true;
        this.environment = EnvironmentInfoHelper_1.EnvironmentInfoHelper.getEnvironmentInfo();
        // console.log("THIS ENVIROMENT", this.environment);
        this.httpClient = axios_1.default.create({
            baseURL: this.baseURL + "/notification",
            timeout: 10000,
        });
        this.getSubscription().then(function (subs) {
            _this.currentSubscription = subs;
        });
        this.getUserNotifications();
    }
    Notification.prototype.getSubscription = function () {
        return __awaiter(this, void 0, void 0, function () {
            var registration, subscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!("serviceWorker" in navigator))
                            return [2 /*return*/, null];
                        return [4 /*yield*/, navigator.serviceWorker.ready];
                    case 1:
                        registration = _a.sent();
                        return [4 /*yield*/, registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: (0, utils_1.urlBase64ToUint8Array)(this.publicVapidKey),
                            })];
                    case 2:
                        subscription = _a.sent();
                        return [2 /*return*/, subscription];
                }
            });
        });
    };
    // private generateApplicationIdHeader(): null | types.Headers {
    //   if (this.appId) {
    //     return {
    //       ApplicationId: `${this.appId}`,
    //     };
    //   } else {
    //     return null;
    //   }
    // }
    Notification.prototype.getCurrentSubscription = function () {
        return this.currentSubscription;
    };
    Notification.prototype.isReadyForWebPush = function () {
        return this.currentSubscription ? true : false;
    };
    Notification.prototype.getEnvironment = function () {
        return this.environment;
    };
    Notification.prototype._generateHeaders = function () {
        var _a;
        return {
            Authorization: "Bearer " + ((_a = this.currentSession.getSession()) === null || _a === void 0 ? void 0 : _a.jwt_token),
        };
    };
    Notification.prototype.getUserEmailNotification = function () {
        return this.userEmailNotification;
    };
    Notification.prototype.getUserSubscription = function () {
        return this.activeSubscription;
    };
    Notification.prototype.getEmailTags = function () {
        return this.userEmailNotification ? this.userEmailNotification.tags : null;
    };
    Notification.prototype.getWebPusTags = function () {
        return this.activeSubscription ? this.activeSubscription.tags : null;
    };
    Notification.prototype.getUserNotifications = function () {
        var _this = this;
        var _a;
        if (!this.currentSession.getSession()) {
            this.userSubscriptions = [];
            this.userEmailNotification = null;
            return null;
        }
        return this.httpClient
            .get("/getUserNotifications", {
            headers: {
                Authorization: "Bearer " + ((_a = this.currentSession.getSession()) === null || _a === void 0 ? void 0 : _a.jwt_token),
            },
        })
            .then(function (resp) {
            _this.userEmailNotification = resp.data.users_email;
            _this.userSubscriptions = resp.data.webpushes;
            if (_this.currentSubscription) {
                _this.activeSubscription = _this.userSubscriptions.find(function (us) {
                    return us.subscription.endpoint === _this.currentSubscription.endpoint;
                });
            }
            else {
                _this.activeSubscription = null;
            }
            return resp.data;
        });
    };
    Notification.prototype.setWebPushNotification = function (tags) {
        var _this = this;
        if (tags === void 0) { tags = {}; }
        if (!this.currentSubscription)
            return null;
        if (this.activeSubscription)
            return this.activeSubscription;
        var session = this.currentSession.getSession();
        if (!session) {
            this.activeSubscription = null;
            return null;
        }
        return this.httpClient
            .post("/setUserWebPushNotifications", {
            subscription: this.currentSubscription,
            enviromentInfo: this.environment,
            tags: tags,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            _this.activeSubscription = resp.data;
            _this.userSubscriptions.push(_this.activeSubscription);
            return resp.data;
        });
    };
    Notification.prototype.setEmailNotification = function (tags) {
        var _this = this;
        if (tags === void 0) { tags = {}; }
        if (this.userEmailNotification)
            return this.userEmailNotification;
        var session = this.currentSession.getSession();
        if (!session) {
            this.userEmailNotification = null;
            return null;
        }
        var user = session.user;
        return this.httpClient
            .post("/setUserEmailNotifications", {
            email: user.email,
            tags: tags,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            _this.userEmailNotification = resp.data;
            return resp.data;
        });
    };
    Notification.prototype.deleteWebPushNotification = function () {
        var _this = this;
        if (!this.activeSubscription)
            return null;
        var session = this.currentSession.getSession();
        if (!session) {
            this.activeSubscription = null;
            return null;
        }
        var id = this.activeSubscription.id;
        return this.httpClient
            .post("/deleteUserWebPushNotifications", {
            id: id,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            var id = resp.data.id;
            _this.userSubscriptions = _this.userSubscriptions.filter(function (us) { return us.id !== id; });
            _this.activeSubscription = null;
            return null;
        });
    };
    Notification.prototype.deleteEmailNotification = function () {
        var _this = this;
        if (!this.userEmailNotification)
            return null;
        var session = this.currentSession.getSession();
        if (!session) {
            this.userEmailNotification = null;
            return null;
        }
        var id = this.userEmailNotification.id;
        return this.httpClient
            .post("/deleteUserEmailNotifications", {
            id: id,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function () {
            _this.userEmailNotification = null;
            return null;
        });
    };
    /* This overwrite all tags for current user */
    Notification.prototype.setTagsWebPushNotification = function (tags) {
        var _this = this;
        if (tags === void 0) { tags = {}; }
        if (!this.activeSubscription)
            return null;
        var session = this.currentSession.getSession();
        if (!session) {
            this.activeSubscription = null;
            return null;
        }
        var id = this.activeSubscription.id;
        return this.httpClient
            .post("/setTagsUserWebPushNotifications", {
            id: id,
            tags: tags,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            var id = resp.data.id;
            _this.userSubscriptions = _this.userSubscriptions.filter(function (us) { return us.id !== id; });
            _this.userSubscriptions.push(resp.data);
            _this.activeSubscription = resp.data;
            return resp.data;
        });
    };
    /* This overwrite all tags for current user */
    Notification.prototype.setTagsEmailNotification = function (tags) {
        var _this = this;
        if (tags === void 0) { tags = {}; }
        if (!this.userEmailNotification)
            return null;
        var session = this.currentSession.getSession();
        if (!session) {
            this.userEmailNotification = null;
            return null;
        }
        var id = this.userEmailNotification.id;
        return this.httpClient
            .post("/setTagsUserEmailNotifications", {
            id: id,
            tags: tags,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            _this.userEmailNotification = resp.data;
            return resp.data;
        });
    };
    /* This add tags for current user */
    Notification.prototype.addTagsWebPushNotification = function (tagsToAdd) {
        var _this = this;
        if (tagsToAdd === void 0) { tagsToAdd = {}; }
        if (!this.activeSubscription)
            return null;
        var session = this.currentSession.getSession();
        if (!session) {
            this.activeSubscription = null;
            return null;
        }
        var id = this.activeSubscription.id;
        var tags = (0, utils_1.addTags)(this.activeSubscription.tags, tagsToAdd);
        return this.httpClient
            .post("/setTagsUserWebPushNotifications", {
            id: id,
            tags: tags,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            var id = resp.data.id;
            _this.userSubscriptions = _this.userSubscriptions.filter(function (us) { return us.id !== id; });
            _this.userSubscriptions.push(resp.data);
            _this.activeSubscription = resp.data;
            return resp.data;
        });
    };
    /* This add tags for current user */
    Notification.prototype.addTagsEmailNotification = function (tagsToAdd) {
        var _this = this;
        if (tagsToAdd === void 0) { tagsToAdd = {}; }
        if (!this.userEmailNotification)
            return null;
        var session = this.currentSession.getSession();
        if (!session) {
            this.userEmailNotification = null;
            return null;
        }
        var id = this.userEmailNotification.id;
        var tags = (0, utils_1.addTags)(this.userEmailNotification.tags, tagsToAdd);
        return this.httpClient
            .post("/setTagsUserEmailNotifications", {
            id: id,
            tags: tags,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            _this.userEmailNotification = resp.data;
            return resp.data;
        });
    };
    /* This add tags for current user */
    Notification.prototype.deleteTagsWebPushNotification = function (tagsToDelete) {
        var _this = this;
        if (tagsToDelete === void 0) { tagsToDelete = {}; }
        if (!this.activeSubscription)
            return null;
        var session = this.currentSession.getSession();
        if (!session) {
            this.activeSubscription = null;
            return null;
        }
        var id = this.activeSubscription.id;
        var tags = (0, utils_1.deleteTags)(this.activeSubscription.tags, tagsToDelete);
        return this.httpClient
            .post("/setTagsUserWebPushNotifications", {
            id: id,
            tags: tags,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            var id = resp.data.id;
            _this.userSubscriptions = _this.userSubscriptions.filter(function (us) { return us.id !== id; });
            _this.userSubscriptions.push(resp.data);
            _this.activeSubscription = resp.data;
            return resp.data;
        });
    };
    /* This add tags for current user */
    Notification.prototype.deleteTagsEmailNotification = function (tagsToDelete) {
        var _this = this;
        if (tagsToDelete === void 0) { tagsToDelete = {}; }
        if (!this.userEmailNotification)
            return null;
        var session = this.currentSession.getSession();
        if (!session) {
            this.userEmailNotification = null;
            return null;
        }
        var id = this.userEmailNotification.id;
        var tags = (0, utils_1.deleteTags)(this.userEmailNotification.tags, tagsToDelete);
        return this.httpClient
            .post("/setTagsUserEmailNotifications", {
            id: id,
            tags: tags,
        }, {
            headers: {
                Authorization: "Bearer " + session.jwt_token,
            },
        })
            .then(function (resp) {
            _this.userEmailNotification = resp.data;
            return resp.data;
        });
    };
    return Notification;
}());
exports.default = Notification;
//# sourceMappingURL=Notification.js.map