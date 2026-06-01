---
"react-doctor": patch
---

Redesigned the interactive scan report and added a first-run onboarding reveal.

The default single-project report now reads top-to-bottom the way a human scans it: the category tally, then the score box (with the total issue count inline on the score line, e.g. `7 / 100 Critical   295 issues`), the projection, the top fixes one by one, the warning roll-up, a single merged `+N more errors and +N more warnings` overflow line, and finally Share / Docs / Tip. The per-section `+N more rules` lines, the `N warnings` sub-header, and the `Top N errors you should fix` header were removed for a cleaner read. CI, coding-agent, git-hook, and verbose runs keep the classic information-dense layout (diagnostics first, then agent guidance and score).

On a user's first interactive run it plays as an onboarding sequence: a happy React Doctor "welcome" scene opens, the scan runs, the category tallies count up from zero in parallel, and then each section — and each of the top errors — reveals on an ~850ms beat (quickening to ~680ms once the score lands) instead of a wall of text. It runs only once (a marker persisted in the global config records that it was shown), and is skipped entirely in CI, under coding agents, and on any non-TTY / score-only / JSON run.
