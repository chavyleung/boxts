import { pathsToModuleNameMapper } from 'ts-jest'

import type { Config } from '@jest/types'

import tsconfig from './tsconfig.paths.json'

function getModuleNameMapper() {
  const paths = tsconfig?.compilerOptions?.paths ?? {}
  return pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' })
}

export default async (): Promise<Config.InitialOptions> => ({
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.[jt]s?(x)'],
  testTimeout: 30000,
  moduleNameMapper: getModuleNameMapper(),
  verbose: true
})
