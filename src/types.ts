export type ProviderId =
  | 'openai'
  | 'google-ai-studio'
  | 'deepseek'
  | 'kimi'
  | 'minimax'
  | 'bailian'
  | 'bailian-coding'
  | 'bailian-token'
  | 'bigmodel'
  | 'custom';

export type UILanguage = 'en' | 'zh-Hant' | 'zh-Hans';
export type AppLanguage = UILanguage | 'yue';
export type EmotionId = 'angry' | 'overwhelmed' | 'hurt' | 'anxious' | 'disappointed';
export type RecipientId = 'friend' | 'teammate' | 'teacher' | 'family';
export type ToneId = 'gentle' | 'direct' | 'formal';
export type PetMood = 'idle' | 'listening' | 'checking' | 'breathing' | 'proud';
export type MeloExpression =
  | 'calm'
  | 'listening'
  | 'thinking'
  | 'encouraging'
  | 'concerned';
export type RewriteFallbackReason =
  | 'no-key'
  | 'timeout'
  | 'network-error'
  | 'http-error'
  | 'invalid-response'
  | 'configuration-error'
  | 'unsafe-output';

export interface ProviderPreset {
  id: ProviderId;
  label: string;
  baseUrl: string;
  model: string;
  note: string;
}

export interface AISettings {
  provider: ProviderId;
  apiKey: string;
  baseUrl: string;
  model: string;
  supportsImages: boolean;
}

export interface RewriteInput {
  draft: string;
  emotion: EmotionId;
  recipient: RecipientId;
  tone: ToneId;
  language: AppLanguage;
}

export interface RewriteResult {
  text: string;
  source: 'ai' | 'fallback' | 'safety';
  providerLabel: string;
  providerId?: ProviderId;
  attemptedProviderId?: ProviderId;
  configuredProviderId?: ProviderId;
  fallbackReason?: RewriteFallbackReason;
  providerHttpStatus?: number;
  providerErrorCode?: string;
  providerRequestId?: string;
  explanation: string[];
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  text: string;
  image?: ChatImageAttachment;
  expression?: MeloExpression;
}

export interface ChatImageAttachment {
  id: string;
  uri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  width: number;
  height: number;
  fileName?: string;
}

export interface ChatSessionMessage extends ChatHistoryMessage {
  id: string;
  source?: 'ai' | 'safety';
  providerId?: ProviderId;
  model?: string;
  providerRequestId?: string;
}

export type ChatTurnResult =
  | {
      status: 'message';
      text: string;
      source: 'ai' | 'safety';
      providerLabel: string;
      expression: MeloExpression;
      providerId?: ProviderId;
      model?: string;
      providerRequestId?: string;
    }
  | {
      status: 'unavailable';
      reason:
        | RewriteFallbackReason
        | 'attachment-error'
        | 'image-not-enabled';
      attemptedProviderId?: ProviderId;
      configuredProviderId?: ProviderId;
      providerHttpStatus?: number;
      providerErrorCode?: string;
      providerRequestId?: string;
    };
