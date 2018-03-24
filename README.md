# My Packt Books

Batch my eBooks info scraping from Packt Publishing site.

The app uses [request](https://github.com/request/request) and [cheerio](https://github.com/cheeriojs/cheerio) to scrape data from the given Packt account's [My eBooks](https://www.packtpub.com/account/my-ebooks) page.

## Usage

1. clone this project
2. install dependencies
3. compile TypeScript files
4. create a copy of the `.env.sample` with `.env` name and enter fill it with your Packt credentials
5. create `data` and `data/covers` folders in the project root
5. run the app with the `yarn start` command

## Output

The app creates a `data.json` file that contains the title, link, category and local cover image source for each book you have bought on Packt. It also tries to download the cover image of the books and put them to the `data/covers` folder.

### Example output

`data/data.json`

```json
{
  {
    "title": "React Design Patterns and Best Practices [eBook]",
    "link": "https://www.packtpub.com/web-development/react-design-patterns-and-best-practices",
    "category": "web-development",
    "coverImageSrc": "covers/react-design-patterns-and-best-practices.jpg"
  }
}
```

## License

MIT
