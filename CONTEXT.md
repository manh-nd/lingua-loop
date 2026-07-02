# Lingua Loop

Lingua Loop is an English improvement system for Vietnamese professionals. Its domain centers on the Active Correction Loop: real workplace writing and speaking moments are corrected, explained, saved as personal memory, and practiced later in new contexts.

## Language

**Active Correction Loop**:
The central product model. The user writes, speaks, or reads workplace English; AI corrects or explains it; AI proposes MemoryCandidates; the user saves selected candidates as MemoryItems; saved MemoryItems influence future correction and Practice.
_Avoid_: Linear writing assistant, one-off grammar checker, flashcard loop

**Correction Workspace**:
The primary writing surface for improving workplace English. It handles quick messages, emails, PR/Jira comments, documentation, and explanation/spec writing through presets. It replaces Message Coach and Explanation Coach as standalone product workflows.
_Avoid_: Message Coach as a separate product, Explanation Coach as a separate product, generic editor

**CorrectionSession**:
A saved workspace correction event. It records the original text, improved text, context controls, preset, generated MemoryCandidates, and timestamps so the user can reopen history, copy the improved version, refine from an old session, and review pending suggestions.
_Avoid_: Draft, document history, chat history

**MemoryCandidate**:
An AI-proposed learning point that has not yet become saved memory. A MemoryCandidate can be pending, saved, or ignored. It should usually come from the diff between original and improved text.
_Avoid_: Mistake Candidate, correction, grammar note

**MemoryItem**:
A user-approved saved learning point. MemoryItems are used for future correction, Practice, and personalization. Core types are Mistake, Reusable Phrase, Vocabulary, and Tone Pattern.
_Avoid_: Learning item, saved correction, flashcard

**Memory**:
The user's personal collection of saved MemoryItems and pending MemoryCandidates. Memory is the product's durable learning data and must be database-backed for cross-device use.
_Avoid_: localStorage memory, backup JSON as source of truth

**Mistake**:
A MemoryItem type for a recurring or reusable error pattern, usually represented with an original example, corrected example, and explanation.
_Avoid_: generic grammar rule

**Reusable Phrase**:
A MemoryItem type for workplace phrasing the user can reuse in future writing or speaking.
_Avoid_: idiom list, phrasebook entry detached from context

**Vocabulary**:
A MemoryItem type for a word, phrase, or collocation worth learning in a workplace context.
_Avoid_: dictionary entry without a personal example

**Tone Pattern**:
A MemoryItem type for a reusable tone transformation, such as direct to polite, vague to clear, casual to professional, or too strong to softer.
_Avoid_: sentiment label, style preference only

**Practice**:
The active learning workflow for due MemoryItems. The default mode is writing-first practice, not flashcards or multiple choice. Practice asks the user to produce English in a new workplace context.
_Avoid_: Review as the primary term, quiz, flashcard dashboard

**Live Coach**:
The primary speaking and listening surface. It supports guided and conversation practice, and should evolve into a Memory-aware Speaking Coach that uses saved MemoryItems and creates post-call MemoryCandidates.
_Avoid_: voice chat, call bot, standalone speaking product detached from Memory

**Reading Coach**:
A secondary learning surface for understanding English written by others and collecting useful Vocabulary, Reusable Phrase, and Tone Pattern candidates. It should not create Mistake candidates unless the user marks the source as their own draft.
_Avoid_: translation tool, document intelligence platform

**Suggested memories**:
User-facing UI copy for pending MemoryCandidates.
_Avoid_: MemoryCandidate in visible end-user copy unless debugging

**Saved memories**:
User-facing UI copy for saved MemoryItems.
_Avoid_: MemoryItem in visible end-user copy unless debugging

## UX & Copywriting Conventions

For UI design and copywriting guidelines, refer to [ADR-0003](./docs/adr/0003-ai-native-ux-and-friendly-copywriting.md).
