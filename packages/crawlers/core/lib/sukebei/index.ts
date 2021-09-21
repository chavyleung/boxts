import { Command } from 'commander'
import numeral from 'numeral'

import { usePlaywright } from '@boxts/crawler'
import { getMagnets } from '@boxts/sukebei'

const program = new Command()
program
  .name('sukebei')
  .argument('<code>', 'search key.')
  .helpOption(
    '-h, --help',
    `
    sukebei dvaj-532
    sukebei fsdss-288

    more: https://sukebei.nyaa.si/
    `
  )
  .action(async (code) => {
    const magnets = await getMagnets(code)
    await usePlaywright().then(({ close }) => close())

    const output = magnets
      .map((v) => {
        const size = numeral(v.size).format('0,0.00')
        return `${v.url}&dn=${code}&size=${size}GB`
      })
      .join('\n')
    console.info(output)
  })

program.parse(process.argv)
