import tap from 'tap'
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

tap.test('Failing API calls', async (t) => {
  let CWD

  t.beforeEach(() => {
    CWD = temporaryDirectory()
  })
  t.afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  t.test('versionize without release type', async (t) => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    try {
      bumpVersion(null, { cwd: CWD })
      t.fail('should throw error')
    } catch (e) {
      t.pass('should throw error')
      t.equal(e.message, 'Invalid release type', 'with expected message')
    }
  })

  t.test('versionize latest, but with inconsistent versions', async (t) => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

    try {
      bumpVersion('latest', { cwd: CWD })
      t.fail('should throw error')
    } catch (e) {
      t.pass('should throw error')
      t.equal(
        e.message,
        'Versions in package.json and manifest.json are inconsistent',
        'with expected message'
      )
    }
  })

  t.test(
    'versionize latest with commit, but with inconsistent versions',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

      try {
        bumpVersion('latest', { commit: true, cwd: CWD })
      } catch (e) {
        t.pass('should throw error')
        t.equal(
          e.message,
          'Versions in package.json and manifest.json are inconsistent',
          'with expected message'
        )
      }
    }
  )

  t.test(
    'versionize latest with commit, but without git repository',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

      try {
        bumpVersion('latest', { commit: true, cwd: CWD })
      } catch (e) {
        t.pass('should throw error')
        t.equal(e.message, 'Git execution failed', 'with expected message')
      }
    }
  )

  t.test(
    'versionize latest with tag, but with inconsistent versions',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

      try {
        bumpVersion('latest', { tag: true, cwd: CWD })
      } catch (e) {
        t.pass('should throw error')
        t.equal(
          e.message,
          'Versions in package.json and manifest.json are inconsistent',
          'with expected message'
        )
      }
    }
  )

  t.test(
    'versionize latest with tag, but without git repository',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

      try {
        bumpVersion('latest', { tag: true, cwd: CWD })
      } catch (e) {
        t.pass('should throw error')
        t.equal(e.message, 'Git execution failed', 'with expected message')
      }
    }
  )
})
