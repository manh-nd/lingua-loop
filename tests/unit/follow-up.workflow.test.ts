import { describe, expect, it, vi } from 'vitest';
import { runFollowUpWorkflow } from '@/core/message/follow-up.workflow';
import { AiClient } from '@/core/ai/ai-client';
import { FollowUpInput } from '@/core/message/follow-up.schema';

describe('runFollowUpWorkflow', () => {
  it('correctly constructs the prompt and returns parsed answer', async () => {
    const mockGenerateJson = vi.fn().mockResolvedValue({
      answerVi: 'Đây là câu trả lời của trợ lý về câu của bạn.',
    });

    const mockAiClient: AiClient = {
      generateJson: mockGenerateJson,
    };

    const input: FollowUpInput = {
      originalInput: 'Nhờ review PR nhé',
      recommendedDraft: 'Could you please review this PR?',
      userQuestion: 'Tại sao lại dùng "Could you please"?',
      history: [
        { role: 'user', text: 'Nhờ review PR nhé' },
        { role: 'assistant', text: 'Đây là câu tiếng Anh đề xuất.' },
      ],
    };

    const result = await runFollowUpWorkflow(input, { aiClient: mockAiClient });

    expect(result).toEqual({
      answerVi: 'Đây là câu trả lời của trợ lý về câu của bạn.',
    });

    expect(mockGenerateJson).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateJson.mock.calls[0][0];

    // Check system prompt constraints are included
    expect(callArgs.system).toContain(
      'You are an English message and writing coach for Vietnamese professionals.'
    );
    expect(callArgs.system).toContain('Never use code-style single quotes');

    // Check user payload
    const userPayload = JSON.parse(callArgs.user);
    expect(userPayload.originalInput).toBe(input.originalInput);
    expect(userPayload.recommendedDraft).toBe(input.recommendedDraft);
    expect(userPayload.userQuestion).toBe(input.userQuestion);
  });
});
