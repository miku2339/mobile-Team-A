import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AISettingsModal } from './src/components/AISettingsModal';
import { ChoiceChip } from './src/components/ChoiceChip';
import { MeloChat } from './src/components/MeloChat';
import { MeloPet } from './src/components/MeloPet';
import { PrimaryButton } from './src/components/PrimaryButton';
import { PROVIDERS } from './src/config/providers';
import { getTranslations, uiLanguageToOutputLanguage } from './src/i18n';
import { rewriteMessage } from './src/services/ai';
import { chatWithMelo } from './src/services/chat';
import {
  clearChatMessages,
  loadChatMessages,
  saveChatMessages
} from './src/services/chatStorage';
import {
  ChatImageError,
  clearAllChatImages,
  deleteChatImage,
  pickChatImage,
  pruneChatImages
} from './src/services/chatImages';
import {
  clearAISettings,
  loadAISettings,
  loadCalmStars,
  loadUILanguage,
  saveAISettings,
  saveCalmStars,
  saveUILanguage
} from './src/services/storage';
import { colors, radius } from './src/theme';
import { limitLocalChatMessages } from './src/utils/chatPersistence';
import type {
  AISettings,
  AppLanguage,
  ChatSessionMessage,
  ChatImageAttachment,
  ChatTurnResult,
  EmotionId,
  PetMood,
  RecipientId,
  RewriteResult,
  ToneId,
  UILanguage
} from './src/types';

type Step = 'home' | 'draft' | 'checkin' | 'pause' | 'result';
type AppSurface = 'rewrite' | 'chat';
type ChatFailure = Extract<ChatTurnResult, { status: 'unavailable' }>;

let chatMessageSequence = 0;

function nextChatMessageId(role: 'user' | 'assistant'): string {
  chatMessageSequence += 1;
  return `${role}-${Date.now()}-${chatMessageSequence}`;
}

const emotionOptions: Array<{ id: EmotionId; emoji: string }> = [
  { id: 'angry', emoji: '😠' },
  { id: 'overwhelmed', emoji: '😵‍💫' },
  { id: 'hurt', emoji: '💔' },
  { id: 'anxious', emoji: '😟' },
  { id: 'disappointed', emoji: '😞' }
];

const recipientOptions: Array<{ id: RecipientId; emoji: string }> = [
  { id: 'friend', emoji: '🫶' },
  { id: 'teammate', emoji: '👥' },
  { id: 'teacher', emoji: '🧑‍🏫' },
  { id: 'family', emoji: '🏠' }
];

const toneOptions: ToneId[] = ['gentle', 'direct', 'formal'];

const languageOptions: AppLanguage[] = ['en', 'zh-Hant', 'zh-Hans', 'yue'];

const initialSettings: AISettings = {
  provider: 'openai',
  apiKey: '',
  baseUrl: PROVIDERS.openai.baseUrl,
  model: PROVIDERS.openai.model,
  supportsImages: false
};

function petMoodForStep(step: Step): PetMood {
  switch (step) {
    case 'draft':
      return 'listening';
    case 'checkin':
      return 'checking';
    case 'pause':
      return 'breathing';
    case 'result':
      return 'proud';
    default:
      return 'idle';
  }
}

function ProgressDots({ current, label }: { current: 1 | 2 | 3; label: string }) {
  return (
    <View accessibilityLabel={label} style={styles.progressRow}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={[styles.progressDot, item <= current && styles.progressDotActive]} />
      ))}
    </View>
  );
}

