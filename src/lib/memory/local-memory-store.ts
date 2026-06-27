export type LocalMemoryItem = {
  id: string;
  sourceWorkflow: 'message' | 'explanation';
  patternKey: string;
  wrongText: string;
  correctText: string;
  explanationVi: string;
  category: string;
  confidence: number;
  source: 'observed' | 'inferred';
  status: 'active' | 'ignored';
  createdAt: string;
  updatedAt: string;
};

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
  item: Omit<LocalMemoryItem, 'id' | 'createdAt' | 'updatedAt'>
): LocalMemoryItem {
  const items = getLocalMemoryItems();

  // Avoid saving duplicate patternKey + wrongText + correctText items
  const existingIndex = items.findIndex(
    (i) =>
      i.patternKey === item.patternKey &&
      i.wrongText === item.wrongText &&
      i.correctText === item.correctText
  );

  const now = new Date().toISOString();

  if (existingIndex > -1) {
    const existing = items[existingIndex];
    const updated: LocalMemoryItem = {
      ...existing,
      ...item,
      status: item.status,
      updatedAt: now,
    };
    items[existingIndex] = updated;
    saveLocalMemoryItems(items);
    return updated;
  } else {
    const newItem: LocalMemoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: now,
      updatedAt: now,
    };
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
