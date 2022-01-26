import fs from 'fs-extra'
import path from 'path'
import prettier from 'prettier'
import { normalizePath } from 'vite'

import { getPackagesSync } from '@lerna/project'

export async function bootstrap() {
  await _buildTscPaths()
}

export async function _buildTscPaths() {
  const projectRootPath = path.resolve('./')
  const tscPathsPath = path.resolve(projectRootPath, 'tsconfig.paths.json')
  const packages = getPackagesSync()

  const tsc = fs.readJSONSync(tscPathsPath, { encoding: 'utf-8' })
  const paths = (tsc.compilerOptions.paths = {})

  packages.forEach((pkg) => {
    const pkgRootPath = pkg.location.replace(projectRootPath, '.')
    const pkgName = pkg.name
    paths[pkgName] = [normalizePath(`${pkgRootPath}/src`)]
  })

  const formatedTsc = await prettier
    .resolveConfig(process.cwd())
    .then((options) => {
      options.parser = 'json'
      options.printWidth = 120
      return prettier.format(JSON.stringify(tsc), options)
    })

  fs.writeFileSync(tscPathsPath, formatedTsc)
}
