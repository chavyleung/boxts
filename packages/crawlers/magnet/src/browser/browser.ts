import type { Browser, Page } from 'playwright'
import { webkit } from 'playwright'

let BROWSER: Browser | null = null

export async function useBrowser() {
  if (BROWSER) return BROWSER
  return (BROWSER = await webkit.launch())
}

export async function closeBrowser(browser?: Browser) {
  if (browser) {
    await browser.close()
  } else {
    BROWSER && (await BROWSER?.close())
    BROWSER = null
  }
}

export async function createContext<T = {}>(
  context?: T,
  options?: CreateBrowserOptions
) {
  const browser = await useBrowser()
  const page = await browser.newPage(options?.page)
  const close = async () => await page.close()

  const browserContext: BrowserContext<T> = {
    context: context ?? ({} as T),
    browser,
    page,
    close
  }
  return browserContext
}

export interface CreateBrowserOptions {
  page?: Parameters<Browser['newPage']>[0]
}

export interface BrowserContext<T = {}> {
  context: T

  browser: Browser
  page: Page

  close(): Promise<void>
}
