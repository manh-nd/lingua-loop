'use server';

import { runExplanationCoach } from '@/core/explanation/explanation.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import {
  ExplanationCoachInput,
  ExplanationCoachResult,
} from '@/core/explanation/explanation.schema';

export async function submitExplanationCoach(
  input: ExplanationCoachInput
): Promise<ExplanationCoachResult> {
  const aiClient = createGeminiAiClient();
  return await runExplanationCoach(input, { aiClient });
}
