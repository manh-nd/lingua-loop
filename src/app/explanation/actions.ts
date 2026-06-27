'use server';

import { runExplanationCoach } from '@/core/explanation/explanation.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import {
  ExplanationCoachInput,
  ExplanationCoachResult,
} from '@/core/explanation/explanation.schema';
import { presentAiError } from '@/core/ai/ai-error-presenter';

export async function submitExplanationCoach(
  input: ExplanationCoachInput
): Promise<ExplanationCoachResult> {
  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
    return await runExplanationCoach(input, { aiClient });
  } catch (error) {
    throw new Error(presentAiError(error));
  }
}
