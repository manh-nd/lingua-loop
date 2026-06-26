import { GoogleGenAI } from '@google/genai';
import { AiClient, GenerateJsonInput } from './ai-client';
import { ApiKeyLease, ApiKeyPool } from './api-key-pool';
import { getGeminiApiKeyPool } from './gemini-api-key-pool';

/**
 * Retrieves the default Gemini model from environment variables.
 * Throws if the configuration is missing.
 */
function getModel(): string {
  const model = process.env.GEMINI_DEFAULT_MODEL;

  if (!model) {
    throw new Error('Missing GEMINI_DEFAULT_MODEL');
  }

  return model;
}

/**
 * Utility helper to sleep for a specified duration in milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Manages the GoogleGenAI instance cache to reuse client connections
 * and prevent SDK overhead.
 */
class GoogleGenAiCache {
  private cache = new Map<string, GoogleGenAI>();

  /**
   * Returns a cached GoogleGenAI instance or initializes a new one.
   */
  get(apiKey: string): GoogleGenAI {
    let client = this.cache.get(apiKey);

    if (!client) {
      client = new GoogleGenAI({ apiKey });
      this.cache.set(apiKey, client);
    }

    return client;
  }
}

/**
 * Handles security operations like redacting API keys from error outputs
 * to avoid leaking credentials in console logs or error trackers.
 */
class ErrorRedactor {
  /**
   * Replaces raw API key values in messages and stacks with a masked ID.
   */
  static redact(error: unknown, lease: ApiKeyLease): unknown {
    if (!lease.apiKey) {
      return error;
    }

    const rawMessage = error instanceof Error ? error.message : String(error);
    const redactedMessage = rawMessage.replaceAll(
      lease.apiKey,
      `[REDACTED:${lease.keyId}]`
    );

    const wrapped = new Error(redactedMessage);
    wrapped.name = error instanceof Error ? error.name : 'Error';

    if (error instanceof Error && error.stack) {
      wrapped.stack = error.stack.replaceAll(
        lease.apiKey,
        `[REDACTED:${lease.keyId}]`
      );
    }

    // Preserve status, code, and other custom HTTP properties on the error object
    if (typeof error === 'object' && error !== null) {
      for (const key of Object.keys(error)) {
        if (key !== 'message' && key !== 'stack') {
          (wrapped as unknown as Record<string, unknown>)[key] = (
            error as unknown as Record<string, unknown>
          )[key];
        }
      }
    }

    return wrapped;
  }
}

/**
 * Classifies Gemini API errors, determining retry behavior and cooldown actions.
 */
class GeminiErrorClassifier {
  /**
   * Safely extracts HTTP status code from a generic Gemini API error.
   */
  static getStatus(error: unknown): number | undefined {
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

  /**
   * Determines whether an error is transient and retryable.
   * - 429: Resource Exhausted / Rate limit hit
   * - 500, 503, 504: Temporary server-side errors
   */
  static isRetryable(error: unknown): boolean {
    const status = this.getStatus(error);

    return status === 429 || status === 500 || status === 503 || status === 504;
  }

  /**
   * Determines the target cooldown duration for specific error codes.
   * Returns 60 seconds cooldown for rate limit (429) errors.
   */
  static getCooldownMs(error: unknown): number | undefined {
    const status = this.getStatus(error);

    if (status === 429) {
      return 60_000;
    }

    return undefined;
  }
}

/**
 * Builds structured prompts for Gemini content generation.
 */
class StructuredPromptBuilder {
  /**
   * Assembles system prompt, user input, and JSON schema reminder.
   */
  static build(systemPrompt: string, userInput: string): string {
    return [
      systemPrompt,
      '',
      'User input:',
      userInput,
      '',
      'Return only valid JSON that matches the provided schema.',
    ].join('\n');
  }
}

/**
 * Creates the Gemini AI Client implementing the generic AiClient interface.
 * Coordinates with the ApiKeyPool to lease keys, execute content generation,
 * handle retryable failures, and redact API keys in logs/errors.
 */
export function createGeminiAiClient(options?: {
  keyPool?: ApiKeyPool;
  maxAttempts?: number;
}): AiClient {
  const model = getModel();
  const keyPool = options?.keyPool ?? getGeminiApiKeyPool();
  const maxAttempts = options?.maxAttempts ?? 6;
  const clientCache = new GoogleGenAiCache();

  return {
    async generateJson(input: GenerateJsonInput): Promise<unknown> {
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const lease = await keyPool.getNextKey();

        try {
          const ai = clientCache.get(lease.apiKey);
          const promptText = StructuredPromptBuilder.build(
            input.system,
            input.user
          );

          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: input.schema,
            },
          });

          if (!response.text) {
            throw new Error('Gemini returned empty response');
          }

          keyPool.reportSuccess(lease.keyId);

          return JSON.parse(response.text);
        } catch (error) {
          const redacted = ErrorRedactor.redact(error, lease);
          lastError = redacted;

          // Non-retryable error -> propagate immediately without cooling down or retrying
          if (!GeminiErrorClassifier.isRetryable(redacted)) {
            throw redacted;
          }

          keyPool.reportFailure(lease.keyId, redacted, {
            cooldownMs: GeminiErrorClassifier.getCooldownMs(redacted),
          });
        }
      }

      throw lastError;
    },
  };
}
