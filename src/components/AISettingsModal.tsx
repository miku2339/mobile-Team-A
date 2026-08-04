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
  View
} from 'react-native';

import { PROVIDERS } from '../config/providers';
import { colors, radius } from '../theme';
import type { AISettings, ProviderId } from '../types';
import { ChoiceChip } from './ChoiceChip';
import { PrimaryButton } from './PrimaryButton';

interface AISettingsModalProps {
  visible: boolean;
  value: AISettings;
  onClose: () => void;
  onSave: (settings: AISettings) => Promise<void>;
  onClear: () => Promise<void>;
}

const providerOrder: ProviderId[] = ['openai', 'bailian', 'bigmodel', 'custom'];

export function AISettingsModal({
  visible,
  value,
  onClose,
  onSave,
  onClear
}: AISettingsModalProps) {
  const [draft, setDraft] = useState<AISettings>(value);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [value, visible]);

  const selectProvider = (provider: ProviderId) => {
    const preset = PROVIDERS[provider];
    setDraft((current) => ({
      ...current,
      provider,
      baseUrl: preset.baseUrl,
      model: preset.model
    }));
  };

  const save = async () => {
    if (!draft.baseUrl.trim()) {
      Alert.alert('Missing Base URL', 'Please enter an OpenAI-compatible Base URL.');
      return;
    }
    if (!draft.model.trim()) {
      Alert.alert('Missing model', 'Please enter the model ID used by your provider.');
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
    Alert.alert('API key cleared', 'Melo will use its offline fallback until a new key is added.');
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
              <Text style={styles.eyebrow}>BRING YOUR OWN KEY</Text>
              <Text style={styles.title}>AI provider settings</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Your key stays on this device</Text>
            <Text style={styles.noticeBody}>
              Native builds use encrypted SecureStore. Web preview keeps it only in this browser tab.
              The key is sent directly to the provider you choose and is never included in the project code.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Provider</Text>
          <View style={styles.chipWrap}>
            {providerOrder.map((provider) => (
              <ChoiceChip
                key={provider}
                label={PROVIDERS[provider].label}
                selected={draft.provider === provider}
                onPress={() => selectProvider(provider)}
              />
            ))}
          </View>
          <Text style={styles.hint}>{PROVIDERS[draft.provider].note}</Text>

          <Text style={styles.sectionLabel}>API key</Text>
          <View style={styles.keyRow}>
            <TextInput
              accessibilityLabel="API key"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="sk-… / dashscope key / BigModel key"
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
              <Text style={styles.showButtonText}>{showKey ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Base URL</Text>
          <TextInput
            accessibilityLabel="Base URL"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://…/v1"
            placeholderTextColor={colors.inkMuted}
            value={draft.baseUrl}
            onChangeText={(baseUrl) => setDraft((current) => ({ ...current, baseUrl }))}
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Model ID</Text>
          <TextInput
            accessibilityLabel="Model ID"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="e.g. gpt-5-mini / qwen-plus / glm-5.2"
            placeholderTextColor={colors.inkMuted}
            value={draft.model}
            onChangeText={(model) => setDraft((current) => ({ ...current, model }))}
            style={styles.input}
          />

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Prototype note</Text>
            <Text style={styles.warningText}>
              Direct BYOK calls are suitable for an Expo prototype. A production release should use a
              trusted backend, rate limits, provider-specific moderation and a full privacy review.
            </Text>
          </View>

          <View style={styles.buttonStack}>
            <PrimaryButton label="Save settings" onPress={save} loading={saving} />
            <PrimaryButton label="Clear saved key" variant="danger" onPress={clear} />
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
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 15
  },
  keyRow: { flexDirection: 'row', gap: 8 },
  keyInput: { flex: 1 },
  showButton: {
    minWidth: 68,
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
