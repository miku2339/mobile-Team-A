import assert from 'node:assert/strict';
import test from 'node:test';

import { rewriteMessage } from '../src/services/ai';

const rewriteInput = {
  draft: 'You never do any work.',
  emotion: 'overwhelmed' as const,
  recipient: 'teammate' as const,
  tone: 'direct' as const,
  language: 'en' as const
};

test('offline mode has no successful or attempted provider attribution', async () => {
  const result = await rewriteMessage(
    {
      provider: 'openai',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'user-model',
      supportsImages: false
    },
    rewriteInput
  );

  assert.equal(result.source, 'fallback');
  assert.equal(result.providerId, undefined);
  assert.equal(result.attemptedProviderId, undefined);
  assert.equal(result.fallbackReason, 'no-key');
});

test('unsafe provider output is blocked before it can be copied or shared', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content: 'I will hurt you if you do not finish the work.' } }]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await rewriteMessage(
      {
        provider: 'custom',
        apiKey: 'test-key',
        baseUrl: 'https://provider.example/v1',
        model: 'test-model',
        supportsImages: false
      },
      {
        draft: 'Please finish your part of our group project.',
        emotion: 'overwhelmed',
        recipient: 'teammate',
        tone: 'direct',
        language: 'en'
      }
    );

    assert.equal(result.source, 'fallback');
    assert.equal(result.providerId, undefined);
    assert.equal(result.attemptedProviderId, 'custom');
    assert.equal(result.fallbackReason, 'unsafe-output');
    assert.doesNotMatch(result.text, /hurt you/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider timeout is disclosed as fallback and never attributed as AI output', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const error = new Error('Aborted');
    error.name = 'AbortError';
    throw error;
  };

  try {
    const result = await rewriteMessage(
      {
        provider: 'bailian-coding',
        apiKey: 'test-key',
        baseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
        model: 'user-model',
        supportsImages: false
      },
      {
        draft: 'You never do any work.',
        emotion: 'overwhelmed',
        recipient: 'teammate',
        tone: 'direct',
        language: 'en'
      }
    );

    assert.equal(result.source, 'fallback');
    assert.equal(result.providerId, undefined);
    assert.equal(result.attemptedProviderId, 'bailian-coding');
    assert.equal(result.fallbackReason, 'timeout');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider network errors are disclosed without claiming an AI result', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('Network unavailable');
  };

  try {
    const result = await rewriteMessage(
      {
        provider: 'deepseek',
        apiKey: 'test-key',
        baseUrl: 'https://api.deepseek.com',
        model: 'user-model',
        supportsImages: false
      },
      rewriteInput
    );

    assert.equal(result.source, 'fallback');
    assert.equal(result.providerId, undefined);
    assert.equal(result.attemptedProviderId, 'deepseek');
    assert.equal(result.fallbackReason, 'network-error');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider HTTP errors expose only safe diagnostics', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: {
          code: 'invalid_api_key',
          message: 'raw provider details must not be copied to the result'
        },
        request_id: 'request-safe-123'
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': 'request-header-456'
        }
      }
    );

  try {
    const result = await rewriteMessage(
      {
        provider: 'bailian-coding',
        apiKey: 'test-key',
        baseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
        model: 'qwen3-coder-plus',
        supportsImages: false
      },
      rewriteInput
    );

    assert.equal(result.source, 'fallback');
    assert.equal(result.providerId, undefined);
    assert.equal(result.attemptedProviderId, 'bailian-coding');
    assert.equal(result.fallbackReason, 'http-error');
    assert.equal(result.providerHttpStatus, 401);
    assert.equal(result.providerErrorCode, 'invalid_api_key');
    assert.equal(result.providerRequestId, 'request-header-456');
    assert.doesNotMatch(JSON.stringify(result), /raw provider details/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('unsafe provider error details are discarded', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: {
          code: 'invalid code with spaces and secret-like content',
          message: 'do not expose this raw body'
        },
        request_id: 'invalid request id with spaces'
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await rewriteMessage(
      {
        provider: 'bailian-coding',
        apiKey: 'test-key',
        baseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
        model: 'qwen3-coder-plus',
        supportsImages: false
      },
      rewriteInput
    );

    assert.equal(result.fallbackReason, 'http-error');
    assert.equal(result.providerHttpStatus, 429);
    assert.equal(result.providerErrorCode, undefined);
    assert.equal(result.providerRequestId, undefined);
    assert.doesNotMatch(JSON.stringify(result), /secret-like|raw body/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('invalid successful provider payload is distinguished from a network failure', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ choices: [{ message: { content: '' } }] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': 'request-empty-789'
      }
    });

  try {
    const result = await rewriteMessage(
      {
        provider: 'custom',
        apiKey: 'test-key',
        baseUrl: 'https://provider.example/v1',
        model: 'test-model',
        supportsImages: false
      },
      rewriteInput
    );

    assert.equal(result.source, 'fallback');
    assert.equal(result.fallbackReason, 'invalid-response');
    assert.equal(result.providerRequestId, 'request-empty-789');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('invalid local provider settings never claim a request was attempted', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    throw new Error('fetch should not run');
  };

  try {
    const result = await rewriteMessage(
      {
        provider: 'bailian-coding',
        apiKey: 'test-key',
        baseUrl: 'not-a-url',
        model: '',
        supportsImages: false
      },
      rewriteInput
    );

    assert.equal(fetchCount, 0);
    assert.equal(result.source, 'fallback');
    assert.equal(result.fallbackReason, 'configuration-error');
    assert.equal(result.attemptedProviderId, undefined);
    assert.equal(result.configuredProviderId, 'bailian-coding');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('named providers reject an unrelated host before transmitting a key', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    throw new Error('fetch should not run');
  };

  try {
    const result = await rewriteMessage(
      {
        provider: 'bailian-coding',
        apiKey: 'test-key',
        baseUrl: 'https://attacker.example/v1',
        model: 'qwen3-coder-plus',
        supportsImages: false
      },
      rewriteInput
    );

    assert.equal(fetchCount, 0);
    assert.equal(result.fallbackReason, 'configuration-error');
    assert.equal(result.attemptedProviderId, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider request contract uses one chat-completions path and the selected model', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;
  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;
    return new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: 'Could we review the workload together?' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await rewriteMessage(
      {
        provider: 'bailian-coding',
        apiKey: 'test-key',
        baseUrl: 'https://coding.dashscope.aliyuncs.com/v1/chat/completions',
        model: 'qwen3-coder-plus',
        supportsImages: false
      },
      rewriteInput
    );

    assert.equal(result.source, 'ai');
    assert.equal(
      capturedUrl,
      'https://coding.dashscope.aliyuncs.com/v1/chat/completions'
    );
    assert.equal(capturedInit?.method, 'POST');
    const headers = new Headers(capturedInit?.headers);
    assert.equal(headers.get('Authorization'), 'Bearer test-key');
    assert.equal(headers.get('Content-Type'), 'application/json');
    const body = JSON.parse(String(capturedInit?.body)) as {
      model: string;
      stream: boolean;
      messages: Array<{ role: string; content: string }>;
    };
    assert.equal(body.model, 'qwen3-coder-plus');
    assert.equal(body.stream, false);
    assert.deepEqual(body.messages.map((message) => message.role), ['system', 'user']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider output explicitly truncated by length is not treated as AI success', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'length',
            message: { content: 'Could we review the' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await rewriteMessage(
      {
        provider: 'custom',
        apiKey: 'test-key',
        baseUrl: 'https://provider.example/v1',
        model: 'test-model',
        supportsImages: false
      },
      rewriteInput
    );

    assert.equal(result.source, 'fallback');
    assert.equal(result.fallbackReason, 'invalid-response');
    assert.doesNotMatch(result.text, /Could we review the$/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider requests are not aborted at the old eight-second boundary', async (context) => {
  const originalFetch = globalThis.fetch;
  const requestState: { signal?: AbortSignal } = {};

  context.mock.timers.enable({ apis: ['setTimeout'] });
  globalThis.fetch = async (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      requestState.signal = init?.signal ?? undefined;
      requestState.signal?.addEventListener('abort', () => {
        const error = new Error('Aborted');
        error.name = 'AbortError';
        reject(error);
      });
    });

  try {
    const resultPromise = rewriteMessage(
      {
        provider: 'bailian-coding',
        apiKey: 'test-key',
        baseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
        model: 'user-model',
        supportsImages: false
      },
      {
        draft: 'You never do any work.',
        emotion: 'overwhelmed',
        recipient: 'teammate',
        tone: 'direct',
        language: 'en'
      }
    );

    context.mock.timers.tick(8_001);
    assert.equal(requestState.signal?.aborted, false);

    context.mock.timers.tick(22_000);
    await resultPromise;
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('AI result keeps the provider that generated it', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content: 'Could we review the tasks and agree on fair deadlines?' } }]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await rewriteMessage(
      {
        provider: 'deepseek',
        apiKey: 'test-key',
        baseUrl: 'https://api.deepseek.com',
        model: 'user-model',
        supportsImages: false
      },
      {
        draft: 'You never do any work.',
        emotion: 'overwhelmed',
        recipient: 'teammate',
        tone: 'direct',
        language: 'en'
      }
    );

    assert.equal(result.source, 'ai');
    assert.equal(result.providerId, 'deepseek');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
