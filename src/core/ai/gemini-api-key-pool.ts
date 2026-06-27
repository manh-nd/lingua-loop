import { InMemoryRoundRobinApiKeyPool } from './api-key-pool';

let singletonPool: InMemoryRoundRobinApiKeyPool | undefined;

export function getGeminiApiKeyPool() {
  if (singletonPool) {
    return singletonPool;
  }

  const apiKeys = getGeminiApiKeysFromEnv();

  singletonPool = new InMemoryRoundRobinApiKeyPool(apiKeys);

  return singletonPool;
}

function getGeminiApiKeysFromEnv() {
  const multiKeys = process.env.GEMINI_API_KEYS;

  if (multiKeys) {
    const keys = multiKeys
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    if (keys.length > 0) {
      return keys;
    }
  }

  throw new Error('Missing GEMINI_API_KEYS');
}
