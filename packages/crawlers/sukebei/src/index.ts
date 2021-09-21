import { ElementHandle } from 'playwright'

import { usePlaywright } from '@boxts/crawler'

import { Magnet, SortMagnets, SortOptions } from './types'

export const SUKEBEI = 'https://sukebei.nyaa.si/'

export const getMagnets = async (key: string) => {
  const sukebei = await usePlaywright()
  const sukebeiPage = await sukebei.newPage()

  const url = `${SUKEBEI}?f=0&c=0_0&q=${key}&s=size&o=desc`
  await sukebeiPage.goto(url)

  const elements = await sukebeiPage.$$('table.torrent-list tbody tr.default')
  const magnets = await parser(elements)

  await sukebeiPage.close()
  return magnets
}

export const sortMagnets: SortMagnets = (magnets, opts) => {
  const defaultOptions: SortOptions = {
    sort: 'size',
    minSize: 2,
    maxSize: 0,
    minDownload: 0,
    maxDownload: 0
  }
  const options: SortOptions = Object.assign(defaultOptions, opts)

  const { sort, minSize, maxSize, minDownload, maxDownload } = options
  return magnets
    .filter((m) => {
      const minS = minSize ? m.size > minSize : true
      const maxS = maxSize ? m.size < maxSize : true
      const minD = minDownload ? m.downloads > minDownload : true
      const maxD = maxDownload ? m.downloads < maxDownload : true
      return minS && maxS && minD && maxD
    })
    .sort((a, b) => b[sort] - a[sort])
}

const parser = async (elements: ElementHandle<SVGElement | HTMLElement>[]) => {
  const magnets: Magnet[] = []

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]

    const url = await urlParser(element)
    const name = await nameParser(element)
    const size = await sizeParser(element)
    const downloads = await dlParser(element)

    if (!url) continue
    magnets.push({ url, name, size, downloads })
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

export * from './types'
