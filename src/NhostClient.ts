import NhostAuth from "./Auth";
import NhostStorage from "./Storage";
import NhostNotification from "./Notification";
import UserSession from "./UserSession";
import * as types from "./types";

export default class NhostClient {
  protected baseURL: string;
  private appId: string | null;
  protected useCookies: boolean;
  private refreshIntervalTime: number | null;
  private clientStorage: types.ClientStorage;
  private clientStorageType: string;
  private ssr: boolean;
  private autoLogin: boolean;
  private createStorage: boolean;
  private handleNotifications: boolean;
  private session: UserSession;
  private publicVapidKey: string | null;

  auth: NhostAuth;
  storage: NhostStorage;
  notifications: NhostNotification;

  constructor(config: types.NHostConfig) {
    if (!config.baseURL)
      throw "Please specify a baseURL. More information at https://docs.nhost.io/libraries/nhost-js-sdk#setup.";

    // console.log("NHOST CONFIG", config)  
    this.baseURL = config.baseURL;
    this.appId = config.appId;
    this.ssr = config.ssr ?? typeof window === "undefined";
    this.useCookies = config.useCookies ?? false;
    this.autoLogin = config.autoLogin ?? true;
    this.createStorage = config.createStorage ?? true;
    this.handleNotifications = config.handleNotifications ?? true;
    this.publicVapidKey = config.publicVapidKey ? config.publicVapidKey : null

    // console.log("this.handleNotifications", this.handleNotifications);
    // console.log("this.publicVapidKey", this.publicVapidKey);

    this.session = new UserSession();
    // Default JWTExpiresIn is 15 minutes (900000 miliseconds)
    this.refreshIntervalTime = config.refreshIntervalTime || null;

    this.clientStorage = this.ssr
      ? {}
      : config.clientStorage || window.localStorage;

    this.clientStorageType = config.clientStorageType
      ? config.clientStorageType
      : "web";

    this.auth = new NhostAuth(
      {
        baseURL: this.appId ? `${this.baseURL}/custom` : this.baseURL,
        useCookies: this.useCookies,
        refreshIntervalTime: this.refreshIntervalTime,
        clientStorage: this.clientStorage,
        clientStorageType: this.clientStorageType,
        ssr: this.ssr,
        autoLogin: this.autoLogin,
        appId: this.appId,
      },
      this.session,
      this
    );
    // this.auth = new NhostAuth(authConfig, this.session);

    if (this.createStorage) {
      this.storage = new NhostStorage(
        {
          baseURL: this.appId ? `${this.baseURL}/custom` : this.baseURL,
          useCookies: this.useCookies,
          appId: this.appId,
        },
        this.session
      );
    }

    if (
      this.handleNotifications &&
      this.publicVapidKey && 
      this.publicVapidKey.length
    ) {
      // console.log("CREATE NOTIFICATION MODULE");
      this.notifications = new NhostNotification(
        {
          baseURL: this.appId ? `${this.baseURL}/custom` : this.baseURL,
          appId: this.appId,
          publicVapidKey: this.publicVapidKey,
        },
        this.session
      );
    }
  }
}
