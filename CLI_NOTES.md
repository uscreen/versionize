
❯ versionize --help
Usage: versionize [options] [releaseType]

CLI to versionize packages according to semver

Arguments:
  releaseType    determines new version. If not given, current version will be displayed (choices: "latest", "stable", "hotfix")

Options:
  -V, --version        output the version number
  --commit             commit changes to git
  --tag                commit changes to git and tag new commit
  --raw                raw output
  --sync-from-newest   syncs version between package.json and manifest.json, using the newer version
  --sync-from-package  syncs version from package.json to manifest.json. If called with releasType, this happens before bumping
  --sync-from-manifest syncs version from manifest.json to package.json. If called with releasType, this happens before bumping
  -h, --help           display help for command

Initially we thought of versionize as the leading tool for versioning, but we realized there are also use cases where you want to use versionize as a companion tool. For example, you might want to use versionize to bump the version in the manifest.json file, but you want to use another tool to bump the version in the package.json file. To support this use case, we added the --sync-from-pkg and --sync-from-mft options. These options allow you to sync the version from one file to another before bumping the version.
