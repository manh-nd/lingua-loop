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

import { runFollowUpWorkflow } from '@/core/message/follow-up.workflow';
import { FollowUpInput, FollowUpResult } from '@/core/message/follow-up.schema';

export async function submitFollowUpQuestion(
  input: FollowUpInput
): Promise<FollowUpResult> {
  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
    return await runFollowUpWorkflow(input, { aiClient });
  } catch (error) {
    throw new Error(presentAiError(error));
  }
}
