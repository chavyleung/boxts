import { createContext } from '../../createContext'
import type { Surge } from './Surge'

export function createSurge() {
  const surge: Surge = {
    name: 'Surge',
    getArgument: (key) => {
      return surge.getArguments()?.[key]
    },
    getArguments: () => {
      const args: Record<string, string> = {}

      if ('undefined' !== typeof $argument) {
        $argument.split('&').reduce((args, arg) => {
          const [key, val] = arg.split('=')
          args[key] = decodeURIComponent(val)
          return args
        }, args)
      }

      return args
    },
    exec: async (script, props) => script(props, createContext({ app: surge })),
    notify: (title, subTitle = '', description = '', options) => {
      // TODO: Adapt options
      $notification.post(title, subTitle, description)
    },
    http: {
      get: (config) =>
        new Promise((resolve, reject) => {
          $httpClient.get(config, (error, response, data) => {
            if (error || !response) {
              reject(error)
            } else {
              resolve({ data, ...response })
            }
          })
        }),
      post: (config) =>
        new Promise((resolve, reject) => {
          $httpClient.post(config, (error, response, data) => {
            if (error || !response) {
              reject(error)
            } else {
              resolve({ data, ...response })
            }
          })
        })
    },
    get: (config, callback) =>
      $httpClient.get(config, (error, response, data) => {
        if (!callback) return
        const resp = { data, ...response }
        callback(error, resp, data)
      }),
    post: (config, callback) =>
      $httpClient.post(config, (error, response, data) => {
        if (!callback) return
        const resp = { data, ...response }
        callback(error, resp, data)
      }),
    done: (data = {}) => $done(data)
  }
  return surge
}
