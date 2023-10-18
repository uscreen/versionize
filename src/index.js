import {
  bumpVersion as _bumpVersion,
  releaseTypes,
  execCommit,
  execCommitAndTag
} from './utils.js'

export { getCurrentVersion } from './utils.js'

export const bumpVersion = (
  releaseType,
  { commit = false, tag = false, cwd } = {}
) => {
  if (!releaseTypes.includes(releaseType)) {
    throw Error('Invalid release type')
  }

  const { currentVersion, newVersion, files } = _bumpVersion(releaseType, {
    cwd
  })

  if (tag) execCommitAndTag(newVersion, files, { cwd })
  else if (commit) execCommit(newVersion, files, { cwd })

  return { currentVersion, newVersion }
}
