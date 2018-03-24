import cheerio from 'cheerio'
import Bluebird from 'bluebird'
import { baseRp } from '../../index'
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
}
