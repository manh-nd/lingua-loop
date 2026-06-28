Status: ready-for-agent

## What to build

Implement a Server Action and grader workflow that calls the Gemini API to grade the user's answers during their Review sessions, accommodating flexible semantic answers and explaining spelling/grammatical issues and cultural/business context nuances.

## Acceptance criteria

- [ ] ReviewGradeResultSchema defines boolean `isCorrect`, `feedbackVi`, `suggestedAlternative`, and `culturalContextVi`.
- [ ] Grader workflow prompts Gemini to grade based on memory type:
  - `writing_mistake`: user corrected the mistake; be lenient on typos/casing.
  - `reusable_phrase`: user phrased it naturally to match the Vietnamese intention.
  - `reading_trap`: user explained the true implied meaning in Vietnamese correctly.
- [ ] Server Action `submitReviewGrade` executes the workflow successfully.

## Blocked by

- [Issue 01](./01-core-memory-storage.md)
