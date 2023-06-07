#!/usr/bin/env node

import { Argument, Command } from 'commander'
import { createRequire } from 'module'

import { versionize, error } from '../src/utils.js'

const require = createRequire(import.meta.url)
const program = new Command()

/**
 * package.json content
 */
const { version } = require('../package.json')

/**
 * catch errors, if any
 */
const versionizeAction = (incType) => {
  try {
    versionize(incType)
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
    new Argument('<incType>', 'type of version increase').choices([
      'latest',
      'stable',
      'hotfix'
    ])
  )
  .action(versionizeAction)

program.parse(process.argv)
