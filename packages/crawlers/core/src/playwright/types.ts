import type { Browser, BrowserContext, Page } from 'playwright'

export type Playwright = {
  browser: Browser
  context: BrowserContext
  newPage: () => Promise<Page>
  close: () => Promise<void>
}
