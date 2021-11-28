import { UserConfig } from "nhost-js-sdk";
import Auth from "nhost-js-sdk/dist/Auth";
import Storage from "nhost-js-sdk/dist/Storage";
import { JWTHasuraClaims } from "nhost-js-sdk/dist/types";
export interface HBPRouterSettings {
    notAuthorized?: () => void;
    notAuthenticated?: () => void;
    loginPath?: string;
    registerPath?: string;
    notAuthorizedPath?: string;
    afterLoginPath?: string;
}
export declare class HBPInstance {
    auth: Auth;
    app_id: string;
    storage: Storage;
    claims: JWTHasuraClaims;
    token: string;
    authenticated: boolean;
    notAuthenticated: () => void;
    notAuthorized: () => void;
    loginPath: string;
    registerPath: string;
    notAuthorizedPath: string;
    afterLoginPath: string;
    constructor(options: UserConfig, routerSettings?: HBPRouterSettings, app_id?: string);
    hasRole: (role: string) => boolean;
    handleOnAuthStateChanged: (status: boolean, store: any) => Promise<void>;
    routerInitApp: (to: any, from: any, next: any) => Promise<void>;
    routeAuthorizeGuard: (router: any, store: any) => (to: any, from: any, next: any) => void;
    requestPasswordChange(email: any): Promise<void>;
    changePassword(oldPassword: any, newPassword: any): Promise<void>;
    confirmPasswordChange(ticket: any, newPassword: any): Promise<void>;
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
export declare const createHasuraBackendPlus: (options: any) => HBPInstance;
