export const PROJECT_ROOT = __dirname

export const BASE_URL: string = 'https://www.packtpub.com'
export const FREE_LEARNING_URL: string = `${BASE_URL}/packt/offers/free-learning`
export const MY_EBOOKS_URL: string = `${BASE_URL}/account/my-ebooks`

export const LOGIN_ERROR_MESSAGE: string = 'Sorry, you entered an invalid email address and password combination.'
export const loginDetails = {
  email: process.env.PACKT_EMAIL,
  password: process.env.PACKT_PASSWORD,
  op: 'Login',
  form_id: 'packt_user_login_form',
  form_build_id: '',
}
