import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

// Type-safe async storage helpers
export const storageUtils = {
  getString: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setString: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('[Storage] Failed to set string:', error);
    }
  },

  getObject: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  setObject: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('[Storage] Failed to set object:', error);
    }
  },

  delete: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('[Storage] Failed to delete:', error);
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('[Storage] Failed to clear:', error);
    }
  },
};

// Zustand persist storage adapter (fully async)
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.warn('[Storage] Zustand setItem failed:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.warn('[Storage] Zustand removeItem failed:', error);
    }
  },
};
