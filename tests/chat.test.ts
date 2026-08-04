import assert from 'node:assert/strict';
import test from 'node:test';

import { chatWithMelo } from '../src/services/chat';
import type { ChatSessionMessage } from '../src/types';

const settings = {
  provider: 'bailian-coding' as const,
  apiKey: 'test-key',
  baseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
  model: 'qwen3.7-plus',
  supportsImages: false
};

test('Melo chat requires a user-selected provider instead of inventing an offline answer', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    throw new Error('fetch should not run');
  };

  try {
    const result = await chatWithMelo(
      { ...settings, apiKey: '' },
      [{ role: 'user', text: 'I feel overwhelmed.' }],
      'en'
    );

    assert.equal(fetchCount, 0);
    assert.equal(result.status, 'unavailable');
    if (result.status === 'unavailable') {
      assert.equal(result.reason, 'no-key');
      assert.equal(result.attemptedProviderId, undefined);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Melo chat sends bounded conversation history and attributes a real model reply', async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody: {
    model: string;
    stream: boolean;
    max_tokens: number;
    messages: Array<{ role: string; content: string }>;
  } | null = null;
  globalThis.fetch = async (_input, init) => {
    capturedBody = JSON.parse(String(init?.body)) as typeof capturedBody;
    return new Response(
      JSON.stringify({
        model: 'qwen3.7-plus-served',
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content: 'That sounds like a lot. What feels most urgent right now?'
            }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const history = Array.from({ length: 13 }, (_, index) => ({
    role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
    text: `Turn ${index + 1}`
  }));

  try {
    const result = await chatWithMelo(settings, history, 'en');

    assert.equal(result.status, 'message');
    if (result.status === 'message') {
      assert.equal(result.source, 'ai');
      assert.equal(result.providerId, 'bailian-coding');
      assert.equal(result.model, 'qwen3.7-plus-served');
      assert.match(result.text, /most urgent/);
      assert.equal(result.expression, 'calm');
    }
    assert.ok(capturedBody);
    const requestBody = capturedBody as {
      model: string;
      stream: boolean;
      max_tokens: number;
      messages: Array<{ role: string; content: string }>;
    };
    assert.equal(requestBody.model, 'qwen3.7-plus');
    assert.equal(requestBody.stream, false);
    assert.equal(requestBody.max_tokens, 256);
    assert.equal(requestBody.messages.length, 8);
    assert.equal(requestBody.messages[0]?.role, 'system');
    assert.match(requestBody.messages[0]?.content ?? '', /not a therapist/i);
    assert.equal(requestBody.messages[1]?.role, 'user');
    assert.equal(requestBody.messages[1]?.content, 'Turn 7');
    assert.equal(requestBody.messages[7]?.content, 'Turn 13');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Melo chat parses the model-selected expression from its JSON reply', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content:
                '```json\n{"message":"You already chose a good starting point.","expression":"encouraging"}\n```'
            }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'I finished the first small step.' }],
      'en'
    );

    assert.equal(result.status, 'message');
    if (result.status === 'message') {
      assert.equal(result.text, 'You already chose a good starting point.');
      assert.equal(result.expression, 'encouraging');
      assert.equal(result.model, 'qwen3.7-plus');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Melo chat keeps the JSON message but defaults an unknown expression to calm', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content:
                '{"message":"Let us pause before choosing the next step.","expression":"excited"}'
            }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'I am not sure what to do next.' }],
      'en'
    );

    assert.equal(result.status, 'message');
    if (result.status === 'message') {
      assert.equal(result.text, 'Let us pause before choosing the next step.');
      assert.equal(result.expression, 'calm');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Melo chat rejects a structured reply with an empty message', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content: '{"message":"   ","expression":"encouraging"}'
            }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'Can you help me choose a next step?' }],
      'en'
    );

    assert.equal(result.status, 'unavailable');
    if (result.status === 'unavailable') {
      assert.equal(result.reason, 'invalid-response');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Melo chat rejects JSON-looking output that has no message field', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: '{"expression":"calm"}' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'Help me pause.' }],
      'en'
    );

    assert.equal(result.status, 'unavailable');
    if (result.status === 'unavailable') {
      assert.equal(result.reason, 'invalid-response');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('a local safety pause cuts earlier risk text out of the next provider context', async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody: {
    messages: Array<{ role: string; content: string }>;
  } | null = null;
  globalThis.fetch = async (_input, init) => {
    capturedBody = JSON.parse(String(init?.body)) as typeof capturedBody;
    return new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: 'We can take this one step at a time.' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const postSafetyHistory: ChatSessionMessage[] = [
      {
        id: 'user-risk',
        role: 'user',
        text: 'I want to kill myself.'
      },
      {
        id: 'assistant-safety',
        role: 'assistant',
        text: 'Please contact real-world support now.',
        source: 'safety'
      },
      {
        id: 'user-follow-up',
        role: 'user',
        text: 'Okay, help me focus on the next minute.'
      }
    ];
    const result = await chatWithMelo(
      settings,
      postSafetyHistory,
      'en'
    );

    assert.equal(result.status, 'message');
    assert.ok(capturedBody);
    const requestBody = capturedBody as {
      messages: Array<{ role: string; content: string }>;
    };
    const sent = JSON.stringify(requestBody.messages);
    assert.doesNotMatch(sent, /kill myself/i);
    assert.doesNotMatch(sent, /real-world support/i);
    assert.match(sent, /next minute/i);
    assert.equal(requestBody.messages[1]?.role, 'user');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('risk language in provider output becomes a local safety message, not a generic failure', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: 'If you want to die, use emergency support.' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'I feel exhausted after school.' }],
      'en'
    );

    assert.equal(result.status, 'message');
    if (result.status === 'message') {
      assert.equal(result.source, 'safety');
      assert.match(result.text, /emergency|trust/i);
      assert.equal(result.expression, 'concerned');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('chat does not display links or HTML returned by a provider', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: 'Open https://example.com for advice.' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'What is one small next step?' }],
      'en'
    );
    assert.equal(result.status, 'unavailable');
    if (result.status === 'unavailable') {
      assert.equal(result.reason, 'unsafe-output');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('urgent-risk chat text pauses locally without contacting a provider', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    throw new Error('fetch should not run');
  };

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'I want to kill myself.' }],
      'en'
    );

    assert.equal(fetchCount, 0);
    assert.equal(result.status, 'message');
    if (result.status === 'message') {
      assert.equal(result.source, 'safety');
      assert.equal(result.providerId, undefined);
      assert.match(result.text, /real-world|emergency|trust/i);
      assert.equal(result.expression, 'concerned');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider failure returns diagnostics without a fake assistant message', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: { code: 'quota_exceeded', message: 'raw details stay private' },
        request_id: 'chat-request-123'
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'Can we talk about school stress?' }],
      'en'
    );

    assert.equal(result.status, 'unavailable');
    if (result.status === 'unavailable') {
      assert.equal(result.reason, 'http-error');
      assert.equal(result.attemptedProviderId, 'bailian-coding');
      assert.equal(result.providerHttpStatus, 429);
      assert.equal(result.providerErrorCode, 'quota_exceeded');
      assert.equal(result.providerRequestId, 'chat-request-123');
    }
    assert.doesNotMatch(JSON.stringify(result), /raw details/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('unsafe or incomplete model output is not appended as a chat reply', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'length',
            message: { content: 'You should definitely' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const result = await chatWithMelo(
      settings,
      [{ role: 'user', text: 'What should I do?' }],
      'en'
    );

    assert.equal(result.status, 'unavailable');
    if (result.status === 'unavailable') {
      assert.equal(result.reason, 'invalid-response');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('image-only chat is blocked locally until the selected model is marked image-capable', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    throw new Error('fetch should not run');
  };

  try {
    const result = await chatWithMelo(
      settings,
      [
        {
          role: 'user',
          text: '',
          image: {
            id: 'image-test-disabled',
            uri: 'data:image/jpeg;base64,YWJj',
            mimeType: 'image/jpeg',
            width: 10,
            height: 10
          }
        }
      ],
      'en'
    );

    assert.equal(fetchCount, 0);
    assert.equal(result.status, 'unavailable');
    if (result.status === 'unavailable') {
      assert.equal(result.reason, 'image-not-enabled');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('image-capable chat sends OpenAI-compatible image content without inventing user text', async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody: {
    messages: Array<{
      role: string;
      content: string | Array<Record<string, unknown>>;
    }>;
  } | null = null;
  globalThis.fetch = async (_input, init) => {
    capturedBody = JSON.parse(String(init?.body)) as typeof capturedBody;
    return new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: 'I can help you focus on the visible details.' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await chatWithMelo(
      { ...settings, supportsImages: true },
      [
        {
          role: 'user',
          text: '',
          image: {
            id: 'image-test-enabled',
            uri: 'data:image/jpeg;base64,YWJj',
            mimeType: 'image/jpeg',
            width: 10,
            height: 10
          }
        }
      ],
      'en'
    );

    assert.equal(result.status, 'message');
    assert.ok(capturedBody);
    const requestBody = capturedBody as {
      messages: Array<{
        role: string;
        content: string | Array<Record<string, unknown>>;
      }>;
    };
    assert.match(String(requestBody.messages[0]?.content), /sprout-like/);
    const content = requestBody.messages[1]?.content;
    assert.ok(Array.isArray(content));
    assert.equal(content.length, 1);
    assert.deepEqual(content[0], {
      type: 'image_url',
      image_url: { url: 'data:image/jpeg;base64,YWJj' }
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('an older local image does not block a later text turn after image input is disabled', async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody = '';
  globalThis.fetch = async (_input, init) => {
    capturedBody = String(init?.body);
    return new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: 'Let us focus on your latest question.' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await chatWithMelo(
      settings,
      [
        {
          role: 'user',
          text: 'This was an earlier image.',
          image: {
            id: 'image-old',
            uri: 'data:image/jpeg;base64,YWJj',
            mimeType: 'image/jpeg',
            width: 10,
            height: 10
          }
        },
        { role: 'assistant', text: 'What would you like to explore?' },
        { role: 'user', text: 'Help me plan one small next step.' }
      ],
      'en'
    );

    assert.equal(result.status, 'message');
    assert.doesNotMatch(capturedBody, /data:image/);
    assert.match(capturedBody, /one small next step/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('disabled image history drops old image-only turns instead of sending empty content', async () => {
  const originalFetch = globalThis.fetch;
  let capturedMessages: Array<{ role: string; content: unknown }> = [];
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as {
      messages: Array<{ role: string; content: unknown }>;
    };
    capturedMessages = body.messages;
    return new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: 'Let us use only the current text.' }
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await chatWithMelo(
      settings,
      [
        {
          role: 'user',
          text: '',
          image: {
            id: 'image-old-only',
            uri: 'data:image/jpeg;base64,YWJj',
            mimeType: 'image/jpeg',
            width: 10,
            height: 10
          }
        },
        { role: 'assistant', text: 'An old image reply.' },
        { role: 'user', text: 'Help with my current text only.' }
      ],
      'en'
    );

    assert.equal(result.status, 'message');
    assert.deepEqual(capturedMessages.slice(1), [
      { role: 'user', content: 'Help with my current text only.' }
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
