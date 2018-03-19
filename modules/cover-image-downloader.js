"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const request_1 = __importDefault(require("request"));
const constants_1 = require("../constants");
const downloadCoverImage = (coverUrl, filename) => {
    const extension = coverUrl.split('.').slice(-1)[0];
    const relativeSrc = `covers/${filename}.${extension}`;
    const output = `${constants_1.PROJECT_ROOT}/data/${relativeSrc}`;
    return new Promise((resolve) => {
        if (!coverUrl || !filename) {
            resolve('Cannot get cover.');
        }
        request_1.default(`https:${coverUrl}`, { timeout: 5000 })
            .on('error', () => {
            resolve(`Request failed getting file for ${filename}`);
        })
            .pipe(fs_1.default.createWriteStream(output))
            .on('close', () => {
            resolve(relativeSrc);
        })
            .on('error', () => {
            resolve(`Failed downloading file for ${filename}`);
        });
    });
};
exports.default = downloadCoverImage;
