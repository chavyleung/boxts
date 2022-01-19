import { BrowserContext, createContext } from '../browser'
import { dlParser, lcParser, nameParser, sizeParser, urlParser } from './utils'

const _SUKEBEI = 'https://sukebei.nyaa.si/'

const _DEFAULT_OPTIONS: SukebeiOptions = {
  key: '',
  page: 1
}

/**
 * [API]: 获取磁力链
 *
 * sukebei({ key: ''})
 * sukebei({ key: '', page: 2 })
 */
export async function sukebei(inOptions?: Partial<SukebeiOptions>) {
  // 1. 初始化
  const options: SukebeiOptions = { ..._DEFAULT_OPTIONS, ...inOptions }
  const context = await _createContext(options)

  // 2. 解析页面
  const magnets = await _parse(context)
  await context.close()

  // 3. 返回结果
  return magnets
}

/**
 * 解析页面
 */
async function _parse(context: BrowserContext<SukebeiOptions>) {
  const { context: options, page: browserPage } = context

  const { key, page, sort } = options
  const keyQuery = `&q=${key}`
  const pageQuery = `&p=${page}`
  const sortQuery = sort ? `&s=${sort}` : ''
  const url = `?f=0&c=2_2${keyQuery}${pageQuery}${sortQuery}&o=desc`

  // 请求页面
  await browserPage.goto(url).catch(() => browserPage.goto(url))
  const $selector = 'table.torrent-list tbody tr'
  const elements = await browserPage.$$($selector).catch(() => [])

  // 解析页面
  const magnets: SekebeiMagnet[] = []
  for (const element of elements) {
    const url = await urlParser(element)
    const name = await nameParser(element)
    const size = await sizeParser(element)
    const downloads = await dlParser(element)
    const leechers = await lcParser(element)

    if (!url) continue
    magnets.push({ url, name, size, downloads, leechers })
  }

  // 返回结果
  return magnets
}

/**
 * 创建上下文
 */
async function _createContext<T = {}>(options?: T) {
  return createContext(options, { page: { baseURL: _SUKEBEI } })
}

export interface SukebeiOptions {
  key: string
  page: number
  sort?: 'downloads' | 'size' | 'leechers'
}

export interface SekebeiMagnet {
  url: string
  name: string
  size: number
  leechers: number
  downloads: number
}
