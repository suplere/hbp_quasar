// Class for management notification settings - email + webpush

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { EnvironmentInfoHelper } from './EnvironmentInfoHelper'
import * as types from "./types";
import UserSession from "./UserSession";
import { addTags, deleteTags, urlBase64ToUint8Array } from "./utils";

export type NotificationChangedFunction = (isSubscribed: boolean) => void;

export default class Notification {
  private httpClient: AxiosInstance;
  private currentSession: UserSession;
  private baseURL: string;
  private currentSubscription: PushSubscription | null;
  private loading: boolean;
  private appId: string | null;
  private publicVapidKey: string;
  private environment: types.EnvironmentInfo;
  private userEmailNotification: types.UserEmail | null;
  private userSubscriptions: types.UserSubscription[] | null;
  private activeSubscription: types.UserSubscription;

  constructor(config: types.NotificationConfig, session: UserSession) {
    const { baseURL, appId, publicVapidKey } = config;
    this.currentSession = session;
    this.currentSubscription = null;

    this.userEmailNotification = null;
    this.userSubscriptions = null;
    this.appId = appId;

    this.baseURL = baseURL;
    this.publicVapidKey = publicVapidKey;
    this.loading = true;

    this.environment = EnvironmentInfoHelper.getEnvironmentInfo();

    // console.log("THIS ENVIROMENT", this.environment);

    this.httpClient = axios.create({
      baseURL: `${this.baseURL}/notification`,
      timeout: 10000,
    });

    this.getSubscription().then((subs: PushSubscription) => {
      this.currentSubscription = subs;
    });

    this.getUserNotifications();
  }

  private generateApplicationIdHeader(): null | types.Headers {
    if (this.appId) {
      return {
        ApplicationId: `${this.appId}`,
      };
    } else {
      return null;
    }
  }

