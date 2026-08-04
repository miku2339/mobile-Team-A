import assert from 'node:assert/strict';
import test from 'node:test';

import { containsUrgentRisk } from '../src/services/safety';

test('urgent-risk guard catches common direct English, Chinese and Cantonese phrases', () => {
  const examples = [
    'I want to die',
    'I hope you die',
    'I want to end it all',
    'I am going to end it all',
    'I do not want to live anymore',
    "I can't go on",
    'I will hurt him',
    '我要死',
    '我撐不下去',
    '我唔想做人'
  ];

  for (const example of examples) {
    assert.equal(containsUrgentRisk(example), true, `Expected risk phrase to be caught: ${example}`);
  }
});
