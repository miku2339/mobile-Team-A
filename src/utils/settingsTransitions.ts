import {
  ALIBABA_ENDPOINTS,
  isAlibabaProvider,
  type AlibabaRegion
} from '../config/alibaba';
import { PROVIDERS } from '../config/providers';
import type { AISettings, ProviderId } from '../types';

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

export function selectProviderSettings(
  current: AISettings,
  provider: ProviderId
): AISettings {
  if (provider === current.provider) return current;

  const preset = PROVIDERS[provider];
  return {
    provider,
    apiKey: '',
    baseUrl: preset.baseUrl,
    model: preset.model,
    supportsImages: false
  };
}

export function selectAlibabaRegionSettings(
  current: AISettings,
  region: AlibabaRegion
): AISettings {
  if (!isAlibabaProvider(current.provider)) return current;

  const endpoint = ALIBABA_ENDPOINTS[current.provider].find((item) => item.id === region);
  if (!endpoint || normalizeBaseUrl(current.baseUrl) === normalizeBaseUrl(endpoint.baseUrl)) {
    return current;
  }

  return {
    ...current,
    apiKey: '',
    baseUrl: endpoint.baseUrl
  };
}
