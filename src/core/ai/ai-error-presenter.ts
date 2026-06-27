export function presentAiError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('All Gemini API keys are currently rate limited')) {
    return 'AI đang bận hoặc API key đã chạm giới hạn. Vui lòng thử lại sau một chút.';
  }

  if (
    message.includes('Missing GEMINI_API_KEYS') ||
    message.includes('Missing GEMINI_API_KEY') ||
    message.includes('At least one Gemini API key is required')
  ) {
    return 'Chưa cấu hình Gemini API key. Hãy kiểm tra biến môi trường GEMINI_API_KEYS hoặc GEMINI_API_KEY.';
  }

  if (message.includes('Missing GEMINI_DEFAULT_MODEL')) {
    return 'Chưa cấu hình model Gemini mặc định. Hãy kiểm tra biến môi trường GEMINI_DEFAULT_MODEL.';
  }

  if (message.includes('Gemini returned empty response')) {
    return 'AI không trả về kết quả hợp lệ. Vui lòng thử lại.';
  }

  return 'Đã xảy ra lỗi khi gọi AI. Vui lòng thử lại sau.';
}
