import { Command } from 'commander'

import { closeBrowser } from '@boxts/crawler-magnet'

import { Options, printApis, printVideos } from './Jable'

const program = new Command()

program
  .name('jable')
  .description('npm i -g @boxts/crawler-magnet')
  .argument('[api]', 'get videos from...', '/hot/')
  .option('-p, --page [page]', 'get videos from page...', (p) => parseInt(p), 1)
  .option('-s, --sort [sort]', 'get videos by sort...', undefined)
  .helpOption(
    '-h, --help',
    `
    jable
    for t in {1..5}; do jable -p $t; sleep 5; done

    jable /hot/
    jable /latest-updates/
    jable /new-release/
    jable /categories/bdsm/
    jable /tags/big-tits/
    more: jable api
    `
  )
  .action(async (api: string) => {
    const options = program.opts<Options>()
    if (api === 'apis') {
      await printApis()
    } else {
      await printVideos(api, options)
    }

    await closeBrowser()
  })
  .parse(process.argv)
