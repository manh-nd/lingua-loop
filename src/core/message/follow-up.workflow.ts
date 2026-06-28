import { toJSONSchema } from 'zod';
import {
  FollowUpInput,
  FollowUpInputSchema,
  FollowUpResult,
  FollowUpResultSchema,
} from './follow-up.schema';
import { AiClient } from '@/core/ai/ai-client';

export async function runFollowUpWorkflow(
  input: FollowUpInput,
  deps: { aiClient: AiClient }
): Promise<FollowUpResult> {
  const parsedInput = FollowUpInputSchema.parse(input);
  const jsonSchema = toJSONSchema(FollowUpResultSchema);

  const raw = await deps.aiClient.generateJson({
    system: buildFollowUpSystemPrompt(),
    user: JSON.stringify(
      {
        originalInput: parsedInput.originalInput,
        recommendedDraft: parsedInput.recommendedDraft,
        history: parsedInput.history,
        userQuestion: parsedInput.userQuestion,
      },
      null,
      2
    ),
    schema: jsonSchema,
  });

  return FollowUpResultSchema.parse(raw);
}

function buildFollowUpSystemPrompt(): string {
  return `
You are an English message and writing coach for Vietnamese professionals.
Your job is to answer the user's follow-up question regarding a recommended English draft that was generated based on their original input.

Context provided:
- originalInput: What the user originally wanted to write (could be Vietnamese intent or English draft).
- recommendedDraft: The English sentence/message currently suggested to the user.
- history: The ongoing chat thread between the user and you.
- userQuestion: The current follow-up question or request.

Output Guidelines:
1. Explain in a warm, encouraging, and supportive Vietnamese tone (answerVi).
2. Write for a user who has average or weak English. Keep explanations very simple, short, and practical. Avoid heavy academic grammatical jargon.
3. Strict Copywriting Rules (Vietnamese text):
   - Never use code-style single quotes '...' (e.g., 'fixed', 'addressed'). Instead, use double quotes "..." or bold text **...** (e.g., "fixed", **fixed**).
   - Never use square brackets [...] under any circumstances in your text. If you need to write placeholders or templates, use ellipsis with Vietnamese description inside parenthesis: "... (gợi ý) ...".
4. Focus on the differences in nuance, word choice, or structure if the user asks "Why" or for alternatives.
5. If the user asks for a shorter version, a different tone, or a small tweak, output the updated English sentence clearly, explain why it works, and enclose the English sentence in double quotes "..." or bold text **...** so it stands out.
6. Keep the response concise, ideally 2-4 sentences, unless the user asks for deep grammatical details.
`.trim();
}
