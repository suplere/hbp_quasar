import { EnvironmentInfo } from "./types";
export declare class EnvironmentInfoHelper {
    static getEnvironmentInfo(): EnvironmentInfo;
    private static getBrowserVersion;
    private static getBrowser;
    private static isHttps;
    private static supportsServiceWorkers;
    private static requiresUserInteraction;
    private static canTalkToServiceWorker;
}
