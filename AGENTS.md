<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues are tracked locally as Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage states map directly to their default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Uses a single-context domain layout with `CONTEXT.md` at the repo root. See `docs/agents/domain.md`.
