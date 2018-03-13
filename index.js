"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').load({
    path: __dirname + '/.env'
});
const request_1 = __importDefault(require("request"));
const request_promise_1 = __importDefault(require("request-promise"));
const cheerio_1 = __importDefault(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const data_file_saver_1 = require("./modules/data-file-saver");
const constants_1 = require("./constants");
//we need cookies for that, therefore let's turn JAR on
const baseRequest = request_1.default.defaults({
    jar: true
});
const baseRp = request_promise_1.default.defaults({
    jar: true
});
const logTitle = (title) => {
    console.log(`----------- ${title} -----------`);
};
const loginToPackt = () => {
    logTitle('Login started');
    return getLoginFormId()
        .then(loginFormId => {
        if (loginFormId) {
            constants_1.loginDetails.form_build_id = loginFormId;
        }
        return submitLoginCredentials();
    });
};
const submitLoginCredentials = () => {
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
    return baseRp(options)
        .then($ => {
        const loginFailureMessage = $("div.error:contains('" + constants_1.LOGIN_ERROR_MESSAGE + "')");
        const isLoginFailed = loginFailureMessage.length !== 0;
        if (isLoginFailed) {
            console.log('Login failed, please check your email address and password');
            logTitle('Process finished');
            return;
        }
        logTitle('Login succeed');
    })
        .catch(error => {
        console.error('Login failed', error);
        logTitle('Process finished');
    });
};
const getLoginFormId = () => {
    const options = {
        uri: constants_1.FREE_LEARNING_URL,
        transform: body => cheerio_1.default.load(body),
    };
    return baseRp(options)
        .then($ => $("input[type='hidden'][id^=form][value^=form]").val())
        .catch(error => {
        console.error('Request failed', error);
        logTitle('Process finished');
    });
};
const openMyEbooksPage = () => {
    logTitle('Collecting ebooks');
    const options = {
        uri: constants_1.MY_EBOOKS_URL,
    };
    return baseRp(options)
        .catch(error => {
        console.error('Request Error', error);
        logTitle('Process finished');
    });
};
loginToPackt()
    .then(openMyEbooksPage)
    .then(scrape)
    .then(data_file_saver_1.saveDataFile)
    .then((message) => {
    console.log(message);
    logTitle('Process finished');
});
function scrape(body) {
    let $ = cheerio_1.default.load(body);
    const productListLength = $('.product-line').length;
    console.log('productListLength: ', productListLength);
    const pageData = [];
    let downloadedFiles = 0;
    let falseItems = 0;
    return new Promise((resolve) => {
        $('.product-line').each((index, item) => {
            const title = $(item).find('.title').text().trim();
            if (!title) {
                falseItems += 1;
                return null;
            }
            const href = $(item).find('.product-thumbnail a').attr('href');
            const link = constants_1.BASE_URL + href;
            const category = href.split('/')[1];
            const safeName = href.split('/')[2];
            const coverUrl = $(item).find('.product-thumbnail img').attr('data-original');
            getCover(coverUrl, safeName)
                .then((coverImageSrc) => {
                pageData.push({ title, link, category, coverImageSrc });
                downloadedFiles += 1;
                console.log('Download success: ', downloadedFiles, title);
                if (downloadedFiles === (productListLength - falseItems)) {
                    console.log('Download is finished!');
                    console.log('downloadedFiles: ', downloadedFiles);
                    console.log('falseItems: ', falseItems);
                    resolve(pageData);
                }
            });
        });
    });
}
function getCover(coverUrl, filename) {
    const extension = coverUrl.split('.').slice(-1)[0];
    const relativeSrc = `covers/${filename}.${extension}`;
    const output = `${constants_1.PROJECT_ROOT}/data/${relativeSrc}`;
    return new Promise((resolve) => {
        if (!coverUrl || !filename) {
            resolve('Cannot get cover.');
        }
        request_1.default(`https:${coverUrl}`, { timeout: 5000 })
            .on('error', function () {
            resolve(`Request failed getting file for ${filename}`);
        })
            .pipe(fs_1.default.createWriteStream(output))
            .on('close', function () {
            resolve(relativeSrc);
        })
            .on('error', function () {
            resolve(`Failed downloading file for ${filename}`);
        });
    });
}
