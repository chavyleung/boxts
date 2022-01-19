import type { App } from '../../App'

export interface Surge extends App {}

export interface SurgeRequestOptions {
  url: string
  body?: string
  headers?: Record<string, string | number | boolean>
}

export type SurgeRequestCallback<Data> = (
  error: string | null,
  response?: {
    status: number
    headers: Record<string, string | number | boolean>
  },
  data?: Data
) => void

declare global {
  const $argument: string | undefined

  const $done: (data?: any) => void

  // {"language":"zh-Hans","system":"macOS","surge-build":"1435","surge-version":"4.3.1"}
  const $environment: {
    'language': string
    'surge-build': string
    'surge-version': string
    'system': string
  }

  const $httpClient: {
    get<Data = any>(
      config: string | SurgeRequestOptions,
      callback?: SurgeRequestCallback<Data>
    ): void

    post<Data = any>(
      config: string | SurgeRequestOptions,
      callback?: SurgeRequestCallback<Data>
    ): void
  }

  const $network: {
    dns: string[]
    wifi: {
      bssid: string | null
      ssid: string | null
    }
    v4: {
      primaryAddress: string | null
      primaryRouter: string | null
      primaryInterface: string | null
    }
    v6: {
      primaryAddress: string | null
      primaryInterface: string | null
    }
  }

  const $notification: {
    post(title: string, subTitle?: string, description?: string): void
  }

  const $persistentStore: {
    read(key: string): string | null
    write(value: string | null, key: string): boolean
  }

  // {"name":"Untitled","type":"cron","startTime":"2021-12-30T08:45:50.793Z"}
  const $script: {
    name: string
    startTime: Date
    type: string
  }

  const $trigger: 'auto-interval' | 'button' | undefined
}
