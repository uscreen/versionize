#!/usr/bin/env node

import { Argument, Command, Option } from 'commander'
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
const versionizeAction = (releaseType, { raw = false }) => {
  try {
    if (!releaseType) {
      const version = getCurrentVersion()
      if (raw) return console.log(version)

      info(`Current version is ${version}`)
    } else {
      const { currentVersion, newVersion } = versionize(releaseType)
      if (raw) return console.log(newVersion)

      info(`Current version is ${currentVersion}`)
      info(`New version is ${newVersion}`)
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
  .addOption(new Option('--raw', 'raw output'))
  .action(versionizeAction)

program.parse(process.argv)
