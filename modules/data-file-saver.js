"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../index");
exports.saveDataFile = (data) => {
    const output = `${index_1.PROJECT_ROOT}/data/data.json`;
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(output, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve('File has been created!');
        });
    });
};
