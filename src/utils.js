import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { packageDirectorySync } from 'package-directory'
import semver from 'semver'

export const releaseTypes = ['major', 'minor', 'stable', 'patch', 'hotfix', 'latest']

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
  if (!fs.existsSync(src)) {
    return null
  }

  const content = fs.readFileSync(src, { encoding: 'utf-8' })
  return JSON.parse(content)
}

export const writeToPackageFile = (src, data) => {
  const content = `${JSON.stringify(data, null, 2)}\n`

  fs.writeFileSync(src, content, { encoding: 'utf-8' })
}

export const sanitizeVersions = (versions) => {
  if (!versions.pkg) {
    throw new Error('Could not read version from package.json')
  }

  if (!semver.valid(versions.pkg)) {
    throw new Error('Version in package.json invalid')
  }

  if (!versions.mft) {
    versions.mft = versions.pkg
  }

  if (!semver.valid(versions.mft)) {
    throw new Error('Version in manifest.json invalid')
  }

  if (versions.mft === versions.pkg) {
    return
  }

  if (
    semver.lt(versions.pkg, versions.mft)
    && semver.lt(versions.mft, semver.inc(versions.pkg, 'minor'))
  ) {
    return
  }

  throw new Error('Versions in package.json and manifest.json are inconsistent')
}

export const incrementVersions = (versions, releaseType) => {
  if (releaseType === 'major') {
    const result = semver.inc(versions.pkg, 'major')
    return { pkg: result, mft: result }
  }
  if (releaseType === 'stable' || releaseType === 'minor') {
    const result = semver.inc(versions.pkg, 'minor')
    return { pkg: result, mft: result }
  }
  if (releaseType === 'hotfix' || releaseType === 'patch') {
    const result = semver.inc(versions.pkg, 'patch')
    return { pkg: result, mft: result }
  }
  if (releaseType === 'latest') {
    const release = semver.prerelease(versions.mft) ? 'prerelease' : 'preminor'

    const result = semver.inc(versions.mft, release)
    return { pkg: versions.pkg, mft: result }
  }
  /* c8 ignore next */
  throw new Error('Invalid release type') // this should never happen
}

const readPackagesAndVersions = ({ cwd } = {}) => {
  const dir = packageDirectorySync({ cwd })
  if (!dir) {
    throw new Error('Not in package directory')
  }

  const paths = {
    pkg: path.join(dir, 'package.json'),
    mft: path.join(dir, 'manifest.json')
  }

  const data = {
    pkg: readFromPackageFile(paths.pkg),
    mft: readFromPackageFile(paths.mft) || {}
  }
  /* c8 ignore next 3 */
  if (!data.pkg) {
    throw new Error('package.json not found')
  } // this should never happen

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

const execGit = (args = [], { cwd }) => {
  try {
    execSync(`git ${args.join(' ')}`, { stdio: 'ignore', cwd })
  }
  catch {
    throw new Error('Git execution failed')
  }
}

export const execCommit = (version, files, { cwd } = {}) => {
  const tag = `v${version}`
  execGit(['add', ...files], { cwd })
  execGit(['commit', '-m', tag], { cwd })
}

export const execCommitAndTag = (version, files, { cwd } = {}) => {
  const tag = `v${version}`
  execGit(['add', ...files], { cwd })
  execGit(['commit', '-m', tag], { cwd })
  execGit(['tag', tag, 'HEAD'], { cwd })
}

export const bumpVersion = (releaseType, { cwd } = {}) => {
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
