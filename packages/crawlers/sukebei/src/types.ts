export interface Magnet {
  url: string
  name: string
  size: number
  leechers: number
  downloads: number
}

type SortFields = keyof Pick<Magnet, 'downloads' | 'size' | 'leechers'>

export interface Options {
  sort?: SortFields
  page: number
  maxSize: number
  minSize: number
  maxDownload: number
  minDownload: number
}

export type WrapOptions = (...opts: Partial<Options>[]) => Options

export type GetMagnets = (
  key: string,
  ...opts: Partial<Options>[]
) => Promise<Magnet[]>

export type SortMagnets = (
  magnets: Magnet[],
  ...opts: Partial<Options>[]
) => Magnet[]
