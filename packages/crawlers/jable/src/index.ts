import { usePlaywright } from '@boxts/crawler'

import {
  GetOptions,
  GetVideos,
  isRootApis,
  RootApisOptions,
  Video,
  VideoOptions
} from './types'

export const JABLE = 'https://jable.tv'

export const getOptions: GetOptions = (api, ...opts) => {
  const options = isRootApis(api)
    ? rootApisOptions[api]
    : rootApisOptions['rest']

  return Object.assign({}, options, ...opts)
}

export const getVideos: GetVideos = async (api, ...opts) => {
  const jable = await usePlaywright()
  const jablePage = await jable.newPage()

  const { list, sort, page } = getOptions(api, ...opts)
  const time = new Date().getTime()
  const url = `${JABLE}${api}?mode=async&function=get_block&block_id=${list}&sort_by=${sort}&from=${page}&_=${time}`
  await jablePage.goto(url)

  const $selector = 'div.video-img-box .detail a'
  const videos = await jablePage
    .$$eval($selector, parser)
    .catch(() => [] as Video[])

  await jablePage.close()
  return videos
}

const parser = (elements: (SVGElement | HTMLElement)[]) => {
  const vidoes: Video[] = []

  elements.forEach((el) => {
    const url = el.getAttribute('href')
    const name = el.textContent?.trim().replace('[廣告] ', '')

    if (!url || !name) return
    const [code] = name.split(' ')
    vidoes.push({ code, name })
  })

  return vidoes
}

export const rootApisOptions: RootApisOptions & { rest: VideoOptions } = {
  '/hot/': {
    list: 'list_videos_common_videos_list',
    sort: 'video_viewed',
    page: 1
  },
  '/latest-updates/': {
    list: 'list_videos_latest_videos_list',
    sort: 'post_date',
    page: 1
  },
  '/new-release/': {
    list: 'list_videos_common_videos_list',
    sort: 'release_year',
    page: 1
  },
  'rest': {
    list: 'list_videos_common_videos_list',
    sort: 'video_viewed',
    page: 1
  }
}

export * from './types'
