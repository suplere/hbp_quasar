"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTags = exports.addTags = exports.percentEncodedBytes = exports.utf8Bytes = exports.base64Bytes = exports.parseVersionString = exports.urlBase64ToUint8Array = exports.StringFormat = void 0;
exports.StringFormat = {
    RAW: "raw",
    BASE64: "base64",
    BASE64URL: "base64url",
    DATA_URL: "data_url",
};
var urlBase64ToUint8Array = function (base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};
exports.urlBase64ToUint8Array = urlBase64ToUint8Array;
function padStart(str, targetLength, padString) {
    var result = str;
    while (result.length < targetLength) {
        result = padString + result;
    }
    return result;
}
function parseVersionString(version) {
    var osVersionParts = version.toString().split(".");
    var majorVersion = padStart(osVersionParts[0], 2, "0");
    var minorVersion;
    if (osVersionParts[1]) {
        minorVersion = padStart(osVersionParts[1], 2, "0");
    }
    else {
        minorVersion = "00";
    }
    return Number(majorVersion + "." + minorVersion);
}
exports.parseVersionString = parseVersionString;
function base64Bytes(format, value) {
    switch (format) {
        case exports.StringFormat.BASE64: {
            var hasMinus = value.indexOf("-") !== -1;
            var hasUnder = value.indexOf("_") !== -1;
            if (hasMinus || hasUnder) {
                var invalidChar = hasMinus ? "-" : "_";
                throw "Invalid character '" + invalidChar + "' found: is it base64url encoded?";
            }
            break;
        }
        case exports.StringFormat.BASE64URL: {
            var hasPlus = value.indexOf("+") !== -1;
            var hasSlash = value.indexOf("/") !== -1;
            if (hasPlus || hasSlash) {
                var invalidChar = hasPlus ? "+" : "/";
                throw "Invalid character '" + invalidChar + "' found: is it base64url encoded?";
            }
            value = value.replace(/-/g, "+").replace(/_/g, "/");
            break;
        }
        default:
        // do nothing
    }
    var bytes;
    try {
        bytes = atob(value);
    }
    catch (e) {
        throw "Invalid character found";
    }
    var array = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; i++) {
        array[i] = bytes.charCodeAt(i);
    }
    return array;
}
exports.base64Bytes = base64Bytes;
function utf8Bytes(value) {
    var b = [];
    for (var i = 0; i < value.length; i++) {
        var c = value.charCodeAt(i);
        if (c <= 127) {
            b.push(c);
        }
        else {
            if (c <= 2047) {
                b.push(192 | (c >> 6), 128 | (c & 63));
            }
            else {
                if ((c & 64512) === 55296) {
                    // The start of a surrogate pair.
                    var valid = i < value.length - 1 && (value.charCodeAt(i + 1) & 64512) === 56320;
                    if (!valid) {
                        // The second surrogate wasn't there.
                        b.push(239, 191, 189);
                    }
                    else {
                        var hi = c;
                        var lo = value.charCodeAt(++i);
                        c = 65536 | ((hi & 1023) << 10) | (lo & 1023);
                        b.push(240 | (c >> 18), 128 | ((c >> 12) & 63), 128 | ((c >> 6) & 63), 128 | (c & 63));
                    }
                }
                else {
                    if ((c & 64512) === 56320) {
                        // Invalid low surrogate.
                        b.push(239, 191, 189);
                    }
                    else {
                        b.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
                    }
                }
            }
        }
    }
    return new Uint8Array(b);
}
exports.utf8Bytes = utf8Bytes;
function percentEncodedBytes(value) {
    var decoded;
    try {
        decoded = decodeURIComponent(value);
    }
    catch (e) {
        throw "Malformed data URL.";
    }
    return utf8Bytes(decoded);
}
exports.percentEncodedBytes = percentEncodedBytes;
function addTags(tags1, tags2) {
    var arrayTags1 = Object.entries(tags1);
    var arrayTags2 = Object.entries(tags2);
    var setTags1 = new Set(arrayTags1);
    for (var _i = 0, arrayTags2_1 = arrayTags2; _i < arrayTags2_1.length; _i++) {
        var elem = arrayTags2_1[_i];
        setTags1.add(elem);
    }
    var obj = Object.fromEntries(setTags1);
    return obj;
}
exports.addTags = addTags;
;
function deleteTags(tags1, tags2) {
    var arrayTags1 = Object.entries(tags1);
    var arrayTags2 = Object.entries(tags2);
    var setTags1 = new Set(arrayTags1);
    for (var _i = 0, arrayTags2_2 = arrayTags2; _i < arrayTags2_2.length; _i++) {
        var elem = arrayTags2_2[_i];
        setTags1.delete(elem);
    }
    var obj = Object.fromEntries(setTags1);
    return obj;
}
exports.deleteTags = deleteTags;
;
//# sourceMappingURL=utils.js.map