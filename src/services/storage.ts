import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { AISettings } from '../types';

const SETTINGS_KEY = 'melo.ai-settings.v1';
const STARS_KEY = 'melo.calm-stars.v1';

interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const getWebStorage = (): SessionStorageLike | undefined => {
  if (Platform.OS !== 'web') return undefined;
  return (globalThis as { sessionStorage?: SessionStorageLike }).sessionStorage;
};

export async function loadAISettings(): Promise<AISettings | null> {
  try {
    const webStorage = getWebStorage();
    const raw = webStorage
      ? webStorage.getItem(SETTINGS_KEY)
      : await SecureStore.getItemAsync(SETTINGS_KEY);

    if (!raw) return null;
    return JSON.parse(raw) as AISettings;
  } catch {
    return null;
  }
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  const raw = JSON.stringify(settings);
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.setItem(SETTINGS_KEY, raw);
    return;
  }

  await SecureStore.setItemAsync(SETTINGS_KEY, raw, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

export async function clearAISettings(): Promise<void> {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.removeItem(SETTINGS_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SETTINGS_KEY);
}

export async function loadCalmStars(): Promise<number> {
  try {
    const webStorage = getWebStorage();
    const raw = webStorage
      ? webStorage.getItem(STARS_KEY)
      : await SecureStore.getItemAsync(STARS_KEY);
    const parsed = Number(raw ?? '0');
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export async function saveCalmStars(stars: number): Promise<void> {
  const value = String(Math.max(0, Math.floor(stars)));
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(STARS_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(STARS_KEY, value);
}
