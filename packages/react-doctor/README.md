<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/react-doctor-readme-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/react-doctor-readme-logo-light.svg">
  <img alt="React Doctor" src="./assets/react-doctor-readme-logo-light.svg" width="180" height="40">
</picture>

[![version](https://img.shields.io/npm/v/react-doctor?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/react-doctor)
[![downloads](https://img.shields.io/npm/dt/react-doctor.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/react-doctor)

Your agent writes bad React, this catches it.

React Doctor deterministically scans your codebase and finds issues across state & effects, performance, architecture, security, and accessibility.

Works for all React frameworks and libraries - Next.js, Vite, TanStack, React Native, Expo, you name it.

| [Website](https://react.doctor) | [Docs](https://react.doctor/docs) |
| --- | --- |

## Install

### 1. Quick start

Run this at your project root to get an audit.

```bash
npx react-doctor@latest
```

https://github.com/user-attachments/assets/07cc88d9-9589-44c3-aa73-5d603cb1c570

### 2. Install for agents

Once you have an audit, you can install the skill for your coding agent to learn from the issues and fix them in the future.

```bash
npx react-doctor@latest install
```

Works with Claude Code, Cursor, Codex, OpenCode, and many more.


### 3. Run in CI (GitHub Actions) for your team

Add a workflow to scan every pull request and leave findings where reviewers already look:

```yaml
name: React Doctor

on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  react-doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: millionco/react-doctor@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          diff: ${{ github.base_ref }}
          fail-on: error
          annotations: true
```

`diff` keeps CI focused on files changed in the PR, `annotations` shows findings inline in GitHub's Files changed view, and `github-token` enables a sticky React Doctor PR comment with the score and scan output. Use `fail-on: warning` for a stricter gate, or `fail-on: none` while introducing React Doctor to an existing codebase.

## Contributing

[Issues are welcome!](https://github.com/millionco/react-doctor/issues)

MIT-licensed.
