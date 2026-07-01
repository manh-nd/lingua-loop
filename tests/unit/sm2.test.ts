import { describe, expect, it } from 'vitest';
import { calculateSM2, SM2State } from '@/lib/memory/sm2';

describe('SM-2 Spaced Repetition Algorithm', () => {
  it('resets progress on rating 1 (Again)', () => {
    const initialState: SM2State = {
      interval: 10,
      easeFactor: 2.5,
      repetitions: 3,
    };

    const nextState = calculateSM2(initialState, 1);
    expect(nextState.repetitions).toBe(0);
    expect(nextState.interval).toBe(1);
    expect(nextState.easeFactor).toBeLessThan(2.5); // EF should decrease
  });

  it('keeps interval at 1 day for first successful repetition', () => {
    const initialState: SM2State = {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
    };

    const nextState = calculateSM2(initialState, 3); // Good
    expect(nextState.repetitions).toBe(1);
    expect(nextState.interval).toBe(1);
  });

  it('increases interval to 6 days for second successful repetition', () => {
    const initialState: SM2State = {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
    };

    const nextState = calculateSM2(initialState, 3); // Good
    expect(nextState.repetitions).toBe(2);
    expect(nextState.interval).toBe(6);
  });

  it('multiplies interval by EF for subsequent successful repetitions', () => {
    const initialState: SM2State = {
      interval: 6,
      easeFactor: 2.5,
      repetitions: 2,
    };

    const nextState = calculateSM2(initialState, 3); // Good
    expect(nextState.repetitions).toBe(3);
    expect(nextState.interval).toBe(15); // Math.round(6 * 2.5) = 15
  });

  it('drops easeFactor for rating 2 (Hard)', () => {
    const initialState: SM2State = {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
    };

    const nextState = calculateSM2(initialState, 2); // Hard
    expect(nextState.easeFactor).toBeLessThan(2.5);
  });

  it('increases easeFactor for rating 4 (Easy)', () => {
    const initialState: SM2State = {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
    };

    const nextState = calculateSM2(initialState, 4); // Easy
    expect(nextState.easeFactor).toBeGreaterThan(2.5);
  });

  it('enforces minimum easeFactor of 1.3', () => {
    const initialState: SM2State = {
      interval: 1,
      easeFactor: 1.3,
      repetitions: 1,
    };

    const nextState = calculateSM2(initialState, 2); // Hard (would normally drop EF)
    expect(nextState.easeFactor).toBe(1.3);
  });
});
