# 5. Guided Practice Modes and Modular Live Coach Architecture

## Status

Accepted (Implemented)

## Context

The initial Live Speak & Listen Coach (`/live` page) was a monolithic React component (~855 lines) supporting only **Conversation Practice** (6 static roleplay scenarios).
To make the app support a wider range of English learners, we needed to expand the system with **Guided Practice** modes—specifically:

1. **Shadowing**: AI speaks a sentence, user repeats, AI checks accuracy.
2. **Vocab Building**: AI introduces a word and example, user places a sentence, AI critiques.
3. **Read-Aloud**: AI reads a short passage, user reads it, AI highlights pronunciation.
4. **Interactive Podcast**: AI tells a story for 1-2 minutes, pauses to ask a question, and continues on user response.

These guided modes require:

- A way to configure topic selection (Workplace, Daily Life, Academic, Technology).
- Custom UI displays (e.g. highlighting target text in Read-Aloud mode).
- Custom prompt generation and mode-specific post-call analysis report guidelines.

Implementing these within the original monolithic component would result in a massive, unmaintainable file with messy conditional branching. Furthermore, we needed a robust state synchronization mechanism to avoid React 19 linter warnings when calling `setState` inside `useEffect` blocks.

## Decision

We implemented the following architectural changes:

### 1. Unified Live Modes Configuration

We created a structured data model in `src/core/live/live-modes.ts` to manage all modes, topics, and scenarios. This encapsulates all base system instructions for both Guided and Conversation categories, decoupling them from React components.

### 2. Modular Component Hierarchy

We refactored `/live/page.tsx` into an orchestrator page managing 5 new modular React sub-components:

- **`LiveModeSidebar`**: Renders category-grouped side menus. Unified the sidebar UX so that both Guided and Conversation modes expand to show sub-options (Topics for guided modes, Scenarios for conversation modes) rather than leaving conversation options flat and cluttered.
- **`LivePreCallCard`**: Shows instructions (Guided) or recommended phrases (Roleplay), using identical card layouts, background colors, and numbered bullet styles for design consistency.
- **`LiveCallView`**: Manages active call visualizer, transcript scroll, and mute/hangup controls.
- **`LiveTranscript`**: Transcript logger. In **Read-Aloud** mode, it displays the Coach's target text in a highlighted reading box with custom styling to guide the user visually.
- **`LiveReportView`**: Renders the score dials, monologue, mistakes, and phrasings list.

### 3. Event-Driven State Synchronization

We removed React `useEffect` hooks that synced default topics/scenarios when the selected mode changed. Instead, we handled all state synchronization inside the sidebar's `onSelectMode` click handler, resolving the Next.js `react-hooks/set-state-in-effect` rule warnings.

### 4. Mode-Aware Hook and Post-Call Analysis

- Updated `useLiveSession` to accept `mode` configuration and build final system prompts internally (matching voice options and inserting `[TOPIC_NAME]` details).
- Enhanced the `live-analysis.workflow.ts` prompt to adapt to the active mode:
  - **Shadowing**: Focuses on word-for-word repetition accuracy.
  - **Vocab Building**: Focuses on correct contextual vocabulary usage.
  - **Read-Aloud**: Focuses on reading fidelity and pronunciation.
  - **Interactive Podcast**: Focuses on comprehension and relevance.

## Consequences

- **Code Maintainability**: The orchestrator page is simplified (~250 lines), and each component has a clear, isolated responsibility.
- **Aesthetic Consistency**: The UI uses uniform cards, consistent highlight colors (`bg-primary/[0.02]`), and unified numbered steps across all modes.
- **Pedagogical Flexibility**: The app now covers both active dialogue roleplay and structured listening/speaking exercises in a single page.
