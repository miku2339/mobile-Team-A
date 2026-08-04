import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';

import { AISettingsModal } from './src/components/AISettingsModal';
import { ChoiceChip } from './src/components/ChoiceChip';
import { MeloPet } from './src/components/MeloPet';
import { PrimaryButton } from './src/components/PrimaryButton';
import { PROVIDERS } from './src/config/providers';
import { rewriteMessage } from './src/services/ai';
import {
  clearAISettings,
  loadAISettings,
  loadCalmStars,
  saveAISettings,
  saveCalmStars
} from './src/services/storage';
import { colors, radius } from './src/theme';
import type {
  AISettings,
  AppLanguage,
  EmotionId,
  PetMood,
  RecipientId,
  RewriteResult,
  ToneId
} from './src/types';

type Step = 'home' | 'draft' | 'checkin' | 'pause' | 'result';

const emotionOptions: Array<{ id: EmotionId; label: string; emoji: string }> = [
  { id: 'angry', label: 'Angry', emoji: '😠' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵‍💫' },
  { id: 'hurt', label: 'Hurt', emoji: '💔' },
  { id: 'anxious', label: 'Anxious', emoji: '😟' },
  { id: 'disappointed', label: 'Disappointed', emoji: '😞' }
];

const recipientOptions: Array<{ id: RecipientId; label: string; emoji: string }> = [
  { id: 'friend', label: 'Friend', emoji: '🫶' },
  { id: 'teammate', label: 'Teammate', emoji: '👥' },
  { id: 'teacher', label: 'Teacher', emoji: '🧑‍🏫' },
  { id: 'family', label: 'Family', emoji: '🏠' }
];

const toneOptions: Array<{ id: ToneId; label: string }> = [
  { id: 'gentle', label: 'Gentle' },
  { id: 'direct', label: 'Direct' },
  { id: 'formal', label: 'Formal' }
];

const languageOptions: Array<{ id: AppLanguage; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'zh-Hant', label: '繁體中文' },
  { id: 'yue', label: '廣東話' }
];

const initialSettings: AISettings = {
  provider: 'openai',
  apiKey: '',
  baseUrl: PROVIDERS.openai.baseUrl,
  model: PROVIDERS.openai.model
};

const sampleDraft = 'You never do any work. I am done with this group project.';

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

function petLineForStep(step: Step): string {
  switch (step) {
    case 'draft':
      return 'Tell me what you almost sent. I will not judge.';
    case 'checkin':
      return 'Naming the feeling helps create a little space.';
    case 'pause':
      return 'Breathe with me. We can answer after the feeling slows down.';
    case 'result':
      return 'You made room for a kinder and clearer next step.';
    default:
      return 'I’m Melo. I help you pause before a difficult message.';
  }
}

function ProgressDots({ current }: { current: 1 | 2 | 3 }) {
  return (
    <View accessibilityLabel={`Step ${current} of 3`} style={styles.progressRow}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={[styles.progressDot, item <= current && styles.progressDotActive]} />
      ))}
    </View>
  );
}

