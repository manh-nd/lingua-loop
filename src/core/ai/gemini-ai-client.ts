import { GoogleGenAI } from '@google/genai';
import { AiClient, GenerateJsonInput } from './ai-client';

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  return apiKey;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status;
  }

  return undefined;
}

function isRetryableGeminiError(error: unknown) {
  const status = getErrorStatus(error);

  return status === 429 || status === 500 || status === 503 || status === 504;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 4;
  const baseDelayMs = options?.baseDelayMs ?? 1_000;
  const maxDelayMs = options?.maxDelayMs ?? 10_000;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableGeminiError(error) || attempt === maxAttempts) {
        throw error;
      }

      const exponentialDelay = Math.min(
        baseDelayMs * 2 ** (attempt - 1),
        maxDelayMs
      );

      const jitter = Math.floor(Math.random() * 500);

      await sleep(exponentialDelay + jitter);
    }
  }

  throw lastError;
}

export function createGeminiAiClient(): AiClient {
  const ai = new GoogleGenAI({
    apiKey: getApiKey(),
  });

  return {
    async generateJson(input: GenerateJsonInput): Promise<unknown> {
      const response = await withRetry(
        async () =>
          await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: [
                      input.system,
                      '',
                      'User input:',
                      input.user,
                      '',
                      'Return only valid JSON that matches the provided schema.',
                    ].join('\n'),
                  },
                ],
              },
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: input.schema,
            },
          })
      );

      console.log(response);

      if (!response.text) {
        throw new Error('Gemini returned empty response');
      }

      return JSON.parse(response.text);
    },
  };
}
