export interface SM2State {
  interval: number; // in days
  easeFactor: number; // standard ease factor, usually starts at 2.5
  repetitions: number; // consecutive correct review sessions
}

/**
 * Calculates next interval, ease factor, and repetitions based on rating.
 * Rating map:
 * - 1: Again (imperfect response, repeat review immediately)
 * - 2: Hard (correct response but required effort)
 * - 3: Good (correct response, normal recall)
 * - 4: Easy (correct response, instant recall)
 */
export function calculateSM2(state: SM2State, rating: 1 | 2 | 3 | 4): SM2State {
  let { interval, easeFactor, repetitions } = state;

  // Map rating (1-4) to quality quality (0-5)
  // 1 -> q=1 (failed, repeat)
  // 2 -> q=3 (correct, hard)
  // 3 -> q=4 (correct, good)
  // 4 -> q=5 (correct, easy)
  let q = 1;
  if (rating === 2) q = 3;
  else if (rating === 3) q = 4;
  else if (rating === 4) q = 5;

  if (q >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Calculate new Ease Factor (EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // Minimum EF is 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return {
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimal places
    repetitions,
  };
}
