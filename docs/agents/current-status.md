# Current Status

Current phase: Active Correction Foundation planning.

Implemented:

- Message Coach core workflow
- Explanation Coach core workflow
- Reading Coach core workflow
- Live Coach guided and conversation practice
- Google Auth and database schema foundations
- Gemini AI client with API key rotation
- Server actions for Message, Explanation, and Reading
- UI routes for /message, /explanation, and /reading
- Landing page with active Bento cards
- Eval scripts for message, explanation, reading, and key rotation
- Local-only Memory store (`localStorage`)
- Memory Candidate save/edit/ignore actions
- `/memory` page for personal mistake catalog management
- Local Memory live search, category filtering, inline editing, and deletion
- Unit test suite for local memory storage operations
- Local-only Review v0 page (`/review`) with text normalization and card practice flow

Current focus:

- Replace the old staged MVP direction with the Active Correction Loop product model.
- Move product source of truth to `docs/product.md`.
- Replace localStorage learning data with database-backed CorrectionSessions, MemoryCandidates, and MemoryItems.
- Build `/workspace` as the primary Correction Workspace.
- Replace `/review` with writing-first `/practice`.

Non-goals:

- WYSIWYG/Tiptap in Phase 1
- Embedding retrieval in Phase 1
- Advanced analytics dashboard in Phase 1
- Browser extension
- Team/collaboration features
- User-managed API keys
- Full spaced repetition scheduler as the Phase 1 focus

Recommended next tasks:

1. Implement the dashboard app shell and new route map.
2. Implement DB-backed MemoryCandidate and MemoryItem APIs.
3. Build Correction Workspace with presets, What Changed & Why, and suggested memories.
4. Add Correction History.
5. Add basic Memory-aware correction.
6. Replace Review with writing-first Practice.
