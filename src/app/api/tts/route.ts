import { NextRequest, NextResponse } from 'next/server';
import { Communicate } from 'edge-tts-universal';

const hasVietnamese = (str: string) => {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    str
  );
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return NextResponse.json(
      { error: 'Text parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Determine language and voice
    const isVi = hasVietnamese(text);
    const voice = isVi ? 'vi-VN-HoaiMyNeural' : 'en-US-AriaNeural';

    // Microsoft Edge TTS synthesis via edge-tts-universal
    const tts = new Communicate(text.trim(), {
      voice,
      rate: '-5%', // slightly slower pacing for clean learning pronunciation
    });

    const chunks: Uint8Array[] = [];
    for await (const chunk of tts.stream()) {
      if (chunk.type === 'audio' && chunk.data) {
        chunks.push(chunk.data);
      }
    }

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No audio generated' },
        { status: 500 }
      );
    }

    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err) {
    console.error('Edge TTS Proxy Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate Edge TTS speech' },
      { status: 500 }
    );
  }
}
