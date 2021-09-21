import { webkit } from 'playwright'

import { Playwright } from './types'

export let _playwright: Playwright | null = null

export const usePlaywright = async () => {
  if (_playwright) return _playwright

  const browser = await webkit.launch()
  const context = await browser.newContext()

  const newPage = async () => {
    return await context.newPage()
  }

  const close = async () => {
    await context.close()
    await browser.close()
    _playwright = null
  }

  _playwright = { browser, context, newPage, close }
  return _playwright
}
