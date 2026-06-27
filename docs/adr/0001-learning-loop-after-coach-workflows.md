# 1. Learning Loop After Coach Workflows

## Status

Accepted

## Context

The initial phase (MVP v0) focused on building separate coach input workflows: Message Coach, Explanation Coach, and Reading Coach. These workflows analyze inputs, provide translations, and suggest corrections, but do not complete the learning loop.

To fulfill the core philosophy of **"học theo vòng lặp, không quên lỗi cũ"** (learning in loops, never forget/repeat old mistakes), the product must transition to the next phase (MVP v1). Mistake Candidates (extracted points worth saving) and Memory (curated personal mistake database) form the foundation of this learning loop.

## Decision

We will build the Mistake Candidate tracking and Memory management before introducing complex infrastructure (databases, authentication) or scheduling algorithms:

1. **Mistake Candidates & Memory First**: The next product focus will be on the _Memory Candidate Review_ action to let users save, edit, or ignore proposed mistake candidates, establishing a personal memory catalog.
2. **Local-only Storage**: Persistence will start local-only using `localStorage` on the client. This avoids premature database integration, allows rapid iteration, and minimizes system complexity.
3. **Review Comes After Memory**: The Spaced Repetition/Review flow will only be developed _after_ the Memory capture pipeline is operational and users have accumulated real personal mistakes.
4. **Defer Infrastructure**: Non-goals like authentication, external database hosting, dashboards, and rich text editing remain deferred to later phases.

## Consequences

- Users can now save mistake candidates locally, completing the input-to-memory loop.
- Avoids building complex sync protocols or quota management at this stage.
- Data is client-scoped, meaning it will be lost if browser cache/local storage is cleared, which is acceptable for MVP v1 validation.
