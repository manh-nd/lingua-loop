# 4. Live Coach Voice UX and Stability Improvements

## Status

Accepted (Implemented)

## Context

The Live Speak & Listen Coach is a real-time, bidirectional voice call feature for Vietnamese professionals. In early iterations, several user experience (UX) and technical stability issues were identified during live usage:

1. **AI Repetition Bug**: The AI coach often outputted duplicate instruction prompts in the same turn (e.g., _"Để nói tự nhiên hơn, hãy đọc câu này... Hãy đọc to câu này..."_).
2. **Echo Self-Interruption**: Sounds from the device's speakers were picked up by the microphone, causing the AI model's Voice Activity Detection (VAD) to trigger false interruptions ("barge-in") and stop talking mid-sentence.
3. **Greeting Echo Interruption**: At the very start of a call, the browser's WebRTC echo canceller has not yet converged, causing the AI's first greeting to be cut short instantly by its own echo.
4. **Lack of Mid-Lock Clarification**: When the AI locked the session waiting for a repetition check, if the user said _"I don't understand"_ or _"Tại sao?"_, the AI marked it as incorrect and demanded repetition again, trapping the user in a loop.
5. **No Monologue Practice**: After finishing a 10-minute conversational session, the user did not have a synthesized passage of their own ideas to practice reading or speaking later.
6. **Cramped Giao diện (Cramped UI)**: The transcription log viewport was only 160px tall, and the 2-column layout kept configuration panels open during active calls, distracting the user.
7. **Mobile Screen Sleep**: Phones automatically turned off or locked their screens during long speaking pauses.

## Decision

To establish a premium, robust, and pedagogical real-time speaking experience, we implemented the following technical decisions:

### 1. Structured Mutually Exclusive Prompt Cases

We refactored the prompt system of the **Active Grammar Coach** and **TOEIC Speaking Simulator** into a structured, Case-based state machine:

- **Case 0 (Explanation Request)**: If the user asks _"why?"_ or _"tại sao?"_, the AI breaks the repetition lock, explains the rule briefly in English or Vietnamese (based on context), and prompts them to repeat again.
- **Case 1 (Repetition Check)**: Checks user repetition. Compliments must be spoken **only in English** (e.g., _"Perfect repetition!"_).
- **Case 2 (Correction)**: Inspects grammar word-by-word and explains **why** the correction is made in Vietnamese.
- **Case 3 (Short Answer Expansion)**: Suggests an expanded sentence once.
- **Case 4 (Story Accumulation)** & **Case 5 (Normal Flow)**: Standard conversation states.

This mutually exclusive structure prevents the model from combining multiple rules and repeating the target sentence.

### 2. Dual-Protection Echo & Barge-in Mechanism

To allow natural user interruption while completely blocking echo feedback:

- **Initial 3.5-second Warm-up**: Microphones do not transmit audio to the WebSocket for the first 3.5 seconds of the call, allowing the AI to finish its greeting and the browser's WebRTC Echo Cancellation to stabilize.
- **0.02 RMS Volume Noise Gate**: When the AI is playing speaker audio, microphone chunks are only sent to the server if the Root Mean Square (RMS) volume exceeds `0.02`. This blocks low-level echo but transmits the user's voice if they speak up loudly, allowing natural barge-in.

### 3. Post-Call Practice Monologue (Bài nói tổng hợp)

- Added `practiceMonologue` to the `LiveAnalysisResultSchema` Zod model.
- The AI synthesizes all thoughts, facts, and details the user shared during the call into a cohesive, elegant 150-word English passage.
- The UI displays this monologue with a **CopyButton** and a **TTSButton (Text-To-Speech)** using native synthesis.

### 4. Dynamic Focus Mode UI

- Added `focusMode` to `CoachShell`: Hides the configuration sidebar during active calls and report screens, centering and expanding the main content area (full-width up to `max-w-3xl`).
- Enlarged the live transcript log scroll container to `h-[380px]` (380px) for readable text flows.
- Skipped analysis requests if the user did not speak (`transcript.some(msg => msg.role === 'user') === false`).
- Automatically cleared the report state when switching scenarios.

### 5. Browser Screen Wake Lock API

- Integrated the Screen Wake Lock API inside the call lifecycle. The browser requests a lock when the session is established and releases it on cleanup, ensuring mobile screens stay active while the call is open.
- Handled the `visibilitychange` event to re-acquire the lock when the user returns to the tab.

## Consequences

- **Self-Interruption eliminated**: Users can converse on speakers without the AI cutting itself off.
- **Natural Barge-in preserved**: Users can still naturally interrupt the AI by speaking up.
- **UX focus**: The UI is cleaner, larger, and keeps the screen awake.
- **Pedagogical value**: Users get immediate feedback in English, clear explanations of grammatical errors, and a complete text script to practice later.
