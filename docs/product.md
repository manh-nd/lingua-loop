# Lingua Loop Product Direction

Lingua Loop is an English improvement system for Vietnamese professionals. It helps users improve workplace English through an Active Correction Loop: real writing and speaking moments are corrected, explained, saved as personal memory, and practiced later in new contexts.

The product is not a general AI writing tool, a document intelligence platform, or a flashcard app. Its core value is turning everyday corrections into reusable learning data that helps the user avoid repeating old mistakes and reuse better English over time.

## Core Promise

Lingua Loop helps Vietnamese professionals improve workplace English by learning from their own real corrections.

Every useful interaction should support this loop:

1. The user writes, speaks, or reads workplace English.
2. AI corrects or explains the language in context.
3. AI shows what changed and why.
4. AI proposes high-signal MemoryCandidates.
5. The user saves, edits, or ignores each candidate.
6. Saved MemoryItems influence future corrections and practice.
7. The user practices saved MemoryItems through active writing or speaking tasks.

## Product Model

### Active Correction Loop

The Active Correction Loop is the central product model. It connects all major surfaces:

- Correction Workspace for writing, rewriting, and improving workplace English.
- Live Coach for speaking and listening practice.
- Reading Coach for understanding external English and collecting useful language.
- Memory for saved personal learning points.
- Practice for writing-first active review.

### Primary Surfaces

Correction Workspace and Live Coach are the two long-term primary surfaces.

Correction Workspace is prioritized first because it establishes the shared learning infrastructure: database-backed CorrectionSessions, MemoryCandidates, MemoryItems, history, and writing-first Practice.

Live Coach remains a primary surface for speaking improvement. Its long-term role is to become a Memory-aware Speaking Coach that uses saved MemoryItems, creates post-call MemoryCandidates, and supports active speaking practice.

### Secondary Surfaces

Reading Coach is a secondary learning surface. It helps the user understand English written by other people and collect reusable language. When the source text is not the user's own draft, Reading Coach should not create Mistake candidates for the user. It may create Vocabulary, Reusable Phrase, or Tone Pattern candidates.

## Correction Workspace

Correction Workspace is the main writing surface. It replaces Message Coach and Explanation Coach as separate product workflows. Those older workflows become presets inside the workspace.

### MVP Presets

- Quick Message
- Email
- PR/Jira Comment
- Documentation
- Explanation/Spec

Each preset uses the same Active Correction Loop but has a lightweight behavior profile:

- Quick Message: short, natural, fast to send.
- Email: polite, professional, clear about context and requests.
- PR/Jira Comment: precise, technical, concise, and not overly polite.
- Documentation: structured, clear, and terminology-consistent.
- Explanation/Spec: improves sequencing, clarity, ambiguity, and technical meaning preservation.

### Context Controls

The workspace should stay minimal. MVP controls:

- Preset
- Goal
- Tone
- Audience
- Custom instruction

Goals may include Fix mistakes, Improve clarity, Make professional, and Make concise. Tone options may include Neutral, Friendly, Polite, and Direct.

### Correction Behavior

The default behavior is meaning-preserving correction. AI may improve grammar, word choice, collocation, structure, clarity, and tone, but it must not add new claims, commitments, or details unless the user explicitly asks for that through a refine goal or custom instruction.

The result should show one primary improved version only. If the user is not satisfied, the user should refine with guided controls such as More concise, More polite, More direct, More natural, Simpler English, or a custom instruction. Regeneration should not be random.

### Result Sections

Correction Workspace results should use three main sections:

1. Improved Version: the single recommended version, ready to copy.
2. What Changed & Why: two to five high-signal diffs with short explanations.
3. Suggested Memories: up to three MemoryCandidates with Save, Edit, and Ignore actions.

What Changed & Why should use English diffs and concise explanations. The product source of truth is English-first, but the UI may include Vietnamese explanations where that best serves the user.

## Memory Model

Learning data must be database-backed. localStorage must not be the source of truth for MemoryCandidates, MemoryItems, CorrectionSessions, Live learning data, or Practice data. localStorage may still be used for local UI preferences such as theme.

### MemoryCandidate

A MemoryCandidate is an AI-proposed learning point that has not yet become saved memory. It may be pending, saved, or ignored.

MemoryCandidates should be created mainly from the diff between original and improved text. They should be concrete, reusable, and likely to help the user avoid a future mistake or reuse better English.

Pending MemoryCandidates should be saved to the database when a correction completes so the user can review them later from any device.

### MemoryItem

A MemoryItem is a user-approved saved learning point. MemoryItems are used for future correction, Practice, and long-term personalization.

The core MemoryItem types are:

- Mistake
- Reusable Phrase
- Vocabulary
- Tone Pattern

MemoryItems should prefer personalized examples from real corrections. They should store only the short excerpt or example needed for learning, not full sensitive workplace content when that is unnecessary.

