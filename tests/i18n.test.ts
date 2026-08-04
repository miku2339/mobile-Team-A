import assert from 'node:assert/strict';
import test from 'node:test';

import { getTranslations, parseUILanguage, uiLanguageOptions } from '../src/i18n';
import { generateFallbackMessage } from '../src/utils/fallback';

test('settings offers exactly English, Traditional Chinese and Simplified Chinese UI languages', () => {
  assert.deepEqual(
    uiLanguageOptions.map((option) => option.id),
    ['en', 'zh-Hant', 'zh-Hans']
  );
  assert.equal(getTranslations('en').settings.languageTitle, 'App language');
  assert.equal(getTranslations('zh-Hant').settings.languageTitle, '介面語言');
  assert.equal(getTranslations('zh-Hans').settings.languageTitle, '界面语言');
  assert.equal(getTranslations('en').providerNames.bigmodel, 'Z.ai BigModel');
  assert.equal(getTranslations('zh-Hant').providerNames.bigmodel, '智譜 BigModel');
  assert.equal(getTranslations('zh-Hans').providerNames.bigmodel, '智谱 BigModel');
});

test('saved UI language accepts only the three supported locales', () => {
  assert.equal(parseUILanguage('en'), 'en');
  assert.equal(parseUILanguage('zh-Hant'), 'zh-Hant');
  assert.equal(parseUILanguage('zh-Hans'), 'zh-Hans');
  assert.equal(parseUILanguage('yue'), null);
  assert.equal(parseUILanguage('not-a-locale'), null);
});

test('all UI languages disclose provider fallback instead of claiming AI success', () => {
  for (const language of ['en', 'zh-Hant', 'zh-Hans'] as const) {
    const copy = getTranslations(language);
    assert.ok(copy.result.providerFallbackTitle.length > 0);
    assert.match(copy.result.providerTimeoutBody('Test Provider'), /Test Provider/);
    assert.match(copy.result.providerNetworkBody('Test Provider'), /Test Provider/);
    assert.match(copy.result.providerHttpBody('Test Provider', 401), /Test Provider/);
    assert.match(copy.result.providerInvalidBody('Test Provider'), /Test Provider/);
    assert.match(copy.result.providerConfigurationBody('Test Provider'), /Test Provider/);
    assert.match(
      copy.result.providerDiagnostic(401, 'invalid_api_key', 'request-123'),
      /401.*invalid_api_key.*request-123/
    );
    assert.match(copy.footer.fallback('Test Provider'), /Test Provider/);
    assert.match(copy.footer.notSent('Test Provider'), /Test Provider/);
  }
});

test('offline rewrite supports Simplified Chinese output', () => {
  const result = generateFallbackMessage({
    draft: '你们都不做事，我不想继续这个小组项目了。',
    emotion: 'overwhelmed',
    recipient: 'teammate',
    tone: 'gentle',
    language: 'zh-Hans'
  });

  assert.match(result, /小组项目/);
  assert.match(result, /重新确认分工/);
  assert.doesNotMatch(result, /重新確認/);
});

test('Melo chat has complete session, safety and provider states in every UI language', () => {
  for (const language of ['en', 'zh-Hant', 'zh-Hans'] as const) {
    const copy = getTranslations(language);
    assert.ok(copy.home.chat.length > 0);
    assert.equal(copy.chat.title, 'Melo');
    assert.equal(copy.chat.quickPrompts.length, 2);
    assert.match(copy.chat.aiMode('Test Provider'), /Test Provider/);
    assert.match(
      copy.chat.aiLabel('Test Provider', 'test-model'),
      /Test Provider.*test-model/
    );
    assert.match(copy.chat.httpBody('Test Provider', 429), /Test Provider/);
    assert.ok(copy.chat.sessionNotice.length > 0);
    assert.ok(copy.chat.notTherapyNotice.length > 0);
    assert.ok(copy.chat.memoryUnavailable.length > 0);
    assert.ok(copy.chat.memoryLoading.length > 0);
    assert.ok(copy.chat.clearConfirmBody.length > 0);
  }
});
