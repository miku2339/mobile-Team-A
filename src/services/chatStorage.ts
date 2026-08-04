import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { ChatSessionMessage } from '../types';
import {
  CHAT_TEXT_CHUNK_SIZE,
  MAX_LOCAL_CHAT_MESSAGES,
  MAX_STORED_CHAT_TEXT_LENGTH,
  limitLocalChatMessages,
  parseLocalChatMessages,
  serializeLocalChatMessages,
  splitChatText
} from '../utils/chatPersistence';

const WEB_CHAT_STORAGE_KEY = 'melo.chat.local.v1';
const NATIVE_CHAT_MANIFEST_KEY = 'melo.chat.local.manifest.v1';
const MAX_CHAT_TEXT_CHUNKS = Math.ceil(
  MAX_STORED_CHAT_TEXT_LENGTH / CHAT_TEXT_CHUNK_SIZE
);
const secureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface NativeManifest {
  version: 1;
  count: number;
}

interface NativeMessageMetadata {
  version: 1;
  id: string;
  role: ChatSessionMessage['role'];
  source?: ChatSessionMessage['source'];
  providerId?: ChatSessionMessage['providerId'];
  model?: string;
  providerRequestId?: string;
  image?: ChatSessionMessage['image'];
  expression?: ChatSessionMessage['expression'];
  chunkCount: number;
}

let writeQueue: Promise<void> = Promise.resolve();

function getWebLocalStorage(): StorageLike | undefined {
  if (Platform.OS !== 'web') return undefined;
  return (globalThis as { localStorage?: StorageLike }).localStorage;
}

function nativeMetadataKey(slot: number): string {
  return `melo.chat.local.v1.${slot}.meta`;
}

function nativeChunkKey(slot: number, chunk: number): string {
  return `melo.chat.local.v1.${slot}.text.${chunk}`;
}

function parseManifest(raw: string | null): NativeManifest | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<NativeManifest>;
    if (
      value.version !== 1 ||
      typeof value.count !== 'number' ||
      !Number.isInteger(value.count) ||
      value.count < 0 ||
      value.count > MAX_LOCAL_CHAT_MESSAGES
    ) {
      return null;
    }
    return { version: 1, count: value.count };
  } catch {
    return null;
  }
}

function parseMetadata(raw: string | null): NativeMessageMetadata | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<NativeMessageMetadata>;
    if (
      value.version !== 1 ||
      typeof value.id !== 'string' ||
      (value.role !== 'user' && value.role !== 'assistant') ||
      typeof value.chunkCount !== 'number' ||
      !Number.isInteger(value.chunkCount) ||
      value.chunkCount < 1 ||
      value.chunkCount > MAX_CHAT_TEXT_CHUNKS
    ) {
      return null;
    }
    return value as NativeMessageMetadata;
  } catch {
    return null;
  }
}

async function loadNativeMessages(): Promise<ChatSessionMessage[]> {
  const manifest = parseManifest(
    await SecureStore.getItemAsync(NATIVE_CHAT_MANIFEST_KEY)
  );
  if (!manifest) return [];

  const messages: ChatSessionMessage[] = [];
  for (let slot = 0; slot < manifest.count; slot += 1) {
    const metadata = parseMetadata(
      await SecureStore.getItemAsync(nativeMetadataKey(slot))
    );
    if (!metadata) continue;

    const chunks = await Promise.all(
      Array.from({ length: metadata.chunkCount }, (_, chunk) =>
        SecureStore.getItemAsync(nativeChunkKey(slot, chunk))
      )
    );
    if (chunks.some((chunk) => chunk === null)) continue;

    messages.push({
      id: metadata.id,
      role: metadata.role,
      text: chunks.join(''),
      ...(metadata.source ? { source: metadata.source } : {}),
      ...(metadata.providerId ? { providerId: metadata.providerId } : {}),
      ...(metadata.model ? { model: metadata.model } : {}),
      ...(metadata.providerRequestId
        ? { providerRequestId: metadata.providerRequestId }
        : {}),
      ...(metadata.image ? { image: metadata.image } : {}),
      ...(metadata.expression ? { expression: metadata.expression } : {})
    });
  }
  return limitLocalChatMessages(messages);
}

