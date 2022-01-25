import { Command } from 'commander'

import { init } from './prepare.js'

const program = new Command()

program
  .name('init')
  .action(async () => {
    await init()
  })
  .parse(process.argv)
