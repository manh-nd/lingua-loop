import { z } from 'zod';
import { toJSONSchema } from 'zod';
import { AiClient } from '@/core/ai/ai-client';
import { WorkspaceMemoryItem } from '@/core/workspace/workspace.matcher';

export const PracticeChallengeSchema = z.object({
  instruction: z.string().trim().min(1),
  context: z.string().trim().optional(),
  suggestedFormat: z.string().trim().optional(),
});

export type PracticeChallenge = z.infer<typeof PracticeChallengeSchema>;

export async function runPracticeChallengeGeneration(
  item: WorkspaceMemoryItem,
  deps: { aiClient: AiClient }
): Promise<PracticeChallenge> {
  const jsonSchema = toJSONSchema(PracticeChallengeSchema);

  const systemPrompt = `
You are a workplace English coach for Vietnamese professionals.
Your task is to generate a realistic, short workplace scenario/writing challenge based on a saved notebook memory item.

The challenge should prompt the user to write a sentence in English.
- For "mistake" or "tone_pattern" items: Prompt the user to write a sentence that avoids or corrects the mistake, or rewrites a rough sentence into the target tone.
- For "reusable_phrase" or "vocabulary" items: Prompt the user to write a workplace sentence (e.g. Email, Slack, meeting comment) applying the phrase or word in a natural context.

Format constraints:
- instruction: Clear instructions in Vietnamese (e.g. "Hãy viết một câu xin phép nghỉ học sử dụng cụm từ 'take time off'").
- context (optional): Brief background description of the scenario or the target vocabulary meaning/situation.
- suggestedFormat (optional): A small hint on how to start or structure the answer.
`;

  const userPrompt = `
Memory Item Details:
- Type: ${item.type}
- Title: ${item.title}
- Explanation: ${item.explanation}
- Wrong Text: ${item.wrongText || 'N/A'}
- Correct Text: ${item.correctText || 'N/A'}
- Phrase: ${item.phrase || 'N/A'}
- Situation: ${item.situation || 'N/A'}
`;

  const raw = await deps.aiClient.generateJson({
    system: systemPrompt,
    user: userPrompt,
    schema: jsonSchema,
  });

  return PracticeChallengeSchema.parse(raw);
}

export const PracticeGradingSchema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string().trim().min(1),
  sampleAnswer: z.string().trim().min(1),
});

export type PracticeGrading = z.infer<typeof PracticeGradingSchema>;

export async function runPracticeGrading(
  item: WorkspaceMemoryItem,
  challengePrompt: string,
  userAnswer: string,
  deps: { aiClient: AiClient }
): Promise<PracticeGrading> {
  const jsonSchema = toJSONSchema(PracticeGradingSchema);

  const systemPrompt = `
You are a workplace English coach for Vietnamese professionals.
Evaluate the user's answer to a writing challenge based on a notebook memory item.

Evaluate the user's answer against these criteria:
1. Did they correctly apply the vocabulary/phrase/correction?
2. Is the sentence grammatically correct, natural, and appropriate for a workplace setting?
3. Provide encouraging feedback in Vietnamese (feedback), highlighting what they did well, correcting any grammar/spelling errors, and explaining any improvements.
4. Output a native-like alternative sample sentence (sampleAnswer) that meets the challenge requirements.

Format constraints:
- isCorrect: true if the answer is mostly correct, natural, and successfully applies/corrects the target item. False if there are major grammar issues or the target item was not applied/corrected correctly.
- score: 0 to 100 representing the quality of the answer.
- feedback: Short, positive coaching comment in Vietnamese. Highlight target words inside double quotes ("...") or bold (**...**).
- sampleAnswer: A premium, natural English sentence.
`;

  const userPrompt = `
Memory Item:
- Type: ${item.type}
- Target: ${item.type === 'mistake' || item.type === 'tone_pattern' ? `Wrong: "${item.wrongText}", Correct: "${item.correctText}"` : `Phrase/Word: "${item.phrase}"`}
- Explanation: ${item.explanation}

Challenge Instruction:
${challengePrompt}

User's Written Answer:
"${userAnswer}"
`;

  const raw = await deps.aiClient.generateJson({
    system: systemPrompt,
    user: userPrompt,
    schema: jsonSchema,
  });

  return PracticeGradingSchema.parse(raw);
}
