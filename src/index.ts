import decode from "jwt-decode";
import { createClient, NhostClient, UserConfig } from "nhost-js-sdk";
import Auth from "nhost-js-sdk/dist/Auth";
import Storage from "nhost-js-sdk/dist/Storage";
import { JWTHasuraClaims, UserCredentials } from "nhost-js-sdk/dist/types";
// import { Notify } from "quasar";
// import { restartWebsockets } from 'src/services/apollo/create-apollo-client'

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

  constructor(
    options: UserConfig,
    routerSettings: HBPRouterSettings = {},
    app_id: string = null
  ) {
    const nhost = createClient({
      baseURL: options.baseURL,
      useCookies: false,
      refreshIntervalTime: (options.refreshIntervalTime || 600) * 1000,
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
    this.app_id = app_id;
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

  handleOnAuthStateChanged = async (status: boolean, store) => {
    this.authenticated = status;
    store.commit("app/isAuthenticated", status);
    if (status) {
      const token = this.auth.getJWTToken();
      this.token = token;
      this.claims = decode(token)["https://hasura.io/jwt/claims"];
      store.commit("app/setAuthData", this.claims);
      store.dispatch("app/getUserSettings", this.claims);
      //
    } else {
      this.token = undefined;
      this.claims = undefined;
      store.commit("app/setAuthData", null);
      store.dispatch("app/getUserSettings", null);
    }
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
    await this.auth.requestPasswordChange(email);
  }

  async changePassword(oldPassword, newPassword) {
    return this.auth.changePassword(oldPassword, newPassword);
  }

  async confirmPasswordChange(ticket, newPassword) {
    await this.auth.confirmPasswordChange(newPassword, ticket);
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
        ...additionalFields
    }
    if (this.app_id) userData['app_id'] = this.app_id
    const options = {
      userData,
    };
    const registerData: UserCredentials = {
        email,
        password,
        options
    }
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

export const createHasuraBackendPlus = (options: UserConfig, routerSettings?: HBPRouterSettings, app_id?: string) => {
  return new HBPInstance(options,  routerSettings, app_id);
};
