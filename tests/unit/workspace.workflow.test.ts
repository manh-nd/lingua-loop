import { describe, expect, it, vi } from 'vitest';
import { runWorkspaceCorrection } from '@/core/workspace/workspace.workflow';
import { AiClient } from '@/core/ai/ai-client';
import { WorkspaceInput } from '@/core/workspace/workspace.schema';

describe('runWorkspaceCorrection', () => {
  it('correctly constructs the prompt and returns parsed result', async () => {
    const mockResponse = {
      improvedText: 'Could you please take a look at this PR?',
      changes: [
        {
          original: 'Please check PR',
          improved: 'take a look at this PR',
          reason: 'Lịch sự hơn trong môi trường làm việc.',
          category: 'tone',
        },
      ],
      memoryCandidates: [
        {
          type: 'mistake',
          patternKey: 'check_pr_vs_take_look',
          title: 'Nhờ check PR lịch sự',
          payload: {
            wrongText: 'Please check PR',
            correctText: 'take a look at this PR',
            explanation: 'Giải nghĩa chi tiết...',
            category: 'tone',
          },
        },
      ],
    };

    const mockGenerateJson = vi.fn().mockResolvedValue(mockResponse);
    const mockAiClient: AiClient = { generateJson: mockGenerateJson };

    const input: WorkspaceInput = {
      text: 'Please check PR',
      preset: 'quick_message',
      tone: 'polite',
    };

    const result = await runWorkspaceCorrection(input, {
      aiClient: mockAiClient,
    });

    expect(result.improvedText).toBe(mockResponse.improvedText);
    expect(result.changes).toEqual(mockResponse.changes);
    expect(result.memoryCandidates).toHaveLength(1);
    expect(result.memoryCandidates?.[0].patternKey).toBe(
      'check_pr_vs_take_look'
    );
    expect(mockGenerateJson).toHaveBeenCalledTimes(1);

    const callArgs = mockGenerateJson.mock.calls[0][0];
    expect(callArgs.system).toContain(
      'You are a premium English language coach for Vietnamese professionals'
    );
  });

  it('gracefully degrades and filters out malformed memory candidates while keeping core result', async () => {
    // Return one valid candidate and one malformed candidate (missing required field explanation)
    const mockResponseWithMalformedCandidate = {
      improvedText: 'Could you please take a look at this PR?',
      changes: [
        {
          original: 'Please check PR',
          improved: 'take a look at this PR',
          reason: 'Lịch sự hơn trong môi trường làm việc.',
          category: 'tone',
        },
      ],
      memoryCandidates: [
        {
          type: 'mistake',
          patternKey: 'valid_candidate',
          title: 'Gợi ý hợp lệ',
          payload: {
            wrongText: 'wrong',
            correctText: 'correct',
            explanation: 'Giải thích hợp lệ',
            category: 'tone',
          },
        },
        {
          type: 'mistake',
          patternKey: 'invalid_candidate_no_explanation',
          title: 'Gợi ý lỗi',
          payload: {
            wrongText: 'wrong',
            correctText: 'correct',
            // missing explanation
            category: 'tone',
          },
        },
      ],
    };

    const mockGenerateJson = vi
      .fn()
      .mockResolvedValue(mockResponseWithMalformedCandidate);
    const mockAiClient: AiClient = { generateJson: mockGenerateJson };

    const input: WorkspaceInput = {
      text: 'Please check PR',
      preset: 'quick_message',
    };

    const result = await runWorkspaceCorrection(input, {
      aiClient: mockAiClient,
    });

    expect(result.improvedText).toBe(
      'Could you please take a look at this PR?'
    );
    expect(result.changes).toHaveLength(1);
    // The malformed candidate is discarded, but the valid one remains
    expect(result.memoryCandidates).toHaveLength(1);
    expect(result.memoryCandidates?.[0].patternKey).toBe('valid_candidate');
  });
});
