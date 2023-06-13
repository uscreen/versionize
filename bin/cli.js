#!/usr/bin/env node

import { Argument, Command } from 'commander'
import { createRequire } from 'module'

import { getCurrentVersion, versionize, info, error } from '../src/utils.js'

const require = createRequire(import.meta.url)
const program = new Command()

/**
 * package.json content
 */
const { version } = require('../package.json')

/**
 * catch errors, if any
 */
const versionizeAction = (releaseType) => {
  try {
    if (!releaseType) {
      const version = getCurrentVersion()
      info(`Current version is ${version}`)
    } else {
      const version = versionize(releaseType)
      info(`New version to ${version}`)
    }
  } catch (e) {
    error(e)
  }
}

/**
 * define the command
 */
program
  .name('versionize')
  .description('CLI to versionize packages according to semver')
  .version(version)
  .addArgument(
    new Argument(
      '[releaseType]',
      'determines new version. If not given, current version will be displayed'
    ).choices(['latest', 'stable', 'hotfix'])
  )
  .action(versionizeAction)

program.parse(process.argv)
