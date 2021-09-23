import { ElementHandle } from 'playwright'

import { usePlaywright } from '@boxts/crawler'

import { GetMagnets, Magnet, Options, SortMagnets, WrapOptions } from './types'

export const SUKEBEI = 'https://sukebei.nyaa.si/'

export const getMagnets: GetMagnets = async (key, ...opts) => {
  const options = wrapOptions(...opts)
  const sukebei = await usePlaywright()
  const sukebeiPage = await sukebei.newPage()

  const { sort, page } = options
  const _sort = sort ? `&s=${sort}` : ''
  const url = `${SUKEBEI}?f=0&c=2_2&q=${key}${_sort}&o=desc&p=${page}`
  await sukebeiPage.goto(url)

  const elements = await sukebeiPage.$$('table.torrent-list tbody tr')
  const magnets = await parser(elements)

  await sukebeiPage.close()
  return magnets
}

export const wrapOptions: WrapOptions = (...opts) => {
  const defaultOptions: Options = {
    page: 1,
    minSize: 2,
    maxSize: 0,
    minDownload: 0,
    maxDownload: 0
  }
  return Object.assign(defaultOptions, ...opts)
}

export const sortMagnets: SortMagnets = (magnets, ...opts) => {
  const options = wrapOptions(...opts)

  const { sort, minSize, maxSize, minDownload, maxDownload } = options
  let sorted = magnets.filter((m) => {
    const minS = minSize ? m.size > minSize : true
    const maxS = maxSize ? m.size < maxSize : true
    const minD = minDownload ? m.downloads > minDownload : true
    const maxD = maxDownload ? m.downloads < maxDownload : true
    return minS && maxS && minD && maxD
  })

  if (sort) {
    sorted = sorted.sort((a, b) => b[sort] - a[sort])
  }

  return sorted
}

const parser = async (elements: ElementHandle<SVGElement | HTMLElement>[]) => {
  const magnets: Magnet[] = []

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]

    const url = await urlParser(element)
    const name = await nameParser(element)
    const size = await sizeParser(element)
    const downloads = await dlParser(element)
    const leechers = await lcParser(element)

    if (!url) continue
    magnets.push({ url, name, size, downloads, leechers })
  }

  return magnets
}

const hrefParser = (el: SVGElement | HTMLElement) => el.getAttribute('href')
const textParser = (el: SVGElement | HTMLElement) => el.textContent

const urlParser = async (element: ElementHandle<SVGElement | HTMLElement>) => {
  const $url = await element.$('td >> nth=2')
  if (!$url) return

  const rawUrl = await $url.$eval('a >> nth=1', hrefParser).catch(() => '')
  if (!rawUrl) return

  return rawUrl.split('&')[0]
}

const nameParser = async (element: ElementHandle<SVGElement | HTMLElement>) => {
  const $name = await element.$('td >> nth=1')
  if (!$name) return ''

  const rawName = await $name.$eval('a', textParser).catch(() => '')
  if (!rawName) return ''

  const name = rawName.replace(/\n|\t/g, '')
  return name
}

const sizeParser = async (element: ElementHandle<SVGElement | HTMLElement>) => {
  const $size = await element.$eval('td >> nth=3', textParser)
  const [rawSize, unit] = $size?.split(' ') ?? ['0', 'GiB']
  return Number(rawSize) / (unit === 'GiB' ? 1 : unit === 'MiB' ? 1024 : 0)
}

const dlParser = async (element: ElementHandle<SVGElement | HTMLElement>) => {
  const $downloads = await element.$eval('td >> nth=-1', textParser)
  return Number($downloads) ?? 0
}

const lcParser = async (element: ElementHandle<SVGElement | HTMLElement>) => {
  const $leechers = await element.$eval('td >> nth=6', textParser)
  return Number($leechers) ?? 0
}

export * from './types'
