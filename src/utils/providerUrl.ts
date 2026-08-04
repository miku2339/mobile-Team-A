import type { ProviderId } from '../types';

const localDevelopmentHosts = new Set(['localhost', '127.0.0.1', '::1']);

const providerHosts: Partial<Record<ProviderId, Set<string>>> = {
  openai: new Set(['api.openai.com']),
  'google-ai-studio': new Set(['generativelanguage.googleapis.com']),
  deepseek: new Set(['api.deepseek.com']),
  kimi: new Set(['api.moonshot.cn', 'api.moonshot.ai']),
  minimax: new Set(['api.minimaxi.com', 'api.minimax.io']),
  'bailian-coding': new Set([
    'coding.dashscope.aliyuncs.com',
    'coding-intl.dashscope.aliyuncs.com'
  ]),
  'bailian-token': new Set([
    'token-plan.cn-beijing.maas.aliyuncs.com',
    'token-plan.ap-southeast-1.maas.aliyuncs.com'
  ]),
  bigmodel: new Set(['open.bigmodel.cn'])
};

function parseAllowedUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (url.username || url.password || url.search || url.hash) return null;
    if (url.protocol === 'https:') return url;
    if (url.protocol === 'http:' && localDevelopmentHosts.has(url.hostname)) return url;
    return null;
  } catch {
    return null;
  }
}

export function isAllowedProviderBaseUrl(value: string): boolean {
  return parseAllowedUrl(value) !== null;
}

export function isAllowedProviderEndpoint(
  provider: ProviderId,
  value: string
): boolean {
  const url = parseAllowedUrl(value);
  if (!url) return false;
  if (provider === 'custom') return true;
  if (url.protocol !== 'https:' || (url.port && url.port !== '443')) return false;

  const hostname = url.hostname.toLowerCase();
  if (provider === 'bailian') {
    return (
      hostname === 'dashscope.aliyuncs.com' ||
      hostname === 'dashscope-intl.aliyuncs.com' ||
      hostname === 'dashscope-us.aliyuncs.com' ||
      hostname.endsWith('.maas.aliyuncs.com')
    );
  }
  return providerHosts[provider]?.has(hostname) ?? false;
}

export function toChatCompletionsUrl(baseUrl: string): string {
  const url = new URL(baseUrl.trim());
  const pathname = url.pathname.replace(/\/+$/, '');
  url.pathname = pathname.endsWith('/chat/completions')
    ? pathname
    : `${pathname}/chat/completions`;
  return url.toString();
}
