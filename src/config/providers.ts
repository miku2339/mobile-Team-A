import type { ProviderId, ProviderPreset } from '../types';

export const PROVIDERS: Record<ProviderId, ProviderPreset> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5-mini',
    note: 'OpenAI-compatible Chat Completions endpoint.'
  },
  bailian: {
    id: 'bailian',
    label: '阿里雲百鍊',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    note: '中國站預設域名；可改成你的業務空間專屬域名。'
  },
  bigmodel: {
    id: 'bigmodel',
    label: '智譜 BigModel',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-5.2',
    note: '智譜 OpenAI-compatible endpoint.'
  },
  custom: {
    id: 'custom',
    label: '自訂相容服務',
    baseUrl: '',
    model: '',
    note: '任何支援 /chat/completions 的 OpenAI-compatible API。'
  }
};

export const getPreset = (id: ProviderId): ProviderPreset => PROVIDERS[id];
