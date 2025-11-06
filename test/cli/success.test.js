import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { temporaryDirectory } from 'tempy'
import { exec, execSync } from 'child_process'

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

const readJSON = (dir, filename) => {
  const content = fs.readFileSync(path.join(dir, filename), {
    encoding: 'utf-8'
  })

  return JSON.parse(content)
}

describe('Succeeding CLI calls', () => {
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

  test('$ versionize', async () => {
    const result = await cli([], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\n',
      'expected stdout'
    )
  })

  test('$ versionize --raw', async () => {
    const result = await cli(['--raw'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(result.stdout, '0.4.0-2\n', 'expected stdout')
  })

  test('$ versionize latest', async () => {
    const result = await cli(['latest'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    assert.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')
  })

  test('$ versionize latest --raw', async () => {
    const result = await cli(['latest', '--raw'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(result.stdout, '0.4.0-3\n', 'expected stdout')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    assert.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')
  })

  test('$ versionize latest --commit', async () => {
    const result = await cli(['latest', '--commit'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    assert.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.4.0-3\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  test('$ versionize latest --tag', async () => {
    const result = await cli(['latest', '--tag'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    assert.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.4.0-3\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), 'v0.4.0-3\n', 'has set correct git tag')
  })

  test('$ versionize stable', async () => {
    const result = await cli(['stable'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(mft.version, '0.4.0', 'does increment version in manifest.json')
  })

  test('$ versionize stable --raw', async () => {
    const result = await cli(['stable', '--raw'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(result.stdout, '0.4.0\n', 'expected stdout')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(mft.version, '0.4.0', 'does increment version in manifest.json')
  })

  test('$ versionize stable --commit', async () => {
    const result = await cli(['stable', '--commit'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(mft.version, '0.4.0', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.4.0\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  test('$ versionize stable --tag', async () => {
    const result = await cli(['stable', '--tag'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    assert.equal(mft.version, '0.4.0', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.4.0\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), 'v0.4.0\n', 'has set correct git tag')
  })

  test('$ versionize hotfix', async () => {
    const result = await cli(['hotfix'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.3.1\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    assert.equal(mft.version, '0.3.1', 'does increment version in manifest.json')
  })

  test('$ versionize hotfix --raw', async () => {
    const result = await cli(['hotfix', '--raw'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(result.stdout, '0.3.1\n', 'expected stdout')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    assert.equal(mft.version, '0.3.1', 'does increment version in manifest.json')
  })

  test('$ versionize hotfix --commit', async () => {
    const result = await cli(['hotfix', '--commit'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.3.1\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    assert.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    assert.equal(mft.version, '0.3.1', 'does increment version in manifest.json')

    const commitBuffer = execSync('git log -1 --pretty=%B | cat', { cwd: CWD })
    assert.equal(commitBuffer.toString(), 'v0.3.1\n\n', 'has committed changes')

    const tagsBuffer = execSync('git tag', { cwd: CWD })
    assert.equal(tagsBuffer.toString(), '', 'has not set git tag')
  })

  test('$ versionize hotfix --tag', async () => {
    const result = await cli(['hotfix', '--tag'], CWD)
    assert.equal(result.code, 0, 'code 0')
    assert.equal(result.stderr, '', 'no stderr')
    assert.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.3.1\n',
      'expected stdout'
    )

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