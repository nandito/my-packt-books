import fs from 'fs'
import request from 'request'
import { PROJECT_ROOT } from '../constants'

export default (coverUrl: string, filename: string): Promise<string> => {
  const extension: string = coverUrl.split('.').slice(-1)[0]
  const relativeSrc: string = `covers/${filename}.${extension}`
  const output: fs.PathLike = `${PROJECT_ROOT}/data/${relativeSrc}`

  return new Promise((resolve: (value: string) => void) => {
    if (!coverUrl || !filename) {
      resolve('Cannot get cover.')
    }

    request(`https:${coverUrl}`, { timeout: 5000 })
      .on('error', () => {
        resolve(`Request failed getting file for ${filename}`)
      })
      .pipe(fs.createWriteStream(output))
      .on('close', () => {
        resolve(relativeSrc)
      })
      .on('error', () => {
        resolve(`Failed downloading file for ${filename}`)
      })
  })
}
