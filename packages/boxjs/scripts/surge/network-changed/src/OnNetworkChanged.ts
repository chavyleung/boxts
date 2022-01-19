import type { Context } from '@boxts/core'

export default function (props: Props, context: Context) {
  const { app } = context

  const tssid = app.getArgument<string>('tssid')
  if (tssid && tssid.includes($network.wifi.ssid ?? '')) {
    return _handleT(context)
  } else {
    return {}
  }
}

const _handleT = (context: Context) => {
  const { app } = context

  const args = app.getArguments()
  const { username, password } = args
  if (!username || !password) {
    app.notify('上网认证系统', '自动认证: 失败!', '原因: 用户名或密码为空!')
    return Promise.resolve(false)
  }

  return app.http
    .post<string>({
      url: `http://10.1.50.252/ac_portal/login.php`,
      body: `opr=pwdLogin&userName=${username}&pwd=${password}&rememberPwd=1`,
      headers: {
        'Host': '10.1.50.252',
        'Pragma': 'no-cache',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Proxyman-Repeated-ID': '146B65B7',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cache-Control': 'no-cache',
        'Content-Length': '65',
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36`,
        'Connection': 'keep-alive'
      }
    })
    .then((resp) => {
      const notify = (success: boolean) =>
        app.notify('上网认证系统', `自动认证: ${success ? '成功' : '失败'}!`)

      if (resp?.data) {
        const result: { success: boolean } = JSON.parse(
          resp.data.replace(/'/g, '"')
        )
        notify(result.success)
      } else {
        notify(false)
      }
    })
}

interface Props {}
