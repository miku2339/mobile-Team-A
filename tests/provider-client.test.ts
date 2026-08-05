import assert from 'node:assert/strict';
import test from 'node:test';

import { requestProviderCompletion } from '../src/services/providerClient';

const codingPlanSettings = {
  provider: 'bailian-coding' as const,
  apiKey: 'test-key',
  baseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
  model: 'qwen3.7-plus',
  supportsImages: false
};

test('Web provider requests use the configured same-device proxy', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  let capturedHeaders: Headers | null = null;

  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedHeaders = new Headers(init?.headers);
    return new Response(
      JSON.stringify({
        model: 'qwen3.7-plus',
        choices: [
          {
            finish_reason: 'stop',
            message: { content: 'A real provider reply.' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await requestProviderCompletion(
      codingPlanSettings,
      [{ role: 'user', content: 'Hello' }],
      {
        runtime: 'web',
        webProxyUrl: 'http://127.0.0.1:8787'
      }
    );

    assert.equal(result.ok, true);
    assert.equal(capturedUrl, 'http://127.0.0.1:8787/v1/chat/completions');
    const headers = capturedHeaders as Headers | null;
    assert.ok(headers);
    assert.equal(
      headers.get('X-Melo-Upstream-Base-Url'),
      codingPlanSettings.baseUrl
    );
    assert.equal(headers.get('Authorization'), 'Bearer test-key');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('a Web request timeout is not mislabelled as an unreachable proxy', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const error = new Error('Aborted');
    error.name = 'AbortError';
    throw error;
  };

  try {
    const result = await requestProviderCompletion(
      codingPlanSettings,
      [{ role: 'user', content: 'Hello' }],
      {
        runtime: 'web',
        webProxyUrl: 'http://127.0.0.1:8787'
      }
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.reason, 'timeout');
      assert.equal(result.diagnostics.errorCode, undefined);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
