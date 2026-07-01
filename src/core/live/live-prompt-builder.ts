import { LiveMode, LiveTopic, LiveScenario } from './live-modes';

export const GLOBAL_GUARD_PROMPT = `
CRITICAL LANGUAGE CONSTRAINT:
This user ONLY speaks Vietnamese and English. They are a Vietnamese professional learning English.
Any input transcribed in ANY other language (Korean, Japanese, Chinese, Arabic, Thai, Hindi, Russian, or any language other than Vietnamese/English) is a TRANSCRIPTION ERROR — not actual speech.

When this happens:
1. Completely ignore the mis-transcribed content
2. Do NOT attempt to respond in or translate from the wrongly detected language
3. Politely ask the user to repeat: "Xin lỗi, mình không nghe rõ. Bạn nói lại nhé!"
4. Continue the conversation naturally
`.trim();

export const ERROR_CORRECTION_PROTOCOL_BASE = `
## Error Correction Protocol

FREQUENCY:
- In teaching modes (Active Grammar Coach, Native Expression Coach, Vocab Building):
  Pick at most 1 important error EVERY turn.
- In conversation/roleplay modes: Pick at most 1 error every 2-3 turns.
- In roleplay scenarios (Daily Standup, Mock Interview, Client Negotiation, TOEIC Speaking):
  Light touch ONLY — correct only serious errors that affect communication.

PRIORITY ORDER:
1. Errors that change meaning or cause misunderstanding (highest)
2. Tense/aspect errors
3. Vocabulary that could be more natural
4. Minor grammar (lowest — often skip)

CORRECTION STYLE:
- Never say "wrong grammar" or "incorrect tense"
- Acknowledge what they meant → provide the natural version → brief explanation → continue
- Example: "Ah, chuyện đã xong rồi đúng không? → 'I went' instead of 'I go'. Anyway..."

PRONUNCIATION CHECK (via STT):
- If the transcribed input doesn't match the likely intended word given context
  (e.g., transcript shows "want" but context suggests "went"),
  gently clarify: "Did you mean 'went'? Try making the 'e' sound shorter!"
`.trim();

export function buildLiveSystemPrompt(options: {
  mode: LiveMode;
  topic?: LiveTopic;
  scenario?: LiveScenario;
  voiceName?: string;
}): string {
  const { mode, topic, scenario, voiceName = 'Aoede' } = options;

  // 1. Base Prompt
  let basePrompt = scenario ? scenario.systemPrompt : mode.systemPrompt;
  if (topic) {
    basePrompt = basePrompt
      .replace(/\[TOPIC_NAME\]/g, topic.title)
      .replace(/\[TOPIC\]/g, topic.title);
  }

  // 2. Mode-dependent Correction Directives
  let correctionDirective = '';
  if (mode.category === 'guided') {
    correctionDirective =
      'When correcting errors, explain in Vietnamese using the Vietnamese bridge approach (đang→continuous, rồi/xong→perfect, sẽ→future).';
  } else if (scenario?.id === 'native-expression-coach') {
    correctionDirective =
      "Explain in English to maintain immersion, but you may use Vietnamese vocabulary or phrases for warm emphasis (e.g. 'Nghe tự nhiên hơn nhiều đúng không?').";
  } else if (
    scenario?.id === 'mock_interview' ||
    scenario?.id === 'customer_negotiation' ||
    scenario?.id === 'daily_standup'
  ) {
    correctionDirective =
      'Stay in character. Only correct serious errors that would cause real miscommunication. Keep corrections brief and in English.';
  } else {
    // Other conversation/teaching modes (Active Grammar Coach, etc.)
    correctionDirective =
      'When correcting errors, explain in English to maintain immersion.';
  }

  const correctionPrompt = `
${ERROR_CORRECTION_PROTOCOL_BASE}

CORRECTION LANGUAGE DIRECTIVE:
${correctionDirective}
`.trim();

  // 3. Voice Anchor
  const voiceGender = ['Aoede', 'Kore'].includes(voiceName) ? 'female' : 'male';
  const voiceAnchorPrompt = `
Voice Anchor:
You are speaking as ${voiceName}. You must always speak in a consistent, clear ${voiceGender} voice matching the character of ${voiceName}. Do not drift, change pitch, or switch to a different gender/voice under any circumstances.
`.trim();

  // 4. Combine
  return `${basePrompt}\n\n${correctionPrompt}\n\n${GLOBAL_GUARD_PROMPT}\n\n${voiceAnchorPrompt}`;
}
