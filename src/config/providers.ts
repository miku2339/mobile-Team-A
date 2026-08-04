import type { ProviderId, ProviderPreset } from '../types';

export const PROVIDERS: Record<ProviderId, ProviderPreset> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: '',
    note: 'OpenAI-compatible Chat Completions endpoint.'
  },
  'google-ai-studio': {
    id: 'google-ai-studio',
    label: 'Google AI Studio',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: '',
    note: 'Google Gemini OpenAI-compatible endpoint. Enter your own API key and exact model ID.'
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: '',
    note: 'Official DeepSeek OpenAI-compatible endpoint. Enter your own API key and exact model ID.'
  },
  kimi: {
    id: 'kimi',
    label: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: '',
    note: 'Official Kimi OpenAI-compatible endpoint for China. Enter your own API key and exact model ID.'
  },
  minimax: {
    id: 'minimax',
    label: 'MiniMax',
    baseUrl: 'https://api.minimaxi.com/v1',
    model: '',
    note: 'Official MiniMax OpenAI-compatible endpoint for China. Enter your own API key and exact model ID.'
  },
  bailian: {
    id: 'bailian',
    label: '阿里雲百鍊',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: '',
    note: '中國站預設域名；可改成你的業務空間專屬域名。'
  },
  'bailian-coding': {
    id: 'bailian-coding',
    label: '阿里雲百鍊 Coding Plan',
    baseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
    model: '',
    note: '中國區 Coding Plan 專屬 endpoint；必須配合 sk-sp- 開頭的套餐專屬 key。'
  },
  'bailian-token': {
    id: 'bailian-token',
    label: '阿里雲百鍊 Token Plan',
    baseUrl: 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    model: '',
    note: '華北 2（北京）Token Plan 專屬 endpoint；必須配合套餐專屬 key。'
  },
  bigmodel: {
    id: 'bigmodel',
    label: 'Z.ai BigModel',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: '',
    note: 'Z.ai OpenAI-compatible endpoint.'
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
