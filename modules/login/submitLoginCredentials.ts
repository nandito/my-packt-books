import cheerio from 'cheerio'
import Bluebird from 'bluebird'
import { baseRp } from '../../index'
import {
  FREE_LEARNING_URL,
  LOGIN_ERROR_MESSAGE,
  loginDetails,
} from '../../constants'
import logTitle from '../logTitle'

export default (): Bluebird<void> | Promise<void> => {
  const isCredentialsProvided = loginDetails.email && loginDetails.password

  if (!isCredentialsProvided) {
    return Promise.reject('Login credentials are missing')
  }
  
  const options = {
    uri: FREE_LEARNING_URL,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: require('querystring').stringify(loginDetails),
    resolveWithFullResponse: true,
    simple: false,
    transform: body => cheerio.load(body),
  }

  return baseRp(options)
    .then($ => {
      const loginFailureMessage = $("div.error:contains('" + LOGIN_ERROR_MESSAGE + "')")
      const isLoginFailed = loginFailureMessage.length !== 0

      if (isLoginFailed) {
        console.log('Login failed, please check your email address and password')
        logTitle('Process finished')
        return
      }

      logTitle('Login succeed')
    })
    .catch(error => {
      console.error('Login failed', error)
      logTitle('Process finished')
    })
}
