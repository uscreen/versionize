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
```

Versions are written into *package.json* and *manifest.json*. The *package.json* always contains the current stable release version. The *manifest.json* contains the current pre-release version, if given, otherwise also the current stable release version.

The package exposes the method `getCurrentVersion` so you could get the current version inside of your project like this:

```javascript
import { getCurrentVersion } from '@uscreen.de/versionize'
const myVersion = getCurrentVersion()
```

---

## Roadmap

- TBD

## Changelog

> Format according to https://keepachangelog.com

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
