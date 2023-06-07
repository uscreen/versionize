import fs from 'fs'
import path from 'path'
import { packageDirectorySync } from 'pkg-dir'
import chalk from 'chalk'
import semver from 'semver'

export const error = (e) => {
  console.error(chalk.red(`ERROR: ${e.message}\n`))
  process.exit(e.code || 1)
}

const readFromPackageFile = (src) => {
  if (!fs.existsSync(src)) return null

  const content = fs.readFileSync(src, { encoding: 'utf-8' })
  return JSON.parse(content)
}

const writeToPackageFile = (src, data) => {
  const content = JSON.stringify(data, null, 2)
  fs.writeFileSync(src, content, { encoding: 'utf-8' })
}

export const sanitizeVersions = (versions) => {
  if (!versions.pkg) throw Error('Could not read version from package.json')

  if (!semver.valid(versions.pkg))
    throw Error('Version in package.json invalid')

  if (!versions.mft) versions.mft = versions.pkg

  if (!semver.valid(versions.mft))
    throw Error('Version in manifest.json invalid')

  if (versions.mft === versions.pkg) return

  if (
    semver.lt(versions.pkg, versions.mft) &&
    semver.lt(versions.mft, semver.inc(versions.pkg, 'minor'))
  )
    return

  throw Error('Versions in package.json and manifest.json are inconsistent')
}

export const incrementVersions = (versions, incType) => {
  if (incType === 'stable') {
    const result = semver.inc(versions.pkg, 'minor')
    return { pkg: result, mft: result }
  }
  if (incType === 'hotfix') {
    const result = semver.inc(versions.pkg, 'patch')
    return { pkg: result, mft: result }
  }
  if (incType === 'latest') {
    const release = semver.prerelease(versions.mft) ? 'prerelease' : 'preminor'

    const result = semver.inc(versions.mft, release)
    return { pkg: versions.pkg, mft: result }
  }

  throw Error('Invalid incType')
}

export const versionize = (incType, { cwd } = {}) => {
  const dir = packageDirectorySync({ cwd })
  if (!dir) throw Error('Not in package directory')

  const pkgPath = path.join(dir, 'package.json')
  const mftPath = path.join(dir, 'manifest.json')

  const pkg = readFromPackageFile(pkgPath)
  const mft = readFromPackageFile(mftPath) || {}

  if (!pkg) throw Error('package.json not found')

  const versions = {
    pkg: pkg.version,
    mft: mft.version
  }

  sanitizeVersions(versions)

  const newVersions = incrementVersions(versions, incType)

  pkg.version = newVersions.pkg
  mft.version = newVersions.mft

  writeToPackageFile(pkgPath, pkg)
  writeToPackageFile(mftPath, mft)
}
