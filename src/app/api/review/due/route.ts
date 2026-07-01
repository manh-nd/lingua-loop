import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { learningItems } from '@/db/schema';
import { and, eq, lte } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch cards where nextReviewAt <= now
    const cards = await db
      .select()
      .from(learningItems)
      .where(
        and(
          eq(learningItems.userId, session.user.id),
          lte(learningItems.nextReviewAt, new Date())
        )
      )
      .orderBy(learningItems.nextReviewAt);

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Failed to fetch due review cards:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
