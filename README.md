# versionize

[![Test CI](https://github.com/uscreen/versionize/actions/workflows/main.yml/badge.svg)](https://github.com/uscreen/versionize/actions/workflows/main.yml)
[![Test Coverage](https://coveralls.io/repos/github/uscreen/versionize/badge.svg?branch=main)](https://coveralls.io/github/uscreen/versionize?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/uscreen/versionize/badge.svg?targetFile=package.json)](https://snyk.io/test/github/uscreen/versionize?targetFile=package.json)
[![NPM Version](https://badge.fury.io/js/@uscreen.de%2Fversionize.svg)](https://badge.fury.io/js/@uscreen.de%2Fversionize)

> Opinionated package versioner

This package can be used for versioning your Node.js projects. It uses Semantic Versioning and increments versions by specifying the desired release type.

## Prerequisites

- `node` v18 or higher

## Install

Add the module within your monorepo:

```bash
$ yarn add -D @uscreen.de/versionize
```

## Usage

```bash
$ versionize latest // => increments (minor) pre-release version
$ versionize stable // => increments minor version
$ versionize hotfix // => increments patch version
$ versionize        // => outputs current version
```

Versions are written into `package.json` and `manifest.json`. The `package.json` always contains the current stable release version. The `manifest.json` contains the current pre-release version, if given, otherwise also the current stable release version.

### Options

#### Raw output

If you want to use versionize's output for shell scripts or similar, use the option `--raw`. Instead of the default output, versionize will only write the new version to stdout, without any pretty printing.

#### Commit & tag via Git

If used with option `--commit`, versionize will automatically commit the changes it made to `package.json` and `manifest.json`. If used with option `--tag`, versionize will additionally tag the automatic commit with the new version.

You need a working `git` binary in your `PATH`.

#### Sync versions

If `versionize` is used additionally to another version management tool, it may be necessary to sync the versions between `package.json` and `manifest.json`. This can be done with the options `--sync-from-newest`, `sync-from-package` and `--sync-from-manifest`. If used with `latest`, `stable` or `hotfix`, the versions will be synced before incrementing. If used without any of these arguments, the versions will be synced without incrementing.

If another tool is used to change the versions in package.json, it may be feasible to sync the versions in manifest.json with the versions in package.json. This can be done by using the option `--sync`.

### JavaScript

The package also exposes some methods so you could use `versionize` inside your project:

```javascript
import { getCurrentVersion, bumpVersion } from '@uscreen.de/versionize'
```

#### getCurrentVersion

Get the current version of your project:

```javascript
const myVersion = getCurrentVersion()
```

You could overwrite the current working directory with the option `cwd`:

```javascript
const myVersion = getCurrentVersion({ cwd: '/path/to/my/project' })
```

#### bumpVersion

Bump the version of your project:

```javascript
bumpVersion('stable')
```

You could overwrite the current working directory with the option `cwd`:

```javascript
bumpVersion('stable', { cwd: '/path/to/my/project' })
```

To commit or tag the version bump, use the corresponding options:

```javascript
// commit:
bumpVersion('stable', { commit: true })

// (commit &) tag:
bumpVersion('stable', { tag: true })
```

---

## Roadmap

- TBD

## Changelog

> Format according to https://keepachangelog.com

### v0.7.1
#### Fixed
- fix api documentation in readme

### v0.7.0
#### Added
- expose method to bump version

#### Removed
- node v16 support

### v0.6.1
#### Fixed
- write newline to end of package file

### v0.6.0
#### Added
- cli option to commit changes to git without tag

### v0.5.0
#### Added
- cli option to commit changes to git and tag new commit

### v0.4.0
#### Added
- cli option for raw output

### v0.3.0
#### Added
- show current version when calling versionize without arguments

#### Changed
- give feedback about current version, too
- small ui changes
- refactoring

### v0.2.0

#### Added
- give feedback about new version

### v0.1.0

#### Added
- initial version with basic functionality

---

## License

Licensed under [MIT](./LICENSE).

Published, Supported and Sponsored by [u|screen](https://uscreen.de)
