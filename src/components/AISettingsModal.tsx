import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';

import {
  ALIBABA_ENDPOINTS,
  ALIBABA_PLANS,
  detectAlibabaRegion,
  isAlibabaKeyCompatible,
  isAlibabaProvider,
  type AlibabaRegion
} from '../config/alibaba';
import { getTranslations, uiLanguageOptions } from '../i18n';
import { colors, radius } from '../theme';
import type { AISettings, ProviderId, UILanguage } from '../types';
import { isAllowedProviderBaseUrl } from '../utils/providerUrl';
import {
  selectAlibabaRegionSettings,
  selectProviderSettings
} from '../utils/settingsTransitions';
import { ChoiceChip } from './ChoiceChip';
import { PrimaryButton } from './PrimaryButton';

interface AISettingsModalProps {
  visible: boolean;
  value: AISettings;
  language: UILanguage;
  onClose: () => void;
  onSave: (settings: AISettings) => Promise<void>;
  onClear: () => Promise<void>;
  onLanguageChange: (language: UILanguage) => Promise<void>;
}

type ProviderGroup =
  | 'openai'
  | 'google-ai-studio'
  | 'alibaba'
  | 'deepseek'
  | 'kimi'
  | 'minimax'
  | 'bigmodel'
  | 'custom';

const providerGroups: ProviderGroup[] = [
  'openai',
  'google-ai-studio',
  'alibaba',
  'deepseek',
  'kimi',
  'minimax',
  'bigmodel',
  'custom'
];

