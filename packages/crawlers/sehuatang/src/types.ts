import { Video as JableVideo } from '@boxts/jable'
import { Magnet } from '@boxts/sukebei'

/**
 * https://github.com/Microsoft/TypeScript/issues/29729
 */
export type LiteralUnion<T extends U, U = string> =
  | T
  | (U & Record<never, never>)

declare module '@boxts/jable' {
  interface Video {
    magnet?: string
    magnets?: Magnet[]
  }
}

export const apis = [
  '/forum-103',
  '/forum-151',
  '/forum-36',
  '/forum-37'
] as const

export type Apis = LiteralUnion<typeof apis[number]>

export interface Video extends JableVideo {
  url: string
}

export interface Options {
  page?: number
}

export type GetOptions = (...opts: Partial<Options>[]) => Options

export type GetVideos = <Api extends Apis>(
  api: Api,
  ...opts: Partial<Options>[]
) => Promise<Video[]>

export type GetMagnet = (url: string) => Promise<string>
