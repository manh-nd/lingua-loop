import { describe, expect, it } from 'vitest';
import { runMessageCoach } from '@/core/message/message.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';

const runAiTests = process.env.RUN_AI_TESTS === 'true';

describe.skipIf(!runAiTests)('Message Coach with Gemini', () => {
  it('returns structured message coach result', async () => {
    const result = await runMessageCoach(
      {
        mode: 'improve_english_draft',
        text: 'Please check this when you free',
        tone: 'polite',
      },
      { aiClient: createGeminiAiClient() }
    );

    expect(result.recommendedMessage).toBeTruthy();
    expect(result.explanationVi).toBeTruthy();
    expect(result.mistakeCandidates.length).toBeLessThanOrEqual(3);
  });
});
