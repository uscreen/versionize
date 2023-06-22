import tap from 'tap'
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
      `node ${path.resolve(__dirname, '../bin/cli.js')} ${args.join(' ')}`,
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

tap.test('CLI', async (t) => {
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

  t.test('$ versionize', async (t) => {
    const result = await cli([], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\n',
      'expected stdout'
    )
  })

  t.test('$ versionize --raw', async (t) => {
    const result = await cli(['--raw'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(result.stdout, '0.4.0-2\n', 'expected stdout')
  })

  t.test('$ versionize latest', async (t) => {
    const result = await cli(['latest'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    t.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')
  })

  t.test('$ versionize latest --raw', async (t) => {
    const result = await cli(['latest', '--raw'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(result.stdout, '0.4.0-3\n', 'expected stdout')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    t.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')
  })

  t.test('$ versionize latest --tag', async (t) => {
    const result = await cli(['latest', '--tag'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.0', 'does not increment version in package.json')
    t.equal(mft.version, '0.4.0-3', 'does increment version in manifest.json')

    const buffer = execSync('git describe --tags', { cwd: CWD })
    t.equal(buffer.toString(), 'v0.4.0-3\n', 'has set correct git tag')
  })

  t.test('$ versionize stable', async (t) => {
    const result = await cli(['stable'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    t.equal(mft.version, '0.4.0', 'does increment version in manifest.json')
  })

  t.test('$ versionize stable --raw', async (t) => {
    const result = await cli(['stable', '--raw'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(result.stdout, '0.4.0\n', 'expected stdout')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    t.equal(mft.version, '0.4.0', 'does increment version in manifest.json')
  })

  t.test('$ versionize stable --tag', async (t) => {
    const result = await cli(['stable', '--tag'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
    t.equal(mft.version, '0.4.0', 'does increment version in manifest.json')

    const buffer = execSync('git describe --tags', { cwd: CWD })
    t.equal(buffer.toString(), 'v0.4.0\n', 'has set correct git tag')
  })

  t.test('$ versionize hotfix', async (t) => {
    const result = await cli(['hotfix'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.3.1\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    t.equal(mft.version, '0.3.1', 'does increment version in manifest.json')
  })

  t.test('$ versionize hotfix --raw', async (t) => {
    const result = await cli(['hotfix', '--raw'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(result.stdout, '0.3.1\n', 'expected stdout')

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    t.equal(mft.version, '0.3.1', 'does increment version in manifest.json')
  })

  t.test('$ versionize hotfix --tag', async (t) => {
    const result = await cli(['hotfix', '--tag'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.3.1\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    t.equal(mft.version, '0.3.1', 'does increment version in manifest.json')

    const buffer = execSync('git describe --tags', { cwd: CWD })
    t.equal(buffer.toString(), 'v0.3.1\n', 'has set correct git tag')
  })

  t.test('$ versionize hotfix --tag', async (t) => {
    const result = await cli(['hotfix', '--tag'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, '', 'no stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.3.1\n',
      'expected stdout'
    )

    const pkg = readJSON(CWD, 'package.json')
    const mft = readJSON(CWD, 'manifest.json')

    t.equal(pkg.version, '0.3.1', 'does increment version in package.json')
    t.equal(mft.version, '0.3.1', 'does increment version in manifest.json')

    const buffer = execSync('git describe --tags', { cwd: CWD })
    t.equal(buffer.toString(), 'v0.3.1\n', 'has set correct git tag')
  })
})
