import { Command } from 'commander'

import { bootstrap } from './bootstrap.js'

const program = new Command()

program
  .name('bootstrap')
  .action(async () => bootstrap())
  .parse(process.argv)
