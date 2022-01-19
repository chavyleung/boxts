import numeral from 'numeral'

import type { JableVideo } from '../jable'
import { jable, jableApis } from '../jable'
import type { SekebeiMagnet } from '../sukebei'
import { sukebei } from '../sukebei'

export async function printVideos(api: string, options: Options) {
  const { page, sort } = options
  const videos = await jable({ api, page, sort })

  for (const video of videos) {
    // 搜索磁链
    const magnets = await sukebei({ key: video.code })
    // 筛选最佳
    const magnet = await _findBestMagnet(magnets)
    // 打印磁链
    if (!magnet) continue
    _printMagent(video, magnet)
  }
}

export async function printApis() {
  const apis = await jableApis()
  const output = apis.reduce((printer, api) => {
    printer += `jable ${api}\n`
    return printer
  }, '')
  console.log(output)
}

/**
 * 查找最佳磁链
 */
export const _findBestMagnet = async (magnets: SekebeiMagnet[]) => {
  if (magnets.length < 1) return

  let bestMagnets = magnets

  // 移除: 小于 2GB
  const minSize = 2
  const bigMagnets = magnets.filter((m) => _filterBySize(m, minSize))
  bestMagnets = bigMagnets.length > 0 ? bigMagnets : bestMagnets

  // 保留: 含中文字幕
  const subMagnets = magnets.filter(_filterBySub)
  const hasSubMagnets = subMagnets.length > 0
  bestMagnets = hasSubMagnets ? subMagnets : magnets

  // 排序
  bestMagnets = hasSubMagnets
    ? // 如果有字幕, 则按大小排序
      bestMagnets.sort(_sortBySize)
    : // 如果无字幕, 取热度前3, 再按大小排序
      bestMagnets
        .sort(_sortByHot)
        .filter((_, idx) => idx < 3)
        .sort(_sortBySize)

  return bestMagnets[0]
}

export const _printMagent = (video: JableVideo, magnet: SekebeiMagnet) => {
  if (!magnet?.url) return
  const code = video.code
  const size = numeral(magnet.size).format('0,0.00')
  console.log(`${magnet.url}&dn=${code}&size=${size}GB`)
}

export const _sortBySize = (a: SekebeiMagnet, b: SekebeiMagnet) =>
  b.size - a.size

export const _sortByHot = (a: SekebeiMagnet, b: SekebeiMagnet) =>
  b.downloads - a.downloads

export const _filterBySize = (magnet: SekebeiMagnet, minSize: number = 2) =>
  magnet.size >= minSize

export const _filterBySub = (magnet: SekebeiMagnet) =>
  magnet.name.includes('中文') ||
  magnet.name.includes('中字') ||
  magnet.name.includes('字幕')

export interface Options {
  page: number
  sort?: string
}
