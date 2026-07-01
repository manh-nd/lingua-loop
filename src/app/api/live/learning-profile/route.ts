import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { learningItems } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch the 5 most recent grammar mistakes
    const commonMistakes = await db
      .select({
        originalText: learningItems.originalText,
        correctedText: learningItems.correctedText,
      })
      .from(learningItems)
      .where(
        and(eq(learningItems.userId, userId), eq(learningItems.type, 'grammar'))
      )
      .orderBy(desc(learningItems.createdAt))
      .limit(5);

    // Fetch the 5 most recent vocabulary/phrase suggestions
    const activeVocab = await db
      .select({
        originalText: learningItems.originalText,
        correctedText: learningItems.correctedText,
      })
      .from(learningItems)
      .where(
        and(
          eq(learningItems.userId, userId),
          eq(learningItems.type, 'vocabulary')
        )
      )
      .orderBy(desc(learningItems.createdAt))
      .limit(5);

    return NextResponse.json({
      commonMistakes,
      activeVocab,
    });
  } catch (error) {
    console.error('Failed to fetch user learning profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
