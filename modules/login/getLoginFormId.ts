import cheerio from 'cheerio'
import Bluebird from 'bluebird'
import { baseRp } from '../../index'
import logTitle from '../logTitle'
import {
  FREE_LEARNING_URL,
} from '../../constants'

export default (): Bluebird<string> => {
  const options = {
    uri: FREE_LEARNING_URL,
    transform: body => cheerio.load(body),
  }

  return baseRp(options)
    .then($ => $("input[type='hidden'][id^=form][value^=form]").val())
    .catch(error => {
      console.error('Request failed', error)
      logTitle('Process finished')
    })
}
