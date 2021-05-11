"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exec = require('cordova/exec');
var emptyFunction = function () { };
var pluginId = module.id.slice(0, module.id.lastIndexOf('.'));
const MobileFirstRequestInterceptor = require(pluginId + '.mobile-first-network-interceptor').MobileFirstRequestInterceptor;
const NativeNetworkInterceptorUtils = require(pluginId + '.native-network-interceptor-utils').NativeNetworkInterceptorUtils;
module.exports = {
    endVisit: function (success, error) {
        success = success || emptyFunction;
        error = error || emptyFunction;
        exec(success, error, "DynatraceCordovaPlugin", "endVisit", []);
    },
    getMobileFirstNetworkInterceptor() {
        return MobileFirstRequestInterceptor;
    },
    getNativeNetworkInterceptorUtils() {
        return NativeNetworkInterceptorUtils;
    },
    getUserPrivacyOptions: function (success, error) {
        success = success || emptyFunction;
        error = error || emptyFunction;
        exec(success, error, "DynatraceCordovaPlugin", "getUserPrivacyOptions", []);
    },
    applyUserPrivacyOptions(userPrivacyOptions, success, error) {
        success = success || emptyFunction;
        error = error || emptyFunction;
        exec(success, error, "DynatraceCordovaPlugin", "applyUserPrivacyOptions", [userPrivacyOptions]);
    }
};
