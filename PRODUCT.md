# LinguaLoop

## Problem

Tôi dùng AI để viết và hiểu tiếng Anh công sở, nhưng sau đó lại nhanh chóng quên đi các góp ý và tiếp tục lặp lại các lỗi cũ (forgetting corrections and repeating mistakes).

## Core promise

Học tiếng Anh công sở theo vòng lặp hiệu quả (học theo vòng lặp, không quên lỗi cũ): Giúp tôi viết tốt hơn, hiểu sâu ngữ cảnh và đảm bảo không bao giờ quên hay lặp lại các lỗi sai cũ nhờ cơ chế phát hiện & ôn tập vòng lặp.

## Staged Scope

### MVP v0

The immediate implementation focus is making the writing workflows useful in daily work.

- Message Coach
- Explanation Coach
- Eval scripts for both workflows
- Simple UI for both workflows
- No persistence, or only temporary/local state

### MVP v1

After the writing workflows are useful in real usage, add the first learning loop.

- Reading Coach
- Memory candidate review
- Manual save to Memory
- Basic Review flow

### Later

These are part of the broader product vision, but should not shape MVP v0.

- Auth
- Database-backed persistence
- Spaced repetition scheduling
- Dashboard
- Rich editor

## Non-Goals for MVP v0

- Admin dashboard
- Rich text editor
- Tiptap
- Worker queue
- Multi-provider AI
- Payment
- Browser extension
