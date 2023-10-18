import tap from 'tap'
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

tap.test('Succeeding API calls', async (t) => {
  let CWD
  t.beforeEach(() => {
    CWD = temporaryDirectory()
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })
    execSync('git init', { cwd: CWD, stdio: 'ignore' })
  })
  t.afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  t.test(`bumpVersion('latest')`, async (t) => {
    const result = await bumpVersion('latest', { cwd: CWD })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.4.0-3', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    t.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')
  })

  t.test(`bumpVersion('latest', { commit: true })`, async (t) => {
    const result = await bumpVersion('latest', { cwd: CWD, commit: true })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.4.0-3', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    t.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    t.equal(commitBuffer.toString(), 'v0.4.0-3\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    t.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  t.test(`bumpVersion('latest', { tag: true })`, async (t) => {
    const result = await bumpVersion('latest', { cwd: CWD, tag: true })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.4.0-3', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    t.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    t.equal(commitBuffer.toString(), 'v0.4.0-3\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    t.equal(tagsBuffer.toString(), 'v0.4.0-3\n', 'has set correct git tag')
  })

  t.test(`bumpVersion('stable')`, async (t) => {
    const result = await bumpVersion('stable', { cwd: CWD })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.4.0', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    t.equal(mft.version, '0.4.0', 'does increment version in manifest.json')
  })

  t.test(`bumpVersion('stable', { commit: true })`, async (t) => {
    const result = await bumpVersion('stable', { cwd: CWD, commit: true })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.4.0', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    t.equal(mft.version, '0.4.0', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    t.equal(commitBuffer.toString(), 'v0.4.0\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    t.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  t.test(`bumpVersion('stable', { tag: true })`, async (t) => {
    const result = await bumpVersion('stable', { cwd: CWD, tag: true })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.4.0', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    t.equal(mft.version, '0.4.0', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    t.equal(commitBuffer.toString(), 'v0.4.0\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    t.equal(tagsBuffer.toString(), 'v0.4.0\n', 'has set correct git tag')
  })

  t.test(`bumpVersion('hotfix')`, async (t) => {
    const result = await bumpVersion('hotfix', { cwd: CWD })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.3.1', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    t.equal(mft.version, '0.3.1', 'does increment version in manifest.json')
  })

  t.test(`bumpVersion('hotfix', { commit: true })`, async (t) => {
    const result = await bumpVersion('hotfix', { cwd: CWD, commit: true })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.3.1', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    t.equal(mft.version, '0.3.1', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    t.equal(commitBuffer.toString(), 'v0.3.1\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    t.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  t.test(`bumpVersion('hotfix', { tag: true })`, async (t) => {
    const result = await bumpVersion('hotfix', { cwd: CWD, tag: true })
    t.equal(result.currentVersion, '0.4.0-2', 'returns correct current version')
    t.equal(result.newVersion, '0.3.1', 'returns correct new version')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    t.equal(mft.version, '0.3.1', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    t.equal(commitBuffer.toString(), 'v0.3.1\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    t.equal(tagsBuffer.toString(), 'v0.3.1\n', 'has set correct git tag')
  })
})
