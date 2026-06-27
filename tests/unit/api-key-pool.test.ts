import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemoryRoundRobinApiKeyPool } from '@/core/ai/api-key-pool';

describe('InMemoryRoundRobinApiKeyPool', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rotates keys in round-robin order', async () => {
    const pool = new InMemoryRoundRobinApiKeyPool(['key1', 'key2', 'key3']);

    await expect(pool.getNextKey()).resolves.toMatchObject({
      keyId: 'gemini-key-1',
      apiKey: 'key1',
    });

    await expect(pool.getNextKey()).resolves.toMatchObject({
      keyId: 'gemini-key-2',
      apiKey: 'key2',
    });

    await expect(pool.getNextKey()).resolves.toMatchObject({
      keyId: 'gemini-key-3',
      apiKey: 'key3',
    });

    await expect(pool.getNextKey()).resolves.toMatchObject({
      keyId: 'gemini-key-1',
      apiKey: 'key1',
    });
  });

  it('skips keys in cooldown', async () => {
    const pool = new InMemoryRoundRobinApiKeyPool(['key1', 'key2']);

    const first = await pool.getNextKey();
    expect(first.keyId).toBe('gemini-key-1');

    // Report failure with 60s cooldown
    pool.reportFailure(first.keyId, new Error('rate limited'), {
      cooldownMs: 60_000,
    });

    // The next key should be key2, since key1 is on cooldown
    const second = await pool.getNextKey();
    expect(second.keyId).toBe('gemini-key-2');

    // Next key request should still return key2 because key1 is still in cooldown
    const third = await pool.getNextKey();
    expect(third.keyId).toBe('gemini-key-2');
  });

  it('waits for the earliest key when all keys are on cooldown', async () => {
    const pool = new InMemoryRoundRobinApiKeyPool(['key1', 'key2']);

    const k1 = await pool.getNextKey();
    const k2 = await pool.getNextKey();

    // Set k1 to 10s cooldown, k2 to 20s cooldown
    pool.reportFailure(k1.keyId, new Error('rate limited'), {
      cooldownMs: 10_000,
    });
    pool.reportFailure(k2.keyId, new Error('rate limited'), {
      cooldownMs: 20_000,
    });

    // Start getNextKey which should block waiting for k1 to recover
    const promise = pool.getNextKey();

    // Advance time by 9.9s -> k1 is still in cooldown, promise shouldn't resolve yet
    await vi.advanceTimersByTimeAsync(9_900);

    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    // Let microtasks run
    await Promise.resolve();
    expect(resolved).toBe(false);

    // Advance time by 200ms -> k1 should recover (total 10.1s elapsed)
    await vi.advanceTimersByTimeAsync(200);
    await Promise.resolve();

    const recovered = await promise;
    expect(recovered.keyId).toBe('gemini-key-1');
  });

  it('throws when no keys are provided', () => {
    expect(() => new InMemoryRoundRobinApiKeyPool([])).toThrow(
      'At least one Gemini API key is required'
    );
    expect(() => new InMemoryRoundRobinApiKeyPool(['', '  '])).toThrow(
      'At least one Gemini API key is required'
    );
  });

  it('resets cooldown on reportSuccess', async () => {
    const pool = new InMemoryRoundRobinApiKeyPool(['key1', 'key2']);

    const first = await pool.getNextKey();
    pool.reportFailure(first.keyId, new Error('rate limited'), {
      cooldownMs: 60_000,
    });

    // k1 is on cooldown. Success reports should clear it immediately.
    pool.reportSuccess(first.keyId);

    // First call after cursor is key2 (which wasn't on cooldown)
    const next1 = await pool.getNextKey();
    expect(next1.keyId).toBe('gemini-key-2');

    // Second call should rotate back to key1, which is now cleared and off cooldown
    const next2 = await pool.getNextKey();
    expect(next2.keyId).toBe('gemini-key-1');
  });

  it('throws an error if wait duration exceeds maxWaitMs', async () => {
    const pool = new InMemoryRoundRobinApiKeyPool(['key1']);

    const first = await pool.getNextKey();
    pool.reportFailure(first.keyId, new Error('rate limited'), {
      cooldownMs: 10_000,
    });

    // Requesting next key with maxWaitMs < 10s should throw
    await expect(pool.getNextKey({ maxWaitMs: 5_000 })).rejects.toThrow(
      'All Gemini API keys are currently rate limited'
    );
  });

  it('resolves/waits if wait duration is less than or equal to maxWaitMs', async () => {
    const pool = new InMemoryRoundRobinApiKeyPool(['key1']);

    const first = await pool.getNextKey();
    pool.reportFailure(first.keyId, new Error('rate limited'), {
      cooldownMs: 10_000,
    });

    const promise = pool.getNextKey({ maxWaitMs: 15_000 });

    // Advance timers by 9.9s -> k1 is still in cooldown
    await vi.advanceTimersByTimeAsync(9_900);
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(false);

    // Advance timers by 200ms -> k1 recovers
    await vi.advanceTimersByTimeAsync(200);
    await Promise.resolve();
    expect(resolved).toBe(true);

    const recovered = await promise;
    expect(recovered.keyId).toBe('gemini-key-1');
  });
});
