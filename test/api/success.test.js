import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { bumpVersion } from '../../src/index.js'
import { execSync } from 'child_process'

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

describe('Succeeding API calls', () => {
  let CWD
  beforeEach(() => {
    CWD = temporaryDirectory()
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })
    execSync('git init', { cwd: CWD, stdio: 'ignore' })
  })
  afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  test(`bumpVersion('latest')`, async () => {
    const result = bumpVersion('latest', { cwd: CWD })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.4.0-3', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    assert.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')
  })

  test(`bumpVersion('latest', { commit: true })`, async () => {
    const result = bumpVersion('latest', { cwd: CWD, commit: true })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.4.0-3', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    assert.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.4.0-3\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  test(`bumpVersion('latest', { tag: true })`, async () => {
    const result = bumpVersion('latest', { cwd: CWD, tag: true })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.4.0-3', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    assert.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.4.0-3\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), 'v0.4.0-3\n', 'has set correct git tag')
  })

  test(`bumpVersion('stable')`, async () => {
    const result = bumpVersion('stable', { cwd: CWD })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.4.0', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(mft.version, '0.4.0', 'does increment version in manifest.json')
  })

  test(`bumpVersion('stable', { commit: true })`, async () => {
    const result = bumpVersion('stable', { cwd: CWD, commit: true })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.4.0', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(mft.version, '0.4.0', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.4.0\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  test(`bumpVersion('stable', { tag: true })`, async () => {
    const result = bumpVersion('stable', { cwd: CWD, tag: true })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.4.0', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(mft.version, '0.4.0', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.4.0\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), 'v0.4.0\n', 'has set correct git tag')
  })

  test(`bumpVersion('hotfix')`, async () => {
    const result = bumpVersion('hotfix', { cwd: CWD })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.3.1', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    assert.equal(mft.version, '0.3.1', 'does increment version in manifest.json')
  })

  test(`bumpVersion('hotfix', { commit: true })`, async () => {
    const result = bumpVersion('hotfix', { cwd: CWD, commit: true })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.3.1', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    assert.equal(mft.version, '0.3.1', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.3.1\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  test(`bumpVersion('hotfix', { tag: true })`, async () => {
    const result = bumpVersion('hotfix', { cwd: CWD, tag: true })
    assert.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    assert.equal(result.newVersion, '0.3.1', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    assert.equal(mft.version, '0.3.1', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.3.1\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), 'v0.3.1\n', 'has set correct git tag')
  })
})