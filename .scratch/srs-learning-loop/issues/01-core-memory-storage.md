Status: ready-for-agent

## What to build

Enhance the local storage memory data model and schema to support multiple memory types (`writing_mistake`, `reading_trap`, `reusable_phrase`) and Spaced Repetition (SRS) tracking metadata. Update the storage helpers to initialize these metadata fields (easeFactor, intervalDays, streaks, nextReviewAt) when items are added or updated. Update the Memory Library UI (`/memory`) to render and filter these three types of memories correctly.

## Acceptance criteria

- [ ] Zod schema in memory.schema.ts handles three memory types, source workflows, and SRS metadata.
- [ ] `addLocalMemoryItem` in local-memory-store.ts initializes SRS tracking (status: active, easeFactor: 2.5, intervalDays: 0, nextReviewAt: now).
- [ ] Key duplicate check handles wrongText/correctText for writing_mistake, trapText/wrongInterpretationVi/correctInterpretationVi for reading_trap, and phrase/situationVi for reusable_phrase.
- [ ] The Memory Library UI (`/memory`) renders items with tags showing their memory type and source workflow, and filters them correctly.
- [ ] Storage functions are verified by unit tests.

## Blocked by

None - can start immediately
