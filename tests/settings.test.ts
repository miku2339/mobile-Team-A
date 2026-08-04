import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALIBABA_ENDPOINTS,
  detectAlibabaRegion,
  isAlibabaKeyCompatible
} from '../src/config/alibaba';
import { PROVIDERS } from '../src/config/providers';
import {
  AI_SETTINGS_STORAGE_KEY,
  parseAISettings
} from '../src/utils/settingsValidation';
import {
  selectAlibabaRegionSettings,
  selectProviderSettings
} from '../src/utils/settingsTransitions';

test('saved AI settings are accepted only when every required field has a valid shape', () => {
  const valid = JSON.stringify({
    provider: 'openai',
    apiKey: 'test-key',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5-mini'
  });

  assert.deepEqual(parseAISettings(valid), JSON.parse(valid));
  assert.equal(parseAISettings('{"provider":"removed-provider"}'), null);
  assert.equal(parseAISettings('{"provider":"openai","apiKey":42}'), null);
  assert.equal(parseAISettings('not json'), null);
});

test('Alibaba Cloud Coding Plan is a distinct selectable preset', () => {
  const codingPlan = PROVIDERS['bailian-coding'];

  assert.equal(codingPlan.baseUrl, 'https://coding.dashscope.aliyuncs.com/v1');
  assert.equal(codingPlan.model, '');

  const saved = JSON.stringify({
    provider: 'bailian-coding',
    apiKey: 'sk-sp-test',
    baseUrl: codingPlan.baseUrl,
    model: codingPlan.model
  });
  assert.deepEqual(parseAISettings(saved), JSON.parse(saved));
});

test('Alibaba Cloud Token Plan is a distinct selectable preset', () => {
  const tokenPlan = PROVIDERS['bailian-token'];

  assert.equal(
    tokenPlan.baseUrl,
    'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1'
  );
  assert.equal(tokenPlan.model, '');
});

test('Alibaba plan region menu maps each supported server to an exact endpoint', () => {
  assert.equal(
    ALIBABA_ENDPOINTS.bailian.find((item) => item.id === 'singapore')?.baseUrl,
    'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
  );
  assert.equal(
    ALIBABA_ENDPOINTS['bailian-coding'].find((item) => item.id === 'singapore')?.baseUrl,
    'https://coding-intl.dashscope.aliyuncs.com/v1'
  );
  assert.equal(
    ALIBABA_ENDPOINTS['bailian-token'].find((item) => item.id === 'singapore')?.baseUrl,
    'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1'
  );
  assert.equal(
    detectAlibabaRegion('bailian', 'https://dashscope-us.aliyuncs.com/compatible-mode/v1'),
    'us-virginia'
  );
  assert.equal(detectAlibabaRegion('bailian', 'https://workspace.example/v1'), 'custom');
});

test('OpenAI and Google AI Studio presets provide endpoints but no default model', () => {
  assert.equal(PROVIDERS.openai.baseUrl, 'https://api.openai.com/v1');
  assert.equal(PROVIDERS.openai.model, '');
  assert.equal(
    PROVIDERS['google-ai-studio'].baseUrl,
    'https://generativelanguage.googleapis.com/v1beta/openai'
  );
  assert.equal(PROVIDERS['google-ai-studio'].model, '');
});

test('DeepSeek, Kimi and MiniMax presets use official compatible endpoints without default models', () => {
  assert.deepEqual(
    [
      [PROVIDERS.deepseek.baseUrl, PROVIDERS.deepseek.model],
      [PROVIDERS.kimi.baseUrl, PROVIDERS.kimi.model],
      [PROVIDERS.minimax.baseUrl, PROVIDERS.minimax.model]
    ],
    [
      ['https://api.deepseek.com', ''],
      ['https://api.moonshot.cn/v1', ''],
      ['https://api.minimaxi.com/v1', '']
    ]
  );
});

test('Alibaba plan-key family is kept separate from pay-as-you-go keys', () => {
  assert.equal(isAlibabaKeyCompatible('bailian', 'sk-standard-key'), true);
  assert.equal(isAlibabaKeyCompatible('bailian', 'sk-sp-plan-key'), false);
  assert.equal(isAlibabaKeyCompatible('bailian-coding', 'sk-sp-plan-key'), true);
  assert.equal(isAlibabaKeyCompatible('bailian-token', 'sk-standard-key'), false);
});

test('AI settings use a new storage key so legacy default models are not restored', () => {
  assert.equal(AI_SETTINGS_STORAGE_KEY, 'melo.ai-settings.v2');
});

test('reselecting a provider or Alibaba region preserves the current credentials', () => {
  const current = {
    provider: 'bailian-coding' as const,
    apiKey: 'sk-sp-private',
    baseUrl: 'https://coding-intl.dashscope.aliyuncs.com/v1',
    model: 'user-selected-model'
  };

  assert.equal(selectProviderSettings(current, 'bailian-coding'), current);
  assert.equal(selectAlibabaRegionSettings(current, 'singapore'), current);
});

test('changing provider or Alibaba region clears credentials and model intentionally', () => {
  const current = {
    provider: 'bailian-coding' as const,
    apiKey: 'sk-sp-private',
    baseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'user-selected-model'
  };

  assert.deepEqual(selectProviderSettings(current, 'deepseek'), {
    provider: 'deepseek',
    apiKey: '',
    baseUrl: PROVIDERS.deepseek.baseUrl,
    model: ''
  });
  assert.deepEqual(selectAlibabaRegionSettings(current, 'singapore'), {
    ...current,
    apiKey: '',
    baseUrl: 'https://coding-intl.dashscope.aliyuncs.com/v1'
  });
});
