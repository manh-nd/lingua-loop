# LinguaLoop

## Problem

Tôi dùng AI để viết và hiểu tiếng Anh công sở, nhưng sau đó lại nhanh chóng quên đi các góp ý và tiếp tục lặp lại các lỗi cũ (forgetting corrections and repeating mistakes).

## Core promise

Học tiếng Anh công sở theo vòng lặp hiệu quả (học theo vòng lặp, không quên lỗi cũ): Giúp tôi viết tốt hơn, hiểu sâu ngữ cảnh và đảm bảo không bao giờ quên hay lặp lại các lỗi sai cũ nhờ cơ chế phát hiện & ôn tập vòng lặp.

## Product Positioning

Lingua Loop is a tailored workplace English micro-coach for Vietnamese professionals, not a general document intelligence platform.

The product should focus on small, frequent, practical workflows:

- Slack, Teams, and email messages
- PR and Jira comments
- Short specs and issue explanations
- Pasted workplace English that the user needs to understand quickly

Lingua Loop should optimize for speed, clarity, Vietnamese explanations, and reusable learning points.

## Competitive Boundary

Lingua Loop should not try to replace NotebookLM, Copilot, ChatGPT file upload, or general long-document Q&A products.

Avoid near-term product direction that requires:

- Source libraries
- Multi-document notebooks
- Citations
- Audio summaries
- Document ingestion
- Enterprise knowledge search

Long-document or document-mode reading can be a later expansion, but it is not part of MVP v1.

## Design Principle

Small, practical, tailored workflows over broad AI document features.

Every new feature should answer:

> Does this help a Vietnamese professional write, understand, or remember workplace English better in daily use?

## Staged Scope

### MVP v0

The immediate implementation focus is making the writing workflows useful in daily work.

- Message Coach
- Explanation Coach
- Eval scripts for both workflows
- Simple UI for both workflows
- No persistence, or only temporary/local state (currently, Mistake Candidates are extracted and displayed temporarily on-screen, with no disk or database saving)

### MVP v1

After the writing workflows are useful in real usage, add the first learning loop.

- Reading Coach
  - Start with a single pasted workplace English text, with a recommended input limit around `<=3000` characters.
  - Explain the natural Vietnamese meaning, key phrases, tone or implied meaning, possible typo/source issues, and optional reply suggestions.
  - Do not create personal `MistakeCandidate` items from someone else's writing. Source errors should be shown in a separate result section.
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
- Long-document or document-mode reading

## Non-Goals for MVP v0

- Admin dashboard
- Rich text editor
- Tiptap
- Worker queue
- Multi-provider AI
- Payment
- Browser extension
