import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import { ApiKeyPool } from '@/core/ai/api-key-pool';

// Mock the @google/genai module
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

describe('createGeminiAiClient', () => {
  let mockKeyPool: ApiKeyPool;

  beforeEach(() => {
    process.env.GEMINI_DEFAULT_MODEL = 'gemini-3.1-flash-lite';
    mockGenerateContent.mockReset();

    mockKeyPool = {
      getNextKey: vi.fn().mockResolvedValue({
        keyId: 'gemini-key-1',
        apiKey: 'key-abc-123',
      }),
      reportSuccess: vi.fn(),
      reportFailure: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('performs a successful JSON generation', async () => {
    mockGenerateContent.mockResolvedValue({
      text: '{"result": "success"}',
    });

    const client = createGeminiAiClient({ keyPool: mockKeyPool });
    const response = await client.generateJson({
      system: 'system prompt',
      user: 'user input',
      schema: { type: 'object' },
    });

    expect(response).toEqual({ result: 'success' });
    expect(mockKeyPool.getNextKey).toHaveBeenCalledTimes(1);
    expect(mockKeyPool.reportSuccess).toHaveBeenCalledWith('gemini-key-1');
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-3.1-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'system prompt\n\nUser input:\nuser input\n\nReturn only valid JSON that matches the provided schema.',
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: { type: 'object' },
      },
    });
  });

  it('retries with next key on retryable error', async () => {
    // Return key1 first, then key2
    vi.mocked(mockKeyPool.getNextKey)
      .mockResolvedValueOnce({
        keyId: 'gemini-key-1',
        apiKey: 'key-abc-123',
      })
      .mockResolvedValueOnce({
        keyId: 'gemini-key-2',
        apiKey: 'key-def-456',
      });

    // First attempt fails with 429, second attempt succeeds
    const error429 = Object.assign(new Error('Rate limit exceeded'), {
      status: 429,
    });
    mockGenerateContent
      .mockRejectedValueOnce(error429)
      .mockResolvedValueOnce({ text: '{"ok": true}' });

    const client = createGeminiAiClient({
      keyPool: mockKeyPool,
      maxAttempts: 3,
    });
    const response = await client.generateJson({
      system: 'sys',
      user: 'user',
      schema: {},
    });

    expect(response).toEqual({ ok: true });
    expect(mockKeyPool.getNextKey).toHaveBeenCalledTimes(2);

    // Should report failure for first key
    expect(mockKeyPool.reportFailure).toHaveBeenCalledWith(
      'gemini-key-1',
      expect.any(Error),
      { cooldownMs: 60_000 }
    );

    // Should report success for second key
    expect(mockKeyPool.reportSuccess).toHaveBeenCalledWith('gemini-key-2');
  });

  it('stops immediately and throws on non-retryable error', async () => {
    const error400 = Object.assign(new Error('Bad Request'), { status: 400 });
    mockGenerateContent.mockRejectedValue(error400);

    const client = createGeminiAiClient({ keyPool: mockKeyPool });

    await expect(
      client.generateJson({ system: 'sys', user: 'user', schema: {} })
    ).rejects.toThrow('Bad Request');

    expect(mockKeyPool.getNextKey).toHaveBeenCalledTimes(1);
    expect(mockKeyPool.reportFailure).not.toHaveBeenCalled();
    expect(mockKeyPool.reportSuccess).not.toHaveBeenCalled();
  });

  it('throws last error when max attempts are exceeded', async () => {
    const error500 = Object.assign(new Error('Internal Server Error'), {
      status: 500,
    });
    mockGenerateContent.mockRejectedValue(error500);

    const client = createGeminiAiClient({
      keyPool: mockKeyPool,
      maxAttempts: 2,
    });

    await expect(
      client.generateJson({ system: 'sys', user: 'user', schema: {} })
    ).rejects.toThrow('Internal Server Error');

    expect(mockKeyPool.getNextKey).toHaveBeenCalledTimes(2);
    expect(mockKeyPool.reportFailure).toHaveBeenCalledTimes(2);
  });

  it('redacts raw API keys in error message and stack trace', async () => {
    const errorWithKey = Object.assign(
      new Error('API key key-abc-123 is invalid or blocked'),
      { status: 400 }
    );
    mockGenerateContent.mockRejectedValue(errorWithKey);

    const client = createGeminiAiClient({ keyPool: mockKeyPool });

    const promise = client.generateJson({
      system: 'sys',
      user: 'user',
      schema: {},
    });

    await expect(promise).rejects.toThrow(
      'API key [REDACTED:gemini-key-1] is invalid or blocked'
    );

    // Also verify the stack trace is redacted
    try {
      await promise;
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(Error);
      const errorObj = err as Error;
      expect(errorObj.stack).toContain('[REDACTED:gemini-key-1]');
      expect(errorObj.stack).not.toContain('key-abc-123');
    }
  });
});
