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
exports.searchForPListFile = void 0;
const logger_1 = require("./logger");
const fileOperation = require("./fileOperationHelper");
const pathConstants = require("./pathsConstants");
const plist = require("plist");
const nodePath = require("path");
exports.default = {
    modifyPListFile: modifyPListFile,
    searchForPListFile: searchForPListFile
};
function modifyPListFile(pathToPList, iosConfig, removeOnly) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pathToPList === undefined) {
            pathToPList = yield searchForPListFile();
        }
        else {
            if (!pathToPList.endsWith(".plist")) {
                throw new Error("Can't find .plist file. plist path must also include the plist file!");
            }
            try {
                fileOperation.checkIfFileExistsSync(pathToPList);
            }
            catch (e) {
                throw new Error("Could not read plist file: " + pathToPList);
            }
        }
        removePListConfig(pathToPList);
        if (!removeOnly) {
            if (iosConfig === undefined || iosConfig.config === undefined) {
                logger_1.default.logMessageSync("Can't write configuration of iOS agent because it is missing!", logger_1.default.WARNING);
            }
            else {
                addAgentConfigToPListFile(pathToPList, iosConfig.config);
            }
        }
    });
}
function removePListConfig(file) {
    let pListContent = fileOperation.readTextFromFileSync(file);
    let pListObj = plist.parse(pListContent);
    let pListObjCopy = Object.assign({}, pListObj);
    for (let property in pListObj) {
        if (property.startsWith("DTX")) {
            delete pListObjCopy[property];
        }
    }
    fileOperation.writeTextToFileSync(file, plist.build(pListObjCopy));
    logger_1.default.logMessageSync("Removed old configuration in plist file: " + file, logger_1.default.INFO);
}
function addAgentConfigToPListFile(file, config) {
    let pListContent = fileOperation.readTextFromFileSync(file);
    let newPListContent = `<plist><dict>${config}</dict></plist>`;
    let flavorType = `<plist><dict><key>DTXFlavor</key><string>cordova</string></dict></plist>`;
    fileOperation.writeTextToFileSync(file, plist.build(Object.assign(Object.assign(Object.assign({}, plist.parse(pListContent)), plist.parse(newPListContent)), plist.parse(flavorType))));
    logger_1.default.logMessageSync("Updated configuration in plist file: " + file, logger_1.default.INFO);
}
const DIR_SEARCH_EXCEPTION = ["build", "cordova", "CordovaLib"];
function searchForPListFile() {
    return __awaiter(this, void 0, void 0, function* () {
        let foundPListFiles;
        try {
            let packageApplicationContent = yield fileOperation.readTextFromFile(pathConstants.getApplicationPackage());
            let packageApplicationJSON = JSON.parse(packageApplicationContent);
            foundPListFiles = yield fileOperation.searchFilesInDirectoryRecursive(pathConstants.getIosPath(), packageApplicationJSON.name + "-Info.plist", DIR_SEARCH_EXCEPTION);
        }
        catch (e) {
            logger_1.default.logMessageSync("Didn't find package.json and couldn't read name of the application. Will search for other plist files.", logger_1.default.WARNING);
        }
        if (!foundPListFiles || foundPListFiles.length == 0) {
            try {
                foundPListFiles = yield fileOperation.searchFilesInDirectoryRecursive(pathConstants.getIosPath(), "-Info.plist", DIR_SEARCH_EXCEPTION);
            }
            catch (e) {
            }
        }
        if (foundPListFiles === undefined || foundPListFiles.length == 0) {
            throw new Error("Can't find .plist file in iOS Folder! Try to use plist= custom argument. See documentation for help!");
        }
        else if (foundPListFiles.length > 1) {
            logger_1.default.logMessageSync("Found several -Info.plist files, will take the first one: " + nodePath.resolve(foundPListFiles[0]), logger_1.default.WARNING);
        }
        return foundPListFiles[0];
    });
}
exports.searchForPListFile = searchForPListFile;
