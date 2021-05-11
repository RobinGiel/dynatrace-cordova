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
exports.removeOldDtAgent = exports.checkHTMLFile = exports.loadHTMLFile = exports.isHTMLQualified = exports.addAgentToHTMLDom = exports.removeAgentFromHTMLDom = exports.isAgentInHTMLDom = exports.instrumentHtml = void 0;
const logger_1 = require("./logger");
const files = require("./fileOperationHelper");
const path = require("path");
const pathConstants = require("./pathsConstants");
const jsdom_1 = require("jsdom");
const OLD_AGENT_SRC = "assets/dtAgent.js";
const SWALLOW_API_SRC = "assets/dtrum-swallow-api.js";
const HTML_IDENTIFIER = ["ion-app", "app-root"];
function instrumentHtml(folderHtml, jsagentContent) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.logMessageSync("Searching for HTML files ..", logger_1.default.INFO);
        let htmlFiles = yield files.searchFileExtInDirectoryNonRecursive(folderHtml, ".html", []);
        let htmlFilesToInstrument = [];
        for (let i = 0; i < htmlFiles.length; i++) {
            if (checkHTMLFile(htmlFiles[i])) {
                htmlFilesToInstrument.push(htmlFiles[i]);
            }
        }
        if (htmlFilesToInstrument.length == 0) {
            logger_1.default.logMessageSync("No HTML files to instrument!", logger_1.default.INFO);
        }
        else {
            for (let i = 0; i < htmlFilesToInstrument.length; i++) {
                yield insertAgentIntoHtml(htmlFilesToInstrument[i], jsagentContent);
            }
        }
        if (htmlFilesToInstrument.length > 0) {
            logger_1.default.logMessageSync(htmlFilesToInstrument.length + " HTML file(s) are instrumented.", logger_1.default.INFO);
            for (let i = 0; i < htmlFilesToInstrument.length; i++) {
                yield copyAgent(path.join(htmlFilesToInstrument[i], ".."));
            }
        }
        logger_1.default.logMessageSync("Successfully updated the JSAgent in HTML file!", logger_1.default.INFO);
    });
}
exports.instrumentHtml = instrumentHtml;
function insertAgentIntoHtml(htmlFile, jsagentContent) {
    return __awaiter(this, void 0, void 0, function* () {
        let domTree = yield loadHTMLFile(htmlFile);
        domTree = addAgentToHTMLDom(domTree, jsagentContent);
        yield writeHTMLTreeToFile(domTree, htmlFile);
        logger_1.default.logMessageSync("Successfully instrumented: " + path.resolve(htmlFile), logger_1.default.INFO);
    });
}
function isAgentInHTMLDom(domTree) {
    let scripts = domTree.window.document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
        let item = scripts.item(i);
        if (item !== null && item.src === OLD_AGENT_SRC) {
            return i;
        }
    }
    return -1;
}
exports.isAgentInHTMLDom = isAgentInHTMLDom;
function removeAgentFromHTMLDom(domTree) {
    let scripts = domTree.window.document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
        let item = scripts.item(i);
        if (item !== null && item.src === OLD_AGENT_SRC && item.parentNode !== null) {
            item.parentNode.removeChild(item);
            return domTree;
        }
    }
    return domTree;
}
exports.removeAgentFromHTMLDom = removeAgentFromHTMLDom;
function addAgentToHTMLDom(domTree, jsagentContent) {
    let scriptTag = domTree.window.document.createElement('template');
    scriptTag.innerHTML = jsagentContent;
    let swallowApiScript = domTree.window.document.createElement("script");
    swallowApiScript.type = "text/javascript";
    swallowApiScript.src = SWALLOW_API_SRC;
    let head = domTree.window.document.getElementsByTagName("head");
    if (head.length == 0) {
        let item = domTree.window.document.createElement("head");
        domTree.window.document.appendChild(item);
        item.prepend(swallowApiScript);
        if (scriptTag.content.firstChild !== null) {
            item.prepend(scriptTag.content.firstChild);
        }
    }
    else {
        let item = head.item(0);
        item === null || item === void 0 ? void 0 : item.prepend(swallowApiScript);
        if (item !== null && scriptTag.content.firstChild !== null) {
            item.prepend(scriptTag.content.firstChild);
        }
    }
    return domTree;
}
exports.addAgentToHTMLDom = addAgentToHTMLDom;
function isHTMLQualified(domTree) {
    for (let i = 0; i < HTML_IDENTIFIER.length; i++) {
        let tags = domTree.window.document.getElementsByTagName(HTML_IDENTIFIER[i]);
        if (tags.length > 0) {
            return true;
        }
    }
    let scripts = domTree.window.document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
        let item = scripts.item(i);
        if (item !== null && item.src === "cordova.js") {
            return true;
        }
    }
    return false;
}
exports.isHTMLQualified = isHTMLQualified;
function loadHTMLFile(htmlFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield files.readTextFromFile(htmlFile);
        return new jsdom_1.JSDOM(data);
    });
}
exports.loadHTMLFile = loadHTMLFile;
function writeHTMLTreeToFile(domTree, htmlFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = domTree.serialize();
        yield files.writeTextToFile(htmlFile, content);
    });
}
function checkHTMLFile(htmlFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const domTree = yield loadHTMLFile(htmlFile);
        if (isAgentInHTMLDom(domTree) > -1) {
            removeAgentFromHTMLDom(domTree);
            logger_1.default.logMessageSync("Updating instrumented HTML file: " + path.resolve(htmlFile), logger_1.default.INFO);
            return true;
        }
        else if (isHTMLQualified(domTree)) {
            logger_1.default.logMessageSync("Found main HTML file: " + path.resolve(htmlFile), logger_1.default.INFO);
            return true;
        }
        return false;
    });
}
exports.checkHTMLFile = checkHTMLFile;
function copyAgent(destDir) {
    return __awaiter(this, void 0, void 0, function* () {
        let destAssets = path.join(destDir, pathConstants.FOLDER_ASSETS);
        try {
            yield files.checkIfFileExists(destAssets);
        }
        catch (e) {
            yield files.createDirectory(destAssets);
        }
        try {
            let swallowApi = yield files.readTextFromFile(pathConstants.getSwallowApiPath());
            if (swallowApi.indexOf("\"use strict\";") > -1) {
                swallowApi = swallowApi.substring(swallowApi.indexOf("\n") + 1);
                yield files.writeTextToFile(path.resolve(destAssets, pathConstants.FILE_SWALLOW_API), swallowApi);
            }
        }
        catch (e) {
            throw Error("Error while copying dtrum swallow api to platforms folder: " + e);
        }
    });
}
function removeOldDtAgent(path) {
    try {
        files.deleteFileSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.removeOldDtAgent = removeOldDtAgent;
