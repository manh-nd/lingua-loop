export interface WorkspaceMemoryItem {
  id: string;
  type: 'mistake' | 'reusable_phrase' | 'vocabulary' | 'tone_pattern';
  title: string;
  explanation: string;
  wrongText?: string | null;
  correctText?: string | null;
  phrase?: string | null;
  situation?: string | null;
  category: string;
}

const STOP_WORDS = new Set([
  // English stop words
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'to',
  'of',
  'in',
  'on',
  'at',
  'for',
  'with',
  'is',
  'are',
  'am',
  'was',
  'were',
  'be',
  'been',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'this',
  'that',
  'these',
  'those',
  // Vietnamese stop words
  'và',
  'hoặc',
  'nhưng',
  'để',
  'của',
  'trong',
  'trên',
  'tại',
  'cho',
  'với',
  'là',
  'thì',
  'ở',
  'có',
  'làm',
  'này',
  'đó',
  'những',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

export function matchMemoryItems(
  draftText: string,
  items: WorkspaceMemoryItem[]
): WorkspaceMemoryItem[] {
  const draftTokens = new Set(tokenize(draftText));
  if (draftTokens.size === 0) return [];

  const scoredItems = items
    .map((item) => {
      // Find candidate tokens to match against
      const matchText = [
        item.wrongText || '',
        item.phrase || '',
        item.title || '',
      ]
        .filter(Boolean)
        .join(' ');

      const itemTokens = tokenize(matchText);
      let score = 0;
      for (const token of itemTokens) {
        if (draftTokens.has(token)) {
          score++;
        }
      }

      return { item, score };
    })
    .filter((scored) => scored.score > 0);

  // Sort: score descending, then prioritize 'mistake' and 'tone_pattern'
  scoredItems.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const aPriority =
      a.item.type === 'mistake' || a.item.type === 'tone_pattern' ? 1 : 0;
    const bPriority =
      b.item.type === 'mistake' || b.item.type === 'tone_pattern' ? 1 : 0;
    return bPriority - aPriority;
  });

  return scoredItems.slice(0, 5).map((scored) => scored.item);
}
