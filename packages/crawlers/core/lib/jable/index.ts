import { Command } from 'commander'
import numeral from 'numeral'

import { usePlaywright } from '@boxts/crawler'
import { Apis, getOptions, getVideos, Video } from '@boxts/jable'
import { getMagnets, Magnet, sortMagnets } from '@boxts/sukebei'

import { Opts } from './types'

export const sort = (magnets: Magnet[], opts: Opts) => {
  const { minSize, maxSize } = opts
  let sorted = sortMagnets(magnets, {
    sort: 'downloads',
    minSize: minSize ?? 3,
    maxSize: maxSize ?? 10
  })

  if (sorted.length < 1) {
    sorted = sortMagnets(magnets, {
      sort: 'size',
      minSize: 0,
      maxSize: 10
    })
  }
  return sorted
}

export const withMagent = async (videos: Video[], opts: Opts) => {
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]
    const magnets = await getMagnets(video.code)
    video.magnets = sort(magnets, opts)

    const bestMagnet = video.magnets?.[0]
    if (!bestMagnet) continue

    const size = numeral(bestMagnet.size).format('0,0.00')
    const magnet = `${bestMagnet.url}&dn=${video.code}&size=${size}GB`
    console.log(magnet)
  }
  return videos
}

export const getOutputs = (videos: Video[]) => {
  return videos
    .map((v) => v.magnet ?? v.code ?? '')
    .filter((l) => l)
    .join('\n')
}

export const handle = async (path: Apis, opts: Opts) => {
  const { page, magnet: isGetMagnet, latest: isGetLatest } = opts
  let videos: Video[]

  if (path === '/hot/') {
    const sort = isGetLatest ? 'video_viewed_today' : 'video_viewed'
    const options = getOptions(path, { sort, page })
    console.info(`🔔 ${path}${options.sort} 🔔`)
    videos = await getVideos(path, options)
  } else if (path === '/latest-updates/') {
    const options = getOptions(path, { page })
    console.info(`🔔 ${path}${options.sort} 🔔`)
    videos = await getVideos(path, options)
  } else if (path === '/new-release/') {
    const options = getOptions(path, { page })
    console.info(`🔔 ${path}${options.sort} 🔔`)
    videos = await getVideos(path, options)
  } else {
    const sort = isGetLatest ? 'post_date' : 'video_viewed'
    const options = getOptions(path, { sort, page })
    console.info(`🔔 ${path}${options.sort} 🔔`)
    videos = await getVideos(path, options)
  }

  if (isGetMagnet) {
    await withMagent(videos, opts)
  } else {
    console.info(getOutputs(videos))
  }
  return videos
}

const program = new Command()
program
  .name('jable')
  .description('npm i -g @boxts/crawler')
  .argument('[path]', 'get videos from path.', (v) => v, '/hot/')
  .option('-p, --page [page]', 'get videos from page.', (p) => parseInt(p), 1)
  .option('-min, --minSize [minSize]', 'min-size GB', (v) => parseInt(v), 3)
  .option('-max, --maxSize [maxSize]', 'max-size GB', (v) => parseInt(v), 10)
  .option('-m, --magnet [magnet]', 'get video magnet.', false)
  .option('-l, --latest [latest]', 'get latest videos.', false)
  .helpOption(
    '-h, --help',
    `
    jable /tags/creampie/ -m
    jable /tags/creampie/ -l
    jable /tags/creampis/ -p 2
    jable /tags/creampis/ -min 3 -max 10

    jable /hot/ -m -l
    jable /latest-updates/ -m -l
    jable /new-release/ -m -l
    jable /categories/uncensored/ -m -l
    jable /tags/creampie/ -m -l

    for t in {5..5}; do jable /categories/uncensored/ -m -p $t;done

    more: https://github.com/chavyleung/boxts/blob/main/packages/crawlers/core/README.md
    `
  )
  .action(async (path: Apis) => {
    const opts = program.opts<Opts>()
    await handle(path, opts)
    await usePlaywright().then(({ close }) => close())
  })

program.parse(process.argv)
