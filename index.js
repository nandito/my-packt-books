"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').load({
    path: __dirname + '/.env'
});
const request_1 = __importDefault(require("request"));
const cheerio_1 = __importDefault(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const data_file_saver_1 = require("./modules/data-file-saver");
const constants_1 = require("./constants");
//we need cookies for that, therefore let's turn JAR on
const baseRequest = request_1.default.defaults({
    jar: true
});
console.log('----------- Packt My Books Fetching Started -----------');
baseRequest(constants_1.FREE_LEARNING_URL, function (err, res, body) {
    if (err) {
        console.error('Request failed');
        console.log('----------- Packt My Books Fetching Done --------------');
        return;
    }
    const $ = cheerio_1.default.load(body);
    const newFormId = $("input[type='hidden'][id^=form][value^=form]").val();
    if (newFormId) {
        constants_1.loginDetails.form_build_id = newFormId;
    }
    baseRequest.post({
        uri: constants_1.FREE_LEARNING_URL,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: require('querystring').stringify(constants_1.loginDetails)
    }, function (err, res, body) {
        if (err) {
            console.error('Login failed');
            console.log('----------- Packt My Books Fetching Done --------------');
            return;
        }
        const $ = cheerio_1.default.load(body);
        const loginFailed = $("div.error:contains('" + constants_1.LOGIN_ERROR_MESSAGE + "')");
        if (loginFailed.length) {
            console.error('Login failed, please check your email address and password');
            console.log('Login failed, please check your email address and password');
            console.log('----------- Packt My Books Fetching Done --------------');
            return;
        }
        baseRequest('https://www.packtpub.com/account/my-ebooks', function (err, res, body) {
            if (err) {
                console.error('Request Error');
                console.log('----------- Packt My Books Fetching Done --------------');
                return;
            }
            scrape(body)
                .then(bookData => {
                console.log('Scraping is finished, save data!');
                return data_file_saver_1.saveDataFile(bookData);
            })
                .then((message) => {
                console.log(message);
                console.log('----------- Packt My Books Fetching Done --------------');
            })
                .catch(error => {
                console.error(error);
                console.log('----------- Packt My Books Fetching Done --------------');
            });
        });
    });
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
