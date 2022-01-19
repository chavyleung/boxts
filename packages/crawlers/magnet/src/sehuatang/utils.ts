import { SehuatangOptions, SehuatangVideo } from './sehuatang'

export const _parseUrl = (options: SehuatangOptions) => {
  const { api, page } = options
  const url = api.replace('.html', '')

  // /forum-xxx
  if (/^\/forum-\d+$/.test(url)) {
    return `${url}-${page ?? 1}.html`
  }
  // /forum-xxx-x
  else if (/^\/forum-\d+-\d+$/.test(url)) {
    if (page) {
      const [, forum] = url.split('-')
      return `/forum-${forum}-${page}.html`
    }
    return `${url}.html`
  }

  return null
}

export const _parseVideos = (elements: (SVGElement | HTMLElement)[]) =>
  elements.reduce((videos, element) => {
    const url = element.getAttribute('href') ?? ''
    const name = element.textContent ?? ''

    if (!url || !name) return videos
    const code = name.split(' ')[0]

    videos.push({ url, code, name })
    return videos
  }, [] as SehuatangVideo[])
