import Bluebird from 'bluebird'
import getLoginFormId from './getLoginFormId'
import submitLoginCredentials from './submitLoginCredentials'
import logTitle from '../logTitle'
import { loginDetails } from '../../constants'

export default (): Bluebird<void> => {
  logTitle('Login started')

  return getLoginFormId()
    .then(loginFormId => {
      if (loginFormId) {
        loginDetails.form_build_id = loginFormId
      }

      return submitLoginCredentials()
    })
    .catch(error => {
      return Promise.reject(error)
    })
}
