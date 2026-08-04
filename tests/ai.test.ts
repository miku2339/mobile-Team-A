import assert from 'node:assert/strict';
import test from 'node:test';

import { rewriteMessage } from '../src/services/ai';

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
        model: 'test-model'
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
    assert.equal(result.providerId, 'custom');
    assert.doesNotMatch(result.text, /hurt you/i);
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
        model: 'user-model'
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
