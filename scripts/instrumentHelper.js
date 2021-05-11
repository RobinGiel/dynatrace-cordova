"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlatformAvailable = exports.parseCommandLine = exports.showVersionOfPlugin = exports.CONFIG_JSAGENT_FILE = exports.CONFIG_FILE = exports.CONFIG_PLIST_FILE = exports.CONFIG_GRADLE_FILE = void 0;
const logger_1 = require("./logger");
const fileOperation = require("./fileOperationHelper");
const pathConstants = require("./pathsConstants");
exports.CONFIG_GRADLE_FILE = "--gradle";
exports.CONFIG_PLIST_FILE = "--plist";
exports.CONFIG_FILE = "--config";
exports.CONFIG_JSAGENT_FILE = "--jsagent";
function showVersionOfPlugin() {
    try {
        let packageJsonContent = fileOperation.readTextFromFileSync(pathConstants.getPluginPackage());
        let packageJsonContentObj = JSON.parse(packageJsonContent);
        logger_1.default.logMessageSync("Dynatrace Cordova Plugin - Version " + packageJsonContentObj.version, logger_1.default.INFO);
    }
    catch (e) {
        logger_1.default.logMessageSync("Dynatrace Cordova Plugin - Version NOT READABLE", logger_1.default.WARNING);
    }
}
exports.showVersionOfPlugin = showVersionOfPlugin;
function parseCommandLine(inputArgs) {
    let parsedArgs = {};
    inputArgs.forEach(function (entry) {
        let parts = entry.split("=");
        if (parts.length == 2) {
            switch (parts[0]) {
                case exports.CONFIG_GRADLE_FILE:
                    parsedArgs.gradle = parts[1];
                    break;
                case exports.CONFIG_FILE:
                    parsedArgs.config = parts[1];
                    break;
                case exports.CONFIG_PLIST_FILE:
                    parsedArgs.plist = parts[1];
                    break;
                case exports.CONFIG_JSAGENT_FILE:
                    parsedArgs.jsagent = parts[1];
                    break;
            }
        }
    });
    return parsedArgs;
}
exports.parseCommandLine = parseCommandLine;
function isPlatformAvailable(path, platform) {
    try {
        fileOperation.checkIfFileExistsSync(path);
        return true;
    }
    catch (e) {
        logger_1.default.logMessageSync(`${platform} Location doesn't exist - Skip ${platform} instrumentation and configuration.`, logger_1.default.WARNING);
        return false;
    }
}
exports.isPlatformAvailable = isPlatformAvailable;
