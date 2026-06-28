import { NextResponse } from 'next/server';
import { runLiveAnalysisWorkflow } from '@/core/live/live-analysis.workflow';
import { createGeminiAiClient } from '@/core/ai/gemini-ai-client';
import { presentAiError } from '@/core/ai/ai-error-presenter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const aiClient = createGeminiAiClient({ maxWaitMs: 5000 });
    const result = await runLiveAnalysisWorkflow(body, { aiClient });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to run Live transcript analysis:', error);
    const friendlyMessage = presentAiError(error);
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}