async function saveNativeMessages(messages: ChatSessionMessage[]): Promise<void> {
  const bounded = limitLocalChatMessages(messages);
  const oldManifest = parseManifest(
    await SecureStore.getItemAsync(NATIVE_CHAT_MANIFEST_KEY)
  );

  for (let slot = 0; slot < bounded.length; slot += 1) {
    const message = bounded[slot];
    if (!message) continue;
    const chunks = splitChatText(message.text);
    const metadata: NativeMessageMetadata = {
      version: 1,
      id: message.id,
      role: message.role,
      ...(message.source ? { source: message.source } : {}),
      ...(message.providerId ? { providerId: message.providerId } : {}),
      ...(message.model ? { model: message.model } : {}),
      ...(message.providerRequestId
        ? { providerRequestId: message.providerRequestId }
        : {}),
      ...(message.image ? { image: message.image } : {}),
      ...(message.expression ? { expression: message.expression } : {}),
      chunkCount: chunks.length
    };

    await SecureStore.setItemAsync(
      nativeMetadataKey(slot),
      JSON.stringify(metadata),
      secureStoreOptions
    );
    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(
          nativeChunkKey(slot, index),
          chunk,
          secureStoreOptions
        )
      )
    );
    await Promise.all(
      Array.from(
        { length: MAX_CHAT_TEXT_CHUNKS - chunks.length },
        (_, offset) =>
          SecureStore.deleteItemAsync(
            nativeChunkKey(slot, chunks.length + offset)
          )
      )
    );
  }

  await SecureStore.setItemAsync(
    NATIVE_CHAT_MANIFEST_KEY,
    JSON.stringify({ version: 1, count: bounded.length }),
    secureStoreOptions
  );

  const oldCount = oldManifest?.count ?? 0;
  for (let slot = bounded.length; slot < oldCount; slot += 1) {
    await SecureStore.deleteItemAsync(nativeMetadataKey(slot));
    await Promise.all(
      Array.from({ length: MAX_CHAT_TEXT_CHUNKS }, (_, chunk) =>
        SecureStore.deleteItemAsync(nativeChunkKey(slot, chunk))
      )
    );
  }
}

async function clearNativeMessages(): Promise<void> {
  await SecureStore.deleteItemAsync(NATIVE_CHAT_MANIFEST_KEY);
  for (let slot = 0; slot < MAX_LOCAL_CHAT_MESSAGES; slot += 1) {
    await SecureStore.deleteItemAsync(nativeMetadataKey(slot));
    await Promise.all(
      Array.from({ length: MAX_CHAT_TEXT_CHUNKS }, (_, chunk) =>
        SecureStore.deleteItemAsync(nativeChunkKey(slot, chunk))
      )
    );
  }
}

function enqueueWrite(operation: () => Promise<void>): Promise<void> {
  const next = writeQueue.then(operation, operation);
  writeQueue = next.catch(() => undefined);
  return next;
}

export async function loadChatMessages(): Promise<ChatSessionMessage[]> {
  await writeQueue;
  const webStorage = getWebLocalStorage();
  if (webStorage) {
    return parseLocalChatMessages(webStorage.getItem(WEB_CHAT_STORAGE_KEY));
  }
  return loadNativeMessages();
}

export function saveChatMessages(messages: ChatSessionMessage[]): Promise<void> {
  return enqueueWrite(async () => {
    const webStorage = getWebLocalStorage();
    if (webStorage) {
      webStorage.setItem(
        WEB_CHAT_STORAGE_KEY,
        serializeLocalChatMessages(messages)
      );
      return;
    }
    await saveNativeMessages(messages);
  });
}

export function clearChatMessages(): Promise<void> {
  return enqueueWrite(async () => {
    const webStorage = getWebLocalStorage();
    if (webStorage) {
      webStorage.removeItem(WEB_CHAT_STORAGE_KEY);
      return;
    }
    await clearNativeMessages();
  });
}
