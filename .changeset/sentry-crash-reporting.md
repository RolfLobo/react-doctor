---
"react-doctor": patch
---

Add Sentry crash reporting to the CLI. Uncaught errors that reach the CLI's error funnels are now captured via `@sentry/node` and flushed before the process exits, each enriched with a `run` context snapshot (version, node/platform/arch, the invocation `command`/`argv`, `cwd`, CI provider, coding agent, interactivity, and JSON mode) to make crashes triage-able. Sentry initializes as the first statement of the CLI entry so its global handlers are armed before any command runs, and it's scoped to the CLI only — the programmatic `@react-doctor/api` library never initializes Sentry.

Reporting is opt-out: pass `--no-score` to disable crash reporting along with the hosted score API and share URL. The SDK is also skipped under test runs (`VITEST` / `NODE_ENV=test`).
