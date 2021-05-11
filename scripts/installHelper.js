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
exports.removeLinkerFlagToCapConfigFile = exports.addLinkerFlagToCapConfigFile = exports.modifyConfigXmlUninstall = exports.modifyConfigXmlInstall = exports.removePListModification = exports.removeGradleModification = exports.modifyPackageJson = exports.modifyPackageJsonCap = exports.installDependencies = void 0;
const logger_1 = require("./logger");
const fileOp = require("./fileOperationHelper");
const pathConst = require("./pathsConstants");
const android = require("./android");
const ios_1 = require("./ios");
const nodePath = require("path");
const { ConfigParser } = require('cordova-common');
function installDependencies() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fileOp.checkIfFileExists(nodePath.join(pathConst.getPluginPath(), "node_modules"));
        }
        catch (e) {
            logger_1.default.logMessageSync("Dependencies are not resolved - Will do npm install. Please wait!", logger_1.default.WARNING);
            const { execSync } = require('child_process');
            execSync('npm install', { cwd: pathConst.getPluginPath() });
        }
    });
}
exports.installDependencies = installDependencies;
function modifyPackageJsonCap(install, path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let packageJsonParsed = path ? yield parsedPackageJson(path) : yield parsedPackageJson();
            if (install) {
                let capHookValue = "node " + nodePath.relative(nodePath.join((pathConst.getApplicationPath())), nodePath.join(__dirname, "instrument.js"));
                if (packageJsonParsed.scripts == undefined) {
                    packageJsonParsed.scripts = {};
                }
                if (packageJsonParsed.scripts["ionic:capacitor:build:before"] !== capHookValue) {
                    packageJsonParsed.scripts["ionic:capacitor:build:before"] = capHookValue;
                }
            }
            else {
                if (packageJsonParsed.dependencies !== undefined) {
                    delete packageJsonParsed.dependencies["@dynatrace/cordova-plugin"];
                }
                if (packageJsonParsed.devDependencies !== undefined) {
                    delete packageJsonParsed.devDependencies["@dynatrace/cordova-plugin"];
                }
                delete packageJsonParsed.scripts["ionic:capacitor:build:before"];
            }
            path ? yield fileOp.writeTextToFile(path, JSON.stringify(packageJsonParsed, null, "\t")) : yield fileOp.writeTextToFile(pathConst.getApplicationPackage(), JSON.stringify(packageJsonParsed, null, "\t"));
        }
        catch (e) {
            console.log(e);
            logger_1.default.logMessageSync("Could not find package.json!", logger_1.default.WARNING, true);
        }
    });
}
exports.modifyPackageJsonCap = modifyPackageJsonCap;
function modifyPackageJson(install) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let packageJsonParsed = yield parsedPackageJson();
            if (install) {
                packageJsonParsed.cordova.plugins["@dynatrace/cordova-plugin"] = {};
                delete packageJsonParsed.cordova.plugins["dynatrace-cordova-plugin"];
            }
            else {
                if (packageJsonParsed.cordova && packageJsonParsed.cordova.plugins) {
                    delete packageJsonParsed.cordova.plugins["@dynatrace/cordova-plugin"];
                    delete packageJsonParsed.cordova.plugins["dynatrace-cordova-plugin"];
                }
                if (packageJsonParsed.dependencies) {
                    delete packageJsonParsed.dependencies["@dynatrace/cordova-plugin"];
                }
                if (packageJsonParsed.devDependencies) {
                    delete packageJsonParsed.devDependencies["@dynatrace/cordova-plugin"];
                }
            }
            yield fileOp.writeTextToFile(pathConst.getApplicationPackage(), JSON.stringify(packageJsonParsed, null, "\t"));
        }
        catch (e) {
            logger_1.default.logMessageSync("Could not find package.json!", logger_1.default.WARNING);
        }
    });
}
exports.modifyPackageJson = modifyPackageJson;
function removeGradleModification() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let path = pathConst.isCapacitorApp() ? yield fileOp.checkIfFileExists(pathConst.getAndroidGradleFile(pathConst.getAndroidPathCapacitor())) : yield fileOp.checkIfFileExists(pathConst.getAndroidGradleFile(pathConst.getAndroidPath()));
            try {
                android.instrumentAndroidPlatform(path, true);
            }
            catch (e) {
                logger_1.default.logMessageSync("Removal of Gradle modification didn't work!", logger_1.default.ERROR, true);
            }
        }
        catch (e) {
        }
    });
}
exports.removeGradleModification = removeGradleModification;
function removePListModification() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let isCapacitor = pathConst.isCapacitorApp();
            isCapacitor ? yield fileOp.checkIfFileExists(pathConst.getIosPlistPathCapacitor()) : yield fileOp.checkIfFileExists(pathConst.getIosPath());
            try {
                isCapacitor ? yield ios_1.default.modifyPListFile(pathConst.getIosPlistPathCapacitor(), undefined, true) : yield ios_1.default.modifyPListFile(undefined, undefined, true);
            }
            catch (e) {
                logger_1.default.logMessageSync("Removal of PList modification didn't work!", logger_1.default.ERROR, true);
            }
        }
        catch (e) {
        }
    });
}
exports.removePListModification = removePListModification;
function modifyConfigXmlInstall() {
    try {
        const { ConfigParser } = require('cordova-common');
        let cfg = new ConfigParser(nodePath.join(pathConst.getApplicationPath(), "config.xml"));
        let plugin = cfg.getPlugin("dynatrace-cordova-plugin");
        if (plugin === undefined) {
            return;
        }
        let pluginWithAt = cfg.getPlugin("@dynatrace/cordova-plugin");
        if (pluginWithAt === undefined) {
            cfg.addPlugin({ name: "@dynatrace/cordova-plugin", spec: plugin.spec });
        }
        cfg.removePlugin("dynatrace-cordova-plugin");
        cfg.write();
    }
    catch (e) {
        logger_1.default.logMessageSync("Config.xml is not available - Can not modify Dynatrace dependency", logger_1.default.WARNING);
    }
}
exports.modifyConfigXmlInstall = modifyConfigXmlInstall;
function modifyConfigXmlUninstall() {
    try {
        let cfg = new ConfigParser(nodePath.join(pathConst.getApplicationPath(), "config.xml"));
        cfg.removePlugin("@dynatrace/cordova-plugin");
        cfg.write();
    }
    catch (e) {
        logger_1.default.logMessageSync("Config.xml is not available - Can not modify Dynatrace dependency", logger_1.default.WARNING);
    }
}
exports.modifyConfigXmlUninstall = modifyConfigXmlUninstall;
function addLinkerFlagToCapConfigFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let capConfigFile = path ? yield fileOp.readTextFromFile(path) : yield fileOp.readTextFromFile(pathConst.getCapacitorConfig());
            let capConfigFileParsed = JSON.parse(capConfigFile);
            if (!capConfigFileParsed.ios) {
                capConfigFileParsed.ios = {};
            }
            if (capConfigFileParsed.ios) {
                if (!capConfigFileParsed.ios["cordovaLinkerFlags"]) {
                    capConfigFileParsed.ios["cordovaLinkerFlags"] = ["-ObjC"];
                }
                else {
                    if (!capConfigFileParsed.ios["cordovaLinkerFlags"].includes("-ObjC")) {
                        capConfigFileParsed.ios["cordovaLinkerFlags"].push("-ObjC");
                    }
                    else {
                        logger_1.default.logMessageSync("No need to modify the capacitor.config.json as it already includes the proper linker flag!", logger_1.default.INFO);
                    }
                }
                path ? yield fileOp.writeTextToFile(path, JSON.stringify(capConfigFileParsed, null, "\t")) : yield fileOp.writeTextToFile(pathConst.getCapacitorConfig(), JSON.stringify(capConfigFileParsed, null, "\t"));
                logger_1.default.logMessageSync("Modified capacitor.config.js to allow proper usage of iOS agent!", logger_1.default.INFO);
            }
        }
        catch (e) {
            console.log(e);
            logger_1.default.logMessageSync("capacitor.config.json file is not available", logger_1.default.WARNING);
        }
    });
}
exports.addLinkerFlagToCapConfigFile = addLinkerFlagToCapConfigFile;
function removeLinkerFlagToCapConfigFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let capConfigFile = path ? yield fileOp.readTextFromFile(path) : yield fileOp.readTextFromFile(pathConst.getCapacitorConfig());
            let capConfigFileParsed = JSON.parse(capConfigFile);
            if (capConfigFileParsed.ios) {
                if (capConfigFileParsed.ios["cordovaLinkerFlags"] && capConfigFileParsed.ios["cordovaLinkerFlags"].length > 1) {
                    removeValueFromArray("-ObjC", capConfigFileParsed.ios["cordovaLinkerFlags"]);
                }
                else {
                    delete capConfigFileParsed.ios["cordovaLinkerFlags"];
                }
            }
            if (Object.keys(capConfigFileParsed.ios).length === 0) {
                delete capConfigFileParsed.ios;
            }
            path ? yield fileOp.writeTextToFile(path, JSON.stringify(capConfigFileParsed, null, "\t")) : yield fileOp.writeTextToFile(pathConst.getCapacitorConfig(), JSON.stringify(capConfigFileParsed, null, "\t"));
        }
        catch (e) {
            console.log(e);
            logger_1.default.logMessageSync("capacitor.config.json file is not available - Cannot remove -ObjC linker", logger_1.default.WARNING);
        }
    });
}
exports.removeLinkerFlagToCapConfigFile = removeLinkerFlagToCapConfigFile;
function parsedPackageJson(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let packageJson = path ? yield fileOp.readTextFromFile(path) : yield fileOp.readTextFromFile(pathConst.getApplicationPackage());
            return JSON.parse(packageJson);
        }
        catch (e) {
            console.log(e);
            logger_1.default.logMessageSync("Could not find package.json!", logger_1.default.WARNING, true);
        }
    });
}
function removeValueFromArray(value, strArray) {
    strArray.indexOf(value) !== -1 &&
        strArray.splice(strArray.indexOf(value), 1);
}
