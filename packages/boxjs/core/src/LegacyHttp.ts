import type { HttpMethod } from './Http'

export interface LegacyHttp {
  /**
   * [Deprecated] GET request
   *
   * @deprecated since version 2.0. use http.get() instead!
   * @param config url<string> or options<LegacyRequestOptions>
   */
  get<Data>(
    config: string | LegacyRequestOptions,
    callback?: LegacyRequestCallback<Data>
  ): void

  /**
   * [Deprecated] POST request
   *
   * @deprecated since version 2.0. use http.post() instead!
   * @param config url<string> or options<LegacyRequestOptions>
   */
  post<Data>(
    config: string | LegacyRequestOptions,
    callback?: LegacyRequestCallback<Data>
  ): void
}

export interface LegacyRequestOptions {
  url: string
  body?: string
  headers?: Record<string, string | number | boolean>
  method?: HttpMethod
}

export type LegacyRequestCallback<Data> = (
  error: string | null,
  response?: LegacyResponse<Data>,
  data?: Data
) => void

export type LegacyResponse<Data> = {
  data: Data
}
