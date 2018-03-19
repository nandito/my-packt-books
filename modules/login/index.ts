import getLoginFormId from './login-form-detector'
import submitLoginCredentials from './submit-credentials'
import logTitle from '../title-logger'
import { loginDetails } from '../../constants'

export default () => {
  logTitle('Login started')

  return getLoginFormId()
    .then(loginFormId => {
      if (loginFormId) {
        loginDetails.form_build_id = loginFormId
      }

      return submitLoginCredentials()
    })
}