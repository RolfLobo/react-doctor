<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/react-doctor-readme-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/react-doctor-readme-logo-light.svg">
  <img alt="React Doctor" src="./assets/react-doctor-readme-logo-light.svg" width="180" height="40">
</picture>

[![version](https://img.shields.io/npm/v/react-doctor?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/react-doctor)
[![downloads](https://img.shields.io/npm/dt/react-doctor.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/react-doctor)
[![GitHub Action](https://img.shields.io/badge/GitHub%20Action-React%20Doctor-2088FF?style=flat&logo=githubactions&logoColor=white)](https://github.com/marketplace/actions/react-doctor)

Your agent writes bad React, this catches it.

React Doctor deterministically scans your codebase and finds issues across state & effects, performance, architecture, security, and accessibility.

Works for all React frameworks and libraries - Next.js, Vite, TanStack, React Native, Expo, you name it.

[Website](https://react.doctor) · [Docs](https://react.doctor/docs)

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

If this is a Git repo, `install` also asks whether to add a non-blocking pre-commit hook. It runs `react-doctor --staged --fail-on none`, reuses common hook managers when present, and falls back to `.git/hooks/pre-commit`.

For agents with native lifecycle hooks, the interactive installer offers automatic post-edit checks as an optional step. This defaults to **No**. To opt in from CI or scripts, pass:

```bash
npx react-doctor@latest install --agent-hooks
```

This currently installs project hooks for Claude Code and Cursor that run after agent file edits and feed findings back without blocking tool calls.

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

## Docs

Configuration, custom rules, standalone plugins, CLI reference, and API details live in the docs:

https://react.doctor/docs

## Leaderboard

Top React codebases scanned by React Doctor, ranked by score. Updated automatically from [millionco/react-doctor-benchmarks](https://github.com/millionco/react-doctor-benchmarks).

<!-- LEADERBOARD:START -->
<!-- prettier-ignore -->
| #  | Repo | Score |
| -- | ---- | ----: |
| 1  | [executor](https://github.com/RhysSullivan/executor) | 96 |
| 2  | [nodejs.org](https://github.com/nodejs/nodejs.org) | 86 |
| 3  | [tldraw](https://github.com/tldraw/tldraw) | 71 |
| 4  | [t3code](https://github.com/pingdotgg/t3code) | 69 |
| 5  | [better-auth](https://github.com/better-auth/better-auth) | 64 |
| 6  | [mastra](https://github.com/mastra-ai/mastra) | 63 |
| 7  | [excalidraw](https://github.com/excalidraw/excalidraw) | 62 |
| 8  | [payload](https://github.com/payloadcms/payload) | 60 |
| 9  | [typebot](https://github.com/baptisteArno/typebot.io) | 57 |
| 10 | [medusajs/admin](https://github.com/medusajs/medusa) | 56 |

<!-- LEADERBOARD:END -->

See the [full leaderboard](https://www.react.doctor/leaderboard).

## Contributing

PRs and issues welcome — [issue tracker](https://github.com/millionco/react-doctor/issues). Local dev: `pnpm install && pnpm build`.

MIT-licensed.
