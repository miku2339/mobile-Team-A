const localDevelopmentHosts = new Set(['localhost', '127.0.0.1', '::1']);

export function isAllowedProviderBaseUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.username || url.password) return false;
    if (url.protocol === 'https:') return true;
    return url.protocol === 'http:' && localDevelopmentHosts.has(url.hostname);
  } catch {
    return false;
  }
}
