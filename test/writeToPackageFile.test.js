import tap from 'tap'
import fs from 'fs'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { writeToPackageFile } from '../src/utils.js'

let CWD
tap.before(() => {
  CWD = temporaryDirectory()
})
tap.teardown(() => {
  fs.rmSync(CWD, { recursive: true })
})

tap.test('Write to package file', (t) => {
  writeToPackageFile(path.join(CWD, 'manifest.json'), { version: '0.1.0' })

  const content = fs.readFileSync(path.join(CWD, 'manifest.json'), {
    encoding: 'utf-8'
  })

  t.ok(content.endsWith('\n'), 'writes newline at end of file')

  t.end()
})
