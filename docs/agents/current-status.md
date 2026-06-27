Current phase: Review v0 stabilization.

Implemented:

- Message Coach core workflow
- Explanation Coach core workflow
- Reading Coach core workflow
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

- Validate Review v0 and improve feedback quality.

Non-goals:

- Auth
- Database
- Dashboard
- Rich editor/Tiptap
- User-managed API keys
- Full spaced repetition scheduler

Recommended next tasks:

1. Add Review v0.
2. Keep Review local-only.
3. Show feedback before moving to the next review item.
4. Do not implement full spaced repetition yet.
