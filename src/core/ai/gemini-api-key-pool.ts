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
    return multiKeys
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);
  }

  const singleKey = process.env.GEMINI_API_KEY;

  if (singleKey) {
    return [singleKey];
  }

  throw new Error('Missing GEMINI_API_KEYS or GEMINI_API_KEY');
}
