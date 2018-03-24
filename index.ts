import request from 'request'
import rp from 'request-promise'
import saveDataFile from './modules/saveDataFile'
import openMyEbooksPage from './modules/openMyEbooksPage'
import scrapeBookData from './modules/scrapeBookData'
import logTitle from './modules/logTitle'
import loginToPackt from './modules/login'

export const baseRp: request.RequestAPI<
  rp.RequestPromise,
  rp.RequestPromiseOptions,
  request.RequiredUriUrl
> = rp.defaults({
  jar: true
})

loginToPackt()
  .then(openMyEbooksPage)
  .then(scrapeBookData)
  .then(saveDataFile)
  .then((message) => {
    console.log(message)
    logTitle('Process finished')
  })
  .catch(error => {
    console.log('Error', error)
    logTitle('Process finished')
  })
