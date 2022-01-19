import { createApp } from '@boxts/core'

import OnNetworkChanged from './OnNetworkChanged'

const $ = createApp()

$.exec(OnNetworkChanged, {})
  .then((result) => $.done(result))
  .catch((result) => $.done(result))
