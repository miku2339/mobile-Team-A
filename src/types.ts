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
