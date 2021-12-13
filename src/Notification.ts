// Class for management notification settings - email + webpush

import axios, { AxiosInstance } from "axios";
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
  private userSubscriptions: types.UserSubscription[] | [];

  constructor(config: types.NotificationConfig, session: UserSession) {
    const { baseURL, appId, publicVapidKey } = config;
    this.currentSession = session;
    this.currentSubscription = null;
    this.userEmailNotification = null;
    this.userSubscriptions = [];
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

  public getEnvironment(): types.EnvironmentInfo {
    return this.environment;
  }

  private _generateHeaders(): null | types.Headers {
    return {
      Authorization: `Bearer ${this.currentSession.getSession()?.jwt_token}`,
    };
  }

  public getUserEmailNotification() {
    return this.userEmailNotification;
  }

  public getUserSubscriptions() {
    return this.userSubscriptions;
  }

  public getUserNotifications() {
    if (!this.currentSession.getSession()) {
      this.userSubscriptions = [];
      this.userEmailNotification = null;
      return null;
    }
    return this.httpClient
      .get("/getUserNotifications", {
        headers: {
          Authorization: `Bearer ${
            this.currentSession.getSession()?.jwt_token
          }`,
        },
      })
      .then((resp) => {
        this.userEmailNotification = resp.data.users_email;
        this.userSubscriptions = resp.data.webpushes;
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
        {
          headers: {
            Authorization: `Bearer ${session.jwt_token}`,
          },
        }
      )
      .then((resp) => {
        this.userEmailNotification = resp.data;
        return resp.data;
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
        {
          headers: {
            Authorization: `Bearer ${session.jwt_token}`,
          },
        }
      )
      .then(() => {
        this.userEmailNotification = null;
        return null;
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
        {
          headers: {
            Authorization: `Bearer ${session.jwt_token}`,
          },
        }
      )
      .then((resp) => {
        this.userEmailNotification = resp.data;
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
        {
          headers: {
            Authorization: `Bearer ${session.jwt_token}`,
          },
        }
      )
      .then((resp) => {
        this.userEmailNotification = resp.data;
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
        {
          headers: {
            Authorization: `Bearer ${session.jwt_token}`,
          },
        }
      )
      .then((resp) => {
        this.userEmailNotification = resp.data;
        return resp.data;
      });
  }
}
