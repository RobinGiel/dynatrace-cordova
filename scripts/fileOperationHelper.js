#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileSync = exports.deleteFile = exports.searchFileExtInDirectoryNonRecursive = exports.searchFileExtInDirectoryRecursive = exports.searchFilesInDirectoryRecursive = exports.createDirectorySync = exports.createDirectory = exports.checkIfFileExistsSync = exports.checkIfFileExists = exports.copyFileSync = exports.copyFile = exports.renameFileSync = exports.renameFile = exports.deleteDirectory = exports.writeTextToFileSync = exports.writeTextToFile = exports.readTextFromFileSync = exports.readTextFromFile = void 0;
const fs = require("fs");
const path = require("path");
const logger_1 = require("./logger");
function searchFilesInDirectoryRecursive(searchPath, fileExt, filteredDirectories) {
    return _searchFilePatternInDirectory(searchPath, [], fileExt, filteredDirectories, true, compareFileNames);
}
exports.searchFilesInDirectoryRecursive = searchFilesInDirectoryRecursive;
function searchFileExtInDirectoryRecursive(searchPath, fileExt, filteredDirectories) {
    return _searchFilePatternInDirectory(searchPath, [], fileExt, filteredDirectories, true, compareExt);
}
exports.searchFileExtInDirectoryRecursive = searchFileExtInDirectoryRecursive;
function searchFileExtInDirectoryNonRecursive(searchPath, fileExt, filteredDirectories) {
    return _searchFilePatternInDirectory(searchPath, [], fileExt, filteredDirectories, false, compareExt);
}
exports.searchFileExtInDirectoryNonRecursive = searchFileExtInDirectoryNonRecursive;
function compareFileNames(file, filePattern) {
    let fileName = path.basename(file);
    return fileName.indexOf(filePattern) > -1;
}
function compareExt(file, ext) {
    let extName = path.extname(file);
    return extName == ext;
}
function _searchFilePatternInDirectory(searchPath, foundFiles, pattern, filteredDirectories, recursive, fileCompare) {
    return new Promise(function (resolve, reject) {
        fs.readdir(searchPath, function (err, files) {
            if (err) {
                reject("Directory could not be read: " + path.resolve(searchPath));
                return;
            }
            let promiseArr = [];
            for (let i = 0; i < files.length; i++) {
                let dirInfo = isDirectory(path.join(searchPath, files[i]));
                if (dirInfo) {
                    promiseArr.push(dirInfo);
                }
            }
            Promise.all(promiseArr).then(values => {
                let dirArr = [];
                for (let i = 0; i < promiseArr.length; i++) {
                    if (values[i].isDirectory) {
                        if (!isDirectoryFiltered(values[i].path, filteredDirectories) && recursive) {
                            dirArr.push(values[i].path);
                        }
                    }
                    else {
                        if (fileCompare(values[i].path, pattern)) {
                            foundFiles.push(values[i].path);
                        }
                    }
                }
                let anotherPromise = Promise.resolve(foundFiles);
                for (let ii = 0; ii < dirArr.length; ii++) {
                    anotherPromise = anotherPromise.then((foundFiles) => {
                        return _searchFilePatternInDirectory(dirArr[ii], foundFiles, pattern, filteredDirectories, recursive, fileCompare);
                    });
                }
                if (dirArr.length == 0) {
                    resolve(foundFiles);
                }
                else {
                    resolve(anotherPromise);
                }
            });
        });
    });
}
function isDirectory(checkPath) {
    try {
        let stats = fs.statSync(checkPath);
        return {
            isDirectory: stats.isDirectory(),
            path: checkPath
        };
    }
    catch (e) {
        logger_1.default.logMessageSync("Directory or File could not be read: " + path.resolve(checkPath), logger_1.default.WARNING);
        return undefined;
    }
}
function isDirectoryFiltered(dirPath, filteredDirectories) {
    let dirName = path.basename(dirPath);
    for (let i = 0; i < filteredDirectories.length; i++) {
        if (dirName == filteredDirectories[i]) {
            return true;
        }
    }
    return false;
}
function checkIfFileExists(_file) {
    return new Promise(function (resolve, reject) {
        fs.stat(_file, function (err) {
            if (err) {
                reject(`${err} - File doesn't exist: ${path.resolve(_file)}`);
            }
            resolve(_file);
        });
    });
}
exports.checkIfFileExists = checkIfFileExists;
function checkIfFileExistsSync(_file) {
    fs.statSync(_file);
    return _file;
}
exports.checkIfFileExistsSync = checkIfFileExistsSync;
function readTextFromFileSync(_file) {
    return fs.readFileSync(_file, "utf8");
}
exports.readTextFromFileSync = readTextFromFileSync;
function readTextFromFile(_file) {
    return new Promise(function (resolve, reject) {
        fs.readFile(_file, "utf8", (err, data) => {
            if (err) {
                reject(err + "Could not read the file: " + path.resolve(_file));
            }
            resolve(data);
        });
    });
}
exports.readTextFromFile = readTextFromFile;
function writeTextToFile(_file, _text) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(_file, _text, (err) => {
            if (err) {
                reject(err + " Could not write to file: " + path.resolve(_file));
            }
            resolve(_file);
        });
    });
}
exports.writeTextToFile = writeTextToFile;
function writeTextToFileSync(_file, _text) {
    try {
        fs.writeFileSync(_file, _text);
        return _file;
    }
    catch (err) {
        throw new Error(err + " Could not write to file: " + path.resolve(_file));
    }
}
exports.writeTextToFileSync = writeTextToFileSync;
function createDirectory(directory) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(directory, function (err) {
            if (err) {
                resolve(false);
            }
            resolve(true);
        });
    });
}
exports.createDirectory = createDirectory;
function createDirectorySync(directory) {
    try {
        mkdirSyncRecursive(directory);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.createDirectorySync = createDirectorySync;
function mkdirSyncRecursive(directory) {
    let pathParts = directory.split(path.sep);
    for (var i = 1; i <= pathParts.length; i++) {
        var segment = pathParts.slice(0, i).join(path.sep);
        if (segment.length > 0) {
            !fs.existsSync(segment) ? fs.mkdirSync(segment) : null;
        }
    }
}
function deleteDirectory(dir) {
    return new Promise(function (resolve, reject) {
        fs.access(dir, function (err) {
            if (err) {
                return reject(err);
            }
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return reject(err);
                }
                Promise.all(files.map(function (file) {
                    return deleteFile(path.join(dir, file));
                })).then(function () {
                    fs.rmdir(dir, function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                }).catch(reject);
            });
        });
    });
}
exports.deleteDirectory = deleteDirectory;
function deleteDirectorySync(dir) {
    fs.accessSync(dir);
    let files = fs.readdirSync(dir);
    files.map(function (file) {
        return deleteFileSync(path.join(dir, file));
    });
    fs.rmdirSync(dir);
}
function deleteFile(filePath) {
    return new Promise(function (resolve, reject) {
        fs.lstat(filePath, function (err, stats) {
            if (err) {
                return reject(err);
            }
            if (stats.isDirectory()) {
                resolve(deleteDirectory(filePath));
            }
            else {
                fs.unlink(filePath, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
        });
    });
}
exports.deleteFile = deleteFile;
function deleteFileSync(filePath) {
    let stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) {
        deleteDirectorySync(filePath);
    }
    else {
        fs.unlinkSync(filePath);
    }
}
exports.deleteFileSync = deleteFileSync;
function renameFile(fileOld, fileNew) {
    return new Promise(function (resolve, reject) {
        fs.rename(fileOld, fileNew, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
exports.renameFile = renameFile;
function renameFileSync(fileOld, fileNew) {
    fs.renameSync(fileOld, fileNew);
}
exports.renameFileSync = renameFileSync;
function copyFile(filePath, destPath) {
    return new Promise(function (resolve, reject) {
        fs.copyFile(filePath, destPath, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
exports.copyFile = copyFile;
function copyFileSync(filePath, destPath) {
    fs.copyFileSync(filePath, destPath);
}
exports.copyFileSync = copyFileSync;
