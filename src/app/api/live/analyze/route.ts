import { NextResponse } from 'next/server';
import { runLiveAnalysisWorkflow } from '@/core/live/live-analysis.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import { presentAiError } from '@/core/ai/ai-error-presenter';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { liveSessions, learningItems } from '@/db/schema';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, scenarioTitle, scenarioId, durationSeconds, transcript } =
      body;

    // 1. Run AI analysis workflow
    const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
    const result = await runLiveAnalysisWorkflow(
      { mode, scenarioTitle, transcript },
      { aiClient }
    );

    // 2. Fetch authenticated user session
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user?.id) {
        const userId = session.user.id;
        const sessionId = crypto.randomUUID();

        // Save Call Session History
        await db.insert(liveSessions).values({
          id: sessionId,
          userId,
          durationSeconds: durationSeconds || 0,
          mode,
          scenarioId: scenarioId || null,
          overallScore: result.overallScore,
          grammarScore: result.grammarScore,
          pronunciationScore: result.pronunciationScore,
          fluencyScore: result.fluencyScore,
          summaryVi: result.summaryVi,
          transcript,
          mistakes: {
            mistakes: result.mistakes || [],
            alternatives: result.alternatives || [],
          },
        });

        // Collect spaced repetition learning items to insert
        const itemsToInsert = [];

        // Save grammar/pronunciation mistakes
        if (result.mistakes && Array.isArray(result.mistakes)) {
          for (const mistake of result.mistakes) {
            itemsToInsert.push({
              id: crypto.randomUUID(),
              userId,
              type: 'grammar',
              originalText: mistake.originalText,
              correctedText: mistake.correctedText,
              explanationVi: mistake.explanationVi,
              liveSessionId: sessionId,
              interval: 1,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewAt: new Date(), // Due immediately for review
            });
          }
        }

        // Save vocabulary/expression upgrades
        if (result.alternatives && Array.isArray(result.alternatives)) {
          for (const alt of result.alternatives) {
            itemsToInsert.push({
              id: crypto.randomUUID(),
              userId,
              type: 'vocabulary',
              originalText: alt.originalText,
              correctedText: alt.betterAlternative,
              explanationVi: alt.explanationVi,
              liveSessionId: sessionId,
              interval: 1,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewAt: new Date(), // Due immediately for review
            });
          }
        }

        if (itemsToInsert.length > 0) {
          await db.insert(learningItems).values(itemsToInsert);
        }
      }
    } catch (dbError) {
      // Log DB persistence error but do not crash the endpoint
      console.error('Failed to persist call history to Database:', dbError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to run Live transcript analysis:', error);
    const friendlyMessage = presentAiError(error);
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}
