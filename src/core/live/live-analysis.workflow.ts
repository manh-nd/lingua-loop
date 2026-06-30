import { toJSONSchema } from 'zod';
import {
  LiveAnalysisInput,
  LiveAnalysisInputSchema,
  LiveAnalysisResult,
  LiveAnalysisResultSchema,
} from './live-analysis.schema';
import { AiClient } from '@/core/ai/ai-client';

export async function runLiveAnalysisWorkflow(
  input: LiveAnalysisInput,
  deps: { aiClient: AiClient }
): Promise<LiveAnalysisResult> {
  const parsedInput = LiveAnalysisInputSchema.parse(input);
  const jsonSchema = toJSONSchema(LiveAnalysisResultSchema);

  const raw = await deps.aiClient.generateJson({
    system: buildLiveAnalysisSystemPrompt(parsedInput.mode),
    user: JSON.stringify(
      {
        scenarioTitle: parsedInput.scenarioTitle,
        transcript: parsedInput.transcript,
      },
      null,
      2
    ),
    schema: jsonSchema,
  });

  return LiveAnalysisResultSchema.parse(raw);
}

function buildLiveAnalysisSystemPrompt(mode: string): string {
  let modeSpecificGuidelines = '';

  if (mode === 'shadowing') {
    modeSpecificGuidelines = `
This is a Shadowing (Luyện nói đuổi) session.
The core goal of this session was for the user to repeat the English sentences spoken by the AI as accurately as possible.
Focus evaluation on:
- Repetition accuracy: Compare the user's speech transcript word-for-word against the target sentences spoken by the assistant.
- Identify words omitted, replaced, or mispronounced (indicated by phonetic or spelling anomalies in the STT transcription).
- Highlight the target sentences that the user struggled to repeat correctly.
`;
  } else if (mode === 'vocab_building') {
    modeSpecificGuidelines = `
This is a Vocab Building (Tích lũy từ vựng) session.
The core goal of this session was for the user to learn new words/phrases and construct sentences using them.
Focus evaluation on:
- Vocabulary usage: Did the user use the newly introduced words/phrases correctly and contextually in their custom sentences?
- Sentence structure: Critique the grammar and phrasing of the sentences the user created.
`;
  } else if (mode === 'read_aloud') {
    modeSpecificGuidelines = `
This is a Read-Aloud (Luyện đọc to) session.
The core goal of this session was for the user to read short paragraphs/passages aloud.
Focus evaluation on:
- Reading fidelity: Compare the user's reading transcript against the target paragraphs they were asked to read.
- Identify mispronounced words, omissions, or fluency gaps.
`;
  } else if (mode === 'podcast_story') {
    modeSpecificGuidelines = `
This is an Interactive Podcast (Podcast tương tác) session.
The core goal of this session was for the user to listen to story/podcast segments and respond to comprehension questions.
Focus evaluation on:
- Listening comprehension: How well did the user understand the details of the story segments and respond to the host's questions?
- Relevance & fluency: Did the user answer the questions naturally and relevance-wise to the narrative?
`;
  } else {
    modeSpecificGuidelines = `
This is a Conversation (Hội thoại) practice session.
Evaluate overall conversational speaking capability, grammar, naturalness of expression, and vocabulary range.
`;
  }

  return `
You are an expert English Speaking & Communication Coach for Vietnamese professionals.
Your task is to analyze the transcript of a real-time voice call between the user and the AI, evaluate the user's English speaking skills, and provide a constructive feedback report.

Context provided:
- scenarioTitle: The topic or roleplay kịch bản of the call (e.g., "Daily Standup Meeting", "Customer Negotiating", "Free Talk").
- transcript: Array of messages of role "user" (the user's voice input transcribed) and "assistant" (the AI coach's voice responses).

Mode guidelines:
${modeSpecificGuidelines}

Analysis Guidelines:
CRITICAL: You must ONLY analyze the turns spoken by the "user" role. NEVER correct, analyze, or suggest alternatives for sentences spoken by the "assistant" role under any circumstances. The "assistant" turns represent the native-speaking model guiding the call, and their speech is already correct and intentional.

1. Identify grammatical errors, vocabulary mistakes, or clear spelling/transcription errors in the "user" turns. For each mistake, output:
   - originalText: The exact phrase/sentence spoken by the user that had an error.
   - correctedText: The grammatically correct version.
   - explanationVi: A warm, clear, and simple explanation of the error in Vietnamese.
2. Identify sentences spoken by the "user" that were grammatically correct but sounded awkward, too literal (translated directly from Vietnamese), or unprofessional for a corporate setting. For these, output:
   - originalText: The user's original phrasing.
   - betterAlternative: A natural, professional native English alternative.
   - explanationVi: The difference in nuance or why this alternative sounds better in Vietnamese.
3. Score the user (0 to 100 integers):
   - overallScore: Comprehensive speaking capability.
   - grammarScore: Accuracy of syntax and tenses.
   - pronunciationScore: Estimated based on transcription phonetic mismatches (if a word was transcribed very weirdly, e.g., "seek" instead of "sheet").
   - fluencyScore: Vocabulary range, flow, and response speed.
4. Output a summary (summaryVi) in Vietnamese:
   - Keep it encouraging, positive, and constructive.
   - Target a user who is anxious about speaking English. Keep explanations extremely simple and actionable.
5. Compile a practice monologue (practiceMonologue) in English:
   - Synthesize all thoughts, ideas, experiences, and facts that the user expressed during the entire conversation into a single, cohesive, and fluent English monologue or short narrative.
   - It must represent what the user tried to express, but polished into elegant, natural, and high-quality English (max 150 words).
   - The user will use this monologue to practice reading aloud and learning vocabulary later.

Strict Copywriting Rules (Vietnamese text):
- Never use code-style single quotes '...' (e.g., 'fixed', 'addressed'). Instead, use double quotes "..." or bold text **...** (e.g., "fixed", **fixed**).
- Never use square brackets [...] under any circumstances in your text. If you need to write placeholders or templates, use ellipsis with Vietnamese description inside parenthesis: "... (gợi ý) ...".
`.trim();
}
