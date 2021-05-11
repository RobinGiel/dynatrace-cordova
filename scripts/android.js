#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeGradleConfig = exports.instrumentAndroidPlatform = exports.GRADLE_APPLY_BUILDSCRIPT = exports.GRADLE_DYNATRACE_FILE = void 0;
const logger_1 = require("./logger");
const fileOperation = require("./fileOperationHelper");
const pathConstants = require("./pathsConstants");
const path = require("path");
const GRADLE_CONFIG_IDENTIFIER = "// AUTO - INSERTED";
exports.GRADLE_DYNATRACE_FILE = `apply from: \"${pathConstants.getDynatraceGradleFile().split(path.sep).join(`${path.sep + path.sep}`)}\"`;
const GRADLE_BUILDSCRIPT_IDENTIFIER = "buildscript";
exports.GRADLE_APPLY_BUILDSCRIPT = `apply from: \"${pathConstants.getDynatracePluginGradleFile().split(path.sep).join(`${path.sep + path.sep}`)}", to: buildscript`;
function instrumentAndroidPlatform(pathToGradle, remove) {
    let path = fileOperation.checkIfFileExistsSync(pathToGradle);
    if (!path.endsWith(".gradle")) {
        throw new Error("Can't find .gradle file. gradle path must also include the gradle file!");
    }
    changeCordovaBuildGradleFile(path, remove);
}
exports.instrumentAndroidPlatform = instrumentAndroidPlatform;
function changeCordovaBuildGradleFile(pathToGradle, remove) {
    let gradleFileContent = fileOperation.readTextFromFileSync(pathToGradle);
    let gradleFileContentLines = gradleFileContent.split("\n");
    let gradlePluginFileIndex = -1;
    let gradleDynatraceFileIndex = -1;
    for (let i = 0; i < gradleFileContentLines.length && (gradleDynatraceFileIndex === -1 || gradlePluginFileIndex === -1); i++) {
        if (gradleFileContentLines[i].indexOf("plugin.gradle") > -1) {
            gradlePluginFileIndex = i;
        }
        else if (gradleFileContentLines[i].indexOf("dynatrace.gradle") > -1) {
            gradleDynatraceFileIndex = i;
        }
    }
    let modified = false;
    if (remove) {
        if (gradlePluginFileIndex !== -1) {
            gradleFileContentLines.splice(gradlePluginFileIndex, 1);
            modified = true;
        }
        if (gradleDynatraceFileIndex !== -1) {
            gradleFileContentLines.splice(gradleDynatraceFileIndex - (modified ? 1 : 0), 1);
            modified = true;
        }
        if (modified) {
            logger_1.default.logMessageSync("Removed Dynatrace modifications from build.gradle: " + pathToGradle, logger_1.default.INFO);
        }
    }
    else {
        if (gradlePluginFileIndex === -1) {
            let gradleFileCordovaIndex = -1;
            for (let i = 0; i < gradleFileContentLines.length; i++) {
                if (gradleFileContentLines[i].startsWith(GRADLE_BUILDSCRIPT_IDENTIFIER)) {
                    gradleFileCordovaIndex = i;
                    break;
                }
            }
            if (gradleFileCordovaIndex === -1) {
                throw new Error("Could not find Buildscript block in build.gradle.");
            }
            gradleFileContentLines.splice(gradleFileCordovaIndex + 1, 0, exports.GRADLE_APPLY_BUILDSCRIPT);
            modified = true;
        }
        if (gradleDynatraceFileIndex === -1) {
            gradleFileContentLines.splice(gradleFileContentLines.length, 0, exports.GRADLE_DYNATRACE_FILE);
            modified = true;
        }
        if (modified) {
            logger_1.default.logMessageSync("Added Dynatrace plugin.gradle to the build.gradle: " + pathToGradle, logger_1.default.INFO);
        }
        else {
            logger_1.default.logMessageSync("Dynatrace plugin & agent already added to build.gradle", logger_1.default.INFO);
        }
    }
    if (modified) {
        let fullGradleFile = gradleFileContentLines.join("\n");
        fileOperation.writeTextToFileSync(pathToGradle, fullGradleFile);
    }
}
function writeGradleConfig(androidConfig) {
    if (androidConfig === undefined || androidConfig.config === undefined) {
        logger_1.default.logMessageSync("Can't write configuration of Android agent because it is missing!", logger_1.default.WARNING);
        return;
    }
    let gradleFileContent = fileOperation.readTextFromFileSync(pathConstants.getDynatraceGradleFile());
    let gradleFileContentLines = removeOldGradleConfig(gradleFileContent);
    let gradleFileIndex = -1;
    for (let i = 0; i < gradleFileContentLines.length; i++) {
        if (gradleFileContentLines[i].indexOf(GRADLE_CONFIG_IDENTIFIER) > -1) {
            gradleFileIndex = i;
            break;
        }
    }
    gradleFileContentLines.splice(gradleFileIndex + 1, 0, androidConfig.config);
    let fullGradleFile = gradleFileContentLines.join("\n");
    fileOperation.writeTextToFileSync(pathConstants.getDynatraceGradleFile(), fullGradleFile);
    logger_1.default.logMessageSync("Replaced old configuration with current configuration in dynatrace.gradle", logger_1.default.INFO);
}
exports.writeGradleConfig = writeGradleConfig;
function removeOldGradleConfig(gradleFileContent) {
    let gradleFileContentLines = gradleFileContent.split("\n");
    var gradleConfigIndex = [];
    for (let i = 0; i < gradleFileContentLines.length && gradleConfigIndex.length < 2; i++) {
        if (gradleFileContentLines[i].indexOf(GRADLE_CONFIG_IDENTIFIER) > -1) {
            gradleConfigIndex.push(i);
        }
    }
    if (gradleConfigIndex.length != 2) {
        throw new Error("Could not find identifier in internal gradle file. Please re-install.");
    }
    gradleFileContentLines.splice(gradleConfigIndex[0] + 1, gradleConfigIndex[1] - (gradleConfigIndex[0] + 1));
    return gradleFileContentLines;
}