function AppHeader({
  stars,
  onSettings
}: {
  stars: number;
  onSettings: () => void;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>Melo</Text>
        <Text style={styles.brandSub}>Pause. Breathe. Say it better.</Text>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.starBadge}>
          <Text style={styles.starEmoji}>✦</Text>
          <Text style={styles.starText}>{stars}</Text>
        </View>
        <Pressable
          accessibilityLabel="Open AI settings"
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
  const [step, setStep] = useState<Step>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings>(initialSettings);
  const [stars, setStars] = useState(0);
  const [draft, setDraft] = useState('');
  const [emotion, setEmotion] = useState<EmotionId>('overwhelmed');
  const [recipient, setRecipient] = useState<RecipientId>('teammate');
  const [tone, setTone] = useState<ToneId>('gentle');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [pauseSeconds, setPauseSeconds] = useState(12);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [rewardedThisRun, setRewardedThisRun] = useState(false);

  useEffect(() => {
    void Promise.all([loadAISettings(), loadCalmStars()]).then(([savedSettings, savedStars]) => {
      if (savedSettings) setSettings(savedSettings);
      setStars(savedStars);
    });
  }, []);

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

  const providerStatus = useMemo(() => {
    if (!settings.apiKey.trim()) return 'Offline fallback ready';
    return `${PROVIDERS[settings.provider].label} · ${settings.model}`;
  }, [settings]);

  const breathingPhase = useMemo(() => {
    const elapsed = 12 - pauseSeconds;
    if (elapsed < 4) return 'Breathe in';
    if (elapsed < 6) return 'Hold';
    return 'Breathe out';
  }, [pauseSeconds]);

  const resetRun = () => {
    setDraft('');
    setEmotion('overwhelmed');
    setRecipient('teammate');
    setTone('gentle');
    setLanguage('en');
    setPauseSeconds(12);
    setResult(null);
    setRewardedThisRun(false);
    setStep('home');
  };

  const beginPause = () => {
    setPauseSeconds(12);
    setResult(null);
    setStep('pause');
  };

  const generate = async () => {
    if (generating) return;
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
      Alert.alert('Something went wrong', 'Please try again. Melo can also work without an API key.');
    } finally {
      setGenerating(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await Clipboard.setStringAsync(result.text);
    Alert.alert('Copied', 'The message is ready to paste.');
  };

  const shareResult = async () => {
    if (!result) return;
    await Share.share({ message: result.text });
  };

  const saveSettings = async (next: AISettings) => {
    setSettings(next);
    await saveAISettings(next);
  };

  const clearSettings = async () => {
    await clearAISettings();
    setSettings((current) => ({ ...current, apiKey: '' }));
  };

  const mood = petMoodForStep(step);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader stars={stars} onSettings={() => setSettingsOpen(true)} />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.petSection}>
            <MeloPet mood={mood} size={step === 'home' ? 150 : 112} stars={stars} />
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{petLineForStep(step)}</Text>
            </View>
          </View>

          {step === 'home' ? (
            <View style={styles.panel}>
              <Text style={styles.heroTitle}>Before you send it, give yourself one pause.</Text>
              <Text style={styles.bodyText}>
                Melo helps students turn an emotional draft into a calmer, clearer message—without
                pretending to be a therapist.
              </Text>

              <View style={styles.statusCard}>
                <View style={[styles.statusDot, settings.apiKey ? styles.statusDotOnline : null]} />
                <View style={styles.statusCopy}>
                  <Text style={styles.statusTitle}>{providerStatus}</Text>
                  <Text style={styles.statusSub}>
                    {settings.apiKey
                      ? 'Your selected provider will rewrite the message.'
                      : 'Add your own API key, or demonstrate the built-in safe template.'}
                  </Text>
                </View>
              </View>

              <PrimaryButton label="Start a calm rewrite" onPress={() => setStep('draft')} />
              <PrimaryButton
                label="Configure AI provider"
                variant="secondary"
                onPress={() => setSettingsOpen(true)}
              />

              <View style={styles.noGuiltCard}>
                <Text style={styles.noGuiltTitle}>✦ Calm Stars, not streak pressure</Text>
                <Text style={styles.noGuiltText}>
                  The virtual pet celebrates completed pauses. It never gets sick, hungry or sad when
                  the user takes a break from the app.
                </Text>
              </View>
            </View>
          ) : null}

          {step === 'draft' ? (
            <View style={styles.panel}>
              <ProgressDots current={1} />
              <Text style={styles.stepEyebrow}>STEP 1</Text>
              <Text style={styles.stepTitle}>What were you about to send?</Text>
              <Text style={styles.bodyText}>
                Paste the original draft. Melo will preserve the intent, not the hurtful wording.
              </Text>
              <TextInput
                accessibilityLabel="Original message draft"
                multiline
                maxLength={1200}
                placeholder="Type or paste a difficult message…"
                placeholderTextColor={colors.inkMuted}
                value={draft}
                onChangeText={setDraft}
                style={styles.draftInput}
                textAlignVertical="top"
              />
              <View style={styles.inputMeta}>
                <Pressable onPress={() => setDraft(sampleDraft)}>
                  <Text style={styles.textAction}>Use demo example</Text>
                </Pressable>
                <Text style={styles.charCount}>{draft.length}/1200</Text>
              </View>
              <View style={styles.inlineButtons}>
                <PrimaryButton label="Back" variant="ghost" onPress={() => setStep('home')} style={styles.flexButton} />
                <PrimaryButton
                  label="Continue"
                  onPress={() => setStep('checkin')}
                  disabled={draft.trim().length < 5}
                  style={styles.flexButton}
                />
              </View>
            </View>
          ) : null}

          {step === 'checkin' ? (
            <View style={styles.panel}>
              <ProgressDots current={2} />
              <Text style={styles.stepEyebrow}>STEP 2</Text>
              <Text style={styles.stepTitle}>Give the message some context.</Text>

              <Text style={styles.groupLabel}>How are you feeling?</Text>
              <View style={styles.chipWrap}>
                {emotionOptions.map((option) => (
                  <ChoiceChip
                    key={option.id}
                    emoji={option.emoji}
                    label={option.label}
                    selected={emotion === option.id}
                    onPress={() => setEmotion(option.id)}
                  />
                ))}
              </View>

              <Text style={styles.groupLabel}>Who will receive it?</Text>
              <View style={styles.chipWrap}>
                {recipientOptions.map((option) => (
                  <ChoiceChip
                    key={option.id}
                    emoji={option.emoji}
                    label={option.label}
                    selected={recipient === option.id}
                    onPress={() => setRecipient(option.id)}
                  />
                ))}
              </View>

              <Text style={styles.groupLabel}>Preferred tone</Text>
              <View style={styles.chipWrap}>
                {toneOptions.map((option) => (
                  <ChoiceChip
                    key={option.id}
                    label={option.label}
                    selected={tone === option.id}
                    onPress={() => setTone(option.id)}
                  />
                ))}
              </View>

              <Text style={styles.groupLabel}>Output language</Text>
              <View style={styles.chipWrap}>
                {languageOptions.map((option) => (
                  <ChoiceChip
                    key={option.id}
                    label={option.label}
                    selected={language === option.id}
                    onPress={() => setLanguage(option.id)}
                  />
                ))}
              </View>

              <View style={styles.inlineButtons}>
                <PrimaryButton label="Back" variant="ghost" onPress={() => setStep('draft')} style={styles.flexButton} />
                <PrimaryButton label="Pause with Melo" onPress={beginPause} style={styles.flexButton} />
              </View>
            </View>
          ) : null}

          {step === 'pause' ? (
            <View style={[styles.panel, styles.pausePanel]}>
              <ProgressDots current={3} />
              <Text style={styles.stepEyebrow}>STEP 3</Text>
              <Text style={styles.breathingPhase}>{generating ? 'Finding better words…' : breathingPhase}</Text>
              <Text style={styles.countdown}>{generating ? 'AI' : pauseSeconds}</Text>
              <Text style={styles.bodyTextCentered}>
                One short reset can interrupt an impulsive send. This demo uses a 12-second cycle.
              </Text>
              <PrimaryButton
                label={generating ? 'Generating…' : 'Skip breathing for demo'}
                variant="secondary"
                loading={generating}
                onPress={() => {
                  setPauseSeconds(0);
                  void generate();
                }}
              />
              <PrimaryButton
                label="Back"
                variant="ghost"
                disabled={generating}
                onPress={() => setStep('checkin')}
              />
            </View>
          ) : null}

          {step === 'result' && result ? (
            <View style={styles.panel}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.stepEyebrow}>READY TO REVIEW</Text>
                  <Text style={styles.stepTitle}>A calmer version</Text>
                </View>
                <View
                  style={[
                    styles.sourceBadge,
                    result.source === 'safety' && styles.sourceBadgeDanger
                  ]}
                >
                  <Text
                    style={[
                      styles.sourceText,
                      result.source === 'safety' && styles.sourceTextDanger
                    ]}
                  >
                    {result.providerLabel}
                  </Text>
                </View>
              </View>

              {result.source === 'safety' ? (
                <View style={styles.safetyCard}>
                  <Text style={styles.safetyTitle}>Please get real-world support now</Text>
                  <Text style={styles.safetyBody}>
                    Contact someone you trust or local emergency services. Melo is not a crisis service,
                    diagnosis tool or replacement for professional support.
                  </Text>
                </View>
              ) : null}

              <View style={styles.resultCard}>
                <Text selectable style={styles.resultText}>
                  {result.text}
                </Text>
              </View>

              <Text style={styles.groupLabel}>Why this is healthier</Text>
              <View style={styles.reasonList}>
                {result.explanation.map((item) => (
                  <View key={item} style={styles.reasonRow}>
                    <Text style={styles.reasonBullet}>✓</Text>
                    <Text style={styles.reasonText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.inlineButtons}>
                <PrimaryButton label="Copy" onPress={copyResult} style={styles.flexButton} />
                <PrimaryButton label="Share" variant="secondary" onPress={shareResult} style={styles.flexButton} />
              </View>
              <PrimaryButton
                label="Try another tone"
                variant="ghost"
                onPress={() => {
                  setResult(null);
                  setStep('checkin');
                }}
              />
              <PrimaryButton label="Start over" variant="ghost" onPress={resetRun} />
            </View>
          ) : null}

          <Text style={styles.footerNote}>
            Prototype only · No diagnosis · Drafts are not intentionally stored by the app
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <AISettingsModal
        visible={settingsOpen}
        value={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={saveSettings}
        onClear={clearSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingsIcon: { color: colors.ink, fontSize: 21, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 36 },
  petSection: { alignItems: 'center', marginTop: 2, marginBottom: 12 },
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
  heroTitle: { color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: '900', letterSpacing: -0.7 },
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
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 23,
    padding: 15
  },
  inputMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textAction: { color: colors.primaryDark, fontWeight: '800', fontSize: 13 },
  charCount: { color: colors.inkMuted, fontSize: 12 },
  inlineButtons: { flexDirection: 'row', gap: 10 },
  flexButton: { flex: 1 },
  groupLabel: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 3 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pausePanel: { alignItems: 'stretch' },
  breathingPhase: { color: colors.primaryDark, fontWeight: '900', fontSize: 25, textAlign: 'center', marginTop: 4 },
  countdown: { color: colors.ink, fontWeight: '900', fontSize: 54, textAlign: 'center', lineHeight: 62 },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  sourceBadge: { backgroundColor: colors.mint, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  sourceBadgeDanger: { backgroundColor: colors.dangerSoft },
  sourceText: { color: colors.success, fontWeight: '800', fontSize: 11 },
  sourceTextDanger: { color: colors.danger },
  safetyCard: { backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: 15 },
  safetyTitle: { color: colors.danger, fontWeight: '900', fontSize: 15 },
  safetyBody: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 4 },
  resultCard: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 17 },
  resultText: { color: colors.ink, fontSize: 17, lineHeight: 26, fontWeight: '600' },
  reasonList: { gap: 9 },
  reasonRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  reasonBullet: { color: colors.success, fontWeight: '900', fontSize: 16 },
  reasonText: { flex: 1, color: colors.inkMuted, fontSize: 13, lineHeight: 19 },
  footerNote: { color: colors.inkMuted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 16, paddingHorizontal: 12 }
});
