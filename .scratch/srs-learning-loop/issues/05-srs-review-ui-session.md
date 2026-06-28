Status: ready-for-agent

## What to build

Implement the front-end Review page that integrates the spaced repetition (SRS) scheduler, AI-graded responses, and re-queuing logic for incorrect answers. The page should support reviewing a single item via an `id` query parameter or reviewing all due items.

## Acceptance criteria

- [ ] Review page filters items by due date (`nextReviewAt` in the past) by default. Show a clean screen if no items are due, with a "Review all" fallback option.
- [ ] Supports query param `id` to review only that specific card.
- [ ] Renders different layouts for each memory type (writing correction, typing reusable phrase from intention with word initials hint, explaining reading trap in Vietnamese).
- [ ] Integrates the AI-grader Server Action to grade user inputs and displays feedback, alternatives, and cultural context.
- [ ] Updates the item's SRS metadata in localStorage based on the SM-2 algorithm using the first attempt's result.
- [ ] Re-queues failed cards to the end of the session queue so the user must complete them successfully.

## Blocked by

- [Issue 02](./02-reading-coach-candidates.md)
- [Issue 03](./03-coach-save-actions-naming.md)
- [Issue 04](./04-ai-review-grader-engine.md)
