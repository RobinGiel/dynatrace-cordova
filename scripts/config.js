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
exports.checkConfiguration = exports.readConfig = exports.PLATFORM_ANDROID = exports.PLATFORM_IOS = exports.PLATFORM_ALL = exports.defaultConfig = void 0;
const pathConstants = require("./pathsConstants");
const fileOperation = require("./fileOperationHelper");
const logger_1 = require("./logger");
const downloadAgent_1 = require("./downloadAgent");
exports.defaultConfig = {
    cordova: {
        debug: false
    },
    js: {
        url: "",
        mode: 2
    }
};
exports.PLATFORM_ALL = 0;
exports.PLATFORM_IOS = 1;
exports.PLATFORM_ANDROID = 2;
const ERROR_CONFIG_NOT_AVAILABLE = "Couldn't find Configuration!";
function readConfig(pathToConfig) {
    let readConfig;
    try {
        readConfig = require(pathToConfig);
    }
    catch (e) {
        throw new downloadAgent_1.StopBuildError(ERROR_CONFIG_NOT_AVAILABLE);
    }
    if (readConfig === undefined) {
        throw new downloadAgent_1.StopBuildError(ERROR_CONFIG_NOT_AVAILABLE);
    }
    patchIncorrectJSUrl(readConfig);
    return Object.assign(Object.assign({}, exports.defaultConfig), readConfig);
}
exports.readConfig = readConfig;
function patchIncorrectJSUrl(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.js !== undefined && config.js.url !== undefined) {
            config.js.url = config.js.url.replace("ApiToken=", "Api-Token=");
        }
    });
}
function checkConfiguration() {
    return __awaiter(this, void 0, void 0, function* () {
        let pathToDynatraceConfig = pathConstants.getConfigFilePath();
        try {
            yield fileOperation.checkIfFileExists(pathToDynatraceConfig);
        }
        catch (e) {
            yield createNewConfiguration(pathToDynatraceConfig);
        }
    });
}
exports.checkConfiguration = checkConfiguration;
function createNewConfiguration(pathToDynatraceConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let defaultConfigContent = yield fileOperation.readTextFromFile(pathConstants.getDefaultConfig());
        yield fileOperation.writeTextToFile(pathToDynatraceConfig, defaultConfigContent);
        logger_1.default.logMessageSync("Created dynatrace.config.js - Please insert your configuration and update the file!", logger_1.default.INFO);
    });
}
