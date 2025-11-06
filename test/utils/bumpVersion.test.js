import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { bumpVersion } from '../../src/utils.js'

const writeJSON = (dir, filename, content) => {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(content), {
    encoding: 'utf-8'
  })
}

const readJSON = (dir, filename) => {
  const content = fs.readFileSync(path.join(dir, filename), {
    encoding: 'utf-8'
  })

  return JSON.parse(content)
}

const existsFile = (dir, filename) => {
  return fs.existsSync(path.join(dir, filename))
}

describe('Bump version', () => {
  let CWD
  beforeEach(() => {
    CWD = temporaryDirectory()
  })
  afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  test('From directory without package.json and manifest.json', async () => {
    let error = null
    try {
      bumpVersion('stable', { cwd: CWD })
    } catch (e) {
      error = e
    }

    assert.ok(error, 'throws error')
    assert.equal(error.message, 'Not in package directory', 'with correct message')

    const pkgExists = existsFile(CWD, 'package.json')
    const mftExists = existsFile(CWD, 'manifest.json')

    assert.ok(!pkgExists, 'does not create package.json')
    assert.ok(!mftExists, 'does not create manifest.json')
  })

  test('From directory without version in package.json and manifest.json', async () => {
    writeJSON(CWD, 'package.json', {})
    writeJSON(CWD, 'manifest.json', {})

    let error = null
    try {
      bumpVersion('stable', { cwd: CWD })
    } catch (e) {
      error = e
    }

    assert.ok(error, 'throws error')
    assert.equal(
      error.message,
      'Could not read version from package.json',
      'with correct message'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.ok(!pkg.version, 'does not add version to package.json')
    assert.ok(!mft.version, 'does not add version to manifest.json')
  })

  test('From directory with version in package.json and no manifest.json', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })

    let error = null
    try {
      bumpVersion('stable', { cwd: CWD })
    } catch (e) {
      error = e
    }

    assert.ok(!error, 'does not throw error')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(
      mft.version,
      '0.4.0',
      'does create manifest.json with incremented version'
    )
  })

  test('From directory with version in package.json and no version in manifest.json', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', {})

    let error = null
    try {
      bumpVersion('stable', { cwd: CWD })
    } catch (e) {
      error = e
    }

    assert.ok(!error, 'does not throw error')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(
      mft.version,
      '0.4.0',
      'does add incremented version to manifest.json'
    )
  })

  test('From directory with versions in package.json and manifest.json', async () => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

    let error = null
    try {
      bumpVersion('stable', { cwd: CWD })
    } catch (e) {
      error = e
    }

    assert.ok(!error, 'does not throw error')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(mft.version, '0.4.0', 'does increment version in manifest.json')
  })
})