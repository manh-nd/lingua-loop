import dotenv from 'dotenv';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import { runMessageCoach } from '@/core/message/message.workflow';

dotenv.config();

const aiClient = createGeminiAiClient();

async function main() {
  const cases = Array.from({ length: 10 }, (_, index) => ({
    mode: 'improve_english_draft' as const,
    text: `Please check this when you free. Case ${index + 1}`,
    tone: 'polite' as const,
  }));

  for (const item of cases) {
    console.log(`\n--- Running Case ${item.text} ---`);
    const result = await runMessageCoach(item, { aiClient });
    console.log(`Result: ${result.recommendedMessage}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
