# 3. AI-Native UX and Friendly Copywriting Conventions

## Status

Proposed (Pending Implementation Approval)

## Context

Lingua Loop's core audience consists of Vietnamese professionals. As an AI-native learning and writing assistant, the user experience should feel like communicating with a human coach rather than interacting with a technical system.

In early implementations, several programmer-facing conventions leaked into the user interface:

1. **Raw Database Keys**: Stable, `snake_case` keys like `MISSING_BE_BEFORE_ADJECTIVE` were displayed to the user in code tags.
2. **Developer-Style Copywriting**: The AI coach often used single quotes (`'...'`) to highlight English words and bracketed placeholders (like `[topic]` or `[goal]`) in explanation templates, which looks like code/variables.
3. **Mismatched Correction Context**: When users wrote Vietnamese intent (e.g. "Nhờ review PR giúp"), the system treated it as "wrong/incorrect English" and displayed it with a red strikethrough, which was grammatically and contextually incorrect.

## Decision

To establish a polished, professional, and friendly product experience, we will enforce the following UX and copywriting conventions:

1. **Banish Raw Keys from UI**:
   - `patternKey` remains a stable, `snake_case` identifier in the backend for de-duplication and schema verification.
   - We will introduce a new AI-generated field: `patternNameVi` (a natural, human-readable Vietnamese name, e.g., "Thiếu động từ To Be" instead of `missing_be_before_adjective`). The UI must display `patternNameVi`.
   - Legacy data without `patternNameVi` will be gracefully formatted (e.g. snake_case to Title Case) as a fallback.

2. **AI-Native Copywriting Constraints (Prompt Instructions)**:
   - **Quotes**: Banish the use of developer-style single quotes (`'...'`) in explanation prose. The AI must use double quotes (`"..."`) or bold text (`**...**`) to highlight words/phrases.
   - **Placeholders**: Banish bracketed placeholders (e.g. `[topic]`). Instead, use ellipses with Vietnamese hints in parentheses (e.g. `Just following up on ... (chủ đề) ...`).
   - **Tone**: The AI explanation tone must be encouraging and assistant-like (e.g. "Bạn nên ưu tiên dùng..." instead of "Lỗi sai từ vựng...").

3. **Dynamic Mode-Based UI Rendering**:
   - The UI will dynamically adjust labels and behaviors based on the input mode:
     - **Vietnamese Intent (`write_from_vietnamese` mode)**:
       - The input label is "Ý định viết của bạn" (Your Intent).
       - The output label is "Đề xuất viết tiếng Anh".
       - Strikethrough grammatical corrections comparing Vietnamese to English are disabled.
     - **English Draft (`improve_english_draft` mode)**:
       - The input label is "Bản nháp gốc" (Original Draft).
       - The output label is "Bản sửa đổi".
       - Strikethrough grammatical corrections are enabled and encouraged.

## Consequences

- The user interface will look highly polished and feel like a professional assistant.
- Prompts will include stricter formatting guidelines to guide the LLM's styling choices.
- Legacy stored items in local memory will be formatted cleanly on-the-fly.
