import Auth from "./Auth";
import Storage from "./Storage";
import Notification from "./Notification";
import { UserConfig, JWTHasuraClaims } from "./types";
export interface HBPRouterSettings {
    notAuthorized?: () => void;
    notAuthenticated?: () => void;
    loginPath?: string;
    registerPath?: string;
    notAuthorizedPath?: string;
    afterLoginPath?: string;
}
export declare class HBPInstance {
    baseURL: string;
    auth: Auth;
    appId: string;
    storage: Storage;
    notifications: Notification;
    claims: JWTHasuraClaims;
    token: string;
    authenticated: boolean;
    notAuthenticated: () => void;
    notAuthorized: () => void;
    loginPath: string;
    registerPath: string;
    notAuthorizedPath: string;
    afterLoginPath: string;
    constructor(options: UserConfig, routerSettings?: HBPRouterSettings);
    hasRole: (role: string) => boolean;
    handleOnAuthStateChanged: (status: boolean) => Promise<boolean>;
    routerInitApp: (to: any, from: any, next: any) => Promise<void>;
    routeAuthorizeGuard: (router: any, store: any) => (to: any, from: any, next: any) => void;
    requestPasswordChange(email: any): Promise<{
        error: any;
    }>;
    changePassword(oldPassword: any, newPassword: any): Promise<{
        error: any;
    }>;
    updateUser(user: any): Promise<{
        error: any;
        data: any;
    }>;
    confirmPasswordChange(ticket: any, newPassword: any): Promise<{
        error: any;
    }>;
    login(email: string, password: string): Promise<{
        data: any;
        error: any;
    }>;
    createUserWithEmail(email: any, password: any, additionalFields: any): Promise<{
        data: any;
        error: any;
    }>;
    logout(email: any, password: any): Promise<{
        data: any;
        error: any;
    }>;
}
export declare const createHasuraBackendPlus: (options: UserConfig, routerSettings?: HBPRouterSettings) => HBPInstance;
