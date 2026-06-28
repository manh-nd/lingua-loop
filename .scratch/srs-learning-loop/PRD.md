# PRD - SRS Learning Loop (Spaced Repetition & AI-Graded Review Engine)

Status: ready-for-agent

## Problem Statement

As a Vietnamese professional learning English, I currently get message corrections and reading trap explanations, but I quickly forget them because there is no structured review loop. A static diary or quiz is insufficient because it doesn't filter due cards automatically, forces exact match grading which is frustrating for natural language alternatives or minor spelling typos, and lacks context about business and cultural communication nuances (such as East Asian vs. Western workplace communication dynamics).

## Solution

A local Spaced Repetition System (SRS) review loop based on the SM-2 algorithm, using an AI-graded review mechanism to allow flexible, semantic grading. The review loop supports three types of items: writing mistakes (sentence correction), reading traps (explaining implied meaning), and reusable phrases (writing English from intention/context). Cultural context and business nuances are generated during coaching and review grading to help users learn the communication differences.

---

## User Stories

1. As a Vietnamese professional, I want my writing mistakes to be automatically scheduled for review based on how well I remember them, so that I can practice them right before forgetting them.
2. As a Vietnamese professional, I want the review system to use AI grading, so that my correct answers with minor typos or natural synonyms are not marked wrong.
3. As a Vietnamese professional, I want to learn the cultural context of my mistakes and phrasings, so that I can understand how a Western colleague might interpret my English vs. my East Asian intent.
4. As a Vietnamese professional, I want a "Luyện lỗi này ngay" (Practice now) button immediately after saving a card, so that I can practice it immediately while the explanation is fresh.
5. As a Vietnamese professional, I want Reading Coach to suggest reading traps (bẫy đọc hiểu) and reusable phrases as memory candidates, so that I can avoid misinterpreting workplace English in the future.
6. As a Vietnamese professional, I want the review session to put incorrectly answered cards back at the end of the queue, so that I am forced to write the correct version before completing the session.
7. As a Vietnamese professional, I want to see a hint (word initials) when trying to recall a reusable phrase, so that I can get help without seeing the full answer.
8. As a Vietnamese professional, I want to see a clean status page when no cards are due, with an option to "Ôn tập trước hạn" (Review ahead / all active items), so that I can keep studying if I have free time.
9. As a Vietnamese professional, I want to see module names like "Email & Message Coach" and "Work Documentation Coach" and options like "Viết từ ý định", so that I am encouraged to write from intention instead of treating it as a literal translation tool.
10. As a Vietnamese professional, I want to save a reusable phrase suggested by the Email & Message Coach or Work Documentation Coach with a click, so that I can practice using it in my active vocabulary.

---

## Implementation Decisions

### 1. Unified Memory Data Model

The local storage memory model will be expanded to support three memory types: `writing_mistake`, `reading_trap`, and `reusable_phrase`, along with Spaced Repetition (SRS) tracking metadata.

From our prototype, the TypeScript definition for `LocalMemoryItem` is:

```typescript
export type MemoryType = 'writing_mistake' | 'reading_trap' | 'reusable_phrase';
export type SourceWorkflow = 'message' | 'explanation' | 'reading';
export type MemoryStatus = 'active' | 'ignored' | 'mastered';

export type LocalMemoryItem = {
  id: string;
  memoryType: MemoryType;
  sourceWorkflow: SourceWorkflow;
  status: MemoryStatus;
  patternKey: string;
  category: string;
  explanationVi: string;
  culturalContextVi?: string; // Cultural differences or business context
  createdAt: string;
  updatedAt: string;

  // Specific to 'writing_mistake'
  wrongText?: string;
  correctText?: string;

  // Specific to 'reusable_phrase'
  phrase?: string;
  situationVi?: string;

  // Specific to 'reading_trap'
  trapText?: string;
  wrongInterpretationVi?: string;
  correctInterpretationVi?: string;

  // SRS Metadata
  reviewCount: number;
  correctStreak: number;
  wrongStreak: number;
  lastReviewedAt?: string;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
};
```

### 2. Spaced Repetition System (SRS) Scheduler

We will implement a binary-grading (Correct/Incorrect) SM-2 algorithm:

- **Correct**:
  - `correctStreak++`, `wrongStreak = 0`
  - `intervalDays`: 1 if streak is 1; 4 if streak is 2; `Math.ceil(intervalDays * easeFactor)` if streak is 3+.
  - `easeFactor`: `Math.min(3.0, easeFactor + 0.1)`.
  - `nextReviewAt`: `now + intervalDays`.
- **Incorrect**:
  - `correctStreak = 0`, `wrongStreak++`
  - `intervalDays`: 1
  - `easeFactor`: `Math.max(1.3, easeFactor - 0.2)`.
  - `nextReviewAt`: `now + 1 day`.

### 3. AI-Graded Review Engine

- A server action will execute reviews against Gemini using `GEMINI_DEFAULT_MODEL`.
- The grading JSON response schema:
  - `isCorrect: boolean` (ignores tiny typos or natural synonyms, grades semantics).
  - `feedbackVi: string` (Vietnamese advice on spelling/grammar).
  - `suggestedAlternative?: string` (better/natural phrasing option based on user answer).
  - `culturalContextVi?: string` (cultural explanation or business context).

### 4. Reading Coach Candidates Extraction

- The Reading Coach will now return `readingMemoryCandidates` containing reading traps or reusable phrases found in the source text.
- Prompt updated to extract cultural context and appropriate fields.

---

## Testing Decisions

- Only test external behavior (e.g. testing the SRS scheduling math algorithm updates properties correctly, testing the AI grader input/output structure).
- **Test files to create/verify**:
  - Unit tests for the SM-2 scheduler function.
  - Verification of local storage helper functions.
- **Prior Art**: Code uses `vitest` as defined in `vitest.config.ts`.

---

## Out of Scope

- Database-backed persistence (localStorage only for now).
- Authentication or user accounts.
- Daily email or push notifications (review is pull-based).
- Rich text editor integrations (use basic Textarea).
