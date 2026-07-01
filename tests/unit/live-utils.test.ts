import { describe, expect, it } from 'vitest';
import { hasForeignScript, FOREIGN_SCRIPT_REGEX } from '@/core/live/live-utils';

describe('FOREIGN_SCRIPT_REGEX & hasForeignScript', () => {
  it('should export the regex', () => {
    expect(FOREIGN_SCRIPT_REGEX).toBeInstanceOf(RegExp);
  });

  it('should return false for English and Vietnamese text', () => {
    const validTexts = [
      'Hello world',
      'Xin chào Việt Nam!',
      'I went to the office yesterday at 9 AM.',
      'Hôm nay tôi sẽ đi làm lúc tám giờ rưỡi sáng.',
      'Standard punctuation: !@#$%^&*()_+{}|:"<>?`-=[]\\;\',./',
      '1234567890',
    ];

    for (const text of validTexts) {
      expect(hasForeignScript(text)).toBe(false);
    }
  });

  it('should return true for Korean, Japanese, and Chinese characters', () => {
    const invalidTexts = [
      '안녕하세요', // Korean
      'こんにちは', // Japanese Hiragana
      'カタカナ', // Japanese Katakana
      '你好', // Simplified Chinese
      '繁體中文', // Traditional Chinese
      'Hello 你好', // Mixed
    ];

    for (const text of invalidTexts) {
      expect(hasForeignScript(text)).toBe(true);
    }
  });

  it('should return true for Arabic, Thai, Hindi/Devanagari, and Cyrillic (Russian)', () => {
    const invalidTexts = [
      'مرحباً بك', // Arabic
      'สวัสดีครับ', // Thai
      'नमस्ते', // Hindi
      'Привет', // Russian (Cyrillic)
    ];

    for (const text of invalidTexts) {
      expect(hasForeignScript(text)).toBe(true);
    }
  });

  it('should return true for Myanmar, Sinhala, and Tamil characters', () => {
    const invalidTexts = [
      'မင်္ဂလာပါ', // Myanmar
      'ආයුබෝවන්', // Sinhala
      'வணக்கம்', // Tamil
    ];

    for (const text of invalidTexts) {
      expect(hasForeignScript(text)).toBe(true);
    }
  });
});
