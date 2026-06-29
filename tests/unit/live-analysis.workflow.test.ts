import { describe, expect, it, vi } from 'vitest';
import { runLiveAnalysisWorkflow } from '@/core/live/live-analysis.workflow';
import { AiClient } from '@/core/ai/ai-client';
import { LiveAnalysisInput } from '@/core/live/live-analysis.schema';

describe('runLiveAnalysisWorkflow', () => {
  it('correctly invokes gemini and returns parsed evaluation report', async () => {
    const mockReport = {
      overallScore: 85,
      grammarScore: 80,
      pronunciationScore: 90,
      fluencyScore: 82,
      summaryVi: 'Bạn nói rất tốt, cần chú ý một chút về cấu trúc ngữ pháp.',
      mistakes: [
        {
          originalText: 'I goes to office yesterday',
          correctedText: 'I went to the office yesterday',
          explanationVi: 'Sử dụng thì quá khứ đơn "went" thay vì "goes".',
        },
      ],
      alternatives: [
        {
          originalText: 'I think it is ok',
          betterAlternative: 'I believe it looks good',
          explanationVi: 'Cách nói trang trọng và chuyên nghiệp hơn.',
        },
      ],
      practiceMonologue: 'I went to the office yesterday to finish my work.',
    };

    const mockGenerateJson = vi.fn().mockResolvedValue(mockReport);
    const mockAiClient: AiClient = { generateJson: mockGenerateJson };

    const input: LiveAnalysisInput = {
      scenarioTitle: 'Họp tiến độ daily',
      transcript: [
        { role: 'user', text: 'I goes to office yesterday' },
        { role: 'assistant', text: 'Okay, thanks for the update.' },
      ],
    };

    const result = await runLiveAnalysisWorkflow(input, {
      aiClient: mockAiClient,
    });

    expect(result).toEqual(mockReport);
    expect(mockGenerateJson).toHaveBeenCalledTimes(1);

    const callArgs = mockGenerateJson.mock.calls[0][0];
    expect(callArgs.system).toContain('Speaking & Communication Coach');
    expect(callArgs.system).toContain('Never use code-style single quotes');

    const userPayload = JSON.parse(callArgs.user);
    expect(userPayload.scenarioTitle).toBe(input.scenarioTitle);
    expect(userPayload.transcript).toEqual(input.transcript);
  });
});
