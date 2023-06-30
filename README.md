# versionize

> opinionated package versioner

This package can be used for versioning your Node.js projects. It uses Semantic Versioning and increments versions by specifying the desired release type.

## Prerequisites

- `node` v16 or higher

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

### JavaScript

The package also exposes the method `getCurrentVersion` so you could get the current version inside of your project like this:

```javascript
import { getCurrentVersion } from '@uscreen.de/versionize'
const myVersion = getCurrentVersion()
```

---

## Roadmap

- TBD

## Changelog

> Format according to https://keepachangelog.com

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
- show current version when calling calling versionize without arguments

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
