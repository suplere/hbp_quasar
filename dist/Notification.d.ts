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
    private userEmailNotification;
    private userSubscriptions;
    private activeSubscription;
    constructor(config: types.NotificationConfig, session: UserSession);
    private getSubscription;
    getCurrentSubscription(): PushSubscription | null;
    getEnvironment(): types.EnvironmentInfo;
    private _generateHeaders;
    getUserEmailNotification(): types.UserEmail | null;
    getUserSubscription(): types.UserSubscription | null;
    getEmailTags(): types.Tags | null;
    getWebPusTags(): types.Tags | null;
    getUserNotifications(): Promise<{
        users_email: types.UserEmail;
        webpushes: types.UserSubscription;
    }>;
    setWebPushNotification(tags?: types.Tags): Promise<any> | types.UserSubscription;
    setEmailNotification(tags?: types.Tags): Promise<any> | types.UserEmail;
    deleteWebPushNotification(): Promise<any>;
    deleteEmailNotification(): Promise<any>;
    setTagsWebPushNotification(tags?: types.Tags): Promise<any>;
    setTagsEmailNotification(tags?: types.Tags): Promise<any>;
    addTagsWebPushNotification(tagsToAdd?: types.Tags): Promise<any>;
    addTagsEmailNotification(tagsToAdd?: types.Tags): Promise<any>;
    deleteTagsWebPushNotification(tagsToDelete?: types.Tags): Promise<any>;
    deleteTagsEmailNotification(tagsToDelete?: types.Tags): Promise<any>;
}
