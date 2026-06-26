# Local Issue Tracking & Triage

Conventions for managing tasks, specifications, and statuses locally within the repository.

## Issue Tracker Conventions

Issues and PRDs live under the `.scratch/` directory:

- **Directory Structure**: One feature per directory: `.scratch/<feature-slug>/`
- **PRD Location**: `.scratch/<feature-slug>/PRD.md`
- **Issue Location**: `.scratch/<feature-slug>/issues/<NN>-<slug>.md` (numbered sequentially from `01`)
- **Triage Status**: Recorded as a `Status: <label>` line near the top of each issue file (using the labels defined below).
- **Comments & History**: Appended to the bottom of the file under a `## Comments` heading.

## Triage Labels Mapping

When skills or agents need to apply triage labels, map the canonical roles to the local tracker label strings:

| Canonical Role    | Tracker Label     | Meaning                                  |
| :---------------- | :---------------- | :--------------------------------------- |
| `needs-triage`    | `needs-triage`    | Maintainer needs to evaluate this issue  |
| `needs-info`      | `needs-info`      | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent` | Fully specified, ready for an agent      |
| `ready-for-human` | `ready-for-human` | Requires human implementation            |
| `wontfix`         | `wontfix`         | Will not be actioned                     |
