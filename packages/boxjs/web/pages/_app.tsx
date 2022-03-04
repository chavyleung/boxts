import type { ReactElement, ReactNode } from 'react'

import type { NextPage } from 'next'
import { AppProps } from 'next/app'
import Head from 'next/head'

import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <>
      <Head>
        <title>BoxJs</title>
      </Head>

      <ThemeProvider theme={createTheme({})}>
        <CssBaseline />
        {getLayout(<Component {...pageProps} />)}
      </ThemeProvider>
    </>
  )
}

export default App
