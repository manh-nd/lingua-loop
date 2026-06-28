Status: ready-for-agent

## What to build

Update the Email & Message Coach and Work Documentation Coach UI to support manually saving reusable phrases to the memory store, and update all UI labels and coach names to promote active learning and professional workplace context.

## Acceptance criteria

- [ ] Change Coach names: Message Coach -> Email & Message Coach, Explanation Coach -> Document Coach.
- [ ] Change mode names: "Dịch từ tiếng Việt" -> "Viết từ ý định", "Sửa nháp tiếng Anh" -> "Sửa bản nháp tiếng Anh".
- [ ] Textarea labels and button texts changed to align with the intention-focused wording (e.g. "Ý bạn muốn nói", "Viết lại & học từ lỗi").
- [ ] Render a "Lưu cụm từ" (Save to memory) button next to each element of `reusablePhrases` in both coaches. Clicking it saves it as a `reusable_phrase` item.
- [ ] Mistake Candidate List displays "Luyện lỗi này ngay" next to "Xem trong Sổ tay" when an item is saved.

## Blocked by

- [Issue 01](./01-core-memory-storage.md)
