import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { writeToPackageFile } from '../../src/utils.js'

let CWD
before(() => {
  CWD = temporaryDirectory()
})
after(() => {
  fs.rmSync(CWD, { recursive: true })
})

test('Write to package file', () => {
  writeToPackageFile(path.join(CWD, 'manifest.json'), { version: '0.1.0' })

  const content = fs.readFileSync(path.join(CWD, 'manifest.json'), {
    encoding: 'utf-8'
  })

  assert.ok(content.endsWith('\n'), 'writes newline at end of file')
})