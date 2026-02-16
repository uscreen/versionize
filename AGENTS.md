# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

`@uscreen.de/versionize` is an opinionated semver package versioner for Node.js.
It manages versions across `package.json` (stable release) and `manifest.json`
(pre-release), with optional git commit/tag support. Pure JavaScript, no TypeScript.

Three source files: `bin/cli.js` (CLI entry), `src/index.js` (public API),
`src/utils.js` (core logic). Tests live in `test/` organized by category.

## Build & Test Commands

Package manager is **pnpm** (enforced via `only-allow pnpm` preinstall hook).
There is no build step -- this is a pure JS project.

```bash
# Run all tests
pnpm test

# Run a single test file
node --test --test-reporter spec test/utils/incrementVersions.test.js

# Run tests matching a name pattern
node --test --test-reporter spec --test-name-pattern "bumpVersion" test/api/success.test.js

# Run tests in a single directory
node --test --test-reporter spec test/utils/*.test.js

# Run tests with coverage (HTML + text)
pnpm run test:cov

# Run tests with coverage (lcov + text, used in CI)
pnpm run test:ci
```

**Important:** Tests that exercise git operations (API and CLI tests) require a
configured git user. If tests fail with git errors, run:
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

## Linting

```bash
# ESLint is available but has no dedicated script -- run directly:
npx eslint src/ bin/ test/
```

ESLint config extends `@uscreen.de/eslint-config-prettystandard-node`, which
combines `eslint-config-standard` + `eslint-plugin-prettier`. There are no
project-level rule overrides.

## Code Style

### Formatting (enforced by ESLint + Prettier)

- **No semicolons**
- **Single quotes** for strings
- **2-space indentation** (tabs for Makefiles only)
- **No trailing commas** in function arguments or object/array literals
- **Bracket spacing** in object literals: `{ foo: bar }`
- **Trailing newline** in every file
- **LF line endings**

### Module System

- **ESM only** (`"type": "module"` in package.json)
- Node built-ins use bare specifiers: `import fs from 'fs'`
- Local imports always include the `.js` extension: `from './utils.js'`
- Only exception: `bin/cli.js` uses `createRequire` to import `package.json`
  (JSON import workaround)

### Functions & Variables

- **Arrow functions exclusively** -- no `function` keyword anywhere
- **`const` by default**, `let` only when reassignment is needed, never `var`
- **Destructuring** for function options: `({ commit = false, cwd } = {})`
- **Template literals** for string interpolation

### Naming Conventions

- **Functions/variables:** `camelCase` -- `bumpVersion`, `getCurrentVersion`, `releaseType`
- **File names:** `camelCase.js` for source, `camelCase.test.js` for tests
- **Abbreviations:** `pkg` for package.json data, `mft` for manifest.json data
- **Underscore prefix** for aliased imports to avoid shadowing:
  `import { bumpVersion as _bumpVersion } from './utils.js'`

### Error Handling

- **`throw Error('message')`** -- without `new` keyword
- **CLI layer** catches all errors and calls `process.exit(e.code || 1)`
- **API/library layer** throws errors directly; callers handle them
- **Two-tier try/catch in CLI:** inner catch for git (non-fatal warning),
  outer catch for everything else (fatal exit)
- **`/* c8 ignore next */`** for defensive code paths that should never execute

### Exports

- Named exports only, no default exports
- `src/utils.js` exports all internal functions
- `src/index.js` re-exports the public API (`bumpVersion`, `getCurrentVersion`)
- `bin/cli.js` imports directly from `../src/utils.js` (not from index)

## Test Conventions

### Test Runner

Native **Node.js test runner** (`node:test`), not Jest/Mocha/tap.

### Test File Structure

```js
import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
```

- Group related tests in `describe()` blocks with descriptive strings
- Each `test()` gets a descriptive name, often matching the function call:
  `` test(`bumpVersion('latest')`, async () => { ... }) ``
- Tests are `async` even when not strictly needed (convention)

### Test Patterns

- **Temporary directories:** Use `tempy` (`temporaryDirectory()`) for filesystem isolation
- **Setup/Teardown:** `beforeEach` creates temp dir + writes fixture JSON files;
  `afterEach` removes temp dir with `fs.rmSync(CWD, { recursive: true })`
- **Assertions:** Use `node:assert/strict` -- primarily `assert.equal()`,
  `assert.match()`, `assert.throws()`
- **Assertion messages:** Always provide a third argument describing what's checked:
  `assert.equal(result.newVersion, '0.4.0-3', 'returns correct new version')`
- **CLI tests:** Spawn `node bin/cli.js` via `child_process.exec`, capture
  `{code, error, stdout, stderr}`
- **Color suppression:** Set `process.env.FORCE_COLOR = 0` for predictable
  string matching in tests that check colored output

### Test Organization

```
test/
  api/           # Integration tests for the JS API (src/index.js)
    fail.test.js
    success.test.js
  cli/           # End-to-end tests spawning the CLI binary
    fail.test.js
    success.test.js
  utils/         # Unit tests for internal utilities (src/utils.js)
    bumpVersion.test.js
    getCurrentVersion.test.js
    incrementVersions.test.js
    writeToPackageFile.test.js
```

## CI

GitHub Actions runs on push/PR to `main`, testing Node.js `[20, 22, 24]`.
Coverage is uploaded to Coveralls. Dependabot PRs auto-merge after tests pass.

## Dependencies

Runtime: `chalk`, `commander`, `package-directory`, `semver`
Dev: `@uscreen.de/eslint-config-prettystandard-node`, `c8`, `tempy`
