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
module.exports = function (context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context !== undefined && context.opts !== undefined && context.opts.plugins !== undefined) {
            let plugins = context.opts.plugins;
            for (let i = 0; i < plugins.length; i++) {
                if (plugins[i].endsWith("@dynatrace/cordova-plugin")) {
                    delete plugins[i];
                    return;
                }
            }
        }
    });
};
