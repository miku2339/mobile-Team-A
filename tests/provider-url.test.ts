import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isAllowedProviderBaseUrl,
  isAllowedProviderEndpoint,
  toChatCompletionsUrl
} from '../src/utils/providerUrl';

test('provider URLs require HTTPS except for explicit local development hosts', () => {
  assert.equal(isAllowedProviderBaseUrl('https://api.openai.com/v1'), true);
  assert.equal(isAllowedProviderBaseUrl('http://127.0.0.1:11434/v1'), true);
  assert.equal(isAllowedProviderBaseUrl('http://localhost:11434/v1'), true);
  assert.equal(isAllowedProviderBaseUrl('http://example.com/v1'), false);
  assert.equal(isAllowedProviderBaseUrl('javascript:alert(1)'), false);
  assert.equal(isAllowedProviderBaseUrl('https://user:secret@example.com/v1'), false);
});

test('named providers accept only their own compatible hosts', () => {
  assert.equal(
    isAllowedProviderEndpoint(
      'bailian-coding',
      'https://coding.dashscope.aliyuncs.com/v1'
    ),
    true
  );
  assert.equal(
    isAllowedProviderEndpoint(
      'bailian-coding',
      'https://coding-intl.dashscope.aliyuncs.com/v1'
    ),
    true
  );
  assert.equal(
    isAllowedProviderEndpoint('bailian-coding', 'https://example.com/v1'),
    false
  );
  assert.equal(
    isAllowedProviderEndpoint(
      'bailian',
      'https://workspace-123.cn-beijing.maas.aliyuncs.com/compatible-mode/v1'
    ),
    true
  );
  assert.equal(
    isAllowedProviderEndpoint('openai', 'https://api.openai.com/v1'),
    true
  );
  assert.equal(
    isAllowedProviderEndpoint('openai', 'https://attacker.example/v1'),
    false
  );
  assert.equal(
    isAllowedProviderEndpoint('custom', 'https://compatible.example/v1'),
    true
  );
  assert.equal(
    isAllowedProviderEndpoint('custom', 'http://127.0.0.1:8787/v1'),
    true
  );
});

test('chat completions URL accepts either a base URL or a complete endpoint', () => {
  assert.equal(
    toChatCompletionsUrl('https://coding.dashscope.aliyuncs.com/v1'),
    'https://coding.dashscope.aliyuncs.com/v1/chat/completions'
  );
  assert.equal(
    toChatCompletionsUrl(
      'https://coding.dashscope.aliyuncs.com/v1/chat/completions/'
    ),
    'https://coding.dashscope.aliyuncs.com/v1/chat/completions'
  );
});
