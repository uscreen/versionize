import tap from 'tap'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { temporaryDirectory } from 'tempy'
import { exec } from 'child_process'

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

tap.test('CLI Fails', async (t) => {
  let CWD

  t.beforeEach(() => {
    CWD = temporaryDirectory()
  })
  t.afterEach(() => {
    fs.rmSync(CWD, { recursive: true })
  })

  t.test(
    '$ versionize latest --commit, but with inconsistent versions',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

      const result = await cli(['latest', '--commit'], CWD)
      t.not(result.code, 0, 'code !== 0')
      t.equal(
        result.stderr,
        'error Versions in package.json and manifest.json are inconsistent\n',
        'expected stderr'
      )
      t.equal(result.stdout, '', 'expected stdout')
    }
  )
  t.test(
    '$ versionize latest --commit, but without git repository',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

      const result = await cli(['latest', '--commit'], CWD)
      t.equal(result.code, 0, 'code 0')
      t.equal(result.stderr, 'warning Could not `git add`\n', 'expected stderr')
      t.equal(
        result.stdout,
        'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
        'expected stdout'
      )
    }
  )

  t.test(
    '$ versionize latest --tag, but with inconsistent versions',
    async (t) => {
      writeJSON(CWD, 'package.json', { version: '0.3.0' })
      writeJSON(CWD, 'manifest.json', { version: '0.5.0-2' })

      const result = await cli(['latest', '--tag'], CWD)
      t.not(result.code, 0, 'code !== 0')
      t.equal(
        result.stderr,
        'error Versions in package.json and manifest.json are inconsistent\n',
        'expected stderr'
      )
      t.equal(result.stdout, '', 'expected stdout')
    }
  )
  t.test('$ versionize latest --tag, but without git repository', async (t) => {
    writeJSON(CWD, 'package.json', { version: '0.3.0' })
    writeJSON(CWD, 'manifest.json', { version: '0.4.0-2' })

    const result = await cli(['latest', '--tag'], CWD)
    t.equal(result.code, 0, 'code 0')
    t.equal(result.stderr, 'warning Could not `git add`\n', 'expected stderr')
    t.equal(
      result.stdout,
      'info Current version is 0.4.0-2\ninfo New version is 0.4.0-3\n',
      'expected stdout'
    )
  })
})
