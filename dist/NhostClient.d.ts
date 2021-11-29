import NhostAuth from "./Auth";
import NhostStorage from "./Storage";
import * as types from "./types";
export default class NhostClient {
    protected baseURL: string;
    protected useCookies: boolean;
    private refreshIntervalTime;
    private clientStorage;
    private clientStorageType;
    private ssr;
    private autoLogin;
    private session;
    auth: NhostAuth;
    storage: NhostStorage;
    constructor(config: types.UserConfig);
}
