import Bluebird from 'bluebird'
import { MY_EBOOKS_URL } from '../constants'
import { baseRp } from '../index'

export default (): Bluebird<void> => {
  const options = {
    uri: MY_EBOOKS_URL,
  }

  return baseRp(options)
    .catch(error => {
      return error
    })
}
