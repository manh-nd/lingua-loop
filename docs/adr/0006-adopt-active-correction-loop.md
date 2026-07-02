# 6. Adopt Active Correction Loop as the Product Model

## Status

Accepted

## Context

The original product direction described a staged MVP path centered on Message Coach, Explanation Coach, Reading Coach, local Memory, and later Review. The codebase and product intent have moved beyond that staging:

- Google Auth and database tables exist.
- Live Coach exists and already supports guided and conversation practice.
- Reading, Memory, and Review-style flows exist in early forms.
- The user no longer wants localStorage to be the source of truth for learning data.
- The product direction now prioritizes learning from real corrections across writing and speaking.

Keeping the old MVP v0/v1 framing would mislead future product and engineering work.

## Decision

Lingua Loop adopts the Active Correction Loop as its central product model.

The product direction is:

- Correction Workspace and Live Coach are the long-term primary surfaces.
- Correction Workspace is prioritized first because it establishes database-backed CorrectionSessions, MemoryCandidates, MemoryItems, history, and writing-first Practice.
- Live Coach will evolve into a Memory-aware Speaking Coach that uses saved MemoryItems and creates post-call MemoryCandidates.
- Reading Coach remains a secondary learning surface for understanding external English and collecting Vocabulary, Reusable Phrase, and Tone Pattern candidates.
- localStorage is no longer a source of truth for learning data. Learning data must be database-backed for cross-device use.
- Practice replaces flashcard-style Review as the default learning workflow. Phase 1 Practice is writing-first.
- WYSIWYG editing, embedding-based retrieval, Reading Turn into Practice, advanced analytics, and public marketing focus are later-phase work.

The product source of truth moves to `docs/product.md`. A Vietnamese companion explanation lives at `docs/vi/product.md`.

## Consequences

- The old MVP v0/v1 product staging is superseded by the new roadmap phases.
- Message Coach and Explanation Coach become presets inside Correction Workspace rather than standalone product workflows.
- MemoryCandidate and MemoryItem become the canonical domain terms for proposed and saved learning data.
- Existing localStorage-based Memory UI and flows should be replaced rather than preserved as long-term behavior.
- Routes should move toward `/workspace`, `/live`, `/memory`, `/practice`, `/reading`, and `/settings`.
- Phase 1 is not complete until the user can complete the full loop on a deployed app: sign in, correct real work text, save suggested memories, reopen history cross-device, receive Memory-aware correction later, and practice due MemoryItems through writing-first Practice.
