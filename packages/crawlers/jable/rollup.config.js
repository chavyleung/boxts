import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import { terser } from 'rollup-plugin-terser'

import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default () => {
  return defineConfig([
    {
      external: ['playwright', '@boxts/crawler'],
      input: './src/index.ts',
      output: [
        {
          exports: 'named',
          file: './dist/index.js',
          format: 'es',
          sourcemap: true
        }
      ],
      plugins: [
        babel({
          babelHelpers: 'bundled',
          extensions: ['.js', '.ts'],
          rootMode: 'upward'
        }),
        commonjs(),
        json(),
        nodeResolve({
          extensions: ['.js', '.ts'],
          preferBuiltins: true
        }),
        terser()
      ]
    },
    {
      input: './src/index.ts',
      output: {
        file: './dist/index.d.ts',
        format: 'es'
      },
      plugins: [dts()]
    }
  ])
}
