import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import {
  isAllowedProviderBaseUrl,
  isAllowedProviderEndpoint
} from '../utils/providerUrl';
import {
  selectAlibabaRegionSettings,
  selectProviderSettings
} from '../utils/settingsTransitions';
import { showPlatformAlert } from '../utils/platformFeedback';
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
  const roomyLayout = width >= 700;
  const wideWebModal = Platform.OS === 'web' && width >= 760;
  const [draft, setDraft] = useState<AISettings>(value);
  const [showKey, setShowKey] = useState(false);
  const [providerExpanded, setProviderExpanded] = useState(!value.apiKey.trim());
  const [alibabaExpanded, setAlibabaExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
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
  const selectedProviderLabel = isAlibaba
    ? copy.settings.alibabaCloud
    : copy.providerNames[draft.provider];
  const selectedPlanLabel = alibabaProvider
    ? copy.providerNames[alibabaProvider]
    : '';
  const selectedRegionLabel = selectedAlibabaRegion
    ? copy.regions[selectedAlibabaRegion]
    : '';

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setShowKey(false);
      setProviderExpanded(!value.apiKey.trim());
      setAlibabaExpanded(false);
      setDetailsExpanded(false);
      setAboutExpanded(false);
    }
  }, [value, visible]);

  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => subscription.remove();
  }, []);

  const animateDisclosure = () => {
    if (reduceMotion) return;
    LayoutAnimation.configureNext({
      duration: 180,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
      }
    });
  };

  const selectProvider = (provider: ProviderId) => {
    setDraft((current) => selectProviderSettings(current, provider));
  };

  const selectProviderGroup = (provider: ProviderGroup) => {
    animateDisclosure();
    if (provider === 'alibaba') {
      if (!isAlibaba) selectProvider('bailian');
      setProviderExpanded(false);
      setAlibabaExpanded(true);
      setDetailsExpanded(false);
      return;
    }
    selectProvider(provider);
    setProviderExpanded(false);
    setAlibabaExpanded(false);
    setDetailsExpanded(true);
  };

  const selectAlibabaRegion = (region: AlibabaRegion) => {
    if (!alibabaProvider) return;
    const endpoint = ALIBABA_ENDPOINTS[alibabaProvider].find((item) => item.id === region);
    if (!endpoint) return;
    animateDisclosure();
    setDraft((current) => selectAlibabaRegionSettings(current, endpoint.id));
    setAlibabaExpanded(false);
    setDetailsExpanded(true);
  };

  const save = async () => {
    if (!draft.apiKey.trim()) {
      await onSave({ ...draft, apiKey: '' });
      onClose();
      return;
    }
    if (alibabaProvider && !isAlibabaKeyCompatible(alibabaProvider, draft.apiKey)) {
      showPlatformAlert(copy.settings.keyPlanMismatchTitle, copy.settings.keyPlanMismatchBody);
      return;
    }
    if (!draft.baseUrl.trim()) {
      showPlatformAlert(copy.settings.missingBaseUrlTitle, copy.settings.missingBaseUrlBody);
      return;
    }
    if (!isAllowedProviderBaseUrl(draft.baseUrl)) {
      showPlatformAlert(copy.settings.unsafeUrlTitle, copy.settings.unsafeUrlBody);
      return;
    }
    if (!isAllowedProviderEndpoint(draft.provider, draft.baseUrl)) {
      showPlatformAlert(
        copy.settings.unexpectedProviderHostTitle,
        copy.settings.unexpectedProviderHostBody
      );
      return;
    }
    if (!draft.model.trim()) {
      showPlatformAlert(copy.settings.missingModelTitle, copy.settings.missingModelBody);
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
    showPlatformAlert(copy.settings.keyClearedTitle, copy.settings.keyClearedBody);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.flex, wideWebModal && styles.webBackdrop]}
      >
        <SafeAreaView
          edges={['top', 'bottom', 'left', 'right']}
          style={[styles.flex, wideWebModal && styles.webModalCard]}
        >
          <LinearGradient
            colors={[colors.lavenderGlow, colors.background, colors.background]}
            locations={[0, 0.32, 1]}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.content, roomyLayout && styles.contentRoomy]}
            keyboardShouldPersistTaps="handled"
          >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{copy.settings.pageTitle}</Text>
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

          <Text style={styles.eyebrow}>{copy.settings.languageTitle}</Text>
          <Text style={styles.languageBody}>{copy.settings.languageBody}</Text>
          <View accessibilityRole="radiogroup" style={styles.chipWrap}>
            {uiLanguageOptions.map((option) => (
              <ChoiceChip
                key={option.id}
                label={option.label}
                selected={language === option.id}
                onPress={() => void onLanguageChange(option.id)}
                role="radio"
              />
            ))}
          </View>

          <View style={styles.sectionDivider} />
          <Text style={styles.eyebrow}>{copy.settings.aiEyebrow}</Text>
          <Text style={styles.aiTitle}>{copy.settings.title}</Text>
          <Text style={styles.privacyNote}>
            {Platform.OS === 'web'
              ? copy.settings.privacyNoteWeb
              : copy.settings.privacyNoteNative}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: providerExpanded }}
            onPress={() => {
              animateDisclosure();
              setProviderExpanded((current) => !current);
            }}
            style={({ pressed }) => [styles.detailsToggle, pressed && styles.planOptionPressed]}
          >
            <View style={styles.detailsToggleCopy}>
              <Text style={styles.detailsTitle}>{copy.settings.provider}</Text>
              <Text numberOfLines={1} style={styles.detailsSummary}>{selectedProviderLabel}</Text>
            </View>
            <Text style={styles.detailsAction}>
              {providerExpanded ? copy.settings.detailsHide : copy.settings.detailsShow}
            </Text>
          </Pressable>

          {providerExpanded ? (
            <View accessibilityRole="radiogroup" style={styles.providerGrid}>
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
                  variant="tile"
                  style={styles.providerOption}
                  role="radio"
                />
              ))}
            </View>
          ) : null}

          {isAlibaba ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: alibabaExpanded }}
                onPress={() => {
                  animateDisclosure();
                  setAlibabaExpanded((current) => !current);
                }}
                style={({ pressed }) => [styles.detailsToggle, pressed && styles.planOptionPressed]}
              >
                <View style={styles.detailsToggleCopy}>
                  <Text style={styles.detailsTitle}>{copy.settings.planServerTitle}</Text>
                  <Text numberOfLines={1} style={styles.detailsSummary}>
                    {copy.settings.planServerSummary(selectedPlanLabel, selectedRegionLabel)}
                  </Text>
                </View>
                <Text style={styles.detailsAction}>
                  {alibabaExpanded ? copy.settings.detailsHide : copy.settings.detailsShow}
                </Text>
              </Pressable>

              {alibabaExpanded ? (
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
                  <View accessibilityRole="radiogroup" style={styles.chipWrap}>
                    {alibabaEndpoints.map((endpoint) => (
                      <ChoiceChip
                        key={endpoint.id}
                        label={copy.regions[endpoint.id]}
                        selected={selectedAlibabaRegion === endpoint.id}
                        onPress={() => selectAlibabaRegion(endpoint.id)}
                        variant="tile"
                        role="radio"
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
              ) : null}
            </>
          ) : (
            providerExpanded ? <Text style={styles.hint}>{copy.providerNotes[draft.provider]}</Text> : null
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: detailsExpanded }}
            onPress={() => {
              animateDisclosure();
              setDetailsExpanded((current) => !current);
            }}
            style={({ pressed }) => [
              styles.detailsToggle,
              pressed && styles.planOptionPressed
            ]}
          >
            <View style={styles.detailsToggleCopy}>
              <Text style={styles.detailsTitle}>{copy.settings.detailsTitle}</Text>
              <Text numberOfLines={1} style={styles.detailsSummary}>
                {draft.apiKey.trim()
                  ? copy.settings.detailsConfigured(draft.model.trim())
                  : copy.settings.detailsEmpty}
              </Text>
            </View>
            <Text style={styles.detailsAction}>
              {detailsExpanded ? copy.settings.detailsHide : copy.settings.detailsShow}
            </Text>
          </Pressable>

          {detailsExpanded ? (
            <View style={styles.detailsFields}>
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
                onChangeText={(model) =>
                  setDraft((current) => ({
                    ...current,
                    model,
                    supportsImages:
                      model === current.model ? current.supportsImages : false
                  }))
                }
                style={styles.input}
              />

              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: draft.supportsImages }}
                onPress={() =>
                  setDraft((current) => ({
                    ...current,
                    supportsImages: !current.supportsImages
                  }))
                }
                style={({ pressed }) => [
                  styles.capabilityRow,
                  draft.supportsImages && styles.capabilityRowEnabled,
                  pressed && styles.planOptionPressed
                ]}
              >
                <View style={styles.capabilityCopy}>
                  <Text style={styles.capabilityTitle}>
                    {copy.settings.imageInputTitle}
                  </Text>
                  <Text style={styles.capabilityBody}>
                    {copy.settings.imageInputBody}
                  </Text>
                </View>
                <View
                  style={[
                    styles.switchTrack,
                    draft.supportsImages && styles.switchTrackEnabled
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      draft.supportsImages && styles.switchThumbEnabled
                    ]}
                  />
                </View>
                <Text style={styles.capabilityState}>
                  {draft.supportsImages
                    ? copy.settings.imageInputOn
                    : copy.settings.imageInputOff}
                </Text>
              </Pressable>

              {draft.apiKey.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={clear}
                  style={({ pressed }) => [styles.clearKeyButton, pressed && styles.planOptionPressed]}
                >
                  <Text style={styles.clearKeyText}>{copy.settings.clear}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: aboutExpanded }}
            onPress={() => {
              animateDisclosure();
              setAboutExpanded((current) => !current);
            }}
            style={({ pressed }) => [styles.aboutToggle, pressed && styles.planOptionPressed]}
          >
            <Text style={styles.aboutToggleText}>{copy.settings.prototypeTitle}</Text>
            <Text style={styles.detailsAction}>
              {aboutExpanded ? copy.settings.detailsHide : copy.settings.detailsShow}
            </Text>
          </Pressable>
          {aboutExpanded ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>{copy.settings.prototypeBody}</Text>
            </View>
          ) : null}
          </ScrollView>
          <View style={styles.saveDock}>
            <PrimaryButton
              label={copy.settings.save}
              onPress={save}
              loading={saving}
              style={styles.saveButton}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  webBackdrop: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(43, 39, 49, 0.18)'
  },
  webModalCard: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '92%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  content: {
    padding: 22,
    paddingBottom: 24,
    backgroundColor: 'transparent',
    gap: 10
  },
  contentRoomy: { width: '100%', maxWidth: 720, alignSelf: 'center' },
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
  privacyNote: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -3,
    marginBottom: 3
  },
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
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  closeText: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  notice: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginVertical: 6
  },
  noticeTitle: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  noticeBody: { color: colors.inkMuted, lineHeight: 20, marginTop: 4, fontSize: 13 },
  sectionLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 7
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerOption: { flexBasis: '47%', flexGrow: 1 },
  hint: { color: colors.inkMuted, fontSize: 12, lineHeight: 17 },
  alibabaPanel: {
    gap: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    marginVertical: 3
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
  planOptionSelected: { borderColor: colors.primary, backgroundColor: colors.surface },
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
  restrictedPlanNotice: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.peachStrong,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  restrictedPlanTitle: { color: colors.peachStrong, fontSize: 13, fontWeight: '800' },
  restrictedPlanBody: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 4 },
  detailsToggle: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
    marginTop: 4
  },
  detailsToggleCopy: { flex: 1 },
  detailsTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  detailsSummary: { color: colors.inkMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  detailsAction: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  detailsFields: { gap: 10 },
  clearKeyButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  clearKeyText: { color: colors.danger, fontSize: 13, fontWeight: '800' },
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  showButtonText: { color: colors.primaryDark, fontWeight: '800' },
  capabilityRow: {
    minHeight: 82,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface
  },
  capabilityRowEnabled: {
    borderColor: colors.primary,
    backgroundColor: colors.surface
  },
  capabilityCopy: { flex: 1, minWidth: 210 },
  capabilityTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  capabilityBody: { color: colors.inkMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
    backgroundColor: colors.borderStrong
  },
  switchTrackEnabled: { backgroundColor: colors.primary },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface
  },
  switchThumbEnabled: { alignSelf: 'flex-end' },
  capabilityState: { color: colors.primaryDark, fontSize: 11, fontWeight: '900' },
  warningBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  warningTitle: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  warningText: { color: colors.inkMuted, lineHeight: 19, fontSize: 12 },
  aboutToggle: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  aboutToggleText: { color: colors.inkMuted, fontSize: 12, fontWeight: '800' },
  saveDock: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center'
  },
  saveButton: { width: '100%', maxWidth: 720 },
  buttonStack: { gap: 10, marginTop: 10 }
});
