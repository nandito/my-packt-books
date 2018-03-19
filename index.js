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
const data_file_saver_1 = require("./modules/data-file-saver");
const cover_image_downloader_1 = __importDefault(require("./modules/cover-image-downloader"));
const title_logger_1 = __importDefault(require("./modules/title-logger"));
const login_1 = __importDefault(require("./modules/login"));
const constants_1 = require("./constants");
//we need cookies for that, therefore let's turn JAR on
const baseRequest = request_1.default.defaults({
    jar: true
});
exports.baseRp = request_promise_1.default.defaults({
    jar: true
});
const openMyEbooksPage = () => {
    title_logger_1.default('Collecting ebooks');
    const options = {
        uri: constants_1.MY_EBOOKS_URL,
    };
    return exports.baseRp(options)
        .catch(error => {
        console.error('Request Error', error);
        title_logger_1.default('Process finished');
    });
};
login_1.default()
    .then(openMyEbooksPage)
    .then(scrape)
    .then(data_file_saver_1.saveDataFile)
    .then((message) => {
    console.log(message);
    title_logger_1.default('Process finished');
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
            cover_image_downloader_1.default(coverUrl, safeName)
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
