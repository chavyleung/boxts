import { Apis } from '@boxts/jable'
import { Magnet } from '@boxts/sukebei'

export type Opts = {
  path: Apis
  page: number
  magnet: boolean
  latest: boolean
}

declare module '@boxts/jable' {
  interface Video {
    magnet?: string
    magnets?: Magnet[]
  }
}
