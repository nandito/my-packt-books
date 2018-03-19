require('dotenv').load({
  path: __dirname + '/.env'
})

import request from 'request'
import rp from 'request-promise'
import cheerio from 'cheerio'
import fs from 'fs'
import { saveDataFile } from './modules/data-file-saver'
import downloadCoverImage from './modules/cover-image-downloader'
import logTitle from './modules/title-logger'
import loginToPackt from './modules/login'

import { BASE_URL, MY_EBOOKS_URL } from './constants'

//we need cookies for that, therefore let's turn JAR on
const baseRequest = request.defaults({
  jar: true
})

export const baseRp = rp.defaults({
  jar: true
})

const openMyEbooksPage = () => {
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

loginToPackt()
  .then(openMyEbooksPage)
  .then(scrape)
  .then(saveDataFile)
  .then((message) => {
    console.log(message)
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
    $('.product-line').each((index, item) => {
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
