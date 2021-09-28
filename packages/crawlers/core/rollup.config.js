import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'

import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default () => {
  return defineConfig([
    {
      external: ['playwright'],
      input: './src/index.ts',
      output: [
        {
          exports: 'named',
          file: './dist/index.js',
          format: 'cjs'
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
        })
      ]
    },
    {
      input: './src/index.ts',
      output: {
        file: './dist/index.d.ts',
        format: 'es'
      },
      plugins: [dts()]
    },
    {
      external: ['playwright'],
      input: './lib/jable/index.ts',
      output: [
        {
          banner: '#!/usr/bin/env node',
          exports: 'named',
          file: './bin/jable.js',
          format: 'cjs'
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
        })
      ]
    },
    {
      external: ['playwright'],
      input: './lib/sukebei/index.ts',
      output: [
        {
          banner: '#!/usr/bin/env node',
          exports: 'named',
          file: './bin/sukebei.js',
          format: 'cjs'
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
        })
      ]
    },
    {
      external: ['playwright'],
      input: './lib/sehuatang/index.ts',
      output: [
        {
          banner: '#!/usr/bin/env node',
          exports: 'named',
          file: './bin/sehuatang.js',
          format: 'cjs'
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
        })
      ]
    }
  ])
}
