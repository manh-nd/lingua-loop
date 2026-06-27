'use server';

import { runMessageCoach } from '@/core/message/message.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import {
  MessageCoachInput,
  MessageCoachResult,
} from '@/core/message/message.schema';
import { presentAiError } from '@/core/ai/ai-error-presenter';

export async function submitMessageCoach(
  input: MessageCoachInput
): Promise<MessageCoachResult> {
  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
    return await runMessageCoach(input, { aiClient });
  } catch (error) {
    throw new Error(presentAiError(error));
  }
}