### CorrectionSession

A CorrectionSession records a workspace correction event. It should store the original text, improved text, context controls, preset, generated MemoryCandidates, and timestamps. The user should be able to return to history, copy the improved version, refine from an old session, review pending candidates, and delete sessions.

## Memory-Aware Correction

Correction Workspace should use saved MemoryItems during future corrections from the first production-ready phase.

The MVP retrieval strategy may be simple:

- Query active MemoryItems for the signed-in user.
- Prefer recent or frequently relevant items.
- Prefer Mistake and Tone Pattern items when correcting text.
- Use basic keyword or phrase matching.
- Limit prompt context to a small top-N set.

Embedding-based retrieval is a later improvement, not a Phase 1 requirement.

When the user repeats a saved mistake, the reminder should be subtle, short, and confidence-gated. The product should avoid shaming copy and avoid turning every correction into a long lesson.

## Practice

Practice replaces the old review framing. The default practice mode is active writing, not flashcards or multiple choice.

Practice should help the user reuse MemoryItems in new workplace contexts:

- Mistake: correct or rewrite a sentence with a similar issue.
- Reusable Phrase: write a workplace sentence using the phrase.
- Vocabulary: use the word or phrase in a relevant work context.
- Tone Pattern: rewrite a sentence into the target tone.

The MVP should use a simple schedule rather than focusing on advanced spaced repetition algorithms. The hard problem is producing useful active writing exercises, not implementing complex scheduling.

## App Structure

The app should use a dashboard app shell rather than a marketing homepage.

Routes:

- `/` Dashboard overview
- `/workspace` Correction Workspace
- `/live` Live Coach
- `/memory` Suggested and saved memories
- `/practice` Writing-first active practice
- `/reading` Reading Coach
- `/settings` Account, defaults, and data controls

Navigation should use a desktop sidebar and a mobile sheet/drawer.

Sidebar groups:

- Main: Dashboard, Workspace, Live
- Learning: Memory, Practice, Reading
- System: Settings

Dashboard should be a continue-working screen, not an analytics dashboard. It should prioritize continuing in Workspace, starting Live practice, practicing due memories, reviewing pending suggested memories, and reopening recent corrections.

## Roadmap

### Phase 1: Active Correction Foundation

Phase 1 establishes the end-to-end loop for writing-first usage.

Product capabilities:

- Dashboard app shell.
- Correction Workspace at `/workspace`.
- Five workspace presets.
- One primary improved version per correction.
- What Changed & Why.
- Database-backed CorrectionSessions.
- Database-backed MemoryCandidates.
- Database-backed MemoryItems.
- Suggested and saved memory management.
- Correction History inside Workspace.
- Basic Memory-aware correction.
- Writing-first Practice at `/practice`.
- Minimal Settings for account, defaults, and data controls.

Engineering requirements:

- Google Auth and database-backed learning data work in a deployed app.
- No localStorage source of truth for learning data.
- Phase 1 is ready for personal production use, not local-only usage.

Phase 1 is complete when the user can:

1. Sign in with Google on a deployed app.
2. Open Correction Workspace.
3. Paste or write a real work message or documentation snippet.
4. Get one meaning-preserving improved version.
5. See What Changed & Why.
6. Save, edit, or ignore up to three MemoryCandidates.
7. See saved MemoryItems in Memory.
8. Reopen correction history on another device.
9. Submit a later correction and have relevant MemoryItems influence the correction.
10. Practice due MemoryItems through writing-first active Practice.

### Phase 2: Memory-Aware Live Coach

Phase 2 upgrades Live Coach into the speaking surface of the Active Correction Loop.

- Live sessions use relevant MemoryItems.
- Post-call reports create MemoryCandidates.
- Speaking Practice uses due MemoryItems.
- Roleplay and guided modes become more targeted to the user's saved mistakes, vocabulary, phrases, and tone patterns.

### Phase 3: Rich Workspace and Reading Practice

Phase 3 improves richer workflows after the core loop is working.

- WYSIWYG or Notion-like editing.
- Better workspace history and search.
- Reading Turn into Practice flows.
- Richer documentation and short document workflows.

### Phase 4: Intelligence and Personalization

Phase 4 improves retrieval, personalization, and insight.

- Embedding-based Memory retrieval.
- Personalized learning profile.
- Better scheduling.
- Advanced analytics if they help the loop.

## Phase 1 Non-Goals

- No WYSIWYG or Notion-like editor yet.
- No embedding-based retrieval yet.
- No advanced analytics dashboard.
- No browser extension.
- No team or collaboration features.
- No long-document knowledge base.
- No public marketing site focus.
- No multiple alternatives by default.
- No flashcard or multiple-choice review as the default practice mode.

See [Backlog](./backlog.md) for later ideas.
