'use server';

import { runReviewGrader } from '@/core/review/review.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import { LocalMemoryItem } from '@/core/memory/memory.schema';
import { ReviewGradeResult } from '@/core/review/review.schema';
import { presentAiError } from '@/core/ai/ai-error-presenter';

export async function submitReviewGrade(
  item: LocalMemoryItem,
  userAnswer: string
): Promise<ReviewGradeResult> {
  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 8000 });
    return await runReviewGrader(item, userAnswer, { aiClient });
  } catch (error) {
    throw new Error(presentAiError(error));
  }
}
