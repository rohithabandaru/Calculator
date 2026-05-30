import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@calculator_history';
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

/**
 * Loads calculation history from AsyncStorage.
 */
export const loadHistory = async (): Promise<HistoryEntry[]> => {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    if (json) {
      return JSON.parse(json) as HistoryEntry[];
    }
    return [];
  } catch (error) {
    console.log('Error loading history:', error);
    return [];
  }
};

/**
 * Saves the full history array to AsyncStorage.
 */
export const saveHistory = async (entries: HistoryEntry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch (error) {
    console.log('Error saving history:', error);
  }
};

/**
 * Adds a new entry at the front of history and persists it.
 * Caps total entries at MAX_ENTRIES.
 */
export const addHistoryEntry = async (entry: HistoryEntry): Promise<HistoryEntry[]> => {
  const current = await loadHistory();
  const updated = [entry, ...current].slice(0, MAX_ENTRIES);
  await saveHistory(updated);
  return updated;
};

/**
 * Clears all history from AsyncStorage.
 */
export const clearAllHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.log('Error clearing history:', error);
  }
};
