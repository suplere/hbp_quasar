import * as types from "./types";
import UserSession from "./UserSession";
export declare type AuthChangedFunction = (isAuthenticated: boolean) => void;
export default class Auth {
    private httpClient;
    private tokenChangedFunctions;
    private authChangedFunctions;
    private refreshInterval;
    private useCookies;
    private refreshIntervalTime;
    private clientStorage;
    private clientStorageType;
    private ssr;
    private refreshTokenLock;
    private baseURL;
    private currentUser;
    private currentSession;
    private loading;
    private refreshSleepCheckInterval;
    private refreshIntervalSleepCheckLastSample;
    private sampleRate;
    private appId;
    constructor(config: types.AuthConfig, session: UserSession);
    user(): types.User | null;
    register({ email, password, options, }: types.UserCredentials): Promise<{
        session: types.Session | null;
        user: types.User;
    }>;
    login({ email, password, provider, }: types.UserCredentials): Promise<{
        session: types.Session | null;
        user: types.User | null;
        mfa?: {
            ticket: string;
        };
        magicLink?: true;
    }>;
    logout(all?: boolean): Promise<{
        session: null;
        user: null;
    }>;
    onTokenChanged(fn: Function): Function;
    onAuthStateChanged(fn: AuthChangedFunction): Function;
    isAuthenticated(): boolean | null;
    isAuthenticatedAsync(): Promise<boolean>;
    getJWTToken(): string | null;
    getClaim(claim: string): string | string[] | null;
    refreshSession(initRefreshToken?: string | null): Promise<void>;
    activate(ticket: string): Promise<void>;
    changeEmail(new_email: string): Promise<void>;
    updateUser(user: types.User): Promise<void>;
    requestEmailChange(new_email: string): Promise<void>;
    confirmEmailChange(ticket: string): Promise<void>;
    changePassword(oldPassword: string, newPassword: string): Promise<void>;
    requestPasswordChange(email: string): Promise<void>;
    confirmPasswordChange(newPassword: string, ticket: string): Promise<void>;
    MFAGenerate(): Promise<void>;
    MFAEnable(code: string): Promise<void>;
    MFADisable(code: string): Promise<void>;
    MFATotp(code: string, ticket: string): Promise<{
        session: types.Session;
        user: types.User;
    }>;
    private _removeParam;
    private _setItem;
    private _getItem;
    private _removeItem;
    private _generateHeaders;
    private _generateAxiosHeaderConfig;
    private _autoLogin;
    private _refreshToken;
    private tokenChanged;
    private authStateChanged;
    private _clearSession;
    private _setSession;
}
