import { describe, expect, it } from 'vitest';
import { runReadingCoach } from '@/core/reading/reading.workflow';
import { AiClient } from '@/core/ai/ai-client';

describe('runReadingCoach', () => {
  it('returns structured reading coaching result', async () => {
    const fakeAiClient: AiClient = {
      generateJson: async () => ({
        naturalTranslation:
          'Bạn có thể xem qua cái này khi bạn có cơ hội không?',
        summaryVi: 'Người gửi nhờ kiểm tra thông tin khi rảnh.',
        toneAnalysis: {
          toneVi: 'lịch sự',
          impliedMeaningVi: 'Nhờ vả nhẹ nhàng, không gây áp lực.',
        },
        keyPhrases: [
          {
            phrase: 'when you have a chance',
            meaningVi: 'khi bạn có cơ hội/thời gian',
            usageVi: 'Dùng để nhờ vả một cách lịch sự.',
          },
        ],
        misunderstandingsVi: [
          {
            trapVi: 'have a chance',
            explanationVi:
              'Không dịch thô là "có cơ hội thắng cuộc", mà là "khi rảnh/có thời gian".',
          },
        ],
        sourceIssues: [
          {
            originalText: 'when you free',
            issueVi: 'Thiếu động từ to be.',
            category: 'grammar',
            suggestedFix: "when you're free",
          },
        ],
        replySuggestions: [
          {
            text: "Sure, I'll take a look shortly.",
            contextVi: 'Dùng khi đồng ý xem ngay.',
          },
        ],
      }),
    };

    const result = await runReadingCoach(
      {
        text: 'Please check this when you free',
        context: 'Slack message from teammate',
      },
      { aiClient: fakeAiClient }
    );

    expect(result.naturalTranslation).toContain('Bạn có thể');
    expect(result.sourceIssues).toHaveLength(1);
    expect(result.sourceIssues[0].category).toBe('grammar');
  });

  it('validates character limit', async () => {
    const fakeAiClient: AiClient = {
      generateJson: async () => ({}),
    };

    const longText = 'a'.repeat(3001);

    await expect(
      runReadingCoach(
        {
          text: longText,
        },
        { aiClient: fakeAiClient }
      )
    ).rejects.toThrow();
  });
});
