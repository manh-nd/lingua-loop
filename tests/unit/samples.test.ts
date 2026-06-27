import { describe, expect, it } from 'vitest';
import { messageSamples, explanationSamples } from '@/lib/samples';

describe('samples', () => {
  it('has valid message coach samples', () => {
    expect(messageSamples).toBeInstanceOf(Array);
    expect(messageSamples.length).toBe(8);

    messageSamples.forEach((sample) => {
      expect(sample).toHaveProperty('id');
      expect(sample).toHaveProperty('label');
      expect(sample).toHaveProperty('mode');
      expect(sample).toHaveProperty('text');
      expect(sample).toHaveProperty('tone');
      expect(typeof sample.text).toBe('string');
      expect(sample.text.length).toBeGreaterThan(0);
    });
  });

  it('has valid explanation coach samples', () => {
    expect(explanationSamples).toBeInstanceOf(Array);
    expect(explanationSamples.length).toBe(8);

    explanationSamples.forEach((sample) => {
      expect(sample).toHaveProperty('id');
      expect(sample).toHaveProperty('label');
      expect(sample).toHaveProperty('mode');
      expect(sample).toHaveProperty('text');
      expect(sample).toHaveProperty('tone');
      expect(sample).toHaveProperty('purpose');
      expect(typeof sample.text).toBe('string');
      expect(sample.text.length).toBeGreaterThan(0);
    });
  });
});
