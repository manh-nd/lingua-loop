# Implement Reading Coach MVP

Status: completed

## Summary

Implement Reading Coach as the first MVP v1 workflow for understanding single pasted workplace English text. The workflow should explain natural Vietnamese meaning, key phrases, tone or implied meaning, possible misunderstandings, source issues, and optional reply suggestions.

## Acceptance Criteria

- Reading Coach has a structured input and result contract.
- Reading Coach uses the existing AI client and structured JSON workflow pattern.
- Inputs are designed for a single pasted workplace English text with a recommended limit around `<=3000` characters.
- Source typo/grammar/wording issues are modeled separately from Mistake Candidate.
- Reading Coach has practical eval cases for mixed workplace text.
- A dedicated Reading Coach page exists and follows the existing coach UI patterns.
- The page has starter samples, loading state, error state, result hierarchy, and copy support for optional replies.
- Long-document/document-mode features are not implemented.

## Comments

Created from the Reading Coach MVP PRD.

- **Resolved**: Implemented by AI agent using TDD cycle. All tests (unit, contract, build, typecheck) pass. Live AI generation verified using the evaluation script.
