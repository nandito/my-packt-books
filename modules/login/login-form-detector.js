"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const index_1 = require("../../index");
const title_logger_1 = __importDefault(require("../title-logger"));
const constants_1 = require("../../constants");
exports.default = () => {
    const options = {
        uri: constants_1.FREE_LEARNING_URL,
        transform: body => cheerio_1.default.load(body),
    };
    return index_1.baseRp(options)
        .then($ => $("input[type='hidden'][id^=form][value^=form]").val())
        .catch(error => {
        console.error('Request failed', error);
        title_logger_1.default('Process finished');
    });
};
