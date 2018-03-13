require('dotenv').load({
  path: __dirname + '/.env'
})

import request from 'request'
import rp from 'request-promise'
import cheerio from 'cheerio'
import fs from 'fs'
import { saveDataFile } from './modules/data-file-saver'

import {
  BASE_URL,
  FREE_LEARNING_URL,
  LOGIN_ERROR_MESSAGE,
  MY_EBOOKS_URL,
  PROJECT_ROOT,
  loginDetails,
} from './constants'

//we need cookies for that, therefore let's turn JAR on
const baseRequest = request.defaults({
  jar: true
})
const baseRp = rp.defaults({
  jar: true
})

const logTitle = (title) => {
  console.log(`----------- ${title} -----------`)
}

const loginToPackt = () => {
  logTitle('Login started')
  
  return getLoginFormId()
    .then(loginFormId => {
      if (loginFormId) {
        loginDetails.form_build_id = loginFormId
      }

      return submitLoginCredentials()
    })
}

const submitLoginCredentials = () => {
  const options = {
    uri: FREE_LEARNING_URL,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: require('querystring').stringify(loginDetails),
    resolveWithFullResponse: true,
    simple: false,
    transform: body => cheerio.load(body),
  }

  return baseRp(options)
    .then($ => {
      const loginFailureMessage = $("div.error:contains('" + LOGIN_ERROR_MESSAGE + "')")
      const isLoginFailed = loginFailureMessage.length !== 0

      if (isLoginFailed) {
        console.log('Login failed, please check your email address and password')
        logTitle('Process finished')      
        return
      }

      logTitle('Login succeed')      
    })
    .catch(error => {
      console.error('Login failed', error)
      logTitle('Process finished')      
    })
}

const getLoginFormId = () => {
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
