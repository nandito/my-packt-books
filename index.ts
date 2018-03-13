require('dotenv').load({
  path: __dirname + '/.env'
})

import request from 'request'
import cheerio from 'cheerio'
import fs from 'fs'
import { saveDataFile } from './modules/data-file-saver'

import {
  BASE_URL,
  FREE_LEARNING_URL,
  LOGIN_ERROR_MESSAGE,
  PROJECT_ROOT,
  loginDetails,
} from './constants'

//we need cookies for that, therefore let's turn JAR on
const baseRequest = request.defaults({
  jar: true
})

console.log('----------- Packt My Books Fetching Started -----------')
baseRequest(FREE_LEARNING_URL, function (err, res, body) {
  if (err) {
    console.error('Request failed')
    console.log('----------- Packt My Books Fetching Done --------------')
    return
  }

  const $ = cheerio.load(body)

  const newFormId = $("input[type='hidden'][id^=form][value^=form]").val()

  if (newFormId) {
    loginDetails.form_build_id = newFormId
  }

  baseRequest.post({
    uri: FREE_LEARNING_URL,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: require('querystring').stringify(loginDetails)
  }, function (err, res, body) {
    if (err) {
      console.error('Login failed')
      console.log('----------- Packt My Books Fetching Done --------------')
      return
    }
    const $ = cheerio.load(body)
    
    const loginFailed = $("div.error:contains('" + LOGIN_ERROR_MESSAGE + "')")
    if (loginFailed.length) {
      console.error('Login failed, please check your email address and password')
      console.log('Login failed, please check your email address and password')
      console.log('----------- Packt My Books Fetching Done --------------')
      return
    }

    baseRequest('https://www.packtpub.com/account/my-ebooks', function (err, res, body) {
      if (err) {
        console.error('Request Error')
        console.log('----------- Packt My Books Fetching Done --------------')
        return
      }

      scrape(body)
        .then(bookData => {
          console.log('Scraping is finished, save data!')
          return saveDataFile(bookData)
        })
        .then((message) => {
          console.log(message)
          console.log('----------- Packt My Books Fetching Done --------------')
        })
        .catch(error => {
          console.error(error)
          console.log('----------- Packt My Books Fetching Done --------------')
        })
    })
  })
})

type Book = {
  title: string
  link: string
  category: string
  coverImageSrc: string
}

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
      
      getCover(coverUrl, safeName)
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

function getCover(coverUrl: string, filename: string) : Promise<string> {
  const extension : string = coverUrl.split('.').slice(-1)[0]
  const relativeSrc : string = `covers/${filename}.${extension}`
  const output : fs.PathLike = `${PROJECT_ROOT}/data/${relativeSrc}`

  return new Promise((resolve : (value : string) => void) => {
    if (!coverUrl || !filename) {
      resolve('Cannot get cover.')
    }

    request(`https:${coverUrl}`, { timeout: 5000 })
      .on('error', function () {
        resolve(`Request failed getting file for ${filename}`)
      })
      .pipe(fs.createWriteStream(output))
      .on('close', function () {
        resolve(relativeSrc)
      })
      .on('error', function () {
        resolve(`Failed downloading file for ${filename}`)
      })
  })
}
