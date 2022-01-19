export interface Http {
  http: {
    /**
     * GET request
     *
     * @param config url<string> or options<HttpRequestConfig>
     */
    get<Data = any>(config: HttpRequestConfig): Promise<HttpResponse<Data>>

    /**
     * POST request
     *
     * @param config url<string> or options<HttpRequestConfig>
     */
    post<Data = any>(config: HttpRequestConfig): Promise<HttpResponse<Data>>
  }
}

export type HttpRequestConfig = string | HttpRequestOptions

export interface HttpRequestOptions {
  url: string
  body?: string
  headers?: Record<string, string | number | boolean>
  method?: HttpMethod
}

export interface HttpResponse<Data> {
  status: number
  headers: Record<string, string | number | boolean>
  data?: Data
}

export type HttpMethod =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK'