function AppHeader({
  stars,
  onSettings,
  tagline,
  settingsAccessibility
}: {
  stars: number;
  onSettings: () => void;
  tagline: string;
  settingsAccessibility: string;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>Melo</Text>
        <Text numberOfLines={1} style={styles.brandSub}>{tagline}</Text>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.starBadge}>
          <Text style={styles.starEmoji}>✦</Text>
          <Text style={styles.starText}>{stars}</Text>
        </View>
        <Pressable
          accessibilityLabel={settingsAccessibility}
          accessibilityRole="button"
          onPress={onSettings}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
        >
          <Text style={styles.settingsIcon}>⚙︎</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const compactLayout = width < 380;
  const scrollRef = useRef<ScrollView>(null);
  const [surface, setSurface] = useState<AppSurface>('rewrite');
  const [step, setStep] = useState<Step>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings>(initialSettings);
  const [uiLanguage, setUILanguage] = useState<UILanguage>('en');
  const [stars, setStars] = useState(0);
  const [draft, setDraft] = useState('');
  const [emotion, setEmotion] = useState<EmotionId>('overwhelmed');
  const [recipient, setRecipient] = useState<RecipientId>('teammate');
  const [tone, setTone] = useState<ToneId>('gentle');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [pauseSeconds, setPauseSeconds] = useState(12);
  const [generating, setGenerating] = useState(false);
  const generationInFlightRef = useRef(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [rewardedThisRun, setRewardedThisRun] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatSessionMessage[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatFailure, setChatFailure] = useState<ChatFailure | null>(null);
  const [chatHydrated, setChatHydrated] = useState(false);
  const [chatLoadSettled, setChatLoadSettled] = useState(false);
  const [chatStorageFailed, setChatStorageFailed] = useState(false);
  const [pendingChatImage, setPendingChatImage] =
    useState<ChatImageAttachment | null>(null);
  const [chatImagePicking, setChatImagePicking] = useState(false);
  const chatInFlightRef = useRef(false);
  const chatEpochRef = useRef(0);
  const copy = useMemo(() => getTranslations(uiLanguage), [uiLanguage]);

  useEffect(() => {
    void Promise.all([loadAISettings(), loadCalmStars(), loadUILanguage()]).then(([savedSettings, savedStars, savedLanguage]) => {
      if (savedSettings) setSettings(savedSettings);
      setStars(savedStars);
      if (savedLanguage) {
        setUILanguage(savedLanguage);
        setLanguage(uiLanguageToOutputLanguage(savedLanguage));
      }
    });
  }, []);

  useEffect(() => {
    let active = true;
    void loadChatMessages()
      .then((savedMessages) => {
        if (!active) return;
        setChatMessages(savedMessages);
        setChatStorageFailed(false);
        setChatHydrated(true);
        setChatLoadSettled(true);
      })
      .catch(() => {
        if (!active) return;
        console.warn('Melo could not load the device-local chat history.');
        setChatStorageFailed(true);
        setChatLoadSettled(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!chatHydrated) return;
    const retainedImages = chatMessages.flatMap((message) =>
      message.image ? [message.image] : []
    );
    void Promise.all([
      saveChatMessages(chatMessages),
      pruneChatImages(retainedImages)
    ])
      .then(() => setChatStorageFailed(false))
      .catch(() => {
        console.warn('Melo could not save the device-local chat history.');
        setChatStorageFailed(true);
      });
  }, [chatHydrated, chatMessages]);

  useEffect(() => {
    if (settings.supportsImages || !pendingChatImage) return;
    const image = pendingChatImage;
    setPendingChatImage(null);
    void deleteChatImage(image).catch(() => undefined);
  }, [pendingChatImage, settings.supportsImages]);

  useEffect(() => {
    if (step !== 'pause' || pauseSeconds <= 0 || generating) return;
    const timer = setInterval(() => {
      setPauseSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [generating, pauseSeconds, step]);

  useEffect(() => {
    if (step === 'pause' && pauseSeconds === 0 && !generating && !result) {
      void generate();
    }
  }, [generating, pauseSeconds, result, step]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step, surface]);

  useEffect(() => {
    if (surface !== 'chat') return;
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [chatMessages, chatSending, surface]);

  const providerStatus = useMemo(() => {
    if (!settings.apiKey.trim()) return copy.home.offlineReady;
    return copy.home.providerReady(copy.providerNames[settings.provider], settings.model);
  }, [copy, settings]);

  const breathingPhase = useMemo(() => {
    const elapsed = 12 - pauseSeconds;
    if (elapsed < 4) return copy.pause.breatheIn;
    if (elapsed < 6) return copy.pause.hold;
    return copy.pause.breatheOut;
  }, [copy, pauseSeconds]);

  const petLine = copy.pet[step];
  const providerName = copy.providerNames[settings.provider];
  const resultProviderName = result?.providerId
    ? copy.providerNames[result.providerId]
    : null;
  const attemptedProviderName = result?.attemptedProviderId
    ? copy.providerNames[result.attemptedProviderId]
    : null;
  const configuredProviderName = result?.configuredProviderId
    ? copy.providerNames[result.configuredProviderId]
    : null;
  const sourceLabel = result
    ? result.source === 'ai'
      ? resultProviderName ?? result.providerLabel
      : result.source === 'safety'
        ? copy.result.safetyPauseLabel
        : result.providerLabel === 'Safety fallback'
          ? copy.result.safetyFallbackLabel
          : copy.result.offlineLabel
    : '';
  const explanation = result
    ? result.source === 'ai'
      ? copy.result.aiReasons
      : result.source === 'safety'
        ? copy.result.safetyReasons
        : result.providerLabel === 'Safety fallback'
          ? copy.result.safetyFallbackReasons
          : copy.result.fallbackReasons
    : [];
  const providerFallbackBody = (() => {
    if (result?.source !== 'fallback') return null;
    const fallbackProviderName = attemptedProviderName ?? configuredProviderName;
    if (!fallbackProviderName) return null;
    switch (result.fallbackReason) {
      case 'timeout':
        return copy.result.providerTimeoutBody(fallbackProviderName);
      case 'network-error':
        return copy.result.providerNetworkBody(fallbackProviderName);
      case 'http-error':
        return copy.result.providerHttpBody(fallbackProviderName, result.providerHttpStatus);
      case 'invalid-response':
        return copy.result.providerInvalidBody(fallbackProviderName);
      case 'configuration-error':
        return copy.result.providerConfigurationBody(fallbackProviderName);
      case 'unsafe-output':
        return copy.result.providerUnsafeBody(fallbackProviderName);
      default:
        return null;
    }
  })();
  const providerDiagnostic =
    result?.source === 'fallback'
      ? copy.result.providerDiagnostic(
          result.providerHttpStatus,
          result.providerErrorCode,
          result.providerRequestId
        )
      : '';
  const footerText =
    step === 'result' && result
      ? result.source === 'ai' && resultProviderName
        ? copy.footer.ai(resultProviderName)
        : attemptedProviderName
          ? copy.footer.fallback(attemptedProviderName)
          : configuredProviderName
            ? copy.footer.notSent(configuredProviderName)
          : copy.footer.offline
      : settings.apiKey.trim()
        ? copy.footer.configured(providerName)
        : copy.footer.offline;

  const resetRun = () => {
    setDraft('');
    setEmotion('overwhelmed');
    setRecipient('teammate');
    setTone('gentle');
    setLanguage(uiLanguageToOutputLanguage(uiLanguage));
    setPauseSeconds(12);
    setResult(null);
    setRewardedThisRun(false);
    setCopied(false);
    setSurface('rewrite');
    setStep('home');
  };

  const beginPause = () => {
    setPauseSeconds(12);
    setResult(null);
    setCopied(false);
    setStep('pause');
  };

  const generate = async () => {
    if (generationInFlightRef.current) return;
    generationInFlightRef.current = true;
    try {
      setGenerating(true);
      const next = await rewriteMessage(settings, {
        draft,
        emotion,
        recipient,
        tone,
        language
      });
      setResult(next);
      setStep('result');

      if (next.source !== 'safety' && !rewardedThisRun) {
        const updated = stars + 1;
        setStars(updated);
        setRewardedThisRun(true);
        await saveCalmStars(updated);
      }
    } catch {
      Alert.alert(copy.common.errorTitle, copy.common.errorBody);
    } finally {
      generationInFlightRef.current = false;
      setGenerating(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await Clipboard.setStringAsync(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      Alert.alert(copy.common.errorTitle, copy.common.errorBody);
    }
  };

  const shareResult = async () => {
    if (!result) return;
    await Share.share({ message: result.text });
  };

  const runChatRequest = async (history: ChatSessionMessage[]) => {
    if (chatInFlightRef.current) return;
    chatInFlightRef.current = true;
    const requestEpoch = chatEpochRef.current;
    try {
      setChatSending(true);
      setChatFailure(null);
      const next = await chatWithMelo(settings, history, uiLanguage);
      if (requestEpoch !== chatEpochRef.current) return;
      if (next.status === 'unavailable') {
        setChatFailure(next);
        return;
      }
      setChatMessages((current) =>
        limitLocalChatMessages([
          ...current,
          {
            id: nextChatMessageId('assistant'),
            role: 'assistant',
            text: next.text,
            source: next.source,
            expression: next.expression,
            ...(next.providerId ? { providerId: next.providerId } : {}),
            ...(next.model ? { model: next.model } : {}),
            ...(next.providerRequestId
              ? { providerRequestId: next.providerRequestId }
              : {})
          }
        ])
      );
    } catch {
      if (requestEpoch === chatEpochRef.current) {
        setChatFailure({
          status: 'unavailable',
          reason: 'network-error',
          attemptedProviderId: settings.provider
        });
      }
    } finally {
      chatInFlightRef.current = false;
      if (requestEpoch === chatEpochRef.current) setChatSending(false);
    }
  };

  const sendChat = () => {
    const text = chatDraft.trim();
    if (
      (!text && !pendingChatImage) ||
      !chatLoadSettled ||
      chatInFlightRef.current ||
      !settings.apiKey.trim() ||
      (pendingChatImage && !settings.supportsImages)
    ) {
      return;
    }
    const userMessage: ChatSessionMessage = {
      id: nextChatMessageId('user'),
      role: 'user',
      text,
      ...(pendingChatImage ? { image: pendingChatImage } : {})
    };
    const history = limitLocalChatMessages([...chatMessages, userMessage]);
    setChatMessages(history);
    setChatDraft('');
    setPendingChatImage(null);
    setChatFailure(null);
    void runChatRequest(history);
  };

  const retryChat = () => {
    if (
      !chatLoadSettled ||
      chatInFlightRef.current ||
      !settings.apiKey.trim()
    ) {
      return;
    }
    const latest = chatMessages.at(-1);
    if (!latest || latest.role !== 'user') return;
    void runChatRequest(chatMessages);
  };

  const performClearChat = () => {
    chatEpochRef.current += 1;
    setChatMessages([]);
    setChatDraft('');
    setChatFailure(null);
    setChatSending(false);
    setPendingChatImage(null);
    void Promise.all([clearChatMessages(), clearAllChatImages()])
      .then(() => setChatStorageFailed(false))
      .catch(() => {
        console.warn('Melo could not clear every device-local chat item.');
        setChatStorageFailed(true);
      });
  };

  const clearChat = () => {
    Alert.alert(copy.chat.clearConfirmTitle, copy.chat.clearConfirmBody, [
      { text: copy.chat.cancel, style: 'cancel' },
      {
        text: copy.chat.clearConfirm,
        style: 'destructive',
        onPress: performClearChat
      }
    ]);
  };

  const rewriteLatestChatMessage = () => {
    const latest = [...chatMessages]
      .reverse()
      .find((message) => message.role === 'user');
    if (latest) setDraft(latest.text);
    setResult(null);
    setCopied(false);
    setSurface('rewrite');
    setStep('draft');
  };

  const attachChatImage = async () => {
    if (!chatLoadSettled) return;
    if (!settings.supportsImages) {
      Alert.alert(
        copy.settings.imageInputTitle,
        copy.chat.imageNotEnabledBody
      );
      return;
    }
    try {
      setChatImagePicking(true);
      const image = await pickChatImage();
      if (!image) return;
      if (pendingChatImage) await deleteChatImage(pendingChatImage);
      setPendingChatImage(image);
      setChatFailure(null);
    } catch (error) {
      Alert.alert(
        copy.chat.imagePickerErrorTitle,
        error instanceof ChatImageError && error.code === 'too-large'
          ? copy.chat.imageTooLargeBody
          : copy.chat.imagePickerErrorBody
      );
    } finally {
      setChatImagePicking(false);
    }
  };

  const removePendingChatImage = async () => {
    if (!pendingChatImage) return;
    const image = pendingChatImage;
    setPendingChatImage(null);
    try {
      await deleteChatImage(image);
    } catch {
      console.warn('Melo could not remove a pending device-local image.');
    }
  };

  const removeLatestChatImage = async () => {
    const latest = [...chatMessages]
      .reverse()
      .find((message) => message.role === 'user' && message.image);
    if (!latest?.image) return;
    const image = latest.image;
    setChatMessages((current) =>
      current.flatMap((message) => {
        if (message.id !== latest.id) return [message];
        if (!message.text.trim()) return [];
        const { image: _image, ...withoutImage } = message;
        return [withoutImage];
      })
    );
    setChatFailure(null);
    try {
      await deleteChatImage(image);
    } catch {
      console.warn('Melo could not remove a saved device-local image.');
    }
  };

  const saveSettings = async (next: AISettings) => {
    setSettings(next);
    await saveAISettings(next);
  };

  const clearSettings = async () => {
    await clearAISettings();
    setSettings((current) => ({ ...current, apiKey: '' }));
  };

  const changeUILanguage = async (next: UILanguage) => {
    setUILanguage(next);
    if (step === 'home' && !draft.trim()) {
      setLanguage(uiLanguageToOutputLanguage(next));
    }
    await saveUILanguage(next);
  };

  const mood = petMoodForStep(step);

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <AppHeader
            stars={stars}
            tagline={copy.brandTagline}
            settingsAccessibility={copy.settingsAccessibility}
            onSettings={() => setSettingsOpen(true)}
          />

          {surface === 'chat' ? (
            <MeloChat
              copy={copy}
              messages={chatMessages}
              draft={chatDraft}
              sending={chatSending}
              failure={chatFailure}
              memoryReady={chatLoadSettled}
              memoryUnavailable={chatStorageFailed}
              pendingImage={pendingChatImage}
              imageInputEnabled={settings.supportsImages}
              imagePicking={chatImagePicking}
              stars={stars}
              providerName={providerName}
              providerConfigured={settings.apiKey.trim().length > 0}
              onDraftChange={setChatDraft}
              onSend={sendChat}
              onRetry={retryChat}
              onClear={clearChat}
              onAttachImage={() => void attachChatImage()}
              onRemoveImage={() => void removePendingChatImage()}
              onRemoveLatestImage={() => void removeLatestChatImage()}
              onConfigure={() => setSettingsOpen(true)}
              onBack={() => setSurface('rewrite')}
              onRewriteLatest={rewriteLatestChatMessage}
            />
          ) : (
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.petSection}>
                <MeloPet mood={mood} size={step === 'home' ? 136 : 104} stars={stars} />
                <View style={styles.speechBubble}>
                  <Text style={styles.speechText}>{petLine}</Text>
                </View>
              </View>

              {step === 'home' ? (
                <View style={styles.panel}>
                  <Text style={styles.heroTitle}>{copy.home.heroTitle}</Text>
                  <Text style={styles.bodyText}>{copy.home.body}</Text>

                  <PrimaryButton label={copy.home.start} onPress={() => setStep('draft')} />
                  <PrimaryButton
                    label={copy.home.chat}
                    variant="secondary"
                    onPress={() => setSurface('chat')}
                  />

                  <View style={styles.statusCard}>
                    <View style={[styles.statusDot, settings.apiKey ? styles.statusDotOnline : null]} />
                    <View style={styles.statusCopy}>
                      <Text style={styles.statusTitle}>{providerStatus}</Text>
                      <Text style={styles.statusSub}>
                        {settings.apiKey
                          ? copy.home.aiStatus
                          : copy.home.offlineStatus}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.noGuiltCard}>
                    <Text style={styles.noGuiltTitle}>{copy.home.noGuiltTitle}</Text>
                    <Text style={styles.noGuiltText}>{copy.home.noGuiltBody}</Text>
                  </View>
                </View>
              ) : null}
          {step === 'draft' ? (
            <View style={styles.panel}>
              <ProgressDots current={1} label={copy.progress(1)} />
              <Text style={styles.stepEyebrow}>{copy.draft.eyebrow}</Text>
              <Text style={styles.stepTitle}>{copy.draft.title}</Text>
              <Text style={styles.bodyText}>{copy.draft.body}</Text>
              <TextInput
                accessibilityLabel={copy.draft.accessibility}
                multiline
                maxLength={1200}
                placeholder={copy.draft.placeholder}
                placeholderTextColor={colors.inkMuted}
                value={draft}
                onChangeText={setDraft}
                style={styles.draftInput}
                textAlignVertical="top"
              />
              <View style={styles.inputMeta}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setDraft(copy.draft.sample)}
                  style={({ pressed }) => [styles.demoAction, pressed && styles.pressed]}
                >
                  <Text style={styles.textAction}>{copy.draft.demo}</Text>
                </Pressable>
                <Text style={styles.charCount}>{draft.length}/1200</Text>
              </View>
              <View style={[styles.inlineButtons, compactLayout && styles.compactButtonStack]}>
                <PrimaryButton label={copy.common.back} variant="ghost" onPress={() => setStep('home')} style={styles.flexButton} />
                <PrimaryButton
                  label={copy.draft.continue}
                  onPress={() => setStep('checkin')}
                  disabled={draft.trim().length < 5}
                  style={styles.flexButton}
                />
              </View>
            </View>
          ) : null}

          {step === 'checkin' ? (
            <View style={styles.panel}>
              <ProgressDots current={2} label={copy.progress(2)} />
              <Text style={styles.stepEyebrow}>{copy.checkin.eyebrow}</Text>
              <Text style={styles.stepTitle}>{copy.checkin.title}</Text>

              <Text style={styles.groupLabel}>{copy.checkin.emotion}</Text>
              <View style={styles.chipWrap}>
                {emotionOptions.map((option) => (
                  <ChoiceChip
                    key={option.id}
                    emoji={option.emoji}
                    label={copy.emotions[option.id]}
                    selected={emotion === option.id}
                    onPress={() => setEmotion(option.id)}
                  />
                ))}
              </View>

              <Text style={styles.groupLabel}>{copy.checkin.recipient}</Text>
              <View style={styles.chipWrap}>
                {recipientOptions.map((option) => (
                  <ChoiceChip
                    key={option.id}
                    emoji={option.emoji}
                    label={copy.recipients[option.id]}
                    selected={recipient === option.id}
                    onPress={() => setRecipient(option.id)}
                  />
                ))}
              </View>

              <Text style={styles.groupLabel}>{copy.checkin.tone}</Text>
              <View style={styles.chipWrap}>
                {toneOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={copy.tones[option]}
                    selected={tone === option}
                    onPress={() => setTone(option)}
                  />
                ))}
              </View>

              <Text style={styles.groupLabel}>{copy.checkin.outputLanguage}</Text>
              <View style={styles.chipWrap}>
                {languageOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={copy.outputLanguages[option]}
                    selected={language === option}
                    onPress={() => setLanguage(option)}
                  />
                ))}
              </View>

              <View style={styles.dataNotice}>
                <Text style={styles.dataNoticeTitle}>
                  {settings.apiKey ? copy.checkin.aiMode(providerName) : copy.checkin.offlineMode}
                </Text>
                <Text style={styles.dataNoticeText}>
                  {settings.apiKey
                    ? copy.checkin.aiNotice(providerName)
                    : copy.checkin.offlineNotice}
                </Text>
              </View>

              <View style={[styles.inlineButtons, compactLayout && styles.compactButtonStack]}>
                <PrimaryButton label={copy.common.back} variant="ghost" onPress={() => setStep('draft')} style={styles.flexButton} />
                <PrimaryButton label={copy.checkin.pause} onPress={beginPause} style={styles.flexButton} />
              </View>
            </View>
          ) : null}

          {step === 'pause' ? (
            <View style={[styles.panel, styles.pausePanel]}>
              <ProgressDots current={3} label={copy.progress(3)} />
              <Text style={styles.stepEyebrow}>{copy.pause.eyebrow}</Text>
              <Text style={styles.breathingPhase}>{generating ? copy.pause.generating : breathingPhase}</Text>
              <Text style={styles.countdown}>{generating ? 'AI' : pauseSeconds}</Text>
              <Text style={styles.bodyTextCentered}>{copy.pause.body}</Text>
              <PrimaryButton
                label={generating ? copy.pause.generating : copy.pause.skip}
                variant="secondary"
                loading={generating}
                onPress={() => {
                  setPauseSeconds(0);
                }}
              />
              <PrimaryButton
                label={copy.common.back}
                variant="ghost"
                disabled={generating}
                onPress={() => setStep('checkin')}
              />
            </View>
          ) : null}

          {step === 'result' && result ? (
            <View style={styles.panel}>
              <View style={styles.resultHeader}>
                <View style={styles.resultTitleCopy}>
                  <Text style={styles.stepEyebrow}>{copy.result.eyebrow}</Text>
                  <Text style={styles.stepTitle}>{copy.result.title}</Text>
                </View>
                <View
                  style={[
                    styles.sourceBadge,
                    result.source === 'fallback' && styles.sourceBadgeWarning,
                    result.source === 'safety' && styles.sourceBadgeDanger
                  ]}
                >
                  <Text
                    style={[
                      styles.sourceText,
                      result.source === 'fallback' && styles.sourceTextWarning,
                      result.source === 'safety' && styles.sourceTextDanger
                    ]}
                  >
                    {sourceLabel}
                  </Text>
                </View>
              </View>

              {result.source === 'safety' ? (
                <View style={styles.safetyCard}>
                  <Text style={styles.safetyTitle}>{copy.result.safetyTitle}</Text>
                  <Text style={styles.safetyBody}>{copy.result.safetyBody}</Text>
                </View>
              ) : null}

              {providerFallbackBody ? (
                <View style={styles.providerFallbackCard}>
                  <Text style={styles.providerFallbackTitle}>{copy.result.providerFallbackTitle}</Text>
                  <Text style={styles.providerFallbackBody}>{providerFallbackBody}</Text>
                  {providerDiagnostic ? (
                    <Text selectable style={styles.providerFallbackDiagnostic}>
                      {providerDiagnostic}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <Text style={styles.groupLabel}>{copy.result.before}</Text>
              <View style={styles.beforeCard}>
                <Text selectable style={styles.beforeText}>
                  {draft}
                </Text>
              </View>

              <Text style={styles.groupLabel}>{copy.result.after}</Text>
              <View style={styles.resultCard}>
                <Text selectable style={styles.resultText}>
                  {result.text}
                </Text>
              </View>

              <View style={[styles.inlineButtons, compactLayout && styles.compactButtonStack]}>
                <PrimaryButton
                  label={copied ? `✓ ${copy.result.copiedTitle}` : copy.result.copy}
                  onPress={copyResult}
                  style={styles.flexButton}
                />
                <PrimaryButton label={copy.result.share} variant="secondary" onPress={shareResult} style={styles.flexButton} />
              </View>

              {result.source !== 'safety' ? (
                <View style={styles.rewardCard}>
                  <Text style={styles.rewardTitle}>{copy.result.rewardTitle}</Text>
                  <Text style={styles.rewardText}>{copy.result.rewardBody(stars)}</Text>
                </View>
              ) : null}

              <Text style={styles.groupLabel}>{copy.result.why}</Text>
              <View style={styles.reasonList}>
                {explanation.map((item) => (
                  <View key={item} style={styles.reasonRow}>
                    <Text style={styles.reasonBullet}>✓</Text>
                    <Text style={styles.reasonText}>{item}</Text>
                  </View>
                ))}
              </View>

              <PrimaryButton
                label={copy.result.retry}
                variant="ghost"
                onPress={() => {
                  setResult(null);
                  setStep('checkin');
                }}
              />
              <PrimaryButton label={copy.result.restart} variant="ghost" onPress={resetRun} />
            </View>
          ) : null}

              <Text style={styles.footerNote}>{footerText}</Text>
            </ScrollView>
          )}
        </KeyboardAvoidingView>

        <AISettingsModal
          visible={settingsOpen}
          value={settings}
          language={uiLanguage}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
          onClear={clearSettings}
          onLanguageChange={changeUILanguage}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: { color: colors.ink, fontSize: 26, fontWeight: '900', letterSpacing: -0.6 },
  brandSub: { color: colors.inkMuted, fontSize: 11, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  starBadge: {
    height: 42,
    minWidth: 58,
    paddingHorizontal: 12,
    borderRadius: 21,
    backgroundColor: colors.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  starEmoji: { color: '#9B7410', fontSize: 16 },
  starText: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingsIcon: { color: colors.ink, fontSize: 21, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 36, alignItems: 'center' },
  petSection: { width: '100%', maxWidth: 600, alignItems: 'center', marginTop: 2, marginBottom: 12 },
  speechBubble: {
    maxWidth: 330,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  speechText: { color: colors.ink, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  panel: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3
  },
  heroTitle: { color: colors.ink, fontSize: 28, lineHeight: 35, fontWeight: '800' },
  bodyText: { color: colors.inkMuted, fontSize: 15, lineHeight: 22 },
  bodyTextCentered: { color: colors.inkMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 14,
    gap: 12
  },
  statusDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.inkMuted },
  statusDotOnline: { backgroundColor: colors.mintStrong },
  statusCopy: { flex: 1 },
  statusTitle: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  statusSub: { color: colors.inkMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  noGuiltCard: { backgroundColor: colors.mint, borderRadius: radius.md, padding: 14 },
  noGuiltTitle: { color: colors.success, fontWeight: '800', fontSize: 14 },
  noGuiltText: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 4 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  progressDot: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.primary },
  stepEyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1.1 },
  stepTitle: { color: colors.ink, fontSize: 26, lineHeight: 32, fontWeight: '900', letterSpacing: -0.5 },
  draftInput: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 23,
    padding: 15
  },
  inputMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  demoAction: { minHeight: 44, justifyContent: 'center', paddingRight: 12 },
  textAction: { color: colors.primaryDark, fontWeight: '800', fontSize: 13 },
  charCount: { color: colors.inkMuted, fontSize: 12 },
  inlineButtons: { flexDirection: 'row', gap: 10 },
  compactButtonStack: { flexDirection: 'column' },
  flexButton: { flex: 1 },
  groupLabel: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 3 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dataNotice: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 14 },
  dataNoticeTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  dataNoticeText: { color: colors.inkMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  pausePanel: { alignItems: 'stretch' },
  breathingPhase: { color: colors.primaryDark, fontWeight: '900', fontSize: 25, textAlign: 'center', marginTop: 4 },
  countdown: { color: colors.ink, fontWeight: '900', fontSize: 54, textAlign: 'center', lineHeight: 62 },
  resultHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  resultTitleCopy: { flex: 1, minWidth: 210 },
  sourceBadge: { backgroundColor: colors.mint, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  sourceBadgeWarning: { backgroundColor: colors.peach },
  sourceBadgeDanger: { backgroundColor: colors.dangerSoft },
  sourceText: { color: colors.success, fontWeight: '800', fontSize: 11 },
  sourceTextWarning: { color: colors.peachStrong },
  sourceTextDanger: { color: colors.danger },
  safetyCard: { backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: 15 },
  safetyTitle: { color: colors.danger, fontWeight: '900', fontSize: 15 },
  safetyBody: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 4 },
  providerFallbackCard: { backgroundColor: colors.peach, borderRadius: radius.md, padding: 15 },
  providerFallbackTitle: { color: colors.peachStrong, fontWeight: '900', fontSize: 15 },
  providerFallbackBody: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 4 },
  providerFallbackDiagnostic: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    fontWeight: '700'
  },
  beforeCard: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 15 },
  beforeText: { color: colors.inkMuted, fontSize: 15, lineHeight: 22 },
  resultCard: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 17 },
  resultText: { color: colors.ink, fontSize: 17, lineHeight: 26, fontWeight: '600' },
  rewardCard: { backgroundColor: colors.yellow, borderRadius: radius.md, padding: 14 },
  rewardTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  rewardText: { color: colors.inkMuted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  reasonList: { gap: 9 },
  reasonRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  reasonBullet: { color: colors.success, fontWeight: '900', fontSize: 16 },
  reasonText: { flex: 1, color: colors.inkMuted, fontSize: 13, lineHeight: 19 },
  footerNote: { width: '100%', maxWidth: 600, color: colors.inkMuted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 16, paddingHorizontal: 12 }
});
