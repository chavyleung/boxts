import dayjs from 'dayjs'

import type { Context, HttpResponse } from '@boxts/core'

export default function (props: Props, context: Context) {
  const { app } = context
  const url = app.getArgument<string>('sub')
  return app.http.get(url).then(_parse)
}

const _parse = (resp: HttpResponse<string>) => {
  /**
   * Nexitally
   */
  if ((resp.headers?.['Content-Disposition'] as string).includes('Nexitally')) {
    // content-disposition: attachment;  filename=Nexitally_Surge.conf
    return _parseNexitally(resp)
  }
}

const _parseNexitally = (resp: HttpResponse<string>) => {
  const { headers, data } = resp

  // subscription-userinfo: upload=610474331; download=94491090078; total=214748364800; expire=1671930479.367
  const userinfo = headers?.['subscription-userinfo'] as string
  const [rawUpload, rawDownload, rawTotal, rawExpire] = userinfo.split('; ')
  const [, upload] = rawUpload.split('=')
  const [, download] = rawDownload.split('=')
  const [, total] = rawTotal.split('=')
  const [, expire] = rawExpire.split('=')

  // Traffic Reset : 3 Days Left
  const rawTfcReset = data?.match(/Traffic Reset : (\d+) Days Left/) ?? []
  const [, tfcReset] = rawTfcReset

  const used = Number(upload) + Number(download)
  const balance = Number(total) - Number(used)

  const dateFmt = 'YYYY/MM/DD'
  const timeFmt = 'YYYY/MM/DD HH:mm:ss'
  const toSize = (bytes: number) => Math.round(bytes / 1024 ** 3)
  const toDate = (time: number) => new Date(time * 1000)

  const usedSize = toSize(used)
  const balanceSize = toSize(balance)
  const totalSize = toSize(Number(total))
  const tfcResetDays = Number(tfcReset)
  const expireDate = dayjs(toDate(Number(expire))).format(dateFmt)
  const updateDate = dayjs().format(timeFmt)

  const title = 'Nexitally'
  const content = [
    `已用流量: ${usedSize} GB | ${totalSize} GB`,
    `剩余流量: ${balanceSize} GB | ${tfcResetDays} 天`,
    `有效日期: ${expireDate}`,
    `更新时间: ${updateDate}`
  ].join('\n')

  return { title, content }
}

interface Props {}
