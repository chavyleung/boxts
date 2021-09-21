export interface Magnet {
  url: string
  name: string
  size: number
  downloads: number
}

type SortFields = keyof Pick<Magnet, 'downloads' | 'size'>

export interface SortOptions {
  sort: SortFields
  maxSize: number
  minSize: number
  maxDownload: number
  minDownload: number
}

export type SortMagnets = (
  magnets: Magnet[],
  opts?: Partial<SortOptions>
) => Magnet[]
