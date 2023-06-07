import tap from 'tap'
import fs from 'fs'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { versionize } from '../src/utils.js'

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

tap.test('Versionize package', async (t) => {
  let CWD
  t.beforeEach(() => {
    CWD = temporaryDirectory()
  })
  t.afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  t.test('From directory without package.json & manifest.json', async (t) => {
    let error = null
    try {
      versionize('stable', { cwd: CWD })
    } catch (e) {
      error = e
    }

    t.ok(error, 'throws error')
    t.equal(error.message, 'Not in package directory', 'with correct message')

    const pkgExists = existsFile(CWD, 'package.json')
    const mftExists = existsFile(CWD, 'manifest.json')

    t.notOk(pkgExists, 'does not create package.json')
    t.notOk(mftExists, 'does not create manifest.json')
  })

  t.test(
    'From directory without version in package.json & manifest.json',
    async (t) => {
      writeJSON(CWD, 'package.json', {})
      writeJSON(CWD, 'manifest.json', {})

      let error = null
      try {
        versionize('stable', { cwd: CWD })
      } catch (e) {
        error = e
      }

      t.ok(error, 'throws error')
      t.equal(
        error.message,
        'Could not read version from package.json',
        'with correct message'
      )

      const pkg = readJSON(CWD, 'package.json')
      const mft = readJSON(CWD, 'manifest.json')

      t.notOk(pkg.version, 'does not add version to package.json')
      t.notOk(mft.version, 'does not add version to manifest.json')
    }
  )

  t.test(
    'From directory with version in package.json and no manifest.json',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })

      let error = null
      try {
        versionize('stable', { cwd: CWD })
      } catch (e) {
        error = e
      }

      t.notOk(error, 'does not throw error')

      const pkg = readJSON(CWD, 'package.json')
      const mft = readJSON(CWD, 'manifest.json')

      t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
      t.equal(
        mft.version,
        '0.4.0',
        'does create manifest.json with incremented version'
      )
    }
  )

  t.test(
    'From directory with version in package.json & no version in manifest.json',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', {})

      let error = null
      try {
        versionize('stable', { cwd: CWD })
      } catch (e) {
        error = e
      }

      t.notOk(error, 'does not throw error')

      const pkg = readJSON(CWD, 'package.json')
      const mft = readJSON(CWD, 'manifest.json')

      t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
      t.equal(
        mft.version,
        '0.4.0',
        'does add incremented version to manifest.json'
      )
    }
  )

  t.test(
    'From directory with versions in package.json & manifest.json',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

      let error = null
      try {
        versionize('stable', { cwd: CWD })
      } catch (e) {
        error = e
      }

      t.notOk(error, 'does not throw error')

      const pkg = readJSON(CWD, 'package.json')
      const mft = readJSON(CWD, 'manifest.json')

      t.equal(pkg.version, '0.4.0', 'does increment version in package.json')
      t.equal(mft.version, '0.4.0', 'does increment version in manifest.json')
    }
  )
})
