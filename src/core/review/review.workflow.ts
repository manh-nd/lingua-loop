import { toJSONSchema } from 'zod';
import { LocalMemoryItem } from '@/core/memory/memory.schema';
import { ReviewGradeResult, ReviewGradeResultSchema } from './review.schema';
import { buildReviewGraderSystemPrompt } from './review.prompt';
import { AiClient } from '@/core/ai/ai-client';

export async function runReviewGrader(
  item: LocalMemoryItem,
  userAnswer: string,
  deps: { aiClient: AiClient }
): Promise<ReviewGradeResult> {
  const jsonSchema = toJSONSchema(ReviewGradeResultSchema);

  const raw = await deps.aiClient.generateJson({
    system: buildReviewGraderSystemPrompt(item),
    user: JSON.stringify({ userAnswer }, null, 2),
    schema: jsonSchema,
  });

  return ReviewGradeResultSchema.parse(raw);
}
