import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { memoryItems } from '@/db/schema';
import { eq, and, desc, or } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch the 5 most recent mistakes
    const commonMistakes = await db
      .select({
        originalText: memoryItems.sourceText,
        correctedText: memoryItems.suggestedText,
      })
      .from(memoryItems)
      .where(
        and(
          eq(memoryItems.userId, userId),
          or(
            eq(memoryItems.type, 'mistake'),
            eq(memoryItems.type, 'tone_pattern')
          )
        )
      )
      .orderBy(desc(memoryItems.createdAt))
      .limit(5);

    // Fetch the 5 most recent vocabulary/phrase suggestions
    const activeVocab = await db
      .select({
        originalText: memoryItems.sourceText,
        correctedText: memoryItems.suggestedText,
      })
      .from(memoryItems)
      .where(
        and(
          eq(memoryItems.userId, userId),
          or(
            eq(memoryItems.type, 'vocabulary'),
            eq(memoryItems.type, 'reusable_phrase')
          )
        )
      )
      .orderBy(desc(memoryItems.createdAt))
      .limit(5);

    return NextResponse.json({
      commonMistakes: commonMistakes.filter(
        (m) => m.originalText && m.correctedText
      ),
      activeVocab: activeVocab.filter((v) => v.originalText && v.correctedText),
    });
  } catch (error) {
    console.error('Failed to fetch user learning profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
