import { NextResponse } from 'next/server';
import { getGeminiApiKeyPool } from '@/core/ai/gemini-api-key-pool';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  try {
    const keyPool = getGeminiApiKeyPool();
    const lease = await keyPool.getNextKey();

    try {
      const ai = new GoogleGenAI({
        apiKey: lease.apiKey,
        apiVersion: 'v1alpha',
      });
      const response = await ai.authTokens.create({
        model: 'gemini-3.1-flash-live-preview',
      } as any);

      keyPool.reportSuccess(lease.keyId);

      return NextResponse.json({
        token: response.name, // e.g. "auth_tokens/..."
        model: 'gemini-3.1-flash-live-preview',
      });
    } catch (err) {
      keyPool.reportFailure(lease.keyId, err);
      throw err;
    }
  } catch (err) {
    console.error('Failed to generate Live API token:', err);
    return NextResponse.json(
      { error: 'Failed to generate Live API token' },
      { status: 500 }
    );
  }
}
