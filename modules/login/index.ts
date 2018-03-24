import Bluebird from 'bluebird'
import getLoginFormId from './getLoginFormId'
import submitLoginCredentials from './submitLoginCredentials'
import { loginDetails } from '../../constants'

export default (): Bluebird<void> => (
  getLoginFormId()
    .then(loginFormId => {
      if (loginFormId) {
        loginDetails.form_build_id = loginFormId
      }

      return submitLoginCredentials()
    })
    .catch(error => {
      return Promise.reject(error)
    })
)
