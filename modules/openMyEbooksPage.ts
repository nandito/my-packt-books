import Bluebird from 'bluebird'
import logTitle from './logTitle'
import { MY_EBOOKS_URL } from '../constants'
import { baseRp } from '../index'

export default (): Bluebird<void> => {
  logTitle('Collecting ebooks')
  const options = {
    uri: MY_EBOOKS_URL,
  }

  return baseRp(options)
    .catch(error => {
      console.error('Request Error', error)
      logTitle('Process finished')
    })
}
