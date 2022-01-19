import type { Http } from './Http'
import type { LegacyHttp } from './LegacyHttp'
import type { Notification } from './Notification'
import type { Script } from './Script'

export interface App extends Http, LegacyHttp, Notification {
  /**
   * 应用名称
   */
  name: string

  /**
   * 获取上下文参数
   */
  getArgument<Value = any>(key: string): Value

  /**
   * 获取上下文参数
   */
  getArguments(): Record<string, any>

  /**
   * 执行脚本
   */
  exec<Props, Result>(
    script: Script<Props, Result | PromiseLike<Result>>,
    props: Props
  ): Promise<Result>

  /**
   * 释放资源
   */
  done(data?: any): void
}
