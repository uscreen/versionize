import tap from 'tap'
import fs from 'fs'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { getCurrentVersion } from '../src/index.js'

const writeJSON = (dir, filename, content) => {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(content), {
    encoding: 'utf-8'
  })
}

tap.test('Get current version', async (t) => {
  let CWD
  t.beforeEach(() => {
    CWD = temporaryDirectory()
  })
  t.afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  t.test('From directory without package.json and manifest.json', async (t) => {
    let version = null
    let error = null
    try {
      version = getCurrentVersion({ cwd: CWD })
    } catch (e) {
      error = e
    }

    t.ok(error, 'throws error')
    t.notOk(version, 'does not return version')
  })

  t.test(
    'From directory without version in package.json and manifest.json',
    async (t) => {
      writeJSON(CWD, 'package.json', {})
      writeJSON(CWD, 'manifest.json', {})

      let version = null
      let error = null
      try {
        version = getCurrentVersion({ cwd: CWD })
      } catch (e) {
        error = e
      }

      t.ok(error, 'throws error')
      t.notOk(version, 'does not return version')
    }
  )

  t.test(
    'From directory with version in package.json and no manifest.json',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })

      const version = getCurrentVersion({ cwd: CWD })
      t.equal(version, '0.3.0', 'returns version from package.json')
    }
  )

  t.test(
    'From directory with version in package.json and no version in manifest.json',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', {})

      const version = getCurrentVersion({ cwd: CWD })
      t.equal(version, '0.3.0', 'returns version from package.json')
    }
  )

  t.test(
    'From directory with versions in package.json and manifest.json',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

      const version = getCurrentVersion({ cwd: CWD })
      t.equal(version, '0.4.0-2', 'returns version from manifest.json')
    }
  )
})