  private async getSubscription(): Promise<null | PushSubscription> {
    if (!("serviceWorker" in navigator)) return null;

    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription: PushSubscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(this.publicVapidKey),
      });

    return subscription;
  }

  // private generateApplicationIdHeader(): null | types.Headers {
  //   if (this.appId) {
  //     return {
  //       ApplicationId: `${this.appId}`,
  //     };
  //   } else {
  //     return null;
  //   }
  // }

  public getCurrentSubscription(): PushSubscription | null {
    return this.currentSubscription;
  }

  public isReadyForWebPush(): boolean {
    return this.currentSubscription ? true : false;
  }

  public getEnvironment(): types.EnvironmentInfo {
    return this.environment;
  }

  private _generateHeaders(): null | types.Headers {
    return {
      Authorization: `Bearer ${this.currentSession.getSession()?.jwt_token}`,
    };
  }

  private _generateAxiosHeaderConfig(): null | AxiosRequestConfig {
    const token = this.currentSession.getSession()?.jwt_token;
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          ...this.generateApplicationIdHeader(),
        },
      };
    } else {
      return {
        headers: {
          ...this.generateApplicationIdHeader(),
        },
      };
    }
  }

  public generateVAPIDKeys() {
    return this.httpClient
      .get("/generateVAPIDKeys", this._generateAxiosHeaderConfig())
  };

  public getUserEmailNotification(): types.UserEmail | null {
    return this.userEmailNotification;
  }

  public getUserSubscription(): types.UserSubscription | null {
    return this.activeSubscription;
  }

  public getEmailTags(): types.Tags | null {
    return this.userEmailNotification ? this.userEmailNotification.tags : null;
  }

  public getWebPusTags(): types.Tags | null {
    return this.activeSubscription ? this.activeSubscription.tags : null;
  }

  public getUserNotifications(): Promise<{
    users_email: types.UserEmail;
    webpushes: types.UserSubscription;
  }> {
    if (!this.currentSession.getSession()) {
      this.userSubscriptions = [];
      this.userEmailNotification = null;
      return null;
    }
    return this.httpClient
      .get("/getUserNotifications", this._generateAxiosHeaderConfig())
      .then((resp) => {
        this.userEmailNotification = resp.data.users_email;
        this.userSubscriptions = resp.data.webpushes;
        if (this.currentSubscription) {
          this.activeSubscription = this.userSubscriptions.find(
            (us: types.UserSubscription) =>
              us.subscription.endpoint === this.currentSubscription.endpoint
          );
        } else {
          this.activeSubscription = null;
        }
        return resp.data;
      });
  }

  public setWebPushNotification(tags: types.Tags = {}) {
    if (!this.currentSubscription) return null;
    if (this.activeSubscription) return this.activeSubscription;
    const session = this.currentSession.getSession();
    if (!session) {
      this.activeSubscription = null;
      return null;
    }
    return this.httpClient
      .post(
        "/setUserWebPushNotifications",
        {
          subscription: this.currentSubscription,
          enviromentInfo: this.environment,
          tags,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        this.activeSubscription = resp.data;
        this.userSubscriptions.push(this.activeSubscription);
        return resp.data;
      });
  }

  public setEmailNotification(tags: types.Tags = {}) {
    if (this.userEmailNotification) return this.userEmailNotification;
    const session = this.currentSession.getSession();
    if (!session) {
      this.userEmailNotification = null;
      return null;
    }
    const user = session.user;
    return this.httpClient
      .post(
        "/setUserEmailNotifications",
        {
          email: user.email,
          tags,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        this.userEmailNotification = resp.data;
        return resp.data;
      });
  }

  public deleteWebPushNotification() {
    if (!this.activeSubscription) return null;
    const session = this.currentSession.getSession();
    if (!session) {
      this.activeSubscription = null;
      return null;
    }
    const id = this.activeSubscription.id;
    return this.httpClient
      .post(
        "/deleteUserWebPushNotifications",
        {
          id,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        const id = resp.data.id;
        this.userSubscriptions = this.userSubscriptions.filter(
          (us) => us.id !== id
        );
        this.activeSubscription = null;
        return null;
      });
  }

  public deleteEmailNotification() {
    if (!this.userEmailNotification) return null;
    const session = this.currentSession.getSession();
    if (!session) {
      this.userEmailNotification = null;
      return null;
    }
    const id = this.userEmailNotification.id;
    return this.httpClient
      .post(
        "/deleteUserEmailNotifications",
        {
          id,
        },
        this._generateAxiosHeaderConfig()
      )
      .then(() => {
        this.userEmailNotification = null;
        return null;
      });
  }

  /* This overwrite all tags for current user */
  public setTagsWebPushNotification(tags: types.Tags = {}) {
    if (!this.activeSubscription) return null;
    const session = this.currentSession.getSession();
    if (!session) {
      this.activeSubscription = null;
      return null;
    }
    const id = this.activeSubscription.id;
    return this.httpClient
      .post(
        "/setTagsUserWebPushNotifications",
        {
          id,
          tags,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        const id = resp.data.id;
        this.userSubscriptions = this.userSubscriptions.filter(
          (us) => us.id !== id
        );
        this.userSubscriptions.push(resp.data);
        this.activeSubscription = resp.data;
        return resp.data;
      });
  }

  /* This overwrite all tags for current user */
  public setTagsEmailNotification(tags: types.Tags = {}) {
    if (!this.userEmailNotification) return null;
    const session = this.currentSession.getSession();
    if (!session) {
      this.userEmailNotification = null;
      return null;
    }
    const id = this.userEmailNotification.id;
    return this.httpClient
      .post(
        "/setTagsUserEmailNotifications",
        {
          id,
          tags,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        this.userEmailNotification = resp.data;
        return resp.data;
      });
  }

  /* This add tags for current user */
  public addTagsWebPushNotification(tagsToAdd: types.Tags = {}) {
    if (!this.activeSubscription) return null;
    const session = this.currentSession.getSession();
    if (!session) {
      this.activeSubscription = null;
      return null;
    }
    const id = this.activeSubscription.id;
    const tags = addTags(this.activeSubscription.tags, tagsToAdd);
    return this.httpClient
      .post(
        "/setTagsUserWebPushNotifications",
        {
          id,
          tags,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        const id = resp.data.id;
        this.userSubscriptions = this.userSubscriptions.filter(
          (us) => us.id !== id
        );
        this.userSubscriptions.push(resp.data);
        this.activeSubscription = resp.data;
        return resp.data;
      });
  }

  /* This add tags for current user */
  public addTagsEmailNotification(tagsToAdd: types.Tags = {}) {
    if (!this.userEmailNotification) return null;
    const session = this.currentSession.getSession();
    if (!session) {
      this.userEmailNotification = null;
      return null;
    }
    const id = this.userEmailNotification.id;
    const tags = addTags(this.userEmailNotification.tags, tagsToAdd);
    return this.httpClient
      .post(
        "/setTagsUserEmailNotifications",
        {
          id,
          tags,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        this.userEmailNotification = resp.data;
        return resp.data;
      });
  }

  /* This add tags for current user */
  public deleteTagsWebPushNotification(tagsToDelete: types.Tags = {}) {
    if (!this.activeSubscription) return null;
    const session = this.currentSession.getSession();
    if (!session) {
      this.activeSubscription = null;
      return null;
    }
    const id = this.activeSubscription.id;
    const tags = deleteTags(this.activeSubscription.tags, tagsToDelete);
    return this.httpClient
      .post(
        "/setTagsUserWebPushNotifications",
        {
          id,
          tags,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        const id = resp.data.id;
        this.userSubscriptions = this.userSubscriptions.filter(
          (us) => us.id !== id
        );
        this.userSubscriptions.push(resp.data);
        this.activeSubscription = resp.data;
        return resp.data;
      });
  }

  /* This add tags for current user */
  public deleteTagsEmailNotification(tagsToDelete: types.Tags = {}) {
    if (!this.userEmailNotification) return null;
    const session = this.currentSession.getSession();
    if (!session) {
      this.userEmailNotification = null;
      return null;
    }
    const id = this.userEmailNotification.id;
    const tags = deleteTags(this.userEmailNotification.tags, tagsToDelete);
    return this.httpClient
      .post(
        "/setTagsUserEmailNotifications",
        {
          id,
          tags,
        },
        this._generateAxiosHeaderConfig()
      )
      .then((resp) => {
        this.userEmailNotification = resp.data;
        return resp.data;
      });
  }
}
