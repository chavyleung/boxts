import { usePlaywright } from '@boxts/crawler'
import { getVideos } from '@boxts/jable'

beforeAll(() => usePlaywright())
afterAll(() => usePlaywright().then((playwright) => playwright.close()))

describe('@boxts/jable', () => {
  it('getVideos: default', async () => {
    const videos = await getVideos('/hot/')
    await getVideos('/categories/uniform/')
    expect(videos.length).toBeGreaterThan(0)
  })
})
