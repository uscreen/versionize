#!/usr/bin/env node

import { createRequire } from 'node:module'
import process from 'node:process'
import { Argument, Command, Option } from 'commander'

import {
  bumpVersion,
  error,
  execCommit,
  execCommitAndTag,
  getCurrentVersion,
  info,
  releaseTypes,
  warn
} from '../src/utils.js'

const require = createRequire(import.meta.url)
const program = new Command()

/**
 * package.json content
 */
const { version } = require('../package.json')

/**
 * catch errors, if any
 */
const versionizeAction = (
  releaseType,
  { raw = false, commit = false, tag = false }
) => {
  try {
    if (!releaseType) {
      const version = getCurrentVersion()
      if (raw) {
        return console.log(version)
      }

      info(`Current version is ${version}`)
    }
    else {
      const { currentVersion, newVersion, files } = bumpVersion(releaseType)

      try {
        if (tag) {
          execCommitAndTag(newVersion, files)
        }
        else if (commit) {
          execCommit(newVersion, files)
        }
      }
      catch {
        warn('git execution failed')
      }

      if (raw) {
        return console.log(newVersion)
      }

      info(`Current version is ${currentVersion}`)
      info(`New version is ${newVersion}`)
    }
  }
  catch (e) {
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
    ).choices(releaseTypes)
  )
  .addOption(new Option('--commit', 'commit changes to git'))
  .addOption(new Option('--tag', 'commit changes to git and tag new commit'))
  .addOption(new Option('--raw', 'raw output'))
  .action(versionizeAction)

program.parse(process.argv)
