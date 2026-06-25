import { runMessageCoach } from '@/core/message/message.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import { MessageCoachInput } from '@/core/message/message.schema';
import dotenv from 'dotenv';

dotenv.config();

const aiClient = createGeminiAiClient();

const cases: MessageCoachInput[] = [
  {
    mode: 'improve_english_draft' as const,
    text: 'Please check this when you free',
    tone: 'polite' as const,
  },
  {
    mode: 'write_from_vietnamese' as const,
    text: 'Nhờ John xem giúp PR này khi nào rảnh',
    tone: 'friendly' as const,
  },
  {
    mode: 'write_from_vietnamese' as const,
    text: 'Hỏi người ta xem issue này đã fix xong chưa',
    tone: 'professional' as const,
  },
];

async function main() {
  for (const item of cases) {
    const result = await runMessageCoach(item, { aiClient });

    console.log('\n==============================');
    console.log('INPUT:');
    console.log(item.text);

    console.log('\nRECOMMENDED:');
    console.log(result.recommendedMessage);

    console.log('\nALTERNATIVES:');
    console.dir(result.alternatives, { depth: null });

    console.log('\nWHY:');
    console.log(result.explanationVi);

    console.log('\nMISTAKES:');
    console.dir(result.mistakeCandidates, { depth: null });
  }
}

main();
