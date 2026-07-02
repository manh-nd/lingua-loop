import { describe, expect, it } from 'vitest';
import {
  matchMemoryItems,
  WorkspaceMemoryItem,
} from '@/core/workspace/workspace.matcher';

describe('matchMemoryItems', () => {
  const mockItems: WorkspaceMemoryItem[] = [
    {
      id: 'mem_1',
      type: 'mistake',
      title: 'Missing be verb',
      explanation: 'Giải thích...',
      wrongText: 'I happy',
      correctText: 'I am happy',
      category: 'grammar',
    },
    {
      id: 'mem_2',
      type: 'reusable_phrase',
      title: 'Nice greeting',
      explanation: 'Giải thích...',
      phrase: 'take a look at this',
      category: 'naturalness',
    },
    {
      id: 'mem_3',
      type: 'vocabulary',
      title: 'Upgrade word',
      explanation: 'Giải thích...',
      phrase: 'happy',
      category: 'word_choice',
    },
  ];

  it('matches items by token overlap and scores them correctly', () => {
    // happy should match mem_3 and mem_1
    const draft = 'I am so happy to see you';
    const matches = matchMemoryItems(draft, mockItems);

    expect(matches).toHaveLength(2);
    // happy is matched. mem_1 has 'happy' (1 match), mem_3 has 'happy' (1 match).
    // mistake should be prioritized on score ties, so mem_1 comes first
    expect(matches[0]?.id).toBe('mem_1');
    expect(matches[1]?.id).toBe('mem_3');
  });

  it('filters out common English and Vietnamese stop words', () => {
    // "the", "a", "and", "của", "là" are stop words
    const draft = 'the a and của là';
    const matches = matchMemoryItems(draft, mockItems);
    expect(matches).toHaveLength(0);
  });

  it('only returns up to 5 items with score > 0', () => {
    const draft = 'random text that matches nothing';
    const matches = matchMemoryItems(draft, mockItems);
    expect(matches).toHaveLength(0);
  });
});
