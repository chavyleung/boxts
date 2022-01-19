import { Command } from 'commander'

import { init } from './initEnv.js'

const program = new Command()

program
  .name('init')
  .action(async () => {
    await init()
  })
  .parse(process.argv)
