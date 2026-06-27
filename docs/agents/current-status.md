Current phase: Memory v0 stabilization + Review v0 preparation.

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

Current focus:

- Stabilize Memory v0 behavior
- Validate local Memory interactions (ignore, save, restore)
- Prepare Review v0 flow

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
