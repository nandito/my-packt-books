"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const login_form_detector_1 = __importDefault(require("./login-form-detector"));
const submit_credentials_1 = __importDefault(require("./submit-credentials"));
const title_logger_1 = __importDefault(require("../title-logger"));
const constants_1 = require("../../constants");
exports.default = () => {
    title_logger_1.default('Login started');
    return login_form_detector_1.default()
        .then(loginFormId => {
        if (loginFormId) {
            constants_1.loginDetails.form_build_id = loginFormId;
        }
        return submit_credentials_1.default();
    });
};
