import assert from 'node:assert/strict';
import test from 'node:test';

import { isAllowedProviderBaseUrl } from '../src/utils/providerUrl';

test('provider URLs require HTTPS except for explicit local development hosts', () => {
  assert.equal(isAllowedProviderBaseUrl('https://api.openai.com/v1'), true);
  assert.equal(isAllowedProviderBaseUrl('http://127.0.0.1:11434/v1'), true);
  assert.equal(isAllowedProviderBaseUrl('http://localhost:11434/v1'), true);
  assert.equal(isAllowedProviderBaseUrl('http://example.com/v1'), false);
  assert.equal(isAllowedProviderBaseUrl('javascript:alert(1)'), false);
  assert.equal(isAllowedProviderBaseUrl('https://user:secret@example.com/v1'), false);
});
