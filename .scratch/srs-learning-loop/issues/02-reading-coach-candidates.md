Status: ready-for-agent

## What to build

Update the Reading Coach prompt and schema to extract `readingMemoryCandidates` representing reading traps or reusable phrases from the text. Display these candidates on the Reading Coach result screen, and provide buttons to save them to the local memory store. When a candidate is saved, show "Xem trong Sổ tay" and "Luyện lỗi này ngay" buttons.

## Acceptance criteria

- [ ] Reading Coach result schema includes `readingMemoryCandidates` containing trapText, wrongInterpretationVi, correctInterpretationVi, phrase, situationVi, explanationVi, and culturalContextVi.
- [ ] Prompt extracts high-quality, relevant reading memory candidates with shouldSave: boolean.
- [ ] Reading Coach page UI renders candidates in a dedicated section with a "Lưu vào Sổ tay" button.
- [ ] Clicking "Lưu vào Sổ tay" saves the item as `reading_trap` or `reusable_phrase` in localStorage.
- [ ] Saved items display "Xem trong Sổ tay" and "Luyện lỗi này ngay" (linking to `/review?id=<id>`).

## Blocked by

- [Issue 01](./01-core-memory-storage.md)
