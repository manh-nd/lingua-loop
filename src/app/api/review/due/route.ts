import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { memoryItems } from '@/db/schema';
import { and, eq, lte } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch cards where nextPracticeAt <= now
    const cards = await db
      .select()
      .from(memoryItems)
      .where(
        and(
          eq(memoryItems.userId, session.user.id),
          lte(memoryItems.nextPracticeAt, new Date())
        )
      )
      .orderBy(memoryItems.nextPracticeAt);

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Failed to fetch due review cards:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
