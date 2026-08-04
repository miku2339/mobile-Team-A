import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHAT_TEXT_CHUNK_SIZE,
  MAX_LOCAL_CHAT_MESSAGES,
  limitLocalChatMessages,
  parseLocalChatMessages,
  serializeLocalChatMessages,
  splitChatText
} from '../src/utils/chatPersistence';

test('device-local chat persistence keeps only the newest bounded messages', () => {
  const messages = Array.from(
    { length: MAX_LOCAL_CHAT_MESSAGES + 5 },
    (_, index) => ({
      id: `user-${index}`,
      role: 'user' as const,
      text: `Local message ${index}`
    })
  );

  const bounded = limitLocalChatMessages(messages);
  assert.equal(bounded.length, MAX_LOCAL_CHAT_MESSAGES);
  assert.equal(bounded[0]?.text, 'Local message 5');
  assert.equal(bounded.at(-1)?.text, `Local message ${MAX_LOCAL_CHAT_MESSAGES + 4}`);
});

test('device-local chat history round-trips only validated message fields', () => {
  const serialized = serializeLocalChatMessages([
    { id: 'user-1', role: 'user', text: '  I need help.  ' },
    {
      id: 'assistant-2',
      role: 'assistant',
      text: 'Let us choose one small step.',
      source: 'ai',
      providerId: 'bailian-coding',
      model: 'qwen3.7-plus',
      providerRequestId: 'request-123',
      expression: 'encouraging'
    }
  ]);

  assert.deepEqual(parseLocalChatMessages(serialized), [
    { id: 'user-1', role: 'user', text: 'I need help.' },
    {
      id: 'assistant-2',
      role: 'assistant',
      text: 'Let us choose one small step.',
      source: 'ai',
      expression: 'encouraging',
      providerId: 'bailian-coding',
      model: 'qwen3.7-plus',
      providerRequestId: 'request-123'
    }
  ]);
  assert.deepEqual(parseLocalChatMessages('{broken'), []);
});

test('device-local chat persistence drops unsafe model labels', () => {
  const restored = parseLocalChatMessages(
    JSON.stringify({
      version: 1,
      messages: [
        {
          id: 'assistant-invalid-model',
          role: 'assistant',
          text: 'A valid local message.',
          source: 'ai',
          model: 'model\nspoofed label'
        }
      ]
    })
  );

  assert.equal(restored[0]?.model, undefined);
});

test('device-local chat persistence defaults an unknown model expression to calm', () => {
  const restored = parseLocalChatMessages(
    JSON.stringify({
      version: 1,
      messages: [
        {
          id: 'assistant-invalid-expression',
          role: 'assistant',
          text: 'A valid local message.',
          source: 'ai',
          expression: 'excited'
        }
      ]
    })
  );

  assert.deepEqual(restored, [
    {
      id: 'assistant-invalid-expression',
      role: 'assistant',
      text: 'A valid local message.',
      source: 'ai',
      expression: 'calm'
    }
  ]);
});

test('native encrypted storage chunks remain below the per-item character budget', () => {
  const chunks = splitChatText('你'.repeat(1200));
  assert.equal(chunks.length, 4);
  assert.ok(chunks.every((chunk) => chunk.length <= CHAT_TEXT_CHUNK_SIZE));
  assert.equal(chunks.join('').length, 1200);
});

test('image-only messages persist locally and only the newest two keep image references', () => {
  const messages = Array.from({ length: 3 }, (_, index) => ({
    id: `user-image-${index}`,
    role: 'user' as const,
    text: '',
    image: {
      id: `image-${index}`,
      uri: `data:image/jpeg;base64,YWJj${index}`,
      mimeType: 'image/jpeg' as const,
      width: 20,
      height: 20
    }
  }));

  const restored = parseLocalChatMessages(
    serializeLocalChatMessages(messages)
  );
  assert.equal(restored.length, 2);
  assert.equal(restored[0]?.image?.id, 'image-1');
  assert.equal(restored[1]?.image?.id, 'image-2');
  assert.equal(restored[1]?.text, '');
});
