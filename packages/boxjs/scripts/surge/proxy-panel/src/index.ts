import { createApp } from '@boxts/core'

import Panel from './Panel'

const $ = createApp()

$.exec(Panel, {})
  .then((result) => $.done(result))
  .catch((result) => $.done(result))
