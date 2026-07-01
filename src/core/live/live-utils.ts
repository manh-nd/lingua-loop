/**
 * Regex detects non-Latin scripts that are likely transcription/recognition errors in Gemini STT:
 * - Korean (Hangul): \uac00-\ud7af, \u1100-\u11ff, \u3130-\u318f
 * - Japanese (Hiragana/Katakana): \u3040-\u30ff
 * - Chinese (Hanzi/Kanji): \u3400-\u4dbf, \u4e00-\u9fff
 * - Arabic: \u0600-\u06ff, \u0750-\u077f
 * - Thai: \u0e00-\u0e7f
 * - Hindi/Devanagari: \u0900-\u097f
 * - Cyrillic (Russian): \u0400-\u04ff
 * - Myanmar: \u1000-\u109f
 * - Sinhala: \u0d80-\u0dff
 * - Tamil: \u0b80-\u0bff
 */
export const FOREIGN_SCRIPT_REGEX =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\u0600-\u06ff\u0750-\u077f\u0e00-\u0e7f\u0900-\u097f\u0400-\u04ff\u1000-\u109f\u0d80-\u0dff\u0b80-\u0bff]/;

/**
 * Checks if the given text contains any foreign non-Latin scripts.
 */
export function hasForeignScript(text: string): boolean {
  return FOREIGN_SCRIPT_REGEX.test(text);
}
