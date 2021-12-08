// Class for management notification settings - email + webpush

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { EnvironmentInfoHelper } from './EnvironmentInfoHelper'
import * as types from "./types";
import UserSession from "./UserSession";
import { urlBase64ToUint8Array } from "./utils";

export type NotificationChangedFunction = (isSubscribed: boolean) => void;

export default class Notification {
  private httpClient: AxiosInstance;
  private currentSession: UserSession;
  private baseURL: string;
  private currentUser: types.User | null;
  private currentSubscription: PushSubscription | null;
  private loading: boolean;
  private appId: string | null;
  private publicVapidKey: string;
  private environment: types.EnvironmentInfo;

  constructor(config: types.NotificationConfig, session: UserSession) {
    const { baseURL, appId, publicVapidKey } = config;
    this.currentSession = session;
    this.appId = appId;

    this.baseURL = baseURL;
    this.publicVapidKey = publicVapidKey;
    this.loading = true;

    this.environment = EnvironmentInfoHelper.getEnvironmentInfo();

    this.httpClient = axios.create({
      baseURL: `${this.baseURL}/notification`,
      timeout: 10000,
    });

    this.currentUser = this.currentSession.getSession()?.user;
    this.getSubscription().then((subs: PushSubscription) => {
      this.currentSubscription = subs;
    });
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
  };

  // private _generateHeaders(): null | types.Headers {
  //   if (this.useCookies) return null;

  //   return {
  //     Authorization: `Bearer ${this.currentSession.getSession()?.jwt_token}`,
  //   };
  // }
}
