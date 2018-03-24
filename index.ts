import request from 'request'
import rp from 'request-promise'
import cheerio from 'cheerio'
import { saveDataFile } from './modules/data-file-saver'
import openMyEbooksPage from './modules/openMyEbooksPage'
import downloadCoverImage from './modules/cover-image-downloader'
import logTitle from './modules/title-logger'
import loginToPackt from './modules/login'

import { BASE_URL } from './constants'

export const baseRp: request.RequestAPI<
  rp.RequestPromise,
  rp.RequestPromiseOptions,
  request.RequiredUriUrl
> = rp.defaults({
  jar: true
})

loginToPackt()
  .then(openMyEbooksPage)
  .then(scrape)
  .then(saveDataFile)
  .then((message) => {
    console.log(message)
    logTitle('Process finished')
  })
  .catch(error => {
    console.log('Error', error)
    logTitle('Process finished')
  })

function scrape(body): Promise<Array<Book>> {
  let $ = cheerio.load(body)
  const productListLength = $('.product-line').length
  console.log('productListLength: ', productListLength)
  
  const pageData : Array<Book> = []
  let downloadedFiles = 0
  let falseItems = 0

  return new Promise((resolve) => {
    $('.product-line').each((_, item) => {
      const title = $(item).find('.title').text().trim()
  
      if (!title) {
        falseItems += 1

        return null
      }
  
      const href = $(item).find('.product-thumbnail a').attr('href')
      const link = BASE_URL + href
      const category = href.split('/')[1]
      const safeName = href.split('/')[2]
      const coverUrl = $(item).find('.product-thumbnail img').attr('data-original')
      
      downloadCoverImage(coverUrl, safeName)
        .then((coverImageSrc) => {
          pageData.push({ title, link, category, coverImageSrc })
          downloadedFiles += 1
          console.log('Download success: ', downloadedFiles, title)

          if (downloadedFiles === (productListLength - falseItems)) {
            console.log('Download is finished!')
            console.log('downloadedFiles: ', downloadedFiles)
            console.log('falseItems: ', falseItems)
            
            resolve(pageData)
          }
        })
    })
  })
}
