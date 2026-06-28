import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

// Mock localStorage globally before importing the target module
let store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
};

beforeAll(() => {
  global.window = {} as unknown as Window & typeof globalThis;
  global.localStorage = localStorageMock as unknown as Storage;
});

afterAll(() => {
  // @ts-expect-error - deleting global properties for clean teardown
  delete global.window;
  // @ts-expect-error - deleting global properties for clean teardown
  delete global.localStorage;
});

import {
  getLocalMemoryItems,
  addLocalMemoryItem,
  updateLocalMemoryItem,
  deleteLocalMemoryItem,
} from '@/lib/memory/local-memory-store';

describe('local-memory-store', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('1. getLocalMemoryItems() returns [] when localStorage is empty', () => {
    const items = getLocalMemoryItems();
    expect(items).toEqual([]);
  });

  it('2. addLocalMemoryItem() adds a new item with generated id, createdAt, and updatedAt', () => {
    const itemData = {
      sourceWorkflow: 'message' as const,
      patternKey: 'test_key',
      patternNameVi: 'Lỗi kiểm thử',
      wrongText: 'I am test.',
      correctText: 'I am a test.',
      explanationVi: 'Giải nghĩa test.',
      category: 'grammar',
      confidence: 0.9,
      source: 'observed' as const,
      status: 'active' as const,
    };

    const newItem = addLocalMemoryItem(itemData);

    expect(newItem.id).toBeDefined();
    expect(typeof newItem.id).toBe('string');
    expect(newItem.id.length).toBeGreaterThan(0);
    expect(newItem.createdAt).toBeDefined();
    expect(newItem.updatedAt).toBeDefined();
    expect(newItem.wrongText).toBe('I am test.');
    expect(newItem.patternNameVi).toBe('Lỗi kiểm thử');

    const items = getLocalMemoryItems();
    expect(items.length).toBe(1);
    expect(items[0]).toEqual(newItem);
  });

  it('3. addLocalMemoryItem() avoids duplicate items based on patternKey + wrongText + correctText', () => {
    const itemData = {
      sourceWorkflow: 'message' as const,
      patternKey: 'test_key',
      wrongText: 'I am test.',
      correctText: 'I am a test.',
      explanationVi: 'Giải nghĩa test.',
      category: 'grammar',
      confidence: 0.9,
      source: 'observed' as const,
      status: 'active' as const,
    };

    const first = addLocalMemoryItem(itemData);
    const second = addLocalMemoryItem(itemData);

    expect(first.id).toBe(second.id);

    const items = getLocalMemoryItems();
    expect(items.length).toBe(1);
  });

  it('4. Duplicate add should update the existing item rather than create a second item', () => {
    const itemData = {
      sourceWorkflow: 'message' as const,
      patternKey: 'test_key',
      wrongText: 'I am test.',
      correctText: 'I am a test.',
      explanationVi: 'Giải nghĩa test.',
      category: 'grammar',
      confidence: 0.9,
      source: 'observed' as const,
      status: 'active' as const,
    };

    const first = addLocalMemoryItem(itemData);

    // Wait a brief millisecond or mock date change to ensure updatedAt is updated if the timestamp changes.
    // We can also verify that updates (like status) are applied.
    const updatedData = {
      ...itemData,
      status: 'ignored' as const,
      explanationVi: 'Giải nghĩa test mới.',
    };

    const second = addLocalMemoryItem(updatedData);

    expect(first.id).toBe(second.id);
    expect(second.status).toBe('ignored');
    expect(second.explanationVi).toBe('Giải nghĩa test mới.');

    const items = getLocalMemoryItems();
    expect(items.length).toBe(1);
    expect(items[0].status).toBe('ignored');
    expect(items[0].explanationVi).toBe('Giải nghĩa test mới.');
  });

  it('5. updateLocalMemoryItem() updates an existing item and refreshes updatedAt', () => {
    vi.useFakeTimers();
    const systemTime = new Date('2026-06-27T12:00:00.000Z');
    vi.setSystemTime(systemTime);

    const itemData = {
      sourceWorkflow: 'message' as const,
      patternKey: 'test_key',
      wrongText: 'I am test.',
      correctText: 'I am a test.',
      explanationVi: 'Giải nghĩa test.',
      category: 'grammar',
      confidence: 0.9,
      source: 'observed' as const,
      status: 'active' as const,
    };

    const item = addLocalMemoryItem(itemData);
    const originalUpdatedAt = item.updatedAt;

    // Advance system time
    vi.setSystemTime(new Date(systemTime.getTime() + 1000));

    const updated = updateLocalMemoryItem(item.id, {
      correctText: 'I am a verified test.',
    });

    expect(updated).not.toBeNull();
    expect(updated!.id).toBe(item.id);
    expect(updated!.correctText).toBe('I am a verified test.');
    expect(updated!.wrongText).toBe('I am test.'); // preserved
    expect(updated!.updatedAt).not.toBe(originalUpdatedAt);

    const items = getLocalMemoryItems();
    expect(items[0].correctText).toBe('I am a verified test.');
    vi.useRealTimers();
  });

  it('6. updateLocalMemoryItem() returns null for an unknown id', () => {
    const result = updateLocalMemoryItem('unknown_id', {
      correctText: 'No effect',
    });
    expect(result).toBeNull();
  });

  it('7. deleteLocalMemoryItem() removes an item', () => {
    const itemData = {
      sourceWorkflow: 'message' as const,
      patternKey: 'test_key',
      wrongText: 'I am test.',
      correctText: 'I am a test.',
      explanationVi: 'Giải nghĩa test.',
      category: 'grammar',
      confidence: 0.9,
      source: 'observed' as const,
      status: 'active' as const,
    };

    const item = addLocalMemoryItem(itemData);
    expect(getLocalMemoryItems().length).toBe(1);

    deleteLocalMemoryItem(item.id);
    expect(getLocalMemoryItems().length).toBe(0);
  });

  it('8. Corrupted localStorage data should not crash and should return []', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Set corrupted non-JSON data in localStorage
    localStorageMock.setItem('lingua-loop-memory', 'corrupted-[value{');

    // We expect it to not crash and catch the error, returning []
    const items = getLocalMemoryItems();
    expect(items).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
