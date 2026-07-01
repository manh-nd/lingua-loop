import { describe, expect, it } from 'vitest';
import { buildLiveSystemPrompt } from '@/core/live/live-prompt-builder';
import { LiveMode, LiveTopic, LiveScenario } from '@/core/live/live-modes';

describe('buildLiveSystemPrompt', () => {
  const dummyMode: LiveMode = {
    id: 'dummy-mode',
    category: 'guided',
    title: 'Dummy Mode',
    descriptionVi: 'Chế độ giả lập',
    systemPrompt: 'You are a guide for [TOPIC_NAME] and [TOPIC].',
  };

  const dummyTopic: LiveTopic = {
    id: 'dummy-topic',
    title: 'Topic Title',
    descriptionVi: 'Chủ đề giả lập',
  };

  const dummyScenario: LiveScenario = {
    id: 'dummy-scenario',
    title: 'Scenario Title',
    descriptionVi: 'Kịch bản giả lập',
    systemPrompt: 'You are roleplaying in Scenario for [TOPIC].',
    phrases: [],
  };

  it('replaces topic placeholders in mode prompt', () => {
    const prompt = buildLiveSystemPrompt({
      mode: dummyMode,
      topic: dummyTopic,
    });
    expect(prompt).toContain(
      'You are a guide for Topic Title and Topic Title.'
    );
  });

  it('replaces topic placeholders in scenario prompt', () => {
    const prompt = buildLiveSystemPrompt({
      mode: { ...dummyMode, category: 'conversation' },
      scenario: dummyScenario,
      topic: dummyTopic,
    });
    expect(prompt).toContain(
      'You are roleplaying in Scenario for Topic Title.'
    );
  });

  it('appends the upgraded GLOBAL_GUARD_PROMPT', () => {
    const prompt = buildLiveSystemPrompt({ mode: dummyMode });
    expect(prompt).toContain('CRITICAL LANGUAGE CONSTRAINT');
    expect(prompt).toContain('Xin lỗi, mình không nghe rõ. Bạn nói lại nhé!');
    expect(prompt).toContain('Arabic, Thai, Hindi, Russian');
  });

  it('appends the Voice Anchor with correct gender', () => {
    const femalePrompt = buildLiveSystemPrompt({
      mode: dummyMode,
      voiceName: 'Kore',
    });
    expect(femalePrompt).toContain('Voice Anchor:');
    expect(femalePrompt).toContain('Kore');
    expect(femalePrompt).toContain('female voice');

    const malePrompt = buildLiveSystemPrompt({
      mode: dummyMode,
      voiceName: 'Charon',
    });
    expect(malePrompt).toContain('Voice Anchor:');
    expect(malePrompt).toContain('Charon');
    expect(malePrompt).toContain('male voice');
  });

  it('appends the Error Correction Protocol and mode-dependent directions', () => {
    // 1. Guided mode should use Vietnamese bridge instruction
    const guidedPrompt = buildLiveSystemPrompt({
      mode: { ...dummyMode, category: 'guided' },
    });
    expect(guidedPrompt).toContain('Error Correction Protocol');
    expect(guidedPrompt).toContain(
      'When correcting errors, explain in Vietnamese using the Vietnamese bridge approach'
    );

    // 2. Active Grammar Coach scenario should use Thắng Phạm specific wording or at least generic conversation rules
    const grammarScenario: LiveScenario = {
      id: 'active_correction',
      title: 'Active Grammar Coach',
      descriptionVi: '',
      systemPrompt: 'You are a grammar coach.',
      phrases: [],
    };
    const grammarPrompt = buildLiveSystemPrompt({
      mode: { ...dummyMode, category: 'conversation' },
      scenario: grammarScenario,
    });
    expect(grammarPrompt).toContain('Error Correction Protocol');
    // Active Grammar Coach is conversation mode but handles language bridge
    expect(grammarPrompt).toContain(
      'When correcting errors, explain in English to maintain immersion.'
    );

    // 3. Native Expression Coach scenario
    const expressionScenario: LiveScenario = {
      id: 'native-expression-coach',
      title: 'Native Expression Coach',
      descriptionVi: '',
      systemPrompt: 'You are an expression coach.',
      phrases: [],
    };
    const expressionPrompt = buildLiveSystemPrompt({
      mode: { ...dummyMode, category: 'conversation' },
      scenario: expressionScenario,
    });
    expect(expressionPrompt).toContain('Error Correction Protocol');
    expect(expressionPrompt).toContain(
      'Explain in English to maintain immersion, but you may use Vietnamese vocabulary or phrases for warm emphasis'
    );

    // 4. Other roleplay scenarios should correct light touch in English
    const standardScenario: LiveScenario = {
      id: 'mock_interview',
      title: 'Mock Interview',
      descriptionVi: '',
      systemPrompt: 'You are interviewing.',
      phrases: [],
    };
    const roleplayPrompt = buildLiveSystemPrompt({
      mode: { ...dummyMode, category: 'conversation' },
      scenario: standardScenario,
    });
    expect(roleplayPrompt).toContain(
      'Stay in character. Only correct serious errors that would cause real miscommunication. Keep corrections brief and in English.'
    );
  });
});
