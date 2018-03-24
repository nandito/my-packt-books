import fs from 'fs'
import { PROJECT_ROOT } from '../constants'

export default (data: Array<Book>): Promise<string | NodeJS.ErrnoException> => {
  const output: string = `${PROJECT_ROOT}/data/data.json`

  return new Promise((resolve, reject) => {
    fs.writeFile(output, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err)

        return
      }
      resolve('File has been created!')
    })
  })
}
