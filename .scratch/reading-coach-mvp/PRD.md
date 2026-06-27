# Reading Coach MVP PRD

## Problem Statement

Vietnamese professionals often need to understand English workplace text quickly, but general AI document tools are too broad for this daily job. The user may paste a Slack or Teams message, an email, a PR or Jira comment, a short spec, or an issue explanation and need to know what it naturally means, what tone it carries, which phrases matter, and whether there are source typos or wording issues that could change interpretation.

The current Lingua Loop MVP v0 helps the user write English through Message Coach and Explanation Coach, but it does not yet help the user read and understand English text in context. Without Reading Coach, the product cannot cover the "understand workplace English" side of its core promise, and the future learning loop has no reading-side input.

## Solution

Add Reading Coach as the first MVP v1 workflow. Reading Coach should accept one pasted workplace English text, optimized for short-to-medium practical inputs rather than long documents. It should explain the natural Vietnamese meaning, key phrases, tone or implied meaning, possible typo/source issues, and optional reply suggestions when the pasted text appears to require a response.

Reading Coach must be positioned as a tailored workplace English micro-coach, not a NotebookLM, Copilot, ChatGPT file upload, or general long-document Q&A replacement. It should solve small, frequent, practical reading problems for Vietnamese professionals.

Reading Coach should not create personal Mistake Candidate items from someone else's writing. If the source text contains typo, grammar, or wording issues, those should be shown as source issues in the Reading Coach result, not saved as the user's Memory.

## User Stories

1. As a Vietnamese professional, I want to paste an English workplace message, so that I can understand what the sender naturally means.
2. As a Vietnamese professional, I want the explanation in Vietnamese, so that I can understand nuance without mentally translating every word.
3. As a Vietnamese professional, I want to see the natural Vietnamese meaning of the full pasted text, so that I can quickly decide what action to take.
4. As a Vietnamese professional, I want important English phrases highlighted and explained, so that I can reuse or recognize them later.
5. As a Vietnamese professional, I want implied tone explained, so that I know whether the sender sounds polite, urgent, direct, frustrated, neutral, or casual.
6. As a Vietnamese professional, I want the app to identify possible misunderstandings, so that I do not react incorrectly to a message.
7. As a Vietnamese professional, I want the app to explain word-by-word traps, so that I avoid literal Vietnamese interpretations that are wrong in context.
8. As a Vietnamese professional, I want the app to detect source typos or awkward wording, so that I know when confusion comes from the source text rather than my English level.
9. As a Vietnamese professional, I want source issues separated from my own mistakes, so that I do not save someone else's typo as my personal learning Memory.
10. As a Vietnamese professional, I want optional reply suggestions when a pasted message needs a response, so that I can answer naturally after understanding it.
11. As a Vietnamese professional, I want no reply suggestion when the text is a doc/spec/comment that does not need a response, so that the result stays focused.
12. As a Vietnamese professional, I want Reading Coach to work for Slack and Teams messages, so that I can use it during daily communication.
13. As a Vietnamese professional, I want Reading Coach to work for emails, so that I can understand formal or indirect wording from colleagues, partners, or clients.
14. As a Vietnamese professional, I want Reading Coach to work for PR comments, so that I can understand review feedback accurately.
15. As a Vietnamese professional, I want Reading Coach to work for Jira or issue comments, so that I can understand status, blockers, expected action, and technical details.
16. As a Vietnamese professional, I want Reading Coach to work for short specs or requirements, so that I can understand scope and expectations.
17. As a Vietnamese professional, I want Reading Coach to handle mixed workplace text, so that I do not have to choose between message-only and document-only modes for practical pasted snippets.
18. As a Vietnamese professional, I want the input limit to be clear, so that I understand this is for pasted workplace text, not long-document analysis.
19. As a Vietnamese professional, I want the output to be concise, so that I can use it quickly during work.
20. As a Vietnamese professional, I want the output to preserve important details, so that brevity does not remove meaning, responsibility, deadlines, or constraints.
21. As a Vietnamese professional, I want the app to avoid inventing missing context, so that I can trust the explanation.
22. As a Vietnamese professional, I want the app to explain uncertainty when the source text is ambiguous, so that I know what to clarify.
23. As a Vietnamese professional, I want the app to show possible clarifying questions, so that I can ask the sender when meaning is unclear.
24. As a Vietnamese professional, I want key phrases to include Vietnamese meanings and workplace usage, so that I learn from real work text.
25. As a Vietnamese professional, I want Reading Coach to follow the same visual rhythm as Message Coach and Explanation Coach, so that the product feels consistent.
26. As a Vietnamese professional, I want starter samples, so that I can understand how to use Reading Coach immediately.
27. As a Vietnamese professional, I want loading and error states, so that I know what is happening when AI generation takes time or fails.
28. As a Vietnamese professional, I want a friendly rate-limit or AI-busy error message, so that technical failures are understandable.
29. As a Vietnamese professional, I want copy buttons for reply suggestions, so that I can use a suggested response quickly.
30. As a Vietnamese professional, I want learning sections to stay secondary, so that the main meaning remains dominant.
31. As a Vietnamese professional, I want Reading Coach to avoid broad document AI features, so that the app remains focused on daily workplace English.
32. As a product maintainer, I want Reading Coach to use existing AI client patterns, so that the new workflow fits the current architecture.
33. As a product maintainer, I want Reading Coach to have a structured schema, so that UI rendering is predictable and testable.
34. As a product maintainer, I want Reading Coach eval cases before deep UI polish, so that prompt quality is validated before presentation details.
35. As a product maintainer, I want source issues modeled separately from Mistake Candidate, so that future Memory and Review semantics stay clean.
36. As a product maintainer, I want Reading Coach to stay within MVP v1 scope, so that it does not accidentally become a long-document ingestion feature.
37. As a product maintainer, I want a clear path to future Memory/Review integration, so that Reading Coach can support the learning loop later without forcing persistence now.
38. As a product maintainer, I want tests at the workflow seam, so that behavior remains stable even if prompts or UI components change.
39. As a product maintainer, I want UI tests or smoke checks for the route, so that the new page does not regress core user flow.
40. As a product maintainer, I want documentation to keep the competitive boundary explicit, so that future work does not chase broad AI document products.

