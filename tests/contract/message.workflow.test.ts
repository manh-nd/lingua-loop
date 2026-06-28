import { describe, expect, it } from 'vitest';
import { runMessageCoach } from '@/core/message/message.workflow';
import { AiClient } from '@/core/ai/ai-client';

describe('runMessageCoach', () => {
  it('returns structured message coaching result', async () => {
    const fakeAiClient: AiClient = {
      generateJson: async () => ({
        recommendedMessage:
          'Could you take a look at this when you have a chance?',
        alternatives: [
          {
            label: 'more_direct',
            text: "Can you check this when you're free?",
            whenToUseVi: 'Dùng khi nói với đồng nghiệp thân quen.',
          },
        ],
        explanationVi:
          'Câu này tự nhiên và lịch sự hơn so với cách nói trực tiếp.',
        corrections: [
          {
            original: 'when you free',
            improved: "when you're free",
            reasonVi: 'Thiếu động từ to be.',
            category: 'grammar',
          },
        ],
        reusablePhrases: [
          {
            phrase: 'when you have a chance',
            meaningVi: 'khi bạn có thời gian',
            situationVi: 'Dùng để nhờ ai đó làm gì một cách lịch sự.',
          },
        ],
        mistakeCandidates: [
          {
            patternKey: 'missing_be_when_free',
            patternNameVi: 'Thiếu động từ to-be',
            wrongText: 'when you free',
            correctText: "when you're free",
            explanationVi: "Trong tiếng Anh cần có động từ 'are'.",
            category: 'grammar',
            confidence: 0.95,
            source: 'observed',
            shouldSave: true,
          },
        ],
      }),
    };

    const result = await runMessageCoach(
      {
        mode: 'improve_english_draft',
        text: 'Please check this when you free',
        tone: 'polite',
      },
      { aiClient: fakeAiClient }
    );

    expect(result.recommendedMessage).toContain('Could you');
    expect(result.mistakeCandidates).toHaveLength(1);
  });
});
