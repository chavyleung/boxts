import { Command } from 'commander'
import numeral from 'numeral'

import { usePlaywright } from '@boxts/crawler'
import { getMagnets } from '@boxts/sukebei'

import { Opts } from './types'

const program = new Command()
program
  .name('sukebei')
  .argument('<key>', 'search key.')
  .option('-s, --sort [sort]', 'sort by: size | downloads | leechers')
  .option('-p, --page [page]', 'get magnets from page', (p) => parseInt(p), 1)
  .helpOption(
    '-h, --help',
    `
    sukebei dvaj-532
    sukebei fsdss-288

    sukebei Uncensored -p 2
    sukebei Uncensored -s leechers

    for t in {1..2}; do sukebei Uncensored -s leechers -p $t; sleep 5; done

    more: https://sukebei.nyaa.si/
    `
  )
  .action(async (key) => {
    const opts = program.opts<Opts>()
    const magnets = await handle(key, opts)
    await usePlaywright().then(({ close }) => close())

    const { sort } = opts
    const showField = sort ?? 'size'
    const output = magnets
      .map((v) => {
        const video = {
          name: v.name.slice(0, 10),
          size: `${numeral(v.size).format('0,0.00')}GB`,
          leechers: `${numeral(v.leechers).format('0,0')}`,
          downloads: `${numeral(v.downloads).format('0,0')}`
        }
        return `${v.url}&dn=${key}&${showField}=${video[showField]}`
      })
      .join('\n')
    console.info(output)
  })

const handle = async (key: string, opts: Opts) => {
  const { sort, page } = opts
  return await getMagnets(key, { sort, page })
}

program.parse(process.argv)
