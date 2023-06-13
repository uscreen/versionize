import tap from 'tap'
import { sanitizeVersions, incrementVersions } from '../src/utils.js'

const increment = (packageVersion, manifestVersion, releaseType) => {
  const versions = {
    pkg: packageVersion,
    mft: manifestVersion
  }
  sanitizeVersions(versions)
  return incrementVersions(versions, releaseType)
}

const testRun = async (
  t,
  packageVersion,
  manifestVersion,
  releaseType,
  expectedPackageVersion,
  expectedManifestVersion
) => {
  const vs = increment(packageVersion, manifestVersion, releaseType)
  return t.test(`Calling <${releaseType}>...`, async (t) => {
    t.equal(
      vs.pkg,
      expectedPackageVersion,
      `package.json : ${packageVersion} -> ${expectedPackageVersion}`
    )
    t.equal(
      vs.mft,
      expectedManifestVersion,
      `manifest.json: ${
        manifestVersion || 'empty'
      } -> ${expectedManifestVersion}`
    )
  })
}

const testRunConflict = async (
  t,
  packageVersion,
  manifestVersion,
  releaseType,
  expectedError
) => {
  return t.test(
    `Calling <${releaseType}> on ${packageVersion || 'empty'} [${
      manifestVersion || 'empty'
    }]...`,
    async (t) => {
      let error = null
      let vs = null
      try {
        vs = increment(packageVersion, manifestVersion, releaseType)
      } catch (e) {
        error = e
      }
      t.ok(error, 'An error was thrown')
      t.same(error.message, expectedError, 'Error message ok')
      t.notOk(vs, 'Versions were not incremented')
    }
  )
}

const working = [
  // increment version by 'latest' on multiple consistent version sets:
  ['0.0.0', null, 'latest', '0.0.0', '0.1.0-0'],
  ['0.0.0', '0.0.0', 'latest', '0.0.0', '0.1.0-0'],
  ['0.0.0', '0.1.0-0', 'latest', '0.0.0', '0.1.0-1'],
  ['0.1.0', '0.1.0', 'latest', '0.1.0', '0.2.0-0'],
  ['0.1.0', '0.2.0-0', 'latest', '0.1.0', '0.2.0-1'],
  ['0.1.1', '0.1.1', 'latest', '0.1.1', '0.2.0-0'],
  ['0.1.1', '0.2.0-0', 'latest', '0.1.1', '0.2.0-1'],

  // increment version by 'stable' on multiple consistent version sets:
  ['0.0.0', null, 'stable', '0.1.0', '0.1.0'],
  ['0.0.0', '0.0.0', 'stable', '0.1.0', '0.1.0'],
  ['0.0.0', '0.1.0-0', 'stable', '0.1.0', '0.1.0'],
  ['0.1.0', '0.1.0', 'stable', '0.2.0', '0.2.0'],
  ['0.1.0', '0.2.0-0', 'stable', '0.2.0', '0.2.0'],
  ['0.1.1', '0.1.1', 'stable', '0.2.0', '0.2.0'],
  ['0.1.1', '0.2.0-0', 'stable', '0.2.0', '0.2.0'],

  // increment version by 'hotfix' on multiple consistent version sets:
  ['0.0.0', null, 'hotfix', '0.0.1', '0.0.1'],
  ['0.0.0', '0.0.0', 'hotfix', '0.0.1', '0.0.1'],
  ['0.0.0', '0.1.0-0', 'hotfix', '0.0.1', '0.0.1'],
  ['0.1.0', '0.1.0', 'hotfix', '0.1.1', '0.1.1'],
  ['0.1.0', '0.2.0-0', 'hotfix', '0.1.1', '0.1.1'],
  ['0.1.1', '0.1.1', 'hotfix', '0.1.2', '0.1.2'],
  ['0.1.1', '0.2.0-0', 'hotfix', '0.1.2', '0.1.2'],

  // increment version on some minimally inconsistent version sets:
  ['0.1.0', '0.1.1-0', 'latest', '0.1.0', '0.1.1-1'],
  ['0.1.0', '0.1.1-1', 'latest', '0.1.0', '0.1.1-2'],
  ['0.1.0', '0.1.1-0', 'stable', '0.2.0', '0.2.0'],
  ['0.1.0', '0.1.1-1', 'stable', '0.2.0', '0.2.0'],
  ['0.1.0', '0.1.1-0', 'hotfix', '0.1.1', '0.1.1'],
  ['0.1.0', '0.1.1-1', 'hotfix', '0.1.1', '0.1.1']
]

// increment version on more inconsistent version sets:
const conflicts = [
  [null, '0.0.0', 'latest', 'Could not read version from package.json'],
  [null, '0.0.0', 'stable', 'Could not read version from package.json'],
  [null, '0.0.0', 'hotfix', 'Could not read version from package.json'],

  ['notvalid', '0.0.0', 'latest', 'Version in package.json invalid'],
  ['notvalid', '0.0.0', 'stable', 'Version in package.json invalid'],
  ['notvalid', '0.0.0', 'notfix', 'Version in package.json invalid'],

  ['0.0.0', 'invalid', 'latest', 'Version in manifest.json invalid'],
  ['0.0.0', 'invalid', 'stable', 'Version in manifest.json invalid'],
  ['0.0.0', 'invalid', 'notfix', 'Version in manifest.json invalid'],

  [
    '0.0.0',
    '0.2.0',
    'latest',
    'Versions in package.json and manifest.json are inconsistent'
  ],
  [
    '0.0.0',
    '0.1.1',
    'latest',
    'Versions in package.json and manifest.json are inconsistent'
  ],
  [
    '0.0.0',
    '0.2.0-0',
    'latest',
    'Versions in package.json and manifest.json are inconsistent'
  ],
  [
    '0.2.0',
    '0.1.0-0',
    'latest',
    'Versions in package.json and manifest.json are inconsistent'
  ],
  [
    '0.2.0',
    '0.2.0-0',
    'latest',
    'Versions in package.json and manifest.json are inconsistent'
  ]
]

tap.test('Incrementing given consistent versions', async (t) => {
  for (const test of working) {
    testRun(t, ...test)
  }
})

tap.test('Incrementing given inconsistent versions', async (t) => {
  for (const test of conflicts) {
    testRunConflict(t, ...test)
  }
})
