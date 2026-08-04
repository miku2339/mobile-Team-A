import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import {
  manipulateAsync,
  SaveFormat
} from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { ChatImageAttachment } from '../types';

export const MAX_CHAT_IMAGE_BYTES = 1_500_000;
const MAX_WEB_CHAT_IMAGE_BYTES = 600_000;
const MAX_SOURCE_IMAGE_BYTES = 20_000_000;
const MAX_IMAGE_DIMENSION = 1280;
const imageDirectory = `${FileSystem.documentDirectory ?? ''}melo-chat-images/`;

export type ChatImageErrorCode = 'too-large' | 'unsupported' | 'unavailable';

export class ChatImageError extends Error {
  constructor(readonly code: ChatImageErrorCode) {
    super(code);
    this.name = 'ChatImageError';
  }
}

function estimatedBase64Bytes(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function nextImageId(): string {
  return `image-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function pickChatImage(): Promise<ChatImageAttachment | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    allowsMultipleSelection: false,
    base64: false,
    quality: 1,
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset || asset.type === 'video') {
    throw new ChatImageError('unsupported');
  }
  if (asset.fileSize && asset.fileSize > MAX_SOURCE_IMAGE_BYTES) {
    throw new ChatImageError('too-large');
  }

  const resizeAction =
    Math.max(asset.width, asset.height) > MAX_IMAGE_DIMENSION
      ? asset.width >= asset.height
        ? [{ resize: { width: MAX_IMAGE_DIMENSION } }]
        : [{ resize: { height: MAX_IMAGE_DIMENSION } }]
      : [];
  const normalized = await manipulateAsync(asset.uri, resizeAction, {
    base64: Platform.OS === 'web',
    compress: 0.65,
    format: SaveFormat.JPEG
  });

  const id = nextImageId();
  const fileName = 'melo-image.jpg';
  const common = {
    id,
    mimeType: 'image/jpeg' as const,
    width: Math.max(1, Math.floor(normalized.width || 1)),
    height: Math.max(1, Math.floor(normalized.height || 1)),
    fileName
  };

  if (Platform.OS === 'web') {
    if (
      !normalized.base64 ||
      estimatedBase64Bytes(normalized.base64) > MAX_WEB_CHAT_IMAGE_BYTES
    ) {
      throw new ChatImageError('too-large');
    }
    return {
      ...common,
      uri: `data:image/jpeg;base64,${normalized.base64}`
    };
  }

  if (!FileSystem.documentDirectory) {
    throw new ChatImageError('unavailable');
  }
  await FileSystem.makeDirectoryAsync(imageDirectory, { intermediates: true });
  const uri = `${imageDirectory}${id}.jpg`;
  const info = await FileSystem.getInfoAsync(normalized.uri);
  if (!info.exists || (info.size ?? MAX_CHAT_IMAGE_BYTES + 1) > MAX_CHAT_IMAGE_BYTES) {
    await FileSystem.deleteAsync(normalized.uri, { idempotent: true });
    throw new ChatImageError('too-large');
  }
  await FileSystem.copyAsync({ from: normalized.uri, to: uri });
  await FileSystem.deleteAsync(normalized.uri, { idempotent: true });
  return { ...common, uri };
}

export async function chatImageToDataUrl(
  image: ChatImageAttachment
): Promise<string> {
  if (image.uri.startsWith('data:image/')) {
    if (image.uri.length > Math.ceil((MAX_CHAT_IMAGE_BYTES * 4) / 3) + 64) {
      throw new ChatImageError('too-large');
    }
    return image.uri;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: FileSystem.EncodingType.Base64
    });
    if (estimatedBase64Bytes(base64) > MAX_CHAT_IMAGE_BYTES) {
      throw new ChatImageError('too-large');
    }
    return `data:${image.mimeType};base64,${base64}`;
  } catch (error) {
    if (error instanceof ChatImageError) throw error;
    throw new ChatImageError('unavailable');
  }
}

export async function deleteChatImage(
  image: ChatImageAttachment
): Promise<void> {
  if (
    Platform.OS === 'web' ||
    !FileSystem.documentDirectory ||
    !image.uri.startsWith(imageDirectory)
  ) {
    return;
  }
  await FileSystem.deleteAsync(image.uri, { idempotent: true });
}

export async function clearAllChatImages(): Promise<void> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;
  await FileSystem.deleteAsync(imageDirectory, { idempotent: true });
}

export async function pruneChatImages(
  retainedImages: ChatImageAttachment[]
): Promise<void> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;
  const directoryInfo = await FileSystem.getInfoAsync(imageDirectory);
  if (!directoryInfo.exists) return;

  const retainedNames = new Set(
    retainedImages
      .filter((image) => image.uri.startsWith(imageDirectory))
      .map((image) => image.uri.slice(imageDirectory.length))
  );
  const names = await FileSystem.readDirectoryAsync(imageDirectory);
  await Promise.all(
    names
      .filter((name) => !retainedNames.has(name))
      .map((name) =>
        FileSystem.deleteAsync(`${imageDirectory}${name}`, { idempotent: true })
      )
  );
}
