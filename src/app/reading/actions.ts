'use server';

import { runReadingCoach } from '@/core/reading/reading.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import {
  ReadingCoachInput,
  ReadingCoachResult,
} from '@/core/reading/reading.schema';
import { presentAiError } from '@/core/ai/ai-error-presenter';

export async function submitReadingCoach(
  input: ReadingCoachInput
): Promise<ReadingCoachResult> {
  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
    return await runReadingCoach(input, { aiClient });
  } catch (error) {
    throw new Error(presentAiError(error));
  }
}
