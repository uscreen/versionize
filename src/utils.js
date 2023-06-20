import fs from 'fs'
import path from 'path'
import { packageDirectorySync } from 'pkg-dir'
import chalk from 'chalk'
import semver from 'semver'
import { execSync } from 'child_process'

export const info = (message) => {
  console.log(`${chalk.blue('info')} ${message}`)
}

export const warn = (message) => {
  console.error(`${chalk.yellow('warning')} ${message}`)
}

export const error = (e) => {
  console.error(`${chalk.red('error')} ${e.message}`)
  process.exit(e.code || 1)
}

export const readFromPackageFile = (src) => {
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

export const incrementVersions = (versions, releaseType) => {
  if (releaseType === 'stable') {
    const result = semver.inc(versions.pkg, 'minor')
    return { pkg: result, mft: result }
  }
  if (releaseType === 'hotfix') {
    const result = semver.inc(versions.pkg, 'patch')
    return { pkg: result, mft: result }
  }
  if (releaseType === 'latest') {
    const release = semver.prerelease(versions.mft) ? 'prerelease' : 'preminor'

    const result = semver.inc(versions.mft, release)
    return { pkg: versions.pkg, mft: result }
  }

  throw Error('Invalid releaseType')
}

const readPackagesAndVersions = ({ cwd } = {}) => {
  const dir = packageDirectorySync({ cwd })
  if (!dir) throw Error('Not in package directory')

  const paths = {
    pkg: path.join(dir, 'package.json'),
    mft: path.join(dir, 'manifest.json')
  }

  const data = {
    pkg: readFromPackageFile(paths.pkg),
    mft: readFromPackageFile(paths.mft) || {}
  }

  if (!data.pkg) throw Error('package.json not found')

  const versions = {
    pkg: data.pkg.version,
    mft: data.mft.version
  }

  sanitizeVersions(versions)

  return { versions, paths, data }
}

const writePackagesAndVersions = ({ versions, paths, data }) => {
  data.pkg.version = versions.pkg
  data.mft.version = versions.mft

  writeToPackageFile(paths.pkg, data.pkg)
  writeToPackageFile(paths.mft, data.mft)
}

const tryGit = (args = []) => {
  try {
    execSync(`git ${args.join(' ')}`, { stdio: 'ignore' })
    return true
  } catch (e) {
    warn(`Could not \`git ${args[0]}\``)
    return false
  }
}

export const tryCommitAndTag = (tag, files) => {
  return (
    tryGit(['add', ...files]) &&
    tryGit(['commit', '-m', tag]) &&
    tryGit(['tag', tag, 'HEAD'])
  )
}

export const versionize = (releaseType, { cwd } = {}) => {
  const { versions, paths, data } = readPackagesAndVersions({ cwd })

  const newVersions = incrementVersions(versions, releaseType)
  writePackagesAndVersions({ versions: newVersions, paths, data })

  return {
    currentVersion: versions.mft,
    newVersion: newVersions.mft,
    files: Object.values(paths)
  }
}

export const getCurrentVersion = ({ cwd } = {}) => {
  const { versions } = readPackagesAndVersions({ cwd })

  return versions.mft
}
