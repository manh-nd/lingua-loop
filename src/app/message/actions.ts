'use server';

import { runMessageCoach } from '@/core/message/message.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import {
  MessageCoachInput,
  MessageCoachResult,
} from '@/core/message/message.schema';

export async function submitMessageCoach(
  input: MessageCoachInput
): Promise<MessageCoachResult> {
  const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
  return await runMessageCoach(input, { aiClient });
}
