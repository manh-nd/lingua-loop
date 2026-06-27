/**
 * Maps technical error messages, particularly those relating to API key exhaustion
 * or rate limiting, into user-friendly Vietnamese messages.
 */
export function getFriendlyErrorMessage(err: unknown): string {
  if (err === null || err === undefined) {
    return 'Đã xảy ra lỗi không xác định.';
  }

  let message = '';
  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === 'object') {
    // Handle error-like objects
    message = (err as { message?: string }).message || JSON.stringify(err);
  } else {
    message = String(err);
  }

  const lowerMessage = message.toLowerCase();

  // Check for rate limit, quota, resource exhaustion, or HTTP 429
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('quota') ||
    lowerMessage.includes('exhausted') ||
    lowerMessage.includes('429')
  ) {
    return 'AI đang bận hoặc API key đã chạm giới hạn. Thử lại sau một chút hoặc kiểm tra GEMINI_API_KEYS.';
  }

  return message || 'Đã xảy ra lỗi không xác định.';
}
