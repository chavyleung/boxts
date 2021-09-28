import { usePlaywright } from '@boxts/crawler'

import { Apis, GetMagnet, GetOptions, GetVideos, Options, Video } from './types'

export const SEHUATANG = 'https://www.sehuatang.org'

export const getOptions: GetOptions = (...opts) => {
  const defaultOptions: Options = {}
  return Object.assign(defaultOptions, ...opts)
}

export const getVideos: GetVideos = async (api, ...opts) => {
  const playwright = await usePlaywright()
  const sehuatangPage = await playwright.newPage()

  const url = parseUrl(api, ...opts)
  if (!url) return [] as Video[]
  await sehuatangPage.goto(url)

  const $selector = 'table#threadlisttableid tbody[id^="normalthread"] a.xst'
  const videos = await sehuatangPage
    .$$eval($selector, parser)
    .catch(() => [] as Video[])

  await sehuatangPage.close()
  return videos
}

const parser = (elements: (SVGElement | HTMLElement)[]) => {
  const vidoes: Video[] = []

  elements.forEach((el) => {
    const url = el.getAttribute('href') ?? ''
    const name = el.textContent ?? ''

    if (!url || !name) return
    const code = name.split(' ')[0]
    vidoes.push({ url, code, name })
  })

  return vidoes
}

export const parseUrl = (api: Apis, ...opts: Partial<Options>[]) => {
  const { page } = getOptions(...opts)

  const url = api.replace('.html', '')

  // /forum-xxx
  if (/^\/forum-\d+$/.test(url)) {
    return `${SEHUATANG}${url}-${page ?? 1}.html`
  }
  // /forum-xxx-x
  else if (/^\/forum-\d+-\d+$/.test(url)) {
    if (page) {
      const [, forum] = url.split('-')
      return `${SEHUATANG}/forum-${forum}-${page}.html`
    }
    return `${SEHUATANG}${url}.html`
  }

  return null
}

export const getMagnet: GetMagnet = async (url) => {
  const playwright = await usePlaywright()
  const sehuatangPage = await playwright.newPage()
  await sehuatangPage.goto(`${SEHUATANG}/${url}`)

  const $selector = 'div.blockcode li'
  const magnet = await sehuatangPage
    .$eval($selector, (el) => el.innerHTML ?? '')
    .catch(() => '')

  await sehuatangPage.close()
  return magnet
}

export * from './types'
