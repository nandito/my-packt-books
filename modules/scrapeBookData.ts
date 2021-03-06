import cheerio from 'cheerio'
import downloadCoverImage from './downloadCoverImage'
import { BASE_URL } from '../constants'

export default (body, observer): Promise<Array<Book>> => {
  let $ = cheerio.load(body)
  const productListLength = $('.product-line').length

  const pageData: Array<Book> = []
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
          observer.next(`Download success: ${downloadedFiles} ${title}`)

          if (downloadedFiles === (productListLength - falseItems)) {
            resolve(pageData)
          }
        })
    })
  })
}
