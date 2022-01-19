import { ElementHandle } from 'playwright'

export const hrefParser = (el: SVGElement | HTMLElement) =>
  el.getAttribute('href')

export const textParser = (el: SVGElement | HTMLElement) => el.textContent

export const urlParser = async (
  element: ElementHandle<SVGElement | HTMLElement>
) => {
  const $url = await element.$('td >> nth=2')
  if (!$url) return

  const rawUrl = await $url.$eval('a >> nth=1', hrefParser).catch(() => '')
  if (!rawUrl) return

  return rawUrl.split('&')[0]
}

export const nameParser = async (
  element: ElementHandle<SVGElement | HTMLElement>
) => {
  const $name = await element.$('td >> nth=1')
  if (!$name) return ''

  const rawName = await $name.$eval('a', textParser).catch(() => '')
  if (!rawName) return ''

  const name = rawName.replace(/\n|\t/g, '')
  return name
}

export const sizeParser = async (
  element: ElementHandle<SVGElement | HTMLElement>
) => {
  const $size = await element.$eval('td >> nth=3', textParser)
  const [rawSize, unit] = $size?.split(' ') ?? ['0', 'GiB']
  return Number(rawSize) / (unit === 'GiB' ? 1 : unit === 'MiB' ? 1024 : 0)
}

export const dlParser = async (
  element: ElementHandle<SVGElement | HTMLElement>
) => {
  const $downloads = await element.$eval('td >> nth=-1', textParser)
  return Number($downloads) ?? 0
}

export const lcParser = async (
  element: ElementHandle<SVGElement | HTMLElement>
) => {
  const $leechers = await element.$eval('td >> nth=6', textParser)
  return Number($leechers) ?? 0
}
