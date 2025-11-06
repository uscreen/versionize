import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { getCurrentVersion } from '../../src/index.js'

const writeJSON = (dir, filename, content) => {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(content), {
    encoding: 'utf-8'
  })
}

describe('Get current version', () => {
  let CWD
  beforeEach(() => {
    CWD = temporaryDirectory()
  })
  afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  test('From directory without package.json and manifest.json', async () => {
    let version = null
    let error = null
    try {
      version = getCurrentVersion({ cwd: CWD })
    } catch (e) {
      error = e
    }

    assert.ok(error, 'throws error')
    assert.ok(!version, 'does not return version')
  })

  test('From directory without version in package.json and manifest.json', async () => {
    writeJSON(CWD, 'package.json', {})
    writeJSON(CWD, 'manifest.json', {})

    let version = null
    let error = null
    try {
      version = getCurrentVersion({ cwd: CWD })
    } catch (e) {
      error = e
    }

    assert.ok(error, 'throws error')
    assert.ok(!version, 'does not return version')
  })

  test('From directory with version in package.json and no manifest.json', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })

    const version = getCurrentVersion({ cwd: CWD })
    assert.equal(version, '0.3.0', 'returns version from package.json')
  })

  test('From directory with version in package.json and no version in manifest.json', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', {})

    const version = getCurrentVersion({ cwd: CWD })
    assert.equal(version, '0.3.0', 'returns version from package.json')
  })

  test('From directory with versions in package.json and manifest.json', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

    const version = getCurrentVersion({ cwd: CWD })
    assert.equal(version, '0.4.0-2', 'returns version from manifest.json')
  })
})