import * as types from "./types";
import UserSession from "./UserSession";
export declare type NotificationChangedFunction = (isSubscribed: boolean) => void;
export default class Notification {
    private httpClient;
    private currentSession;
    private baseURL;
    private currentUser;
    private currentSubscription;
    private loading;
    private appId;
    private publicVapidKey;
    private environment;
    constructor(config: types.NotificationConfig, session: UserSession);
    private getSubscription;
    getCurrentSubscription(): PushSubscription | null;
    getEnvironment(): types.EnvironmentInfo;
}
