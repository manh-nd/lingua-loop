import { describe, expect, it } from 'vitest';
import { getFriendlyErrorMessage } from '@/lib/error';

describe('getFriendlyErrorMessage', () => {
  it('maps key pool rate limit error to a friendly Vietnamese message', () => {
    const err = new Error('All Gemini API keys are currently rate limited');
    const result = getFriendlyErrorMessage(err);
    expect(result).toBe(
      'AI đang bận hoặc API key đã chạm giới hạn. Thử lại sau một chút hoặc kiểm tra GEMINI_API_KEYS.'
    );
  });

  it('maps typical 429/quota/exhausted errors to a friendly Vietnamese message', () => {
    const err1 = new Error('Resource has been exhausted (e.g. API rate limit)');
    const err2 = new Error('Google Gen AI SDK Error: 429 Resource Exhausted');
    const err3 = new Error('API key quota exceeded');

    expect(getFriendlyErrorMessage(err1)).toBe(
      'AI đang bận hoặc API key đã chạm giới hạn. Thử lại sau một chút hoặc kiểm tra GEMINI_API_KEYS.'
    );
    expect(getFriendlyErrorMessage(err2)).toBe(
      'AI đang bận hoặc API key đã chạm giới hạn. Thử lại sau một chút hoặc kiểm tra GEMINI_API_KEYS.'
    );
    expect(getFriendlyErrorMessage(err3)).toBe(
      'AI đang bận hoặc API key đã chạm giới hạn. Thử lại sau một chút hoặc kiểm tra GEMINI_API_KEYS.'
    );
  });

  it('passes through or provides a generic fallback for other error messages', () => {
    const err = new Error('Some other random technical error');
    const result = getFriendlyErrorMessage(err);
    expect(result).toBe('Some other random technical error');
  });

  it('handles non-Error objects gracefully', () => {
    expect(getFriendlyErrorMessage('String error')).toBe('String error');
    expect(getFriendlyErrorMessage({ message: 'Object error' })).toBe(
      'Object error'
    );
    expect(getFriendlyErrorMessage(null)).toBe('Đã xảy ra lỗi không xác định.');
  });
});
