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
const fileOperation = require("./fileOperationHelper");
const pathConstants = require("./pathsConstants");
const config_1 = require("./config");
const fs = require("fs");
const nodePath = require("path");
const ERROR = 0;
const INFO = 1;
const WARNING = 2;
exports.default = {
    ERROR: ERROR,
    INFO: INFO,
    WARNING: WARNING,
    closeLogFile: closeLogFile,
    logMessageSync: logMessageSync,
    logErrorSync: logErrorSync
};
function closeLogFile() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.SILENT == "true") {
            return;
        }
        try {
            yield fileOperation.checkIfFileExists(pathConstants.getCurrentLogPath());
            return new Promise(function (resolve, reject) {
                let logFileName = currentDate().split(":").join("-") + ".txt";
                if (fs.existsSync(pathConstants.getLogPath() + logFileName)) {
                    fs.rename(pathConstants.getCurrentLogPath(), nodePath.join(pathConstants.getLogPath(), logFileName), (err) => {
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    });
                }
            });
        }
        catch (e) {
        }
    });
}
function logErrorSync(_message) {
    let config = config_1.readConfig(pathConstants.getConfigFilePath());
    if (config.cordova !== undefined && config.cordova.debug) {
        logMessageSync(_message, ERROR, true);
    }
}
function logMessageSync(_message, _logLevel, _onlyConsole = false) {
    if (process.env.SILENT == "true") {
        return;
    }
    try {
        fs.mkdirSync(pathConstants.getLogPath());
    }
    catch (e) {
    }
    let logString;
    if (_logLevel == INFO) {
        logString = "#INFO  ";
    }
    else if (_logLevel == WARNING) {
        logString = "#WARN  ";
    }
    else if (_logLevel == ERROR) {
        logString = "#ERROR ";
    }
    else {
        logString = "#NONE  ";
    }
    let outputString = logString + "[" + currentDate() + "]: " + _message;
    console.log(outputString);
    if (!_onlyConsole) {
        fs.appendFileSync(pathConstants.getCurrentLogPath(), outputString + "\r\n");
    }
}
function errorHandling(_message) {
    console.log(_message);
}
function currentDate() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -5);
    return localISOTime.replace("T", " ");
}
