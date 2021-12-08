export declare type StringFormat = string;
export declare const StringFormat: {
    RAW: string;
    BASE64: string;
    BASE64URL: string;
    DATA_URL: string;
};
export declare const urlBase64ToUint8Array: (base64String: any) => Uint8Array;
export declare function parseVersionString(version: string | number): number;
export declare function base64Bytes(format: StringFormat, value: string): Uint8Array;
export declare function utf8Bytes(value: string): Uint8Array;
export declare function percentEncodedBytes(value: string): Uint8Array;