function PlanOption({
  label,
  description,
  selected,
  onPress
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      aria-checked={selected}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.planOption,
        selected && styles.planOptionSelected,
        pressed && styles.planOptionPressed
      ]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <View style={styles.planOptionCopy}>
        <Text style={[styles.planOptionTitle, selected && styles.planOptionTitleSelected]}>
          {label}
        </Text>
        <Text style={styles.planOptionDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

export function AISettingsModal({
  visible,
  value,
  language,
  onClose,
  onSave,
  onClear,
  onLanguageChange
}: AISettingsModalProps) {
  const { width } = useWindowDimensions();
  const compactLayout = width < 380;
  const [draft, setDraft] = useState<AISettings>(value);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const copy = getTranslations(language);
  const alibabaProvider = isAlibabaProvider(draft.provider) ? draft.provider : null;
  const isAlibaba = alibabaProvider !== null;
  const selectedProviderGroup: ProviderGroup = alibabaProvider
    ? 'alibaba'
    : (draft.provider as Exclude<ProviderId, 'bailian' | 'bailian-coding' | 'bailian-token'>);
  const selectedAlibabaRegion = alibabaProvider
    ? detectAlibabaRegion(alibabaProvider, draft.baseUrl)
    : null;
  const alibabaEndpoints = alibabaProvider ? ALIBABA_ENDPOINTS[alibabaProvider] : [];

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setShowKey(false);
    }
  }, [value, visible]);

  const selectProvider = (provider: ProviderId) => {
    setDraft((current) => selectProviderSettings(current, provider));
  };

  const selectProviderGroup = (provider: ProviderGroup) => {
    if (provider === 'alibaba') {
      if (!isAlibaba) selectProvider('bailian');
      return;
    }
    selectProvider(provider);
  };

  const selectAlibabaRegion = (region: AlibabaRegion) => {
    if (!alibabaProvider) return;
    const endpoint = ALIBABA_ENDPOINTS[alibabaProvider].find((item) => item.id === region);
    if (!endpoint) return;
    setDraft((current) => selectAlibabaRegionSettings(current, endpoint.id));
  };

  const save = async () => {
    if (!draft.apiKey.trim()) {
      await onSave({ ...draft, apiKey: '' });
      onClose();
      return;
    }
    if (alibabaProvider && !isAlibabaKeyCompatible(alibabaProvider, draft.apiKey)) {
      Alert.alert(copy.settings.keyPlanMismatchTitle, copy.settings.keyPlanMismatchBody);
      return;
    }
    if (!draft.baseUrl.trim()) {
      Alert.alert(copy.settings.missingBaseUrlTitle, copy.settings.missingBaseUrlBody);
      return;
    }
    if (!isAllowedProviderBaseUrl(draft.baseUrl)) {
      Alert.alert(copy.settings.unsafeUrlTitle, copy.settings.unsafeUrlBody);
      return;
    }
    if (!draft.model.trim()) {
      Alert.alert(copy.settings.missingModelTitle, copy.settings.missingModelBody);
      return;
    }

    try {
      setSaving(true);
      await onSave({
        ...draft,
        apiKey: draft.apiKey.trim(),
        baseUrl: draft.baseUrl.trim().replace(/\/+$/, ''),
        model: draft.model.trim()
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    await onClear();
    setDraft((current) => ({ ...current, apiKey: '' }));
    Alert.alert(copy.settings.keyClearedTitle, copy.settings.keyClearedBody);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{copy.settings.languageEyebrow}</Text>
              <Text style={styles.title}>{copy.settings.languageTitle}</Text>
            </View>
            <Pressable
              accessibilityLabel={copy.settings.close}
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.languageBody}>{copy.settings.languageBody}</Text>
          <View style={styles.chipWrap}>
            {uiLanguageOptions.map((option) => (
              <ChoiceChip
                key={option.id}
                label={option.label}
                selected={language === option.id}
                onPress={() => void onLanguageChange(option.id)}
              />
            ))}
          </View>

          <View style={styles.sectionDivider} />
          <Text style={styles.eyebrow}>{copy.settings.aiEyebrow}</Text>
          <Text style={styles.aiTitle}>{copy.settings.title}</Text>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>{copy.settings.noticeTitle}</Text>
            <Text style={styles.noticeBody}>{copy.settings.noticeBody}</Text>
          </View>

          <Text style={styles.sectionLabel}>{copy.settings.provider}</Text>
          <View style={styles.chipWrap}>
            {providerGroups.map((provider) => (
              <ChoiceChip
                key={provider}
                label={
                  provider === 'alibaba'
                    ? copy.settings.alibabaCloud
                    : copy.providerNames[provider]
                }
                selected={selectedProviderGroup === provider}
                onPress={() => selectProviderGroup(provider)}
              />
            ))}
          </View>

          {isAlibaba ? (
            <View style={styles.alibabaPanel}>
              <Text style={styles.planSectionTitle}>{copy.settings.alibabaPlanTitle}</Text>
              <Text style={styles.hint}>{copy.settings.alibabaPlanBody}</Text>
              <View accessibilityRole="radiogroup" style={styles.planList}>
                {ALIBABA_PLANS.map((provider) => (
                  <PlanOption
                    key={provider}
                    label={copy.providerNames[provider]}
                    description={copy.providerNotes[provider]}
                    selected={draft.provider === provider}
                    onPress={() => selectProvider(provider)}
                  />
                ))}
              </View>

              <Text style={styles.planSectionTitle}>{copy.settings.alibabaRegionTitle}</Text>
              <Text style={styles.hint}>{copy.settings.alibabaRegionBody}</Text>
              <View style={styles.chipWrap}>
                {alibabaEndpoints.map((endpoint) => (
                  <ChoiceChip
                    key={endpoint.id}
                    label={copy.regions[endpoint.id]}
                    selected={selectedAlibabaRegion === endpoint.id}
                    onPress={() => selectAlibabaRegion(endpoint.id)}
                  />
                ))}
              </View>

              {draft.provider !== 'bailian' ? (
                <View style={styles.restrictedPlanNotice}>
                  <Text style={styles.restrictedPlanTitle}>
                    {copy.settings.restrictedPlanTitle}
                  </Text>
                  <Text style={styles.restrictedPlanBody}>
                    {copy.settings.restrictedPlanBody}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.hint}>{copy.providerNotes[draft.provider]}</Text>
          )}

          <Text style={styles.sectionLabel}>{copy.settings.apiKey}</Text>
          <View style={[styles.keyRow, compactLayout && styles.compactKeyRow]}>
            <TextInput
              accessibilityLabel={copy.settings.apiKey}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={
                draft.provider === 'bailian-coding' || draft.provider === 'bailian-token'
                  ? 'sk-sp-…'
                  : copy.settings.apiKeyPlaceholder
              }
              placeholderTextColor={colors.inkMuted}
              secureTextEntry={!showKey}
              value={draft.apiKey}
              onChangeText={(apiKey) => setDraft((current) => ({ ...current, apiKey }))}
              style={[styles.input, styles.keyInput]}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowKey((current) => !current)}
              style={styles.showButton}
            >
              <Text style={styles.showButtonText}>
                {showKey ? copy.settings.hide : copy.settings.show}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>{copy.settings.baseUrl}</Text>
          <TextInput
            accessibilityLabel={copy.settings.baseUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://…/v1"
            placeholderTextColor={colors.inkMuted}
            value={draft.baseUrl}
            onChangeText={(baseUrl) => setDraft((current) => ({ ...current, baseUrl }))}
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>{copy.settings.modelId}</Text>
          <TextInput
            accessibilityLabel={copy.settings.modelId}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={copy.settings.modelPlaceholder}
            placeholderTextColor={colors.inkMuted}
            value={draft.model}
            onChangeText={(model) => setDraft((current) => ({ ...current, model }))}
            style={styles.input}
          />

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>{copy.settings.prototypeTitle}</Text>
            <Text style={styles.warningText}>{copy.settings.prototypeBody}</Text>
          </View>

          <View style={styles.buttonStack}>
            <PrimaryButton label={copy.settings.save} onPress={save} loading={saving} />
            <PrimaryButton label={copy.settings.clear} variant="danger" onPress={clear} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 22,
    paddingBottom: 48,
    backgroundColor: colors.background,
    gap: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  headerCopy: { flex: 1, paddingRight: 12 },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.2
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginTop: 4
  },
  languageBody: { color: colors.inkMuted, fontSize: 13, lineHeight: 20, marginTop: -4 },
  sectionDivider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  aiTitle: {
    color: colors.ink,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
    marginTop: -5
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  closeText: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  notice: {
    backgroundColor: colors.mint,
    borderRadius: radius.md,
    padding: 16,
    marginVertical: 4
  },
  noticeTitle: { color: colors.success, fontWeight: '800', fontSize: 15 },
  noticeBody: { color: colors.ink, lineHeight: 20, marginTop: 5, fontSize: 13 },
  sectionLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 7
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { color: colors.inkMuted, fontSize: 12, lineHeight: 17 },
  alibabaPanel: {
    gap: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 14
  },
  planSectionTitle: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 2 },
  planList: { gap: 8 },
  planOption: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface
  },
  planOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  planOptionPressed: { opacity: 0.82 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  radioOuterSelected: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  planOptionCopy: { flex: 1 },
  planOptionTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  planOptionTitleSelected: { color: colors.primaryDark },
  planOptionDescription: { color: colors.inkMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  restrictedPlanNotice: { backgroundColor: colors.peach, borderRadius: radius.md, padding: 12 },
  restrictedPlanTitle: { color: colors.peachStrong, fontSize: 13, fontWeight: '800' },
  restrictedPlanBody: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 4 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 15
  },
  keyRow: { flexDirection: 'row', gap: 8 },
  compactKeyRow: { flexDirection: 'column' },
  keyInput: { flex: 1 },
  showButton: {
    minWidth: 68,
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft
  },
  showButtonText: { color: colors.primaryDark, fontWeight: '800' },
  warningBox: {
    backgroundColor: colors.peach,
    borderRadius: radius.md,
    padding: 15,
    marginTop: 8
  },
  warningTitle: { color: colors.peachStrong, fontWeight: '800', fontSize: 14 },
  warningText: { color: colors.ink, marginTop: 4, lineHeight: 19, fontSize: 12 },
  buttonStack: { gap: 10, marginTop: 10 }
});
