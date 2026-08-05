import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { pathToFileURL } from 'node:url';

import type { ProviderId } from '../src/types';
import {
  isAllowedProviderEndpoint,
  toChatCompletionsUrl
} from '../src/utils/providerUrl';

const DEFAULT_PORT = 8787;
const DEFAULT_HOST = '127.0.0.1';
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const MAX_RESPONSE_BYTES = 256 * 1024;
const UPSTREAM_TIMEOUT_MS = 60_000;
const ALLOWED_PROVIDER_IDS = new Set<ProviderId>([
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

export interface WebProviderProxyOptions {
  allowedOrigins?: string[];
  onRequestComplete?: (entry: {
    provider: ProviderId;
    upstreamHost: string;
    status: number;
    durationMs: number;
  }) => void;
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function originAllowed(origin: string, allowedOrigins?: string[]): boolean {
  if (allowedOrigins) return allowedOrigins.includes(origin);
  return isLoopbackOrigin(origin);
}

function applyCors(response: ServerResponse, origin: string): void {
  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, X-Melo-Provider-Id, X-Melo-Upstream-Base-Url'
  );
  response.setHeader(
    'Access-Control-Expose-Headers',
    'Content-Type, X-Request-Id, X-Dashscope-Request-Id'
  );
}

function sendJson(
  response: ServerResponse,
  status: number,
  payload: Record<string, unknown>,
  origin?: string
): void {
  if (origin) applyCors(response, origin);
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
}

async function readBody(request: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_REQUEST_BYTES) throw new Error('request-too-large');
    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function header(request: IncomingMessage, name: string): string {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function safeProviderId(value: string): ProviderId | null {
  return ALLOWED_PROVIDER_IDS.has(value as ProviderId)
    ? (value as ProviderId)
    : null;
}

function validChatBody(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const record = value as {
    model?: unknown;
    messages?: unknown;
    stream?: unknown;
  };
  return (
    typeof record.model === 'string' &&
    record.model.trim().length > 0 &&
    record.model.length <= 120 &&
    Array.isArray(record.messages) &&
    record.messages.length > 0 &&
    record.messages.length <= 16 &&
    record.stream === false
  );
}

export function createWebProviderProxyServer(
  options: WebProviderProxyOptions = {}
) {
  return createServer(async (request, response) => {
    const origin = header(request, 'origin');
    if (!origin || !originAllowed(origin, options.allowedOrigins)) {
      sendJson(response, 403, { error: { code: 'origin_not_allowed' } });
      return;
    }

    if (request.url !== '/v1/chat/completions') {
      sendJson(response, 404, { error: { code: 'not_found' } }, origin);
      return;
    }

    if (request.method === 'OPTIONS') {
      applyCors(response, origin);
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method !== 'POST') {
      sendJson(response, 405, { error: { code: 'method_not_allowed' } }, origin);
      return;
    }

    const provider = safeProviderId(header(request, 'x-melo-provider-id'));
    const baseUrl = header(request, 'x-melo-upstream-base-url').trim();
    const authorization = header(request, 'authorization');
    if (
      !provider ||
      !isAllowedProviderEndpoint(provider, baseUrl) ||
      !authorization.startsWith('Bearer ') ||
      authorization.length > 16_384
    ) {
      sendJson(response, 400, { error: { code: 'invalid_proxy_request' } }, origin);
      return;
    }

    let body: Buffer;
    let parsedBody: unknown;
    try {
      body = await readBody(request);
      parsedBody = JSON.parse(body.toString('utf8')) as unknown;
    } catch (error) {
      const tooLarge = error instanceof Error && error.message === 'request-too-large';
      sendJson(
        response,
        tooLarge ? 413 : 400,
        { error: { code: tooLarge ? 'request_too_large' : 'invalid_json' } },
        origin
      );
      return;
    }

    if (!validChatBody(parsedBody)) {
      sendJson(response, 400, { error: { code: 'invalid_chat_request' } }, origin);
      return;
    }

    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    let status = 502;

    try {
      const upstreamUrl = toChatCompletionsUrl(baseUrl);
      const upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json'
        },
        body: body.toString('utf8'),
        redirect: 'error',
        signal: controller.signal
      });
      status = upstream.status;
      const responseBytes = Buffer.from(await upstream.arrayBuffer());
      if (responseBytes.length > MAX_RESPONSE_BYTES) {
        status = 502;
        sendJson(
          response,
          status,
          { error: { code: 'upstream_response_too_large' } },
          origin
        );
        return;
      }

      applyCors(response, origin);
      response.statusCode = upstream.status;
      response.setHeader(
        'Content-Type',
        upstream.headers.get('content-type') ?? 'application/json'
      );
      for (const name of ['x-request-id', 'x-dashscope-request-id']) {
        const value = upstream.headers.get(name);
        if (value) response.setHeader(name, value);
      }
      response.end(responseBytes);
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'AbortError';
      status = timedOut ? 504 : 502;
      sendJson(
        response,
        status,
        { error: { code: timedOut ? 'proxy_timeout' : 'proxy_upstream_error' } },
        origin
      );
    } finally {
      clearTimeout(timeout);
      options.onRequestComplete?.({
        provider,
        upstreamHost: new URL(baseUrl).hostname,
        status,
        durationMs: Date.now() - startedAt
      });
    }
  });
}

const launchedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (launchedDirectly) {
  const port = Number(process.env.MELO_PROVIDER_PROXY_PORT ?? DEFAULT_PORT);
  const host = process.env.MELO_PROVIDER_PROXY_HOST ?? DEFAULT_HOST;
  const server = createWebProviderProxyServer({
    onRequestComplete: ({ provider, upstreamHost, status, durationMs }) => {
      console.log(
        `[Melo Web proxy] ${provider} ${upstreamHost} -> ${status} (${durationMs}ms)`
      );
    }
  });
  server.listen(port, host, () => {
    console.log(`[Melo Web proxy] listening on http://${host}:${port}`);
    console.log('[Melo Web proxy] request bodies and API keys are not logged.');
  });
}
