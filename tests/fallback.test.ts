import assert from 'node:assert/strict';
import test from 'node:test';

import { generateFallbackMessage } from '../src/utils/fallback';

test('offline fallback keeps the group-project issue and proposes a concrete next step', () => {
  const result = generateFallbackMessage({
    draft: 'You never do any work. I am done with this group project.',
    emotion: 'overwhelmed',
    recipient: 'teammate',
    tone: 'gentle',
    language: 'en'
  });

  assert.match(result, /group-project workload/i);
  assert.match(result, /review the tasks/i);
  assert.doesNotMatch(result, /you never/i);
});

test('offline group-project fallback stays specific in Traditional Chinese and Cantonese', () => {
  const baseInput = {
    draft: '你哋成班都唔做嘢，我唔搞呢個小組 project 啦。',
    emotion: 'overwhelmed' as const,
    recipient: 'teammate' as const,
    tone: 'gentle' as const
  };

  const traditional = generateFallbackMessage({ ...baseInput, language: 'zh-Hant' });
  const cantonese = generateFallbackMessage({ ...baseInput, language: 'yue' });

  assert.match(traditional, /工作分配/);
  assert.match(traditional, /重新確認分工/);
  assert.match(cantonese, /工作分配/);
  assert.match(cantonese, /重新確認分工/);
});
