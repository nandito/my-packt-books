require('dotenv').load({
  path: __dirname + '/.env'
})

var request = require('request')
var cheerio = require('cheerio')
var fs = require('fs')

const loginDetails = {
  email: process.env.PACKT_EMAIL,
  password: process.env.PACKT_PASSWORD,
  op: "Login",
  form_id: "packt_user_login_form",
  form_build_id: ""
}
const loginError = 'Sorry, you entered an invalid email address and password combination.'
const url = 'https://www.packtpub.com/packt/offers/free-learning'

//we need cookies for that, therefore let's turn JAR on
request = request.defaults({
  jar: true
})

console.log('----------- Packt My Books Fetching Started -----------')
request(url, function (err, res, body) {
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

  request.post({
    uri: url,
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
    
    const loginFailed = $("div.error:contains('" + loginError + "')")
    if (loginFailed.length) {
      console.error('Login failed, please check your email address and password')
      console.log('Login failed, please check your email address and password')
      console.log('----------- Packt My Books Fetching Done --------------')
      return
    }

    request('https://www.packtpub.com/account/my-ebooks', function (err, res, body) {
      if (err) {
        console.error('Request Error')
        console.log('----------- Packt My Books Fetching Done --------------')
        return
      }

      scrape(body)
        .then(bookData => {
          console.log('Scraping is finished, save data!')
          saveToFile(bookData)
        })
        .catch(error => {
          console.log(error)
        })
        .then(() => {
          console.log('----------- Packt My Books Fetching Done --------------')
        })
    })
  })
})

function saveToFile(data) {
  const output = `${__dirname}/data/data.json`
  
  fs.writeFile(output, JSON.stringify(data, null, 2), 'utf-8')
}

function scrape(body) {
  let $ = cheerio.load(body)
  const productListLength = $('.product-line').length
  console.log('productListLength: ', productListLength)
  
  const pageData = []
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
      const link = 'https://www.packtpub.com' + href
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

function getCover(coverUrl, filename) {
  const extension = coverUrl.split('.').slice(-1)[0]
  const relativeSrc = `covers/${filename}.${extension}`
  const output = `${__dirname}/data/${relativeSrc}`

  return new Promise((resolve, reject) => {
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
