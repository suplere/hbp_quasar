export interface NHostConfig {
    baseURL: string;
    useCookies?: boolean;
    refreshIntervalTime?: number | null;
    clientStorage?: ClientStorage;
    clientStorageType?: string;
    autoLogin?: boolean;
    ssr?: boolean;
    appId?: string | null;
    createStorage?: boolean;
    handleNotifications?: boolean;
    publicVapidKey?: string;
}
export interface UserConfig {
    baseURL: string;
    useCookies?: boolean;
    refreshIntervalTime?: number | null;
    clientStorage?: ClientStorage;
    clientStorageType?: string;
    autoLogin?: boolean;
    ssr?: boolean;
    appId?: string | null;
}
export interface AuthConfig {
    baseURL: string;
    useCookies: boolean;
    refreshIntervalTime: number | null;
    clientStorage: ClientStorage;
    clientStorageType: string;
    ssr?: boolean;
    autoLogin: boolean;
    appId?: string | null;
}
export interface NotificationConfig {
    baseURL: string;
    publicVapidKey: string;
    appId?: string | null;
}
export interface StorageConfig {
    baseURL: string;
    useCookies: boolean;
    appId?: string | null;
}
export interface ClientStorage {
    setItem?: (key: string, value: string) => void;
    getItem?: (key: string) => any;
    removeItem?: (key: string) => void;
    set?: (options: {
        key: string;
        value: string;
    }) => void;
    get?: (options: {
        key: string;
    }) => any;
    remove?: (options: {
        key: string;
    }) => void;
    setItemAsync?: (key: string, value: string) => void;
    getItemAsync?: (key: string) => any;
    deleteItemAsync?: (key: string) => void;
}
export declare type ClientStorageType = "web" | "react-native" | "capacitor" | "expo-secure-storage" | "custom";
export interface LoginData {
    mfa?: boolean;
    ticket?: string;
}
export interface Headers {
    Authorization?: string;
    ApplicationId?: string;
}
export declare type Provider = "apple" | "facebook" | "github" | "google" | "linkedin" | "spotify" | "twitter" | "windowslive";
export interface UserCredentials {
    email?: string;
    password?: string;
    provider?: Provider;
    options?: {
        userData?: any;
        defaultRole?: string;
        allowedRoles?: string[];
    };
}
export interface Session {
    jwt_token: string;
    jwt_expires_in: number;
    user: User;
    refresh_token?: string;
}
export interface User {
    id: string;
    email?: string;
    display_name?: string;
    avatar_url?: string;
    firstname?: string;
    lastname?: string;
    mobile?: string;
}
export interface JWTHasuraClaims {
    [claim: string]: string | string[];
    "x-hasura-allowed-roles": string[];
    "x-hasura-default-role": string;
    "x-hasura-user-id": string;
}
export interface JWTClaims {
    sub?: string;
    iat?: number;
    "https://hasura.io/jwt/claims": JWTHasuraClaims;
}
export interface Subscription {
    endpoint: string;
    expirationTime?: number;
    keys: {
        auth: string;
        p256dh: string;
    };
}
export declare enum Browser {
    Safari = "safari",
    Firefox = "firefox",
    Chrome = "chrome",
    Opera = "opera",
    Edge = "edge",
    Other = "other"
}
export interface EnvironmentInfo {
    browserType: Browser;
    browserVersion: number;
    isHttps: boolean;
    isBrowserAndSupportsServiceWorkers: boolean;
    requiresUserInteraction: boolean;
    osName: string;
    osVersion: string | number;
    canTalkToServiceWorker: boolean;
}
export interface UserSubscription {
    id: string;
    subscription: Subscription;
    enviromentInfo?: EnvironmentInfo;
    tags?: string[];
    segments?: string[];
}
