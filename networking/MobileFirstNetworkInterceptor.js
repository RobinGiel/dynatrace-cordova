"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileFirstRequestInterceptor = void 0;
var pluginId = module.id.slice(0, module.id.lastIndexOf('.'));
const NativeNetworkInterceptorUtils = require(pluginId + '.native-network-interceptor-utils').NativeNetworkInterceptorUtils;
var originaWLResourceRequest = undefined;
var isNetworkIntercepted = false;
exports.MobileFirstRequestInterceptor = {
    isInterceptorEnabled() {
        return isNetworkIntercepted;
    },
    enableInterceptor(serverUrl) {
        if (!dT_ && !dtrum) {
            console.log("Missing Dynatrace Javascript Agent API! MFP Interceptor not enabled!");
        }
        if (!WLResourceRequest && !WL) {
            console.log("Missing Mobile First API! MFP Interceptor not enabled!");
            return;
        }
        if (isNetworkIntercepted) {
            console.log("MFP Interceptor already enabled!");
            return;
        }
        originaWLResourceRequest = WLResourceRequest;
        WLResourceRequest = function WLResourceRequest(...args) {
            let request = new originaWLResourceRequest(...args);
            const originalSend = request.send;
            request.send = function send(content) {
                var that = this;
                if (that.getHeader("x-dynatrace") == undefined) {
                    let actionId = NativeNetworkInterceptorUtils.enterNativeRequestAction(that.getUrl(), "Mobile First");
                    that.setHeaders(NativeNetworkInterceptorUtils.getHeadersForNativeRequest(actionId));
                    return originalSend.apply(this, content)
                        .then((response) => {
                        NativeNetworkInterceptorUtils.leaveNativeRequestAction(actionId);
                        return response;
                    }, (error) => {
                        NativeNetworkInterceptorUtils.leaveNativeRequestAction(actionId);
                        return error;
                    });
                }
                else {
                    return originalSend.apply(this, arguments);
                }
            };
            return request;
        };
        for (var prop in originaWLResourceRequest) {
            if (originaWLResourceRequest.hasOwnProperty(prop)) {
                WLResourceRequest[prop] = originaWLResourceRequest[prop];
            }
        }
        isNetworkIntercepted = true;
        console.log("Enabled MFP HTTP Interceptor!");
    },
    disableInterceptor() {
        if (!isNetworkIntercepted) {
            return;
        }
        WLResourceRequest = originaWLResourceRequest;
        isNetworkIntercepted = false;
        console.log("Disabled MFP HTTP Interceptor!");
    }
};
