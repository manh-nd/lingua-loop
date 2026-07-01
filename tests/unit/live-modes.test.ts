import { describe, expect, it } from 'vitest';
import { LIVE_MODES } from '@/core/live/live-modes';

describe('LIVE_MODES configuration', () => {
  it('should contain conversation mode with scenarios', () => {
    const conversationMode = LIVE_MODES.find((m) => m.id === 'conversation');
    expect(conversationMode).toBeDefined();
    expect(conversationMode?.scenarios).toBeDefined();
  });

  it('should contain the new native-expression-coach scenario', () => {
    const conversationMode = LIVE_MODES.find((m) => m.id === 'conversation');
    const coachScenario = conversationMode?.scenarios?.find(
      (s) => s.id === 'native-expression-coach'
    );

    expect(coachScenario).toBeDefined();
    expect(coachScenario?.title).toBe(
      'Native Expression Coach (Luyện cách nói tự nhiên)'
    );
    expect(coachScenario?.systemPrompt).toContain(
      'You are a Native Expression Coach'
    );
    expect(coachScenario?.systemPrompt).toContain('upgrade it');
    expect(coachScenario?.systemPrompt).toContain('Vietnam');
  });

  it('should have updated Active Grammar Coach system prompt with Thắng Phạm methodology', () => {
    const conversationMode = LIVE_MODES.find((m) => m.id === 'conversation');
    const grammarScenario = conversationMode?.scenarios?.find(
      (s) => s.id === 'active_correction'
    );

    expect(grammarScenario).toBeDefined();
    expect(grammarScenario?.systemPrompt).toContain('Active Grammar Coach');
    expect(grammarScenario?.systemPrompt).toContain('meaning-first approach');
    expect(grammarScenario?.systemPrompt).toContain('Ý của bạn là chính');
    expect(grammarScenario?.systemPrompt).toContain('có làm" vs "làm xong');
    expect(grammarScenario?.systemPrompt).toContain('đang');
    expect(grammarScenario?.systemPrompt).toContain('rồi');
  });
});
