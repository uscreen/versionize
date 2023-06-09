import path from 'path'
import { packageDirectorySync } from 'pkg-dir'
import { readFromPackageFile, sanitizeVersions } from './utils.js'

export const getCurrentVersion = ({ cwd } = {}) => {
  const dir = packageDirectorySync({ cwd })
  if (!dir) throw Error('Not in package directory')

  const pkgPath = path.join(dir, 'package.json')
  const mftPath = path.join(dir, 'manifest.json')

  const pkg = readFromPackageFile(pkgPath)
  const mft = readFromPackageFile(mftPath) || {}

  const versions = {
    pkg: pkg.version,
    mft: mft.version
  }

  sanitizeVersions(versions)

  return versions.mft
}
