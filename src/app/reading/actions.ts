'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { memoryCandidates } from '@/db/schema';
import { runReadingCoach } from '@/core/reading/reading.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import {
  ReadingCoachInput,
  ReadingCoachResult,
} from '@/core/reading/reading.schema';
import { presentAiError } from '@/core/ai/ai-error-presenter';

export async function submitReadingCoach(
  input: ReadingCoachInput
): Promise<ReadingCoachResult> {
  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
    return await runReadingCoach(input, { aiClient });
  } catch (error) {
    throw new Error(presentAiError(error));
  }
}

export async function saveReadingCandidateAction(candidate: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Bạn cần đăng nhập để lưu ghi nhớ.');
  }
  const userId = session.user.id;

  const isTrap = candidate.memoryType === 'reading_trap';
  const type = isTrap ? 'mistake' : 'reusable_phrase';
  const sourceText = isTrap ? candidate.trapText : candidate.phrase;
  const suggestedText = isTrap ? candidate.correctInterpretationVi : null;

  const payload = {
    wrongText: isTrap ? candidate.trapText || undefined : undefined,
    correctText: isTrap
      ? candidate.correctInterpretationVi || undefined
      : undefined,
    phrase: !isTrap ? candidate.phrase || undefined : undefined,
    situation: !isTrap ? candidate.situationVi || undefined : undefined,
    explanation: candidate.explanationVi,
    category: candidate.category || 'naturalness',
    culturalContext: candidate.culturalContextVi || undefined,
    title: candidate.patternNameVi,
    wrongInterpretation: isTrap
      ? candidate.wrongInterpretationVi || undefined
      : undefined,
  };

  await db.insert(memoryCandidates).values({
    id: crypto.randomUUID(),
    userId,
    type,
    status: 'pending',
    title: candidate.patternNameVi,
    explanation: candidate.explanationVi,
    sourceText,
    suggestedText,
    confidence: 1.0,
    payload,
  });
}