## Implementation Decisions

- Build Reading Coach as a distinct workflow, separate from Message Coach and Explanation Coach.
- Use the existing generic AI client and structured JSON output pattern.
- Add a Reading Coach input contract for one pasted workplace English text, with optional context only if it helps explain source, audience, or situation.
- Use a recommended input limit around `<=3000` characters. Inputs beyond that should receive a clear validation error or be blocked before calling AI.
- Add a Reading Coach result contract that supports:
  - natural Vietnamese meaning
  - concise summary of what the text is asking, saying, or implying
  - key phrases with Vietnamese meaning and workplace usage
  - tone or implied meaning
  - possible misunderstandings or word-by-word traps
  - source issues for typos, grammar mistakes, awkward wording, or ambiguous wording in the pasted source
  - optional reply suggestions when a response appears useful
- Do not reuse Mistake Candidate for source issues. Mistake Candidate remains reserved for the user's personal recurring English mistakes.
- Keep source issues non-persistent in MVP. They are reading aids, not Memory.
- Add an eval script for Reading Coach using practical workplace examples: Slack/Teams messages, emails, PR review comments, Jira comments, short requirements, and source text with typos.
- Add a Reading Coach page using the existing coach shell patterns, starter samples, loading panel, error panel, copy button, and collapsible learning sections.
- Keep the primary result hierarchy centered on meaning first, then tone, then phrases/traps/source issues, then optional reply suggestions.
- Add the Reading Coach entry point to the app navigation/home experience after the workflow and eval quality are acceptable.
- Keep long-document reading, document upload, source libraries, citations, audio summaries, and multi-document Q&A out of MVP v1.

## Testing Decisions

- The primary test seam is the Reading Coach workflow contract: given structured input and a fake AI client response, the workflow validates input, requests structured output, and parses the result shape.
- Contract tests should mirror existing Message Coach workflow tests and assert externally visible behavior, not prompt wording or internal implementation details.
- Unit tests should cover validation boundaries such as empty input and over-limit input if validation is implemented in the schema or workflow layer.
- Eval cases should be used to judge AI quality manually or semi-manually. A good eval case should verify that Reading Coach preserves meaning, explains tone cautiously, identifies source issues separately, and avoids inventing context.
- UI tests can be added later if browser automation becomes part of the project test suite. For MVP implementation, route-level manual QA plus build/typecheck is acceptable.
- Regression checks should include typecheck, lint, unit/contract tests, production build, and the Reading Coach eval script when API keys are available.

## Out of Scope

- Long-document or document-mode reading.
- Uploading files or ingesting documents.
- Source libraries, notebooks, citations, audio summaries, or enterprise knowledge search.
- Multi-document Q&A.
- Authentication.
- Database-backed persistence.
- Saving Reading Coach source issues as Memory.
- Basic Review flow implementation.
- Memory candidate review implementation.
- Spaced repetition scheduling.
- Rich editor behavior.
- Competing with NotebookLM, Copilot, ChatGPT file upload, or other broad document intelligence products.

## Further Notes

Reading Coach is the first MVP v1 workflow after the writing workflows. It should respect the product positioning added to PRODUCT.md: Lingua Loop solves small, frequent, practical English problems tailored for Vietnamese professionals.

The most important product distinction is that Reading Coach can explain someone else's English text, including its typos or awkward wording, without treating those source issues as the user's personal mistakes. This protects the meaning of Mistake Candidate, Memory, and Review for the later learning loop.
