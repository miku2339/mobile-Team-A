export type ProviderId = 'openai' | 'bailian' | 'bigmodel' | 'custom';

export type AppLanguage = 'en' | 'zh-Hant' | 'yue';
export type EmotionId = 'angry' | 'overwhelmed' | 'hurt' | 'anxious' | 'disappointed';
export type RecipientId = 'friend' | 'teammate' | 'teacher' | 'family';
export type ToneId = 'gentle' | 'direct' | 'formal';
export type PetMood = 'idle' | 'listening' | 'checking' | 'breathing' | 'proud';

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
  explanation: string[];
}
