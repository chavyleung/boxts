import { resolve } from 'path'
import { defineConfig } from 'rollup'
import { terser } from 'rollup-plugin-terser'

import { getPackagesSync } from '@lerna/project'
import alias from '@rollup/plugin-alias'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

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
  terser()
]

export default defineConfig([
  {
    input: './src/index.ts',
    output: {
      exports: 'named',
      file: './dist/index.js',
      format: 'umd',
      name: 'boxjs',
      sourcemap: true
    },
    plugins
  },
  {
    input: './src/index.ts',
    output: {
      exports: 'named',
      file: './dist/index.es.js',
      format: 'es',
      name: 'boxjs',
      sourcemap: true
    },
    plugins
  }
])
