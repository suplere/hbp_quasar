import decode from "jwt-decode";
import Auth from "./Auth";
import Storage from "./Storage";
import NhostClient from "./NhostClient";
import { UserConfig, JWTHasuraClaims, UserCredentials } from "./types";

function notAuthorized(): void {
    window.alert('You dont autorize to view this page.')
}

function notAuthenticated(): void {
  window.alert("Only for authenticated users!");
}

export interface HBPRouterSettings {
  notAuthorized?: () => void;
  notAuthenticated?: () => void;
  loginPath?: string;
  registerPath?: string;
  notAuthorizedPath?: string;
  afterLoginPath?: string;  
}

export class HBPInstance {
  baseURL: string;
  auth: Auth;
  appId: string;
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

  constructor(options: UserConfig, routerSettings: HBPRouterSettings = {}) {
    this.appId = options.appId ? options.appId : null;
    this.baseURL = options.baseURL;
    // console.log("APPID", options.appId, this.appId)
    // console.log("BASEURL", this.baseURL)
    const nhost = new NhostClient({
      baseURL: this.baseURL,
      useCookies: false,
      refreshIntervalTime: (options.refreshIntervalTime || 600) * 1000,
      appId: this.appId,
    });
    this.auth = nhost.auth;
    this.storage = nhost.storage;
    this.claims = undefined;
    this.authenticated = false;
    this.token = "";
    this.notAuthenticated = routerSettings.notAuthenticated
      ? routerSettings.notAuthenticated
      : notAuthenticated;
    this.notAuthorized = routerSettings.notAuthorized
      ? routerSettings.notAuthorized
      : notAuthorized;
    this.loginPath = routerSettings.loginPath
      ? routerSettings.loginPath
      : "/auth/login";
    this.registerPath = routerSettings.registerPath
      ? routerSettings.registerPath
      : "/auth/register";
    this.notAuthorizedPath = routerSettings.notAuthorizedPath
      ? routerSettings.notAuthorizedPath
      : "/admin/home";
    this.afterLoginPath = routerSettings.afterLoginPath
      ? routerSettings.afterLoginPath
      : "/admin/home";
  }

  hasRole = (role: string): boolean => {
    if (!this.token) return false;
    return this.claims["x-hasura-allowed-roles"].includes(role);
  };

  handleOnAuthStateChanged = async (
    status: boolean
  ): Promise<boolean> => {
    this.authenticated = status;
    // store.commit("app/isAuthenticated", status);
    if (status) {
      const token = this.auth.getJWTToken();
      this.token = token;
      this.claims = decode(token)["https://hasura.io/jwt/claims"];
      // store.commit("app/setAuthData", this.claims);
      // store.dispatch("app/getUserSettings", this.claims);
      //
    } else {
      this.token = undefined;
      this.claims = undefined;
      // store.commit("app/setAuthData", null);
      // store.dispatch("app/getUserSettings", null);
    }
    return status
  };

  routerInitApp = async (to, from, next) => {
    if (this.auth.isAuthenticated() === null) {
      this.authenticated = await new Promise((resolve) => {
        this.auth.onAuthStateChanged((status) => {
          resolve(status);
        });
      });
    }
    next();
  };

  routeAuthorizeGuard = (router, store) => (to, from, next) => {
    // Autorizace
    const isAuthenticated = this.auth.isAuthenticated();
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (isAuthenticated) {
        if (to.matched.some((record) => record.meta.role)) {
          const recordWithRole = to.matched.find((record) => record.meta.role);
          if (this.hasRole(recordWithRole.meta.role)) {
            next();
          } else {
            this.notAuthorized();
            next(this.notAuthorizedPath);
          }
        } else {
          next();
        }
      } else {
        this.notAuthenticated();
        next(this.loginPath);
      }
    } else if (
      (to.path === this.registerPath && this.auth.isAuthenticated()) ||
      (to.path === this.loginPath && this.auth.isAuthenticated())
    ) {
      next(this.afterLoginPath);
    } else {
      next();
    }
  };

  async requestPasswordChange(email) {
    let error
    try {
      await this.auth.requestPasswordChange(email);
    } catch (err) {
      error = err;
    }
    return {
      error,
    }; 
  }

  async changePassword(oldPassword, newPassword) {
    let error
    try{
      await this.auth.changePassword(oldPassword, newPassword);
    } catch (err) {
      error = err
    }
    return {
      error
    } 
  }

  async confirmPasswordChange(ticket, newPassword) {
    let error;
    try {
      await this.auth.confirmPasswordChange(newPassword, ticket);
    } catch (err) {
      error = err;
    }
    return {
      error
    } 
  }

  async login(email: string, password: string) {
    let error;
    let data;
    try {
      error = undefined;
      data = await this.auth.login({ email, password });
    } catch (err) {
      error = err;
    }
    return {
      data,
      error,
    };
  }

  async createUserWithEmail(email, password, additionalFields) {
    let error;
    let data;
    const userData = {
      ...additionalFields,
    };
    const options = {
      userData,
    };
    const registerData: UserCredentials = {
      email,
      password,
      options,
    };
    try {
      error = undefined;
      data = await this.auth.register(registerData);
    } catch (err) {
      error = err;
    }
    return {
      data,
      error,
    };
  }

  async logout(email, password) {
    let error;
    let data;
    try {
      error = undefined;
      data = await this.auth.logout(true);
    } catch (err) {
      error = err;
    }
    return {
      data,
      error,
    };
  }
}

export const createHasuraBackendPlus = (options: UserConfig, routerSettings?: HBPRouterSettings) => {
  return new HBPInstance(options,  routerSettings);
};
