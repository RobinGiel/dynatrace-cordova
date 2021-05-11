#!/usr/bin/env node
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
exports.checkForPolicy = exports.updateSecurity = void 0;
const logger_1 = require("./logger");
const files = require("./fileOperationHelper");
const SEC_POLICY_IDENTIFIER = "Content-Security-Policy";
const HTML_IDENTIFIER = ["src=\"cordova.js\"", "<ion-app>"];
const CONNECT_SRC = "connect-src";
function updateSecurity(path, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.logMessageSync("Successfully read the settings for modifying CSP", logger_1.default.INFO);
        if (configuration.cordova.cspURL === undefined) {
            logger_1.default.logMessageSync("Updating the CSP is turned off!", logger_1.default.INFO);
            return false;
        }
        let htmlFiles;
        try {
            htmlFiles = yield files.searchFileExtInDirectoryNonRecursive(path, ".html", []);
            htmlFiles = htmlFiles.filter((value) => {
                return checkForPolicy(value);
            });
        }
        catch (e) {
            logger_1.default.logMessageSync("Error during updating CSP: " + e.message, logger_1.default.ERROR);
            htmlFiles = [];
        }
        if (htmlFiles.length > 1) {
            logger_1.default.logMessageSync("Will not update security policy as the policy is available in two different files.", logger_1.default.WARNING);
            return false;
        }
        else if (htmlFiles.length == 1) {
            yield updateCSPInHtml(htmlFiles[0], configuration.cordova.cspURL);
            return true;
        }
        logger_1.default.logMessageSync("Will not update security policy as the plugin didn't find a html file containing csp.", logger_1.default.WARNING);
        return false;
    });
}
exports.updateSecurity = updateSecurity;
function updateCSPInHtml(htmlFile, cspURL) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.logMessageSync("Updating the CSP to allow communication with the server!", logger_1.default.INFO);
        let content = yield files.readTextFromFile(htmlFile);
        let indexCSP = content.indexOf(SEC_POLICY_IDENTIFIER);
        let indexCSPEnd = content.indexOf("\">", indexCSP);
        let indexCSPContentStart = content.indexOf("content=", indexCSP);
        if (indexCSPContentStart > indexCSPEnd) {
            throw new Error("CSP not correctly formatted!");
        }
        let indexCSPConnectSrc = content.indexOf(CONNECT_SRC, indexCSPContentStart);
        let newFileContent;
        if (indexCSPConnectSrc == -1) {
            newFileContent = content.slice(0, indexCSPEnd) + " " + CONNECT_SRC + " " + cspURL + ";" + content.slice(indexCSPEnd);
        }
        else {
            newFileContent = content.slice(0, indexCSPConnectSrc + CONNECT_SRC.length) + " " + cspURL + content.slice(indexCSPConnectSrc + CONNECT_SRC.length);
        }
        yield files.writeTextToFile(htmlFile, newFileContent);
        logger_1.default.logMessageSync("Successfully updated the CSP!", logger_1.default.INFO);
    });
}
function checkForPolicy(htmlFile) {
    let content = files.readTextFromFileSync(htmlFile);
    if (content.indexOf(SEC_POLICY_IDENTIFIER) > -1) {
        for (let i = 0; i < HTML_IDENTIFIER.length; i++) {
            if (content.indexOf(HTML_IDENTIFIER[i])) {
                return true;
            }
        }
    }
    return false;
}
exports.checkForPolicy = checkForPolicy;
