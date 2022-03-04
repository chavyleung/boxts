import Koa from 'koa'

import axios from 'axios'

const app = new Koa()

app
  .use(async (ctx) => {
    const { url } = ctx.query

    if (!url) return
    const subscribe = Array.isArray(url) ? url[0] : url

    ctx.body = await _parse(subscribe)
  })
  .listen(9000)

const _parse = async (url: string) => {
  const { headers } = await axios({ url })
  const userinfo = headers?.['subscription-userinfo'] as string

  const [rawUpload, rawDownload, rawTotal] = userinfo.split('; ')
  const [, upload] = rawUpload.split('=')
  const [, download] = rawDownload.split('=')
  const [, total] = rawTotal.split('=')

  const toSize = (bytes: number) => Math.round(bytes / 1024 ** 3)
  const used = Number(upload) + Number(download)
  const usedSize = toSize(used)
  const totalSize = toSize(Number(total))

  return `${usedSize} GB | ${totalSize} GB= direct`
}
