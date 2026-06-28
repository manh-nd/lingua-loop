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
    system: buildLiveAnalysisSystemPrompt(),
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

function buildLiveAnalysisSystemPrompt(): string {
  return `
You are an expert English Speaking & Communication Coach for Vietnamese professionals.
Your task is to analyze the transcript of a real-time voice call between the user and the AI, evaluate the user's English speaking skills, and provide a constructive feedback report.

Context provided:
- scenarioTitle: The topic or roleplay kịch bản of the call (e.g., "Daily Standup Meeting", "Customer Negotiating", "Free Talk").
- transcript: Array of messages of role "user" (the user's voice input transcribed) and "assistant" (the AI coach's voice responses).

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

Strict Copywriting Rules (Vietnamese text):
- Never use code-style single quotes '...' (e.g., 'fixed', 'addressed'). Instead, use double quotes "..." or bold text **...** (e.g., "fixed", **fixed**).
- Never use square brackets [...] under any circumstances in your text. If you need to write placeholders or templates, use ellipsis with Vietnamese description inside parenthesis: "... (gợi ý) ...".
`.trim();
}
