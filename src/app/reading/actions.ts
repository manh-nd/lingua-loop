'use server';

import { runReadingCoach } from '@/core/reading/reading.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import {
  ReadingCoachInput,
  ReadingCoachResult,
} from '@/core/reading/reading.schema';

export async function submitReadingCoach(
  input: ReadingCoachInput
): Promise<ReadingCoachResult> {
  const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
  return await runReadingCoach(input, { aiClient });
}
