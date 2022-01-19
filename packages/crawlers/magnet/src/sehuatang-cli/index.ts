import { Command } from 'commander'

import { closeBrowser } from '../browser'
import { getSehuatangMagnet, sehuatang } from '../sehuatang'

const program = new Command()

program
  .name('sehuatang')
  .description('npm i -g @boxts/crawler-magnet')
  .argument('[api]', 'get videos from...', '/forum-103')
  .option('-p, --page [page]', 'get videos from page...', (p) => parseInt(p), 1)
  .helpOption(
    '-h, --help',
    `
    sehuatang
    for t in {1..5}; do sehuatang -p $t; sleep 5; done

    sehuatang /forum-36
    sehuatang /forum-103
    `
  )
  .action(async (api: string) => {
    const { page } = program.opts<Options>()
    const videos = await sehuatang({ api, page })
    for (const video of videos) {
      const { url } = video
      const magnet = await getSehuatangMagnet(url)
      console.log(`${magnet}&dn=${video.code}`)
    }
    await closeBrowser()
  })
  .parse(process.argv)

export interface Options {
  page: number
  sort?: string
}
