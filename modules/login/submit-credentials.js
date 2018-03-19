"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const index_1 = require("../../index");
const constants_1 = require("../../constants");
const title_logger_1 = __importDefault(require("../title-logger"));
exports.default = () => {
    const options = {
        uri: constants_1.FREE_LEARNING_URL,
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: require('querystring').stringify(constants_1.loginDetails),
        resolveWithFullResponse: true,
        simple: false,
        transform: body => cheerio_1.default.load(body),
    };
    return index_1.baseRp(options)
        .then($ => {
        const loginFailureMessage = $("div.error:contains('" + constants_1.LOGIN_ERROR_MESSAGE + "')");
        const isLoginFailed = loginFailureMessage.length !== 0;
        if (isLoginFailed) {
            console.log('Login failed, please check your email address and password');
            title_logger_1.default('Process finished');
            return;
        }
        title_logger_1.default('Login succeed');
    })
        .catch(error => {
        console.error('Login failed', error);
        title_logger_1.default('Process finished');
    });
};
