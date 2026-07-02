'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { memoryCandidates } from '@/db/schema';

export async function saveLiveCandidateAction(
  type: 'mistake' | 'reusable_phrase',
  title: string,
  explanation: string,
  sourceText: string,
  suggestedText: string | null
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Bạn cần đăng nhập để lưu ghi nhớ.');
  }
  const userId = session.user.id;

  const payload = {
    wrongText: type === 'mistake' ? sourceText || undefined : undefined,
    correctText: type === 'mistake' ? suggestedText || undefined : undefined,
    phrase: type === 'reusable_phrase' ? sourceText || undefined : undefined,
    situation:
      type === 'reusable_phrase' ? 'Từ cuộc hội thoại nói Live AI.' : undefined,
    explanation,
    category: 'naturalness',
    title,
  };

  await db.insert(memoryCandidates).values({
    id: crypto.randomUUID(),
    userId,
    type,
    status: 'pending',
    title,
    explanation,
    sourceText: type === 'mistake' ? sourceText : sourceText, // For reusable_phrase, sourceText is the phrase itself
    suggestedText: type === 'mistake' ? suggestedText : null,
    confidence: 1.0,
    payload,
  });
}
