import * as types from "./types";
import UserSession from "./UserSession";
export declare type NotificationChangedFunction = (isSubscribed: boolean) => void;
export default class Notification {
    private httpClient;
    private currentSession;
    private baseURL;
    private currentSubscription;
    private loading;
    private appId;
    private publicVapidKey;
    private environment;
    constructor(config: types.NotificationConfig, session: UserSession);
    private getSubscription;
    getCurrentSubscription(): PushSubscription | null;
    getEnvironment(): types.EnvironmentInfo;
    private _generateHeaders;
    getEmailNotification(): any[] | Promise<import("axios").AxiosResponse<any, any>>;
}
