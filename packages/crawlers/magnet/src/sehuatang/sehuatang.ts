import { BrowserContext, createContext } from '../browser'
import { _parseUrl, _parseVideos } from './utils'

const _SEHUATANG = 'https://www.sehuatang.org'

const _DEFAULT_OPTIONS: SehuatangOptions = {
  api: '',
  page: 1
}

/**
 * [API]: 获取视频列表
 *
 * sehuatang()
 * sehuatang({ api: '/forum-103', page: 1 })
 */
export async function sehuatang(inOptions?: Partial<SehuatangOptions>) {
  // 1. 初始化
  const options: SehuatangOptions = { ..._DEFAULT_OPTIONS, ...inOptions }
  const context = await _createContext(options)

  // 2. 解析页面
  const videos = await _parse(context)
  await context.close()

  // 3. 返回结果
  return videos
}

/**
 * 解析页面
 */
async function _parse(context: BrowserContext<SehuatangOptions>) {
  const { context: options, page: browserPage } = context
  const url = _parseUrl(options)
  if (!url) return []

  await browserPage.goto(url).catch(() => browserPage.goto(url))
  const $selector = 'table#threadlisttableid tbody[id^="normalthread"] a.xst'
  const videos = await browserPage
    .$$eval($selector, _parseVideos)
    .catch(() => [] as SehuatangVideo[])

  // 返回结果
  return videos
}

export async function getSehuatangMagnet(url: string) {
  const context = await _createContext()
  const { page: browserPage } = context
  await browserPage.goto(url).catch(() => browserPage.goto(url))

  const $selector = 'div.blockcode li'
  const magnet = await browserPage
    .$eval($selector, (el) => el.innerHTML ?? '')
    .catch(() => '')

  await context.close()
  return magnet
}

/**
 * 创建上下文
 */
async function _createContext<T = {}>(options?: T) {
  return createContext(options, { page: { baseURL: _SEHUATANG } })
}

export interface SehuatangOptions {
  api: string
  page: number
}

export interface SehuatangVideo {
  url: string
  code: string
  name: string
}
