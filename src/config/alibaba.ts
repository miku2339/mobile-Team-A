import type { ProviderId } from '../types';

export type AlibabaProviderId = Extract<
  ProviderId,
  'bailian' | 'bailian-coding' | 'bailian-token'
>;

export type AlibabaRegion =
  | 'cn-beijing'
  | 'singapore'
  | 'us-virginia'
  | 'custom';

export interface AlibabaEndpoint {
  id: AlibabaRegion;
  baseUrl: string;
}

export const ALIBABA_PLANS: AlibabaProviderId[] = [
  'bailian',
  'bailian-coding',
  'bailian-token'
];

export const ALIBABA_ENDPOINTS: Record<AlibabaProviderId, AlibabaEndpoint[]> = {
  bailian: [
    {
      id: 'cn-beijing',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    },
    {
      id: 'singapore',
      baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
    },
    {
      id: 'us-virginia',
      baseUrl: 'https://dashscope-us.aliyuncs.com/compatible-mode/v1'
    },
    { id: 'custom', baseUrl: '' }
  ],
  'bailian-coding': [
    {
      id: 'cn-beijing',
      baseUrl: 'https://coding.dashscope.aliyuncs.com/v1'
    },
    {
      id: 'singapore',
      baseUrl: 'https://coding-intl.dashscope.aliyuncs.com/v1'
    }
  ],
  'bailian-token': [
    {
      id: 'cn-beijing',
      baseUrl: 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1'
    },
    {
      id: 'singapore',
      baseUrl: 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1'
    }
  ]
};

export function isAlibabaProvider(provider: ProviderId): provider is AlibabaProviderId {
  return ALIBABA_PLANS.includes(provider as AlibabaProviderId);
}

export function detectAlibabaRegion(
  provider: AlibabaProviderId,
  baseUrl: string
): AlibabaRegion {
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  return (
    ALIBABA_ENDPOINTS[provider].find(
      (endpoint) => endpoint.baseUrl.replace(/\/+$/, '') === normalized
    )?.id ?? 'custom'
  );
}

export function isAlibabaKeyCompatible(
  provider: AlibabaProviderId,
  apiKey: string
): boolean {
  const key = apiKey.trim();
  if (provider === 'bailian') return !key.startsWith('sk-sp-');
  return key.startsWith('sk-sp-');
}
