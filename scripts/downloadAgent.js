"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHTTPRequest = exports.createHTTPRequestWithRetries = exports.isModeValid = exports.isJsAgentUrlValid = exports.createHTTPOptions = exports.retrieveJSAgentHttp = exports.downloadAgent = exports.StopBuildError = exports.AGENT_DTCONFIG = void 0;
const axios_1 = require("axios");
const https = require("https");
const logger_1 = require("./logger");
exports.AGENT_DTCONFIG = "data-dtconfig";
const JSAGENT_OPTIONS = ['jsInlineScript', 'jsTagComplete', 'syncCS', 'asyncCS', 'jsTag'];
class StopBuildError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.StopBuildError = StopBuildError;
function downloadAgent(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.js === undefined) {
            logger_1.default.logMessageSync("No Settings available for JSAgent in the dynatrace.config.js file - Will not retrieve or include JSAgent.", logger_1.default.INFO);
            return;
        }
        else if (!isJsAgentUrlValid(config.js.url)) {
            logger_1.default.logMessageSync("Incorrect or empty url found for JSAgent - Will not retrieve or include JSAgent.", logger_1.default.WARNING);
            return;
        }
        logger_1.default.logMessageSync("Starting the retrieval of the JSAgent ..", logger_1.default.INFO);
        try {
            let jsagentContent;
            if (isModeValid(config.js.mode)) {
                jsagentContent = yield retrieveJSAgentHttp(config.js, config.js.url.replace(JSAGENT_OPTIONS[0], JSAGENT_OPTIONS[config.js.mode]));
                logger_1.default.logMessageSync("JSAgent was retrieved successfully!", logger_1.default.INFO);
                return jsagentContent;
            }
            else if (config.js.mode === undefined) {
                logger_1.default.logMessageSync("Mode value is not defined! Retrieving the default code snippet sync option for the JSAgent.", logger_1.default.INFO);
                jsagentContent = yield retrieveJSAgentHttp(config.js, config.js.url.replace(JSAGENT_OPTIONS[0], JSAGENT_OPTIONS[2]));
                logger_1.default.logMessageSync("JSAgent was retrieved successfully!", logger_1.default.INFO);
                return jsagentContent;
            }
            else {
                logger_1.default.logMessageSync("Mode value is not a number between 0 and 4! Retrieving the default code snippet sync option for the JSAgent. Please check the documentation for more details.", logger_1.default.WARNING);
                jsagentContent = yield retrieveJSAgentHttp(config.js, config.js.url);
                logger_1.default.logMessageSync("JSAgent was retrieved successfully!", logger_1.default.INFO);
                return jsagentContent;
            }
        }
        catch (exception) {
            logger_1.default.logMessageSync("Could not retrieve the JSAgent! - " + exception, logger_1.default.ERROR);
        }
        return;
    });
}
exports.downloadAgent = downloadAgent;
function retrieveJSAgentHttp(configuration, jsAgentOptionsUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let configJsUrl = false;
        if (jsAgentOptionsUrl === undefined) {
            throw new Error("JSAgent API url in configuration is not valid! Please update the url to a valid value!");
        }
        else {
            configJsUrl = isJsAgentUrlValid(jsAgentOptionsUrl);
            if (configJsUrl) {
                if (configuration.allowanycert !== undefined && configuration.allowanycert) {
                    logger_1.default.logMessageSync("Ignoring certificate when retrieving the JSAgent!", logger_1.default.WARNING);
                }
                let jsagentContent = yield createHTTPRequestWithRetries(3, jsAgentOptionsUrl, createHTTPOptions(configuration), "Retrieving of JS Agent options finished", "Could not retrieve JS Agent options");
                if (jsagentContent !== undefined && jsagentContent.startsWith("<script")) {
                    return jsagentContent.toString();
                }
                else {
                    throw new Error("Content of the JS Agent is invalid! Please check the js url in the dynatrace.config.js file.");
                }
            }
            return "";
        }
    });
}
exports.retrieveJSAgentHttp = retrieveJSAgentHttp;
function createHTTPOptions(configuration) {
    return { rejectUnauthorized: !(configuration.allowanycert !== undefined && configuration.allowanycert) };
}
exports.createHTTPOptions = createHTTPOptions;
function isJsAgentUrlValid(jsAgentUrl) {
    if (jsAgentUrl == "") {
        return false;
    }
    for (let i = 0; i < JSAGENT_OPTIONS.length; i++) {
        if (jsAgentUrl.indexOf(JSAGENT_OPTIONS[i]) >= 0) {
            return true;
        }
    }
    return false;
}
exports.isJsAgentUrlValid = isJsAgentUrlValid;
function isModeValid(mode) {
    return typeof (mode) === 'number' && mode >= 0 && mode <= 4;
}
exports.isModeValid = isModeValid;
function createHTTPRequestWithRetries(retries, uri, options, finishMsg, errorMsg) {
    return __awaiter(this, void 0, void 0, function* () {
        let amountOfRetries = retries || 1;
        let jsagentContent = "";
        do {
            amountOfRetries -= 1;
            try {
                return yield exports.createHTTPRequest(uri, options, finishMsg, errorMsg);
            }
            catch (error) {
                if (amountOfRetries == 0) {
                    throw error;
                }
            }
        } while (jsagentContent.length === 0 && amountOfRetries > 0);
        return jsagentContent;
    });
}
exports.createHTTPRequestWithRetries = createHTTPRequestWithRetries;
function createHTTPRequest(uri, options, finishMsg, errorMsg) {
    return __awaiter(this, void 0, void 0, function* () {
        var axiosInstance = axios_1.default.create({
            httpsAgent: new https.Agent(options)
        });
        let errorMessage;
        try {
            let httpResponse = yield axiosInstance.get(uri);
            if (httpResponse.status == 200) {
                logger_1.default.logMessageSync(finishMsg, logger_1.default.INFO);
                return httpResponse.data;
            }
            else {
                errorMessage = errorMsg + httpResponse.statusText;
            }
        }
        catch (error) {
            errorMessage = errorMsg + error.message;
        }
        if (errorMessage) {
            throw new Error(errorMessage);
        }
        return "";
    });
}
exports.createHTTPRequest = createHTTPRequest;
