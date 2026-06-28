import { Communicate } from 'edge-tts-universal';
import fs from 'fs';

async function test() {
  const tts = new Communicate(
    'Hello, this is a test of Microsoft Edge neural TTS.',
    {
      voice: 'en-US-AriaNeural',
      rate: '-8%',
    }
  );

  const chunks = [];
  for await (const chunk of tts.stream()) {
    if (chunk.type === 'audio') {
      chunks.push(chunk.data);
    }
  }

  const buffer = Buffer.concat(chunks);
  fs.writeFileSync('test-aria.mp3', buffer);
  console.log('Saved test-aria.mp3, size:', buffer.length);
}

test().catch(console.error);
