'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { memoryItems } from '@/db/schema';
import { and, eq, lte } from 'drizzle-orm';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import {
  runPracticeChallengeGeneration,
  runPracticeGrading,
  PracticeChallenge,
  PracticeGrading,
} from '@/core/practice/practice.workflow';
import { WorkspaceMemoryItem } from '@/core/workspace/workspace.matcher';
import { calculateSM2 } from '@/lib/memory/sm2';
import { presentAiError } from '@/core/ai/ai-error-presenter';

export interface UIMemoryItem {
  id: string;
  userId: string;
  type: 'mistake' | 'reusable_phrase' | 'vocabulary' | 'tone_pattern';
  status: 'active' | 'archived';
  title: string;
  explanation: string;
  sourceText: string | null;
  suggestedText: string | null;
  interval: number;
  easeFactor: number;
  reviewCount: number;
  correctStreak: number;
  wrongStreak: number;
  lastPracticedAt: Date | null;
  nextPracticeAt: Date;
}

async function getRequiredSessionUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Bạn cần đăng nhập để luyện tập.');
  }
  return session.user.id;
}

export async function fetchDueMemoryItems(): Promise<UIMemoryItem[]> {
  const userId = await getRequiredSessionUserId();

  const now = new Date();
  const items = await db
    .select()
    .from(memoryItems)
    .where(
      and(
        eq(memoryItems.userId, userId),
        eq(memoryItems.status, 'active'),
        lte(memoryItems.nextPracticeAt, now)
      )
    )
    .orderBy(memoryItems.nextPracticeAt);

  return items.map((row) => ({
    id: row.id,
    userId: row.userId,
    type: row.type as any,
    status: row.status as any,
    title: row.title,
    explanation: row.explanation,
    sourceText: row.sourceText,
    suggestedText: row.suggestedText,
    interval: row.interval,
    easeFactor: row.easeFactor,
    reviewCount: row.reviewCount,
    correctStreak: row.correctStreak,
    wrongStreak: row.wrongStreak,
    lastPracticedAt: row.lastPracticedAt,
    nextPracticeAt: row.nextPracticeAt,
  }));
}

export async function generatePracticeChallenge(
  itemId: string
): Promise<PracticeChallenge> {
  const userId = await getRequiredSessionUserId();

  const [row] = await db
    .select()
    .from(memoryItems)
    .where(and(eq(memoryItems.id, itemId), eq(memoryItems.userId, userId)))
    .limit(1);

  if (!row) {
    throw new Error('Không tìm thấy ghi nhớ cần luyện tập.');
  }

  const mappedItem: WorkspaceMemoryItem = {
    id: row.id,
    type: row.type as any,
    title: row.title,
    explanation: row.explanation,
    wrongText:
      row.type === 'mistake' || row.type === 'tone_pattern'
        ? row.sourceText
        : null,
    correctText:
      row.type === 'mistake' || row.type === 'tone_pattern'
        ? row.suggestedText
        : null,
    phrase:
      row.type === 'reusable_phrase' || row.type === 'vocabulary'
        ? row.sourceText
        : null,
    category: (row.payload as any)?.category || 'naturalness',
  };

  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 8000 });
    return await runPracticeChallengeGeneration(mappedItem, { aiClient });
  } catch (error) {
    throw new Error(presentAiError(error));
  }
}

export async function submitPracticeAnswer(
  itemId: string,
  challengePrompt: string,
  answer: string
): Promise<PracticeGrading> {
  const userId = await getRequiredSessionUserId();

  const [row] = await db
    .select()
    .from(memoryItems)
    .where(and(eq(memoryItems.id, itemId), eq(memoryItems.userId, userId)))
    .limit(1);

  if (!row) {
    throw new Error('Không tìm thấy ghi nhớ cần luyện tập.');
  }

  const mappedItem: WorkspaceMemoryItem = {
    id: row.id,
    type: row.type as any,
    title: row.title,
    explanation: row.explanation,
    wrongText:
      row.type === 'mistake' || row.type === 'tone_pattern'
        ? row.sourceText
        : null,
    correctText:
      row.type === 'mistake' || row.type === 'tone_pattern'
        ? row.suggestedText
        : null,
    phrase:
      row.type === 'reusable_phrase' || row.type === 'vocabulary'
        ? row.sourceText
        : null,
    category: (row.payload as any)?.category || 'naturalness',
  };

  let grading: PracticeGrading;
  try {
    const aiClient = createGeminiAiClient({ maxWaitMs: 8000 });
    grading = await runPracticeGrading(mappedItem, challengePrompt, answer, {
      aiClient,
    });
  } catch (error) {
    throw new Error(presentAiError(error));
  }

  // Map result to SM-2 rating
  let rating: 1 | 2 | 3 | 4 = 1; // Again
  if (grading.isCorrect) {
    if (grading.score < 70)
      rating = 2; // Hard
    else if (grading.score < 90)
      rating = 3; // Good
    else rating = 4; // Easy
  }

  // Calculate new SM-2 parameters
  const sm2Result = calculateSM2(
    {
      interval: row.interval,
      easeFactor: row.easeFactor,
      repetitions: row.reviewCount, // Reusing reviewCount as repetitions count
    },
    rating
  );

  const now = new Date();
  const nextPractice = new Date();
  nextPractice.setDate(now.getDate() + sm2Result.interval);

  const updatedStreak = grading.isCorrect ? row.correctStreak + 1 : 0;
  const updatedWrongStreak = grading.isCorrect ? 0 : row.wrongStreak + 1;

  // Update DB row
  await db
    .update(memoryItems)
    .set({
      interval: sm2Result.interval,
      easeFactor: sm2Result.easeFactor,
      reviewCount: row.reviewCount + 1,
      correctStreak: updatedStreak,
      wrongStreak: updatedWrongStreak,
      lastPracticedAt: now,
      nextPracticeAt: nextPractice,
      updatedAt: now,
    })
    .where(eq(memoryItems.id, itemId));

  return grading;
}
