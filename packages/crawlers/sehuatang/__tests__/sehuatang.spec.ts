import { usePlaywright } from '@boxts/crawler'
import { getMagnet, getVideos, parseUrl } from '@boxts/sehuatang'

beforeAll(() => usePlaywright())
afterAll(() => usePlaywright().then((playwright) => playwright.close()))

describe('@boxts/sehuatang', () => {
  it('getVideos: default', async () => {
    const videos = await getVideos('/forum-103-2.html')
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      video.magnet = await getMagnet(video.url)
      console.info(video.magnet)
    }
  })

  it('parseUrl', async () => {
    console.info(parseUrl('/forum-103'))
    console.info(parseUrl('/forum-103.html'))
    console.info(parseUrl('/forum-103-2'))
    console.info(parseUrl('/forum-103-2.html'))
  })

  it('home', async () => {
    const playwright = await usePlaywright()
    const webpage = await playwright.newPage()
    await webpage.goto('https://www.sehuatang.org')
    const urls = await webpage.$$eval('div.fl_icn_g a', (els) => {
      return els.map((el) => ({
        url: el.getAttribute('href'),
        name: el.innerHTML
      }))
    })
    console.info(urls)
  })
})
