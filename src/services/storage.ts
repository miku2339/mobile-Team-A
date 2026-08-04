import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { AISettings, UILanguage } from '../types';
import { parseUILanguage } from '../i18n';
import {
  AI_SETTINGS_STORAGE_KEY,
  parseAISettings
} from '../utils/settingsValidation';

const STARS_KEY = 'melo.calm-stars.v1';
const UI_LANGUAGE_KEY = 'melo.ui-language.v1';

interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const getWebStorage = (): SessionStorageLike | undefined => {
  if (Platform.OS !== 'web') return undefined;
  return (globalThis as { sessionStorage?: SessionStorageLike }).sessionStorage;
};

const getWebPersistentStorage = (): SessionStorageLike | undefined => {
  if (Platform.OS !== 'web') return undefined;
  return (globalThis as { localStorage?: SessionStorageLike }).localStorage;
};

export async function loadAISettings(): Promise<AISettings | null> {
  try {
    const webStorage = getWebStorage();
    const raw = webStorage
      ? webStorage.getItem(AI_SETTINGS_STORAGE_KEY)
      : await SecureStore.getItemAsync(AI_SETTINGS_STORAGE_KEY);

    if (!raw) return null;
    return parseAISettings(raw);
  } catch {
    return null;
  }
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  const raw = JSON.stringify(settings);
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.setItem(AI_SETTINGS_STORAGE_KEY, raw);
    return;
  }

  await SecureStore.setItemAsync(AI_SETTINGS_STORAGE_KEY, raw, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

export async function clearAISettings(): Promise<void> {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(AI_SETTINGS_STORAGE_KEY);
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

export async function loadUILanguage(): Promise<UILanguage | null> {
  try {
    const webStorage = getWebPersistentStorage();
    const raw = webStorage
      ? webStorage.getItem(UI_LANGUAGE_KEY)
      : await SecureStore.getItemAsync(UI_LANGUAGE_KEY);
    return parseUILanguage(raw);
  } catch {
    return null;
  }
}

export async function saveUILanguage(language: UILanguage): Promise<void> {
  const webStorage = getWebPersistentStorage();
  if (webStorage) {
    webStorage.setItem(UI_LANGUAGE_KEY, language);
    return;
  }
  await SecureStore.setItemAsync(UI_LANGUAGE_KEY, language);
}
