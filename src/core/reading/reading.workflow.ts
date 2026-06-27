import { toJSONSchema } from 'zod';
import {
  ReadingCoachInput,
  ReadingCoachInputSchema,
  ReadingCoachResult,
  ReadingCoachResultSchema,
} from './reading.schema';
import { buildReadingCoachSystemPrompt } from './reading.prompt';
import { AiClient } from '@/core/ai/ai-client';

export async function runReadingCoach(
  input: ReadingCoachInput,
  deps: { aiClient: AiClient }
): Promise<ReadingCoachResult> {
  const parsedInput = ReadingCoachInputSchema.parse(input);

  const jsonSchema = toJSONSchema(ReadingCoachResultSchema);

  const raw = await deps.aiClient.generateJson({
    system: buildReadingCoachSystemPrompt(),
    user: JSON.stringify(parsedInput, null, 2),
    schema: jsonSchema,
  });

  return ReadingCoachResultSchema.parse(raw);
}
