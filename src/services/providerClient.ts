import type { AISettings, RewriteFallbackReason } from '../types';
import {
  isAllowedProviderEndpoint,
  toChatCompletionsUrl
} from '../utils/providerUrl';

export type ProviderChatContentPart =
  | { type: 'text'; text: string }
  | {
      type: 'image_url';
      image_url: { url: string; detail?: 'auto' | 'low' | 'high' };
    };

export interface ProviderChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ProviderChatContentPart[];
}

export interface ProviderDiagnostics {
  httpStatus?: number;
  errorCode?: string;
  requestId?: string;
}

export interface ProviderCompletionOptions {
  maxTokens?: number;
}

export type ProviderFailureReason = Extract<
  RewriteFallbackReason,
  | 'timeout'
  | 'network-error'
  | 'http-error'
  | 'invalid-response'
  | 'configuration-error'
>;

export type ProviderCompletionOutcome =
  | { ok: true; text: string; model?: string; requestId?: string }
  | {
      ok: false;
      reason: ProviderFailureReason;
      requestSent: boolean;
      diagnostics: ProviderDiagnostics;
    };

const providerTimeoutMs = 30_000;
const maxProviderResponseCharacters = 64_000;
const safeErrorCodePattern = /^[A-Za-z0-9._-]{1,64}$/;
const safeRequestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;
const safeModelPattern = /^[^\u0000-\u001F\u007F]{1,120}$/u;

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

function safeErrorCode(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return safeErrorCodePattern.test(trimmed) ? trimmed : undefined;
}

function safeRequestId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return safeRequestIdPattern.test(trimmed) ? trimmed : undefined;
}

function extractModel(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const value = (payload as { model?: unknown }).model;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return safeModelPattern.test(trimmed) ? trimmed : undefined;
}

function extractProviderErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as { code?: unknown; error?: unknown };
  if (record.error && typeof record.error === 'object') {
    const nested = safeErrorCode((record.error as { code?: unknown }).code);
    if (nested) return nested;
  }
  return safeErrorCode(record.code);
}

function extractRequestId(response: Response, payload: unknown): string | undefined {
  const headerId =
    safeRequestId(response.headers.get('x-request-id')) ??
    safeRequestId(response.headers.get('x-dashscope-request-id'));
  if (headerId) return headerId;
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as { request_id?: unknown; requestId?: unknown };
  return safeRequestId(record.request_id) ?? safeRequestId(record.requestId);
}

function extractFinishReason(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return undefined;
  const reason = (choices[0] as { finish_reason?: unknown } | undefined)?.finish_reason;
  return typeof reason === 'string' ? reason : undefined;
}

function extractContent(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;

  const first = choices[0] as { message?: { content?: unknown } } | undefined;
  const content = first?.message?.content;
  if (typeof content === 'string') return content.trim();

  if (Array.isArray(content)) {
    const joined = content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === 'string' ? text : '';
        }
        return '';
      })
      .join('')
      .trim();
    return joined || null;
  }

  return null;
}

export async function requestProviderCompletion(
  settings: AISettings,
  messages: ProviderChatMessage[],
  options: ProviderCompletionOptions = {}
): Promise<ProviderCompletionOutcome> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl);
  if (
    !settings.apiKey.trim() ||
    !baseUrl ||
    !isAllowedProviderEndpoint(settings.provider, baseUrl) ||
    !settings.model.trim() ||
    messages.length === 0
  ) {
    return {
      ok: false,
      reason: 'configuration-error',
      requestSent: false,
      diagnostics: {}
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), providerTimeoutMs);

  try {
    const response = await fetch(toChatCompletionsUrl(baseUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model.trim(),
        messages,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
        stream: false
      }),
      signal: controller.signal
    });

    const declaredLength = Number(response.headers.get('content-length'));
    if (
      Number.isFinite(declaredLength) &&
      declaredLength > maxProviderResponseCharacters
    ) {
      return {
        ok: false,
        reason: 'invalid-response',
        requestSent: true,
        diagnostics: { httpStatus: response.status }
      };
    }

    const rawText = await response.text();
    if (rawText.length > maxProviderResponseCharacters) {
      return {
        ok: false,
        reason: 'invalid-response',
        requestSent: true,
        diagnostics: { httpStatus: response.status }
      };
    }
    let payload: unknown;
    try {
      payload = JSON.parse(rawText) as unknown;
    } catch {
      payload = null;
    }

    const requestId = extractRequestId(response, payload);
    if (!response.ok) {
      return {
        ok: false,
        reason: 'http-error',
        requestSent: true,
        diagnostics: {
          httpStatus: response.status,
          errorCode: extractProviderErrorCode(payload),
          requestId
        }
      };
    }

    const content = extractContent(payload);
    const finishReason = extractFinishReason(payload);
    if (!content || (finishReason && finishReason !== 'stop')) {
      return {
        ok: false,
        reason: 'invalid-response',
        requestSent: true,
        diagnostics: { httpStatus: response.status, requestId }
      };
    }

    const model = extractModel(payload);
    return {
      ok: true,
      text: content,
      ...(model ? { model } : {}),
      ...(requestId ? { requestId } : {})
    };
  } catch (error) {
    return {
      ok: false,
      reason:
        error instanceof Error && error.name === 'AbortError'
          ? 'timeout'
          : 'network-error',
      requestSent: true,
      diagnostics: {}
    };
  } finally {
    clearTimeout(timeout);
  }
}
