import { describe, expect, it, vi } from 'vitest';
import {
  runPracticeChallengeGeneration,
  runPracticeGrading,
} from '@/core/practice/practice.workflow';
import { WorkspaceMemoryItem } from '@/core/workspace/workspace.matcher';
import { AiClient } from '@/core/ai/ai-client';

describe('Practice Workflow - Challenge Generation', () => {
  it('correctly constructs the prompt and returns parsed challenge result', async () => {
    const mockResponse = {
      instruction:
        'Bạn đang gửi email cho sếp xin nghỉ phép. Hãy viết 1 câu sử dụng cụm từ "take time off".',
      context: 'Context message',
      suggestedFormat: 'Format hint',
    };

    const mockGenerateJson = vi.fn().mockResolvedValue(mockResponse);
    const mockAiClient: AiClient = { generateJson: mockGenerateJson };

    const item: WorkspaceMemoryItem = {
      id: 'mem_123',
      type: 'reusable_phrase',
      title: 'Xin nghỉ phép',
      explanation: 'Dùng take time off để xin nghỉ phép chuyên nghiệp.',
      phrase: 'take time off',
      category: 'word_choice',
    };

    const result = await runPracticeChallengeGeneration(item, {
      aiClient: mockAiClient,
    });

    expect(mockGenerateJson).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateJson.mock.calls[0][0];
    expect(callArgs.system).toContain('workplace English coach');
    expect(callArgs.system).toContain('take time off');
    expect(result.instruction).toBe(mockResponse.instruction);
  });
});

describe('Practice Workflow - Grading', () => {
  it('correctly grades user answer and returns feedback and score', async () => {
    const mockGrading = {
      isCorrect: true,
      score: 95,
      feedback: 'Excellent work! You correctly used the phrase.',
      sampleAnswer: 'I would like to take some time off next week.',
    };

    const mockGenerateJson = vi.fn().mockResolvedValue(mockGrading);
    const mockAiClient: AiClient = { generateJson: mockGenerateJson };

    const item: WorkspaceMemoryItem = {
      id: 'mem_123',
      type: 'reusable_phrase',
      title: 'Xin nghỉ phép',
      explanation: 'Dùng take time off để xin nghỉ phép chuyên nghiệp.',
      phrase: 'take time off',
      category: 'word_choice',
    };

    const result = await runPracticeGrading(
      item,
      'Hãy viết 1 câu sử dụng cụm từ "take time off".',
      'I want to take some time off next week.',
      { aiClient: mockAiClient }
    );

    expect(mockGenerateJson).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateJson.mock.calls[0][0];
    expect(callArgs.system).toContain('workplace English coach');
    expect(callArgs.system).toContain('these criteria');
    expect(callArgs.user).toContain('take time off');
    expect(callArgs.user).toContain('I want to take some time off next week.');
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(95);
  });
});
