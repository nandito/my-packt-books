"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_ROOT = __dirname;
exports.BASE_URL = 'https://www.packtpub.com';
exports.FREE_LEARNING_URL = `${exports.BASE_URL}/packt/offers/free-learning`;
exports.LOGIN_ERROR_MESSAGE = 'Sorry, you entered an invalid email address and password combination.';
exports.loginDetails = {
    email: process.env.PACKT_EMAIL,
    password: process.env.PACKT_PASSWORD,
    op: 'Login',
    form_id: 'packt_user_login_form',
    form_build_id: '',
};
