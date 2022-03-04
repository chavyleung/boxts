import { resolve } from 'path'
import { defineConfig } from 'rollup'
import { terser } from 'rollup-plugin-terser'

import { getPackagesSync } from '@lerna/project'
import alias from '@rollup/plugin-alias'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const plugins = [
  alias({
    entries: getPackagesSync().reduce((entries, pkg) => {
      entries[pkg.name] = resolve(pkg.location, './src')
      return entries
    }, {})
  }),
  babel({
    babelHelpers: 'bundled',
    extensions: ['.js', '.ts'],
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-typescript']
    ]
  }),
  nodeResolve({
    extensions: ['.js', '.ts'],
    preferBuiltins: true
  }),
  commonjs(),
  json(),
  terser()
]

export default defineConfig([
  {
    input: './src/app.ts',
    external: ['axios', 'koa', 'koa-router'],
    output: {
      globals: {
        'axios': 'axios',
        'koa': 'Koa',
        'koa-router': 'KoaRouter'
      },
      exports: 'named',
      file: './dist/app.js',
      format: 'umd',
      name: 'SurgePolicySubscribe',
      sourcemap: true
    },
    plugins
  }
])
