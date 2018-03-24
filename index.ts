import request from 'request'
import rp from 'request-promise'
import Listr from 'listr'
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
    task: ctx => new Promise(resolve => {
      scrapeBookData(ctx.ebooksPageBody)
        .then(data => {
          ctx.booksData = data

          return resolve()
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

tasks.run().catch(err => {
  console.error(err)
})
