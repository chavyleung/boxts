import { Command } from 'commander'

import { usePlaywright } from '@boxts/crawler'
import {
  Apis,
  getMagnet,
  getOptions,
  getVideos,
  parseUrl
} from '@boxts/sehuatang'

import { Opts } from './types'

const program = new Command()
program
  .name('sehuatang')
  .description('npm i -g @boxts/crawler')
  .argument('[path]', 'get videos from path.', (v) => v, '/forum-103')
  .option('-p, --page [page]', 'get videos from page.', (p) => parseInt(p), 1)
  .helpOption(
    '-h, --help',
    `
    sehuatang
    sehuatang /forum-103
    sehuatang /forum-103 -p 2

    sehuatang /forum-103
    sehuatang /forum-151
    sehuatang /forum-36
    sehuatang /forum-37

    for t in {1..5}; do sehuatang /forum-103 -p $t; sleep 5; done

    more: https://github.com/chavyleung/boxts/blob/main/packages/crawlers/core/README.md
    `
  )
  .action(async (path: Apis) => {
    const { page } = program.opts<Opts>()
    const options = getOptions({ page })

    const url = parseUrl(path, options)
    console.info(`🔔 ${url} 🔔`)

    const videos = await getVideos(path, options)
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      video.magnet = await getMagnet(video.url)
      console.info(video.magnet)
    }

    await usePlaywright().then(({ close }) => close())
  })

program.parse(process.argv)
