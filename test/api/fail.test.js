import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { bumpVersion } from '../../src/index.js'

// for easy string testing: disable color output of chalk
process.env.FORCE_COLOR = 0

const writeJSON = (dir, filename, content) => {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(content), {
    encoding: 'utf-8'
  })
}

describe('Failing API calls', () => {
  let CWD

  beforeEach(() => {
    CWD = temporaryDirectory()
  })
  afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  test('versionize without release type', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    try {
      bumpVersion(null, { cwd: CWD })
      assert.fail('should throw error')
    } catch (e) {
      assert.equal(e.message, 'Invalid release type', 'with expected message')
    }
  })

  test('versionize latest, but with inconsistent versions', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    try {
      bumpVersion('latest', { cwd: CWD })
      assert.fail('should throw error')
    } catch (e) {
      assert.equal(
        e.message,
        'Versions in package.json and manifest.json are inconsistent',
        'with expected message'
      )
    }
  })

  test('versionize latest with commit, but with inconsistent versions', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    try {
      bumpVersion('latest', { commit: true, cwd: CWD })
      assert.fail('should throw error')
    } catch (e) {
      assert.equal(
        e.message,
        'Versions in package.json and manifest.json are inconsistent',
        'with expected message'
      )
    }
  })

  test('versionize latest with commit, but without git repository', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

    try {
      bumpVersion('latest', { commit: true, cwd: CWD })
      assert.fail('should throw error')
    } catch (e) {
      assert.equal(e.message, 'Git execution failed', 'with expected message')
    }
  })

  test('versionize latest with tag, but with inconsistent versions', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    try {
      bumpVersion('latest', { tag: true, cwd: CWD })
      assert.fail('should throw error')
    } catch (e) {
      assert.equal(
        e.message,
        'Versions in package.json and manifest.json are inconsistent',
        'with expected message'
      )
    }
  })

  test('versionize latest with tag, but without git repository', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

    try {
      bumpVersion('latest', { tag: true, cwd: CWD })
      assert.fail('should throw error')
    } catch (e) {
      assert.equal(e.message, 'Git execution failed', 'with expected message')
    }
  })
})