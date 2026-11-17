import { LilyStorageData } from '../types/lily';

const LOCAL_STORAGE_KEY = 'lily_companion_mvp_v1';

interface ChromeSyncStorage {
  get: (keys: string[], callback: (result: Record<string, unknown>) => void) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
}

function getChromeSyncStorage(): ChromeSyncStorage | null {
  if (typeof globalThis !== 'undefined') {
    const win = globalThis as unknown as {
      chrome?: { storage?: { sync?: ChromeSyncStorage } };
    };
    if (win.chrome?.storage?.sync) {
      return win.chrome.storage.sync;
    }
  }
  return null;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialStorageData(dateKey: string = getLocalDateKey()): LilyStorageData {
  return {
    lastResetDate: dateKey,
    mainFocus: {
      text: 'Complete today’s key priority',
      completed: false,
    },
    todos: [
      {
        id: 'todo_starter_1',
        text: 'Review today’s calendar events',
        completed: false,
        createdAt: Date.now() - 120000,
      },
      {
        id: 'todo_starter_2',
        text: 'Turn on ambient rain for deep focus',
        completed: false,
        createdAt: Date.now() - 60000,
      },
    ],
    settings: {
      ambientAudioUrl: '',
    },
  };
}

export async function loadStorageData(): Promise<LilyStorageData> {
  const chromeSync = getChromeSyncStorage();
  if (chromeSync) {
    return new Promise((resolve) => {
      chromeSync.get([LOCAL_STORAGE_KEY], (result) => {
        const stored = result?.[LOCAL_STORAGE_KEY] as LilyStorageData | undefined;
        if (stored && typeof stored === 'object' && stored.lastResetDate) {
          resolve(applyMidnightResetIfNeeded(stored).data);
        } else {
          const initial = createInitialStorageData();
          void saveStorageData(initial);
          resolve(initial);
        }
      });
    });
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LilyStorageData;
      if (parsed && typeof parsed === 'object' && parsed.lastResetDate) {
        const checked = applyMidnightResetIfNeeded(parsed);
        if (checked.didReset) {
          void saveStorageData(checked.data);
        }
        return checked.data;
      }
    }
  } catch {
    // Fallback cleanly if storage is corrupted or unavailable
  }

  const initial = createInitialStorageData();
  await saveStorageData(initial);
  return initial;
}

export async function saveStorageData(data: LilyStorageData): Promise<void> {
  const chromeSync = getChromeSyncStorage();
  if (chromeSync) {
    return new Promise((resolve) => {
      chromeSync.set({ [LOCAL_STORAGE_KEY]: data }, () => resolve());
    });
  }

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

/**
 * BR-02: Midnight Daily Reset
 * 1. Clear Today's Main Focus text & completion state.
 * 2. Remove completed To-do items (completed: true), preserve incomplete ones (completed: false).
 * 3. Update lastResetDate to today's YYYY-MM-DD local date.
 */
export function applyMidnightResetIfNeeded(
  current: LilyStorageData,
  now: Date = new Date(),
  forceReset: boolean = false
): { data: LilyStorageData; didReset: boolean } {
  const todayKey = getLocalDateKey(now);
  if (!forceReset && current.lastResetDate === todayKey) {
    return { data: current, didReset: false };
  }

  const resetData: LilyStorageData = {
    lastResetDate: todayKey,
    mainFocus: {
      text: '',
      completed: false,
    },
    todos: (current.todos || []).filter((item) => !item.completed),
    settings: current.settings || { ambientAudioUrl: '' },
  };

  return { data: resetData, didReset: true };
}
