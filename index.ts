import request from 'request'
import rp from 'request-promise'
import Listr from 'listr'
import { Observable } from 'rxjs/Observable'
import saveDataFile from './modules/saveDataFile'
import openMyEbooksPage from './modules/openMyEbooksPage'
import scrapeBookData from './modules/scrapeBookData'
import loginToPackt from './modules/login'

export const baseRp: request.RequestAPI<
  rp.RequestPromise,
  rp.RequestPromiseOptions,
  request.RequiredUriUrl
> = rp.defaults({
  jar: true
})

const tasks = new Listr([
  {
    title: 'Login to Packt',
    task: () => new Promise(resolve => {
      loginToPackt()
        .then(() => resolve())
    })
  },
  {
    title: 'Open My eBooks page',
    task: ctx => new Promise(resolve => {
      openMyEbooksPage()
        .then(body => {
          ctx.ebooksPageBody = body
          return resolve()
        })
    })
  },
  {
    title: 'Scrape book data',
    task: ctx => Observable.create(observer => {
      scrapeBookData(ctx.ebooksPageBody, observer)
        .then(data => {
          ctx.booksData = data

          observer.complete()
        })
    })
  },
  {
    title: 'Save data to file',
    task: ctx => new Promise(resolve => {
      saveDataFile(ctx.booksData)
        .then(() => resolve())
    })
  },
])

tasks.run()
  .then(ctx => {
    console.log('🎉 Download is finished!')
    console.log(`📚 ${ctx.booksData.length} book info is saved to the data file`)
  })
  .catch(err => {
    console.error(err)
  })
