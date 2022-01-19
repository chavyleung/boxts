import { BrowserContext, createContext } from '../browser'

const _JABLE = 'https://jable.tv'

const _DEFAULT_PATH = '/hot/'
const _DEFAULT_SORT = 'video_viewed_week'
const _DEFAULT_BLOCK = 'list_videos_common_videos_list'

const _DEFAULT_OPTIONS: JableOptions = {
  api: _DEFAULT_PATH,
  sort: _DEFAULT_SORT,
  page: 1
}

/**
 * [API]: 获取视频列表
 *
 * jable()
 * jable({ api: '/hot/', page: 1 })
 * jable({ api: '/hot/', sort: 'video_viewed_week', page: 1 })
 */
export async function jable(inOptions?: Partial<JableOptions>) {
  // 1. 初始化
  const options: JableOptions = { ..._DEFAULT_OPTIONS, ...inOptions }
  const context = await _createContext(options)

  // 2. 解析页面
  const videos = await _parseVideosPage(context)
  await context.close()

  // 3. 返回结果
  return videos
}

/**
 * [API]: 获取接口列表
 *
 * jableApis()
 */
export async function jableApis() {
  // 1. 初始化
  const context = await _createContext()

  // 2. 解析页面
  const apis = await _parseApisPage(context)
  await context.close()

  // 3. 返回结果
  return apis
}

/**
 * 创建上下文
 */
async function _createContext<T = {}>(options?: T) {
  return createContext(options, { page: { baseURL: _JABLE } })
}

/**
 * 生成请求体
 *
 * {
 *  url: <请求地址>
 *  ...: <其他参数>
 * }
 */
const _parseJableUrl = (options: JableOptions) => {
  const { api: path, page, sort } = options

  const opts = {
    // 自动追加斜杠: /hot => /hot/
    api: path ? (path.endsWith('/') ? path : `${path}/`) : _DEFAULT_PATH,
    block_id: _DEFAULT_BLOCK,
    from: page,
    sort_by: _DEFAULT_SORT,
    time: new Date().getTime()
  }

  // 默认参数
  switch (opts.api) {
    case _DEFAULT_PATH:
      opts.block_id = _DEFAULT_BLOCK
      opts.sort_by = sort ?? _DEFAULT_SORT
      break
    case '/latest-updates/':
      opts.block_id = 'list_videos_latest_videos_list'
      opts.sort_by = sort ?? 'post_date'
      break
    case '/new-release/':
      opts.block_id = 'list_videos_common_videos_list'
      opts.sort_by = sort ?? 'release_year'
      break
    default:
      opts.block_id = 'list_videos_common_videos_list'
      opts.sort_by = sort ?? 'post_date_and_popularity'
  }

  // 生成请求地址: /hot/...
  const { block_id, sort_by, from, time } = opts
  const url = `${opts.api}?mode=async&function=get_block&block_id=${block_id}&sort_by=${sort_by}&from=${from}&_=${time}`
  return url
}

/**
 * 解析页面 (Videos)
 */
const _parseVideosPage = async (context: BrowserContext<JableOptions>) => {
  const { page: browserPage, context: options } = context
  if (!browserPage) return []

  const url = _parseJableUrl(options)
  await browserPage.goto(url).catch(() => browserPage.goto(url))
  const $selector = 'div.video-img-box .detail a'

  return browserPage
    .$$eval($selector, (elements) =>
      elements.reduce((videos, element) => {
        const url = element.getAttribute('href')
        if (!url) return videos

        const name = element.textContent?.trim() ?? ''
        if (!name || name.includes('[廣告]')) return videos

        const [code] = name.split(' ')
        videos.find((v) => (v.code = code))
        videos.push({ code, name })

        return videos
      }, [] as JableVideo[])
    )
    .catch(() => [])
}

/**
 * 解析页面 (Apis)
 */
const _parseApisPage = async (context: BrowserContext) => {
  const { page: browserPage } = context
  if (!browserPage) return []

  await browserPage.goto('/').catch(() => browserPage.goto('/'))
  const $selector =
    'a[href^="https://jable.tv/tags/"], a[href^="https://jable.tv/categories/"]'

  const urls = await browserPage
    .$$eval($selector, (elements) =>
      elements.map((element) => {
        const url = element.getAttribute('href')
        if (!url) return ''
        return url
      })
    )
    .catch(() => [] as string[])

  const apis = ['/hot/', '/latest-updates/', '/new-release/'].concat(
    // 1. 去重
    Array.from(new Set(urls))
      // 2. 排序
      .sort((a, b) => (a > b ? 1 : -1))
      // 3. 删除多余前缀
      .map((url) => url.replace('https://jable.tv', ''))
      // 4. 删除多余数据
      .filter((url) => !['', '/categories/', '/tags/'].includes(url))
  )

  return apis
}

export interface JableOptions {
  api: string
  sort: string
  page: number
}

export interface JableVideo {
  code: string
  name: string
}
