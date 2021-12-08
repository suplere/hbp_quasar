import NhostAuth from "./Auth";
import NhostStorage from "./Storage";
import NhostNotification from "./Notification";
import * as types from "./types";
export default class NhostClient {
    protected baseURL: string;
    private appId;
    protected useCookies: boolean;
    private refreshIntervalTime;
    private clientStorage;
    private clientStorageType;
    private ssr;
    private autoLogin;
    private createStorage;
    private handleNotifications;
    private session;
    private publicVapidKey;
    auth: NhostAuth;
    storage: NhostStorage;
    notifications: NhostNotification;
    constructor(config: types.NHostConfig);
}
