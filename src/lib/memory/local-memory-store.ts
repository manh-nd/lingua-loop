import { LocalMemoryItem, MemoryType } from '@/core/memory/memory.schema';

const STORAGE_KEY = 'lingua-loop-memory';

export function getLocalMemoryItems(): LocalMemoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse memory from localStorage', e);
    return [];
  }
}

export function saveLocalMemoryItems(items: LocalMemoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save memory to localStorage', e);
  }
}

export function addLocalMemoryItem(
  item: Omit<
    LocalMemoryItem,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'memoryType'
    | 'reviewCount'
    | 'correctStreak'
    | 'wrongStreak'
    | 'lastReviewedAt'
    | 'nextReviewAt'
    | 'intervalDays'
    | 'easeFactor'
  > &
    Partial<
      Pick<
        LocalMemoryItem,
        | 'memoryType'
        | 'reviewCount'
        | 'correctStreak'
        | 'wrongStreak'
        | 'lastReviewedAt'
        | 'nextReviewAt'
        | 'intervalDays'
        | 'easeFactor'
        | 'status'
        | 'culturalContextVi'
        | 'wrongText'
        | 'correctText'
        | 'phrase'
        | 'situationVi'
        | 'trapText'
        | 'wrongInterpretationVi'
        | 'correctInterpretationVi'
        | 'reviewPromptText'
      >
    >
): LocalMemoryItem {
  const items = getLocalMemoryItems();

  const memoryType = item.memoryType ?? 'writing_mistake';

  // Avoid saving duplicate items depending on the memoryType
  const existingIndex = items.findIndex((i) => {
    if (i.patternKey !== item.patternKey || i.memoryType !== memoryType) {
      return false;
    }
    if (memoryType === 'writing_mistake') {
      return (
        i.wrongText === item.wrongText && i.correctText === item.correctText
      );
    }
    if (memoryType === 'reusable_phrase') {
      return i.phrase === item.phrase;
    }
    if (memoryType === 'reading_trap') {
      return i.trapText === item.trapText;
    }
    return false;
  });

  const now = new Date().toISOString();

  if (existingIndex > -1) {
    const existing = items[existingIndex];
    const updated: LocalMemoryItem = {
      ...existing,
      ...item,
      memoryType,
      status: item.status ?? existing.status ?? 'active',
      updatedAt: now,
    };
    items[existingIndex] = updated;
    saveLocalMemoryItems(items);
    return updated;
  } else {
    const newItem: LocalMemoryItem = {
      ...item,
      memoryType,
      id: Math.random().toString(36).substring(2, 11),
      status: item.status ?? 'active',
      createdAt: now,
      updatedAt: now,
      // SRS Defaults
      reviewCount: item.reviewCount ?? 0,
      correctStreak: item.correctStreak ?? 0,
      wrongStreak: item.wrongStreak ?? 0,
      lastReviewedAt: item.lastReviewedAt,
      nextReviewAt: item.nextReviewAt ?? now,
      intervalDays: item.intervalDays ?? 0,
      easeFactor: item.easeFactor ?? 2.5,
    } as LocalMemoryItem;

    items.push(newItem);
    saveLocalMemoryItems(items);
    return newItem;
  }
}

export function updateLocalMemoryItem(
  id: string,
  updates: Partial<Omit<LocalMemoryItem, 'id' | 'createdAt'>>
): LocalMemoryItem | null {
  const items = getLocalMemoryItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const updated: LocalMemoryItem = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  items[index] = updated;
  saveLocalMemoryItems(items);
  return updated;
}

export function deleteLocalMemoryItem(id: string): void {
  const items = getLocalMemoryItems();
  const filtered = items.filter((i) => i.id !== id);
  saveLocalMemoryItems(filtered);
}
export type { LocalMemoryItem };
