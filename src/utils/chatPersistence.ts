import { PROVIDERS } from '../config/providers';
import type {
  ChatImageAttachment,
  ChatSessionMessage,
  MeloExpression,
  ProviderId
} from '../types';

export const MAX_LOCAL_CHAT_MESSAGES = 24;
export const MAX_STORED_CHAT_TEXT_LENGTH = 1200;
export const CHAT_TEXT_CHUNK_SIZE = 300;
export const MAX_LOCAL_CHAT_IMAGES = 2;

const safeIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;
const safeModelPattern = /^[^\u0000-\u001F\u007F]{1,120}$/u;
const providerIds = new Set<ProviderId>(
  Object.keys(PROVIDERS) as ProviderId[]
);
const imageMimeTypes = new Set<ChatImageAttachment['mimeType']>([
  'image/jpeg',
  'image/png',
  'image/webp'
]);
const meloExpressions = new Set<MeloExpression>([
  'calm',
  'listening',
  'thinking',
  'encouraging',
  'concerned'
]);

function sanitizeImage(value: unknown): ChatImageAttachment | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const image = value as Partial<ChatImageAttachment>;
  const uriIsLocalFile =
    typeof image.uri === 'string' &&
    image.uri.startsWith('file://') &&
    image.uri.length <= 4096;
  const uriIsLocalData =
    typeof image.uri === 'string' &&
    /^data:image\/(?:jpeg|png|webp);base64,/i.test(image.uri) &&
    image.uri.length <= 2_100_064;
  if (
    typeof image.id !== 'string' ||
    !safeIdPattern.test(image.id) ||
    (!uriIsLocalFile && !uriIsLocalData) ||
    !image.mimeType ||
    !imageMimeTypes.has(image.mimeType) ||
    typeof image.width !== 'number' ||
    !Number.isFinite(image.width) ||
    image.width < 1 ||
    image.width > 20_000 ||
    typeof image.height !== 'number' ||
    !Number.isFinite(image.height) ||
    image.height < 1 ||
    image.height > 20_000
  ) {
    return undefined;
  }

  const fileName =
    typeof image.fileName === 'string' && image.fileName.length <= 120
      ? image.fileName
      : undefined;
  return {
    id: image.id,
    uri: image.uri as string,
    mimeType: image.mimeType,
    width: Math.floor(image.width),
    height: Math.floor(image.height),
    ...(fileName ? { fileName } : {})
  };
}

function sanitizeMessage(value: unknown): ChatSessionMessage | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ChatSessionMessage>;
  if (
    typeof candidate.id !== 'string' ||
    !safeIdPattern.test(candidate.id) ||
    (candidate.role !== 'user' && candidate.role !== 'assistant') ||
    typeof candidate.text !== 'string'
  ) {
    return null;
  }

  const text = candidate.text.trim().slice(0, MAX_STORED_CHAT_TEXT_LENGTH);

  if (candidate.role === 'user') {
    const image = sanitizeImage(candidate.image);
    if (!text && !image) return null;
    return {
      id: candidate.id,
      role: 'user',
      text,
      ...(image ? { image } : {})
    };
  }

  if (!text) return null;
  if (candidate.source !== 'ai' && candidate.source !== 'safety') return null;
  const providerId =
    candidate.providerId && providerIds.has(candidate.providerId)
      ? candidate.providerId
      : undefined;
  const providerRequestId =
    typeof candidate.providerRequestId === 'string' &&
    safeIdPattern.test(candidate.providerRequestId)
      ? candidate.providerRequestId
      : undefined;
  const model =
    typeof candidate.model === 'string' &&
    safeModelPattern.test(candidate.model.trim())
      ? candidate.model.trim()
      : undefined;
  const expression =
    candidate.expression && meloExpressions.has(candidate.expression)
      ? candidate.expression
      : 'calm';

  return {
    id: candidate.id,
    role: 'assistant',
    text,
    source: candidate.source,
    expression,
    ...(providerId ? { providerId } : {}),
    ...(model ? { model } : {}),
    ...(providerRequestId ? { providerRequestId } : {})
  };
}

export function limitLocalChatMessages(
  messages: ChatSessionMessage[]
): ChatSessionMessage[] {
  const bounded = messages
    .map(sanitizeMessage)
    .filter((message): message is ChatSessionMessage => message !== null)
    .slice(-MAX_LOCAL_CHAT_MESSAGES);

  let retainedImages = 0;
  return bounded
    .reverse()
    .flatMap((message) => {
      if (!message.image) return [message];
      retainedImages += 1;
      if (retainedImages <= MAX_LOCAL_CHAT_IMAGES) return [message];
      if (!message.text) return [];
      const { image: _image, ...withoutImage } = message;
      return [withoutImage];
    })
    .reverse();
}

export function serializeLocalChatMessages(
  messages: ChatSessionMessage[]
): string {
  return JSON.stringify({
    version: 1,
    messages: limitLocalChatMessages(messages)
  });
}

export function parseLocalChatMessages(raw: string | null): ChatSessionMessage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { version?: unknown; messages?: unknown };
    if (parsed.version !== 1 || !Array.isArray(parsed.messages)) return [];
    return limitLocalChatMessages(parsed.messages as ChatSessionMessage[]);
  } catch {
    return [];
  }
}

export function splitChatText(text: string): string[] {
  const chunks: string[] = [];
  for (let offset = 0; offset < text.length; offset += CHAT_TEXT_CHUNK_SIZE) {
    chunks.push(text.slice(offset, offset + CHAT_TEXT_CHUNK_SIZE));
  }
  return chunks.length > 0 ? chunks : [''];
}
