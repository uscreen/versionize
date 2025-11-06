import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { temporaryDirectory } from 'tempy'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// for easy string testing: disable color output of chalk
process.env.FORCE_COLOR = 0

export const cli = (args, cwd, env, timeout) => {
  env = { ...process.env, ...env }

  return new Promise((resolve) => {
    exec(
      `node ${path.resolve(__dirname, '../../bin/cli.js')} ${args.join(' ')}`,
      { cwd, env, timeout },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr
        })
      }
    )
  })
}

const writeJSON = (dir, filename, content) => {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(content), {
    encoding: 'utf-8'
  })
}

describe('Failing CLI calls', () => {
  let CWD

  beforeEach(() => {
    CWD = temporaryDirectory()
  })
  afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  test('$ versionize latest, but with inconsistent versions', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    const result = await cli(['latest'], CWD)
    assert.notEqual(result.code, 0, 'code !== 0')
    assert.equal(
      result.stderr,
      'error Versions in package.json and manifest.json are inconsistent\n',
      'expected stderr'
    )
    assert.equal(result.stdout, '', 'expected stdout')
  })

  test('$ versionize latest --commit, but with inconsistent versions', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    const result = await cli(['latest', '--commit'], CWD)
    assert.notEqual(result.code, 0, 'code !== 0')
    assert.equal(
      result.stderr,
      'error Versions in package.json and manifest.json are inconsistent\n',
      'expected stderr'
    )
    assert.equal(result.stdout, '', 'expected stdout')
  })

  test('$ versionize latest --commit, but without git repository', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

    const result = await cli(['latest', '--commit'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(
      result.stderr,
      'warning git execution failed\n',
      'expected stderr'
    )
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
      'expected stdout'
    )
  })

  test('$ versionize latest --tag, but with inconsistent versions', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    const result = await cli(['latest', '--tag'], CWD)
    assert.notEqual(result.code, 0, 'code !== 0')
    assert.equal(
      result.stderr,
      'error Versions in package.json and manifest.json are inconsistent\n',
      'expected stderr'
    )
    assert.equal(result.stdout, '', 'expected stdout')
  })

  test('$ versionize latest --tag, but without git repository', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

    const result = await cli(['latest', '--tag'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, 'warning git execution failed\n', 'expected stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
      'expected stdout'
    )
  })
})