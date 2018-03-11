"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').load({
    path: __dirname + '/.env'
});
var request_1 = __importDefault(require("request"));
var cheerio_1 = __importDefault(require("cheerio"));
var fs_1 = __importDefault(require("fs"));
var loginDetails = {
    email: process.env.PACKT_EMAIL,
    password: process.env.PACKT_PASSWORD,
    op: "Login",
    form_id: "packt_user_login_form",
    form_build_id: ""
};
var loginError = 'Sorry, you entered an invalid email address and password combination.';
var url = 'https://www.packtpub.com/packt/offers/free-learning';
//we need cookies for that, therefore let's turn JAR on
var baseRequest = request_1.default.defaults({
    jar: true
});
console.log('----------- Packt My Books Fetching Started -----------');
baseRequest(url, function (err, res, body) {
    if (err) {
        console.error('Request failed');
        console.log('----------- Packt My Books Fetching Done --------------');
        return;
    }
    var $ = cheerio_1.default.load(body);
    var newFormId = $("input[type='hidden'][id^=form][value^=form]").val();
    if (newFormId) {
        loginDetails.form_build_id = newFormId;
    }
    baseRequest.post({
        uri: url,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: require('querystring').stringify(loginDetails)
    }, function (err, res, body) {
        if (err) {
            console.error('Login failed');
            console.log('----------- Packt My Books Fetching Done --------------');
            return;
        }
        var $ = cheerio_1.default.load(body);
        var loginFailed = $("div.error:contains('" + loginError + "')");
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
                .then(function (bookData) {
                console.log('Scraping is finished, save data!');
                saveToFile(bookData);
            })
                .catch(function (error) {
                console.log(error);
            })
                .then(function () {
                console.log('----------- Packt My Books Fetching Done --------------');
            });
        });
    });
});
function saveToFile(data) {
    var output = __dirname + "/data/data.json";
    fs_1.default.writeFile(output, JSON.stringify(data, null, 2), 'utf-8');
}
function scrape(body) {
    var $ = cheerio_1.default.load(body);
    var productListLength = $('.product-line').length;
    console.log('productListLength: ', productListLength);
    var pageData = [];
    var downloadedFiles = 0;
    var falseItems = 0;
    return new Promise(function (resolve) {
        $('.product-line').each(function (index, item) {
            var title = $(item).find('.title').text().trim();
            if (!title) {
                falseItems += 1;
                return null;
            }
            var href = $(item).find('.product-thumbnail a').attr('href');
            var link = 'https://www.packtpub.com' + href;
            var category = href.split('/')[1];
            var safeName = href.split('/')[2];
            var coverUrl = $(item).find('.product-thumbnail img').attr('data-original');
            getCover(coverUrl, safeName)
                .then(function (coverImageSrc) {
                pageData.push({ title: title, link: link, category: category, coverImageSrc: coverImageSrc });
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
    var extension = coverUrl.split('.').slice(-1)[0];
    var relativeSrc = "covers/" + filename + "." + extension;
    var output = __dirname + "/data/" + relativeSrc;
    return new Promise(function (resolve, reject) {
        if (!coverUrl || !filename) {
            resolve('Cannot get cover.');
        }
        request_1.default("https:" + coverUrl, { timeout: 5000 })
            .on('error', function () {
            resolve("Request failed getting file for " + filename);
        })
            .pipe(fs_1.default.createWriteStream(output))
            .on('close', function () {
            resolve(relativeSrc);
        })
            .on('error', function () {
            resolve("Failed downloading file for " + filename);
        });
    });
}
