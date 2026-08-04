import { useEffect, useRef } from 'react';
import {
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';

import type { UiCopy } from '../i18n';
import { colors, radius } from '../theme';
import type {
  ChatImageAttachment,
  ChatSessionMessage,
  ChatTurnResult
} from '../types';
import { PrimaryButton } from './PrimaryButton';
import { MeloChatAvatar } from './MeloChatAvatar';

type ChatFailure = Extract<ChatTurnResult, { status: 'unavailable' }>;

interface MeloChatProps {
  copy: UiCopy;
  messages: ChatSessionMessage[];
  draft: string;
  sending: boolean;
  failure: ChatFailure | null;
  memoryReady: boolean;
  memoryUnavailable: boolean;
  pendingImage: ChatImageAttachment | null;
  imageInputEnabled: boolean;
  imagePicking: boolean;
  stars: number;
  providerName: string;
  providerConfigured: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onRetry: () => void;
  onClear: () => void;
  onAttachImage: () => void;
  onRemoveImage: () => void;
  onRemoveLatestImage: () => void;
  onConfigure: () => void;
  onBack: () => void;
  onRewriteLatest: () => void;
}

function failureBody(
  copy: UiCopy,
  failure: ChatFailure,
  providerName: string
): string {
  switch (failure.reason) {
    case 'no-key':
      return copy.chat.noKeyBody;
    case 'timeout':
      return copy.chat.timeoutBody(providerName);
    case 'network-error':
      return copy.chat.networkBody(providerName);
    case 'http-error':
      return copy.chat.httpBody(providerName, failure.providerHttpStatus);
    case 'invalid-response':
      return copy.chat.invalidBody(providerName);
    case 'configuration-error':
      return copy.chat.configurationBody(providerName);
    case 'unsafe-output':
      return copy.chat.unsafeBody(providerName);
    case 'attachment-error':
      return copy.chat.attachmentBody;
    case 'image-not-enabled':
      return copy.chat.imageNotEnabledBody;
  }
}

export function MeloChat({
  copy,
  messages,
  draft,
  sending,
  failure,
  memoryReady,
  memoryUnavailable,
  pendingImage,
  imageInputEnabled,
  imagePicking,
  stars,
  providerName,
  providerConfigured,
  onDraftChange,
  onSend,
  onRetry,
  onClear,
  onAttachImage,
  onRemoveImage,
  onRemoveLatestImage,
  onConfigure,
  onBack,
  onRewriteLatest
}: MeloChatProps) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const transcriptRef = useRef<ScrollView>(null);
  const hasMessages = messages.length > 0;
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user');
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant');
  const headerExpression = sending
    ? 'thinking'
    : latestAssistantMessage?.source === 'safety'
      ? 'concerned'
      : (latestAssistantMessage?.expression ?? 'calm');
  const failureProviderId =
    failure?.attemptedProviderId ?? failure?.configuredProviderId;
  const failureProviderName = failureProviderId
    ? copy.providerNames[failureProviderId]
    : providerName;
  const diagnostic = failure
    ? copy.result.providerDiagnostic(
        failure.providerHttpStatus,
        failure.providerErrorCode,
        failure.providerRequestId
      )
    : '';

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      transcriptRef.current?.scrollToEnd({ animated: hasMessages });
    });
    return () => cancelAnimationFrame(frame);
  }, [hasMessages, messages, sending]);

  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Pressable
          accessibilityLabel={copy.common.back}
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <MeloChatAvatar
          size={34}
          expression={headerExpression}
          animate
          stars={stars}
        />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{copy.chat.title}</Text>
          <Text numberOfLines={1} style={styles.headerStatus}>
            {providerConfigured
              ? copy.chat.aiMode(providerName)
              : copy.chat.offlineMode}
          </Text>
        </View>
        <View
          style={[
            styles.modeDot,
            providerConfigured ? styles.modeDotOnline : styles.modeDotOffline
          ]}
        />
      </View>

      <ScrollView
        ref={transcriptRef}
        style={styles.messageScroll}
        contentContainerStyle={styles.messageContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.boundaryCard}>
          <Text style={styles.boundaryTitle}>{copy.chat.notTherapyNotice}</Text>
          <Text style={styles.boundaryBody}>{copy.chat.sessionNotice}</Text>
        </View>

        {memoryUnavailable ? (
          <View accessibilityRole="alert" style={styles.memoryWarning}>
            <Text style={styles.memoryWarningText}>
              {copy.chat.memoryUnavailable}
            </Text>
          </View>
        ) : null}

        {!memoryReady && !memoryUnavailable ? (
          <View style={styles.memoryLoading}>
            <Text style={styles.memoryLoadingText}>
              {copy.chat.memoryLoading}
            </Text>
          </View>
        ) : null}

        {!providerConfigured ? (
          <View style={styles.offlineCard}>
            <Text style={styles.offlineTitle}>{copy.chat.offlineMode}</Text>
            <Text style={styles.offlineBody}>{copy.chat.noKeyBody}</Text>
            <PrimaryButton label={copy.chat.configure} onPress={onConfigure} />
            <PrimaryButton
              label={copy.chat.rewriteOffline}
              variant="secondary"
              onPress={onRewriteLatest}
            />
          </View>
        ) : null}

        {!hasMessages && providerConfigured ? (
          <View style={styles.emptyState}>
            <View style={styles.largeAvatarSpacing}>
              <MeloChatAvatar
                size={68}
                expression="calm"
                animate
                stars={stars}
              />
            </View>
            <Text style={styles.emptyTitle}>{copy.chat.emptyTitle}</Text>
            <Text style={styles.emptyBody}>{copy.chat.emptyBody}</Text>
            <View style={styles.promptList}>
              {copy.chat.quickPrompts.map((prompt) => (
                <Pressable
                  key={prompt}
                  accessibilityRole="button"
                  onPress={() => onDraftChange(prompt)}
                  style={({ pressed }) => [
                    styles.promptButton,
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.transcript}>
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            const isLatestAssistant =
              !isUser && index === messages.length - 1 && !sending;
            const sourceLabel =
              message.source === 'ai' && message.providerId
                ? copy.chat.aiLabel(
                    copy.providerNames[message.providerId],
                    message.model
                  )
                : message.source === 'safety'
                  ? copy.chat.safetyLabel
                  : null;
            return (
              <View
                key={message.id}
                style={[
                  styles.messageGroup,
                  isUser ? styles.userMessageGroup : styles.meloMessageGroup
                ]}
              >
                <Text style={styles.roleLabel}>
                  {isUser ? copy.chat.you : copy.chat.melo}
                </Text>
                <View style={styles.messageLine}>
                  {!isUser ? (
                    <MeloChatAvatar
                      size={27}
                      expression={
                        message.source === 'safety'
                          ? 'concerned'
                          : (message.expression ?? 'calm')
                      }
                      animate={isLatestAssistant}
                      stars={stars}
                    />
                  ) : null}
                  <View
                    accessibilityLiveRegion={
                      isLatestAssistant ? 'polite' : 'none'
                    }
                    style={[
                      styles.bubble,
                      isUser ? styles.userBubble : styles.meloBubble,
                      message.source === 'safety' && styles.safetyBubble
                    ]}
                  >
                    {message.image ? (
                      <Image
                        accessibilityLabel={copy.chat.imageLabel}
                        resizeMode="cover"
                        source={{ uri: message.image.uri }}
                        style={styles.messageImage}
                      />
                    ) : null}
                    {message.text ? (
                      <Text
                        selectable
                        style={[
                          styles.messageText,
                          isUser && styles.userMessageText
                        ]}
                      >
                        {message.text}
                      </Text>
                    ) : null}
                    {sourceLabel ? (
                      <Text
                        style={[
                          styles.sourceLabel,
                          message.source === 'safety' &&
                            styles.safetySourceLabel
                        ]}
                      >
                        {sourceLabel}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}

          {sending ? (
            <View style={[styles.messageGroup, styles.meloMessageGroup]}>
              <Text style={styles.roleLabel}>{copy.chat.melo}</Text>
              <View style={styles.messageLine}>
                <MeloChatAvatar
                  size={27}
                  expression="thinking"
                  animate
                  stars={stars}
                />
                <View
                  accessibilityLiveRegion="polite"
                  style={[styles.bubble, styles.meloBubble]}
                >
                  <Text style={styles.thinkingText}>{copy.chat.sending}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {failure && providerConfigured ? (
          <View style={styles.failureCard}>
            <Text style={styles.failureTitle}>{copy.chat.unavailableTitle}</Text>
            <Text style={styles.failureBody}>
              {failureBody(copy, failure, failureProviderName)}
            </Text>
            {diagnostic ? (
              <Text selectable style={styles.failureDiagnostic}>
                {diagnostic}
              </Text>
            ) : null}
            <View style={[styles.actionRow, compact && styles.actionStack]}>
              <PrimaryButton
                label={copy.chat.retry}
                onPress={onRetry}
                disabled={sending || !latestUserMessage}
                style={styles.actionButton}
              />
              <PrimaryButton
                label={copy.chat.configure}
                variant="ghost"
                onPress={onConfigure}
                disabled={sending}
                style={styles.actionButton}
              />
            </View>
            {latestUserMessage?.image ? (
              <PrimaryButton
                label={copy.chat.removeImage}
                variant="ghost"
                onPress={onRemoveLatestImage}
                disabled={sending}
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.composerDock}>
        {latestUserMessage ? (
          <View style={styles.utilityRow}>
            <Pressable
              accessibilityRole="button"
              disabled={sending}
              onPress={onRewriteLatest}
              style={({ pressed }) => [
                styles.utilityButton,
                pressed && styles.pressed,
                sending && styles.disabled
              ]}
            >
              <Text style={styles.utilityText}>{copy.chat.rewriteLatest}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={sending}
              onPress={onClear}
              style={({ pressed }) => [
                styles.utilityButton,
                pressed && styles.pressed,
                sending && styles.disabled
              ]}
            >
              <Text style={styles.clearText}>{copy.chat.clear}</Text>
            </Pressable>
          </View>
        ) : null}

        {pendingImage ? (
          <View style={styles.pendingImageRow}>
            <Image
              accessibilityLabel={copy.chat.imageLabel}
              resizeMode="cover"
              source={{ uri: pendingImage.uri }}
              style={styles.pendingImage}
            />
            <Text numberOfLines={1} style={styles.pendingImageLabel}>
              {copy.chat.imageLabel}
            </Text>
            <Pressable
              accessibilityLabel={copy.chat.removeImage}
              accessibilityRole="button"
              disabled={sending}
              onPress={onRemoveImage}
              style={({ pressed }) => [
                styles.removeImageButton,
                pressed && styles.pressed
              ]}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </Pressable>
          </View>
        ) : null}

        {providerConfigured ? (
          <>
            <View style={styles.composerRow}>
              <Pressable
                accessibilityLabel={copy.chat.attachImage}
                accessibilityRole="button"
                disabled={!memoryReady || sending || imagePicking}
                onPress={onAttachImage}
                style={({ pressed }) => [
                  styles.attachButton,
                  !imageInputEnabled && styles.attachButtonUnavailable,
                  pressed && styles.pressed
                ]}
              >
                <Text style={styles.attachIcon}>{imagePicking ? '…' : '＋'}</Text>
              </Pressable>
              <View style={styles.inputShell}>
                <TextInput
                  accessibilityLabel={copy.chat.inputLabel}
                  editable={memoryReady && !sending}
                  maxLength={800}
                  multiline
                  onChangeText={onDraftChange}
                  placeholder={copy.chat.placeholder}
                  placeholderTextColor={colors.inkMuted}
                  style={styles.input}
                  textAlignVertical="center"
                  value={draft}
                />
                {draft.length > 680 ? (
                  <Text style={styles.charCount}>{draft.length}/800</Text>
                ) : null}
              </View>
              <Pressable
                accessibilityLabel={sending ? copy.chat.sending : copy.chat.send}
                accessibilityRole="button"
                disabled={
                  !memoryReady ||
                  sending ||
                  (draft.trim().length === 0 && !pendingImage)
                }
                onPress={onSend}
                style={({ pressed }) => [
                  styles.sendButton,
                  (!memoryReady ||
                    sending ||
                    (draft.trim().length === 0 && !pendingImage)) &&
                    styles.sendDisabled,
                  pressed && styles.pressed
                ]}
              >
                <Text style={styles.sendText}>{sending ? '…' : '↑'}</Text>
              </Pressable>
            </View>
            {!imageInputEnabled ? (
              <Text style={styles.imageDisabledHint}>{copy.chat.imageDisabled}</Text>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  chatHeader: {
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22
  },
  backIcon: { color: colors.primaryDark, fontSize: 36, lineHeight: 38 },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { color: colors.ink, fontSize: 17, lineHeight: 21, fontWeight: '900' },
  headerStatus: { color: colors.inkMuted, fontSize: 11, marginTop: 2 },
  modeDot: { width: 10, height: 10, borderRadius: 5 },
  modeDotOnline: { backgroundColor: colors.mintStrong },
  modeDotOffline: { backgroundColor: colors.inkMuted },
  messageScroll: { flex: 1 },
  messageContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, gap: 14 },
  boundaryCard: {
    alignSelf: 'center',
    maxWidth: 500,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  boundaryTitle: { color: colors.ink, fontWeight: '900', fontSize: 12, textAlign: 'center' },
  boundaryBody: { color: colors.inkMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 3 },
  memoryWarning: { backgroundColor: colors.peach, borderRadius: radius.md, padding: 13 },
  memoryWarningText: { color: colors.peachStrong, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  memoryLoading: { alignItems: 'center', paddingVertical: 8 },
  memoryLoadingText: { color: colors.inkMuted, fontSize: 12, fontWeight: '700' },
  offlineCard: { backgroundColor: colors.peach, borderRadius: radius.md, padding: 15, gap: 12 },
  offlineTitle: { color: colors.peachStrong, fontWeight: '900', fontSize: 16 },
  offlineBody: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  largeAvatarSpacing: { marginBottom: 12 },
  emptyTitle: { color: colors.ink, fontWeight: '900', fontSize: 19, textAlign: 'center' },
  emptyBody: { color: colors.inkMuted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 4 },
  promptList: { width: '100%', gap: 9, marginTop: 16 },
  promptButton: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  promptText: { color: colors.primaryDark, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  transcript: { gap: 14 },
  messageGroup: { maxWidth: '92%' },
  userMessageGroup: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  meloMessageGroup: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  roleLabel: { color: colors.inkMuted, fontSize: 10, fontWeight: '800', marginBottom: 4, marginHorizontal: 4 },
  messageLine: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, maxWidth: '100%' },
  bubble: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 11 },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  meloBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: colors.border },
  safetyBubble: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
  messageText: { color: colors.ink, fontSize: 15, lineHeight: 21 },
  messageImage: { width: 220, maxWidth: '100%', height: 150, borderRadius: 13, marginBottom: 9 },
  userMessageText: { color: '#FFFFFF' },
  sourceLabel: { color: colors.success, fontSize: 10, fontWeight: '900', marginTop: 7 },
  safetySourceLabel: { color: colors.danger },
  thinkingText: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  failureCard: { backgroundColor: colors.peach, borderRadius: radius.md, padding: 15 },
  failureTitle: { color: colors.peachStrong, fontSize: 15, fontWeight: '900' },
  failureBody: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 4 },
  failureDiagnostic: { color: colors.inkMuted, fontSize: 11, fontWeight: '800', marginTop: 7 },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 12 },
  actionStack: { flexDirection: 'column' },
  actionButton: { flex: 1 },
  composerDock: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 10,
    gap: 8
  },
  utilityRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  utilityButton: { minHeight: 32, flex: 1, justifyContent: 'center' },
  utilityText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  clearText: { color: colors.inkMuted, fontSize: 11, fontWeight: '800', textAlign: 'right' },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9 },
  pendingImageRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft
  },
  pendingImage: { width: 48, height: 48, borderRadius: 10 },
  pendingImageLabel: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: '800' },
  removeImageButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  removeImageText: { color: colors.inkMuted, fontSize: 16, fontWeight: '900' },
  attachButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  attachButtonUnavailable: { backgroundColor: colors.surfaceMuted },
  attachIcon: { color: colors.primaryDark, fontSize: 25, lineHeight: 27, fontWeight: '700' },
  imageDisabledHint: { color: colors.inkMuted, fontSize: 10, lineHeight: 14, paddingHorizontal: 4 },
  inputShell: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 23,
    backgroundColor: colors.background,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 4
  },
  input: { minHeight: 36, maxHeight: 98, color: colors.ink, fontSize: 15, lineHeight: 20, paddingVertical: 8 },
  charCount: { color: colors.inkMuted, fontSize: 9, textAlign: 'right', paddingRight: 3, paddingBottom: 2 },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  sendDisabled: { backgroundColor: colors.borderStrong },
  sendText: { color: '#FFFFFF', fontSize: 24, lineHeight: 26, fontWeight: '900' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 }
});
