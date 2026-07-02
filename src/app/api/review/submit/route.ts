import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { memoryItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculateSM2 } from '@/lib/memory/sm2';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, rating } = await req.json();

    if (!itemId || !rating || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 1. Fetch current item state
    const [item] = await db
      .select()
      .from(memoryItems)
      .where(
        and(eq(memoryItems.id, itemId), eq(memoryItems.userId, session.user.id))
      )
      .limit(1);

    if (!item) {
      return NextResponse.json(
        { error: 'Learning item not found' },
        { status: 404 }
      );
    }

    // 2. Apply SM-2 calculation
    const nextState = calculateSM2(
      {
        interval: item.interval,
        easeFactor: item.easeFactor,
        repetitions: item.reviewCount,
      },
      rating as 1 | 2 | 3 | 4
    );

    // 3. Compute nextPracticeAt
    let nextPracticeAt: Date;
    if (rating === 1) {
      // Again: Review again in 10 minutes in the same session
      nextPracticeAt = new Date(Date.now() + 10 * 60 * 1000);
    } else {
      // Hard/Good/Easy: Review in next intervals (in days)
      nextPracticeAt = new Date(
        Date.now() + nextState.interval * 24 * 60 * 60 * 1000
      );
    }

    // Calculate streaks
    const isCorrect = rating > 1;
    const correctStreak = isCorrect ? item.correctStreak + 1 : 0;
    const wrongStreak = isCorrect ? 0 : item.wrongStreak + 1;

    // 4. Update Database
    await db
      .update(memoryItems)
      .set({
        interval: nextState.interval,
        easeFactor: nextState.easeFactor,
        reviewCount: nextState.repetitions,
        correctStreak,
        wrongStreak,
        nextPracticeAt,
        lastPracticedAt: new Date(),
      })
      .where(eq(memoryItems.id, itemId));

    return NextResponse.json({
      success: true,
      nextReviewAt: nextPracticeAt,
      ...nextState,
    });
  } catch (error) {
    console.error('Failed to submit learning item review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
