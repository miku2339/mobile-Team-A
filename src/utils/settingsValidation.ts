import type { AISettings, ProviderId } from '../types';

export const AI_SETTINGS_STORAGE_KEY = 'melo.ai-settings.v2';

const providerIds = new Set<ProviderId>([
  'openai',
  'google-ai-studio',
  'deepseek',
  'kimi',
  'minimax',
  'bailian',
  'bailian-coding',
  'bailian-token',
  'bigmodel',
  'custom'
]);

export function parseAISettings(raw: string): AISettings | null {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== 'object') return null;

    const candidate = value as Partial<Record<keyof AISettings, unknown>>;
    if (typeof candidate.provider !== 'string' || !providerIds.has(candidate.provider as ProviderId)) {
      return null;
    }
    if (typeof candidate.apiKey !== 'string' || candidate.apiKey.length > 4096) return null;
    if (typeof candidate.baseUrl !== 'string' || candidate.baseUrl.length > 2048) return null;
    if (typeof candidate.model !== 'string' || candidate.model.length > 256) return null;

    return {
      provider: candidate.provider as ProviderId,
      apiKey: candidate.apiKey,
      baseUrl: candidate.baseUrl,
      model: candidate.model
    };
  } catch {
    return null;
  }
}
