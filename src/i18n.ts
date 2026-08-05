import type {
  AppLanguage,
  EmotionId,
  ProviderId,
  RecipientId,
  ToneId,
  UILanguage
} from './types';
import type { AlibabaRegion } from './config/alibaba';

export interface UiCopy {
  languageName: string;
  brandTagline: string;
  settingsAccessibility: string;
  progress: (current: number) => string;
  pet: {
    home: string;
    draft: string;
    checkin: string;
    pause: string;
    result: string;
    chat: string;
  };
  common: {
    back: string;
    errorTitle: string;
    errorBody: string;
  };
  home: {
    heroTitle: string;
    body: string;
    connectionLabel: string;
    calmStarsLabel: string;
    offlineReady: string;
    providerReady: (provider: string, model: string) => string;
    offlineStatus: string;
    aiStatus: string;
    start: string;
    chat: string;
    configure: string;
    noGuiltTitle: string;
    noGuiltBody: string;
    petTapAccessibility: string;
    petTapLines: [string, string, string];
  };
  chat: {
    eyebrow: string;
    title: string;
    body: string;
    sessionNotice: string;
    notTherapyNotice: string;
    emptyTitle: string;
    emptyBody: string;
    quickPrompts: [string, string];
    inputLabel: string;
    placeholder: string;
    send: string;
    sending: string;
    clear: string;
    clearConfirmTitle: string;
    clearConfirmBody: string;
    clearConfirm: string;
    cancel: string;
    memoryLoading: string;
    memoryUnavailable: string;
    configure: string;
    rewriteOffline: string;
    rewriteLatest: string;
    you: string;
    melo: string;
    aiMode: (provider: string) => string;
    offlineMode: string;
    aiLabel: (provider: string, model?: string) => string;
    safetyLabel: string;
    unavailableTitle: string;
    noKeyBody: string;
    timeoutBody: (provider: string) => string;
    networkBody: (provider: string) => string;
    httpBody: (provider: string, status?: number) => string;
    invalidBody: (provider: string) => string;
    configurationBody: (provider: string) => string;
    unsafeBody: (provider: string) => string;
    retry: string;
    attachImage: string;
    removeImage: string;
    imageLabel: string;
    imageDisabled: string;
    imageDefaultMessage: string;
    imagePickerErrorTitle: string;
    imagePickerErrorBody: string;
    imageTooLargeBody: string;
    attachmentBody: string;
    imageNotEnabledBody: string;
  };
  draft: {
    eyebrow: string;
    title: string;
    body: string;
    accessibility: string;
    placeholder: string;
    demo: string;
    continue: string;
    sample: string;
  };
  checkin: {
    eyebrow: string;
    title: string;
    emotion: string;
    recipient: string;
    tone: string;
    outputLanguage: string;
    aiMode: (provider: string) => string;
    offlineMode: string;
    aiNotice: (provider: string) => string;
    offlineNotice: string;
    pause: string;
  };
  pause: {
    eyebrow: string;
    generating: string;
    breatheIn: string;
    hold: string;
    breatheOut: string;
    body: string;
    skip: string;
  };
  result: {
    eyebrow: string;
    title: string;
    safetyTitle: string;
    safetyBody: string;
    providerFallbackTitle: string;
    providerTimeoutBody: (provider: string) => string;
    providerNetworkBody: (provider: string) => string;
    providerHttpBody: (provider: string, status?: number) => string;
    providerInvalidBody: (provider: string) => string;
    providerConfigurationBody: (provider: string) => string;
    providerUnsafeBody: (provider: string) => string;
    providerDiagnostic: (status?: number, code?: string, requestId?: string) => string;
    before: string;
    after: string;
    rewardTitle: string;
    rewardBody: (stars: number) => string;
    why: string;
    copy: string;
    share: string;
    retry: string;
    restart: string;
    copiedTitle: string;
    copiedBody: string;
    offlineLabel: string;
    safetyPauseLabel: string;
    safetyFallbackLabel: string;
    aiReasons: string[];
    fallbackReasons: string[];
    safetyReasons: string[];
    safetyFallbackReasons: string[];
  };
  settings: {
    pageTitle: string;
    languageEyebrow: string;
    languageTitle: string;
    languageBody: string;
    aiEyebrow: string;
    title: string;
    noticeTitle: string;
    noticeBody: string;
    provider: string;
    alibabaCloud: string;
    alibabaPlanTitle: string;
    alibabaPlanBody: string;
    alibabaRegionTitle: string;
    alibabaRegionBody: string;
    restrictedPlanTitle: string;
    restrictedPlanBody: string;
    detailsTitle: string;
    detailsConfigured: (model: string) => string;
    detailsEmpty: string;
    detailsShow: string;
    detailsHide: string;
    planServerTitle: string;
    planServerSummary: (plan: string, region: string) => string;
    privacyNoteNative: string;
    privacyNoteWeb: string;
    keyPlanMismatchTitle: string;
    keyPlanMismatchBody: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    baseUrl: string;
    modelId: string;
    modelPlaceholder: string;
    imageInputTitle: string;
    imageInputBody: string;
    imageInputOn: string;
    imageInputOff: string;
    show: string;
    hide: string;
    prototypeTitle: string;
    prototypeBody: string;
    save: string;
    clear: string;
    close: string;
    missingBaseUrlTitle: string;
    missingBaseUrlBody: string;
    unsafeUrlTitle: string;
    unsafeUrlBody: string;
    unexpectedProviderHostTitle: string;
    unexpectedProviderHostBody: string;
    missingModelTitle: string;
    missingModelBody: string;
    keyClearedTitle: string;
    keyClearedBody: string;
  };
  emotions: Record<EmotionId, string>;
  recipients: Record<RecipientId, string>;
  tones: Record<ToneId, string>;
  outputLanguages: Record<AppLanguage, string>;
  providerNames: Record<ProviderId, string>;
  providerNotes: Record<ProviderId, string>;
  regions: Record<AlibabaRegion, string>;
}

export const uiLanguageOptions: Array<{ id: UILanguage; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'zh-Hant', label: '繁體中文' },
  { id: 'zh-Hans', label: '简体中文' }
];

const commonProviderNames: Record<ProviderId, string> = {
  openai: 'OpenAI',
  'google-ai-studio': 'Google AI Studio',
  deepseek: 'DeepSeek',
  kimi: 'Kimi',
  minimax: 'MiniMax',
  bailian: 'Alibaba Cloud · Pay-as-you-go',
  'bailian-coding': 'Alibaba Cloud · Coding Plan',
  'bailian-token': 'Alibaba Cloud · Token Plan',
  bigmodel: 'Z.ai BigModel',
  custom: 'Custom API'
};

const translations: Record<UILanguage, UiCopy> = {
  en: {
    languageName: 'English',
    brandTagline: 'Pause. Breathe. Say it better.',
    settingsAccessibility: 'Open settings',
    progress: (current) => `Step ${current} of 3`,
    pet: {
      home: 'I’m Melo. I help you pause before a difficult message.',
      draft: 'Tell me what you almost sent. I will not judge.',
      checkin: 'Naming the feeling helps create a little space.',
      pause: 'Breathe with me. We can answer after the feeling slows down.',
      result: 'You made room for a kinder and clearer next step.',
      chat: 'We can sort through one thought at a time.'
    },
    common: {
      back: 'Back',
      errorTitle: 'Something went wrong',
      errorBody: 'Please try again. Melo can also work without an API key.'
    },
    home: {
      heroTitle: 'Pause before you press send.',
      body: 'Melo helps you turn a heated draft into a clear, respectful message. It supports communication, not mental-health care.',
      connectionLabel: 'Connection',
      calmStarsLabel: 'Calm Stars',
      offlineReady: 'Ready offline',
      providerReady: (provider) => `${provider} configured`,
      offlineStatus: 'Your draft stays on this device.',
      aiStatus: 'Your draft is sent only when you ask Melo to rewrite it.',
      start: 'Rewrite a message',
      chat: 'Talk to Melo',
      configure: 'Settings & model service',
      noGuiltTitle: 'Your progress waits for you',
      noGuiltBody: 'There are no streaks to protect. Your Calm Stars stay, and Melo will be here when you return.',
      petTapAccessibility: 'Tap Melo for a little response',
      petTapLines: [
        'Hi. I’m right here with you.',
        'One small pause still counts.',
        'We can take the next step together.'
      ]
    },
    chat: {
      eyebrow: 'OPTIONAL · SHORT CHAT',
      title: 'Melo',
      body: 'Use a short AI conversation to name what feels difficult and find one manageable next step.',
      sessionNotice: 'Up to 24 messages stay on this device. When you send, the latest 8 messages and images attached to them go to your selected model service.',
      notTherapyNotice: 'Stored locally · Not therapy, diagnosis or crisis support',
      emptyTitle: 'What is on your mind?',
      emptyBody: 'Start small. You do not need to explain everything at once.',
      quickPrompts: [
        'I feel overwhelmed and do not know where to start.',
        'I need help preparing for a difficult conversation.'
      ],
      inputLabel: 'Message to Melo',
      placeholder: 'Write one thought…',
      send: 'Send',
      sending: 'Melo is replying…',
      clear: 'Clear',
      clearConfirmTitle: 'Clear local conversation?',
      clearConfirmBody: 'This permanently removes the saved Melo conversation from this device.',
      clearConfirm: 'Clear from device',
      cancel: 'Cancel',
      memoryLoading: 'Restoring this device’s local conversation…',
      memoryUnavailable: 'Device-local memory is currently unavailable. New messages may not be restored after the app restarts.',
      configure: 'Configure model service',
      rewriteOffline: 'Use calm rewrite offline',
      rewriteLatest: 'Rewrite latest',
      you: 'You',
      melo: 'Melo',
      aiMode: (provider) => provider,
      offlineMode: 'Set up a model to chat',
      aiLabel: (_provider, model) =>
        model ? `Model · ${model}` : 'Model not recorded',
      safetyLabel: 'Safety pause',
      unavailableTitle: 'Melo could not add an AI reply',
      noKeyBody: 'Choose your own model service, key and model before starting a chat. Melo does not provide a default model.',
      timeoutBody: (provider) => `${provider} did not reply within the time limit. No assistant message was added.`,
      networkBody: (provider) => `This device could not reach ${provider}. Check the network and selected region/server.`,
      httpBody: (provider, status) => `${provider} rejected the chat request${status ? ` with HTTP ${status}` : ''}. Check the key, model, plan, region and quota.`,
      invalidBody: (provider) => `${provider} returned no complete, readable chat message. Nothing was added to the conversation.`,
      configurationBody: (provider) => `The saved ${provider} settings are incomplete or use a server that does not match the selected service.`,
      unsafeBody: (provider) => `${provider} returned a reply that Melo could not safely display. Nothing was added to the conversation.`,
      retry: 'Retry',
      attachImage: 'Attach image',
      removeImage: 'Remove image',
      imageLabel: 'Attached image',
      imageDisabled: 'Enable image input in this model’s settings to attach a photo.',
      imageDefaultMessage: 'Please help me think through what is visible in this image.',
      imagePickerErrorTitle: 'Image could not be attached',
      imagePickerErrorBody: 'Choose a JPEG, PNG or WebP image and try again.',
      imageTooLargeBody: 'Choose a smaller image. Melo limits attachments to 1.5 MB for this prototype.',
      attachmentBody: 'The saved image could not be read from this device. Remove it and attach it again.',
      imageNotEnabledBody: 'This model is not marked as image-capable. Enable image input in Settings only if the selected model supports it.'
    },
    draft: {
      eyebrow: 'STEP 1 · WRITE',
      title: 'What were you about to send?',
      body: 'Paste the original draft. Melo keeps your intent, not the hurtful wording.',
      accessibility: 'Original message draft',
      placeholder: 'Type or paste a difficult message…',
      demo: 'Use demo example',
      continue: 'Continue',
      sample: 'You never do any work. I am done with this group project.'
    },
    checkin: {
      eyebrow: 'STEP 2 · CHECK IN',
      title: 'Give the message some context.',
      emotion: 'How are you feeling?',
      recipient: 'Who will receive it?',
      tone: 'Preferred tone',
      outputLanguage: 'Message language',
      aiMode: (provider) => `AI mode · ${provider}`,
      offlineMode: 'Offline mode',
      aiNotice: (provider) => `Your draft will be sent directly to ${provider} for this rewrite. Melo does not add it to a message-history database.`,
      offlineNotice: 'Your draft stays in this app session. The deterministic fallback makes no network request.',
      pause: 'Pause with Melo'
    },
    pause: {
      eyebrow: 'STEP 3 · PAUSE',
      generating: 'Finding better words…',
      breatheIn: 'Breathe in',
      hold: 'Hold',
      breatheOut: 'Breathe out',
      body: 'One short reset can interrupt an impulsive send. This demo uses a 12-second cycle.',
      skip: 'Skip breathing for demo'
    },
    result: {
      eyebrow: 'READY TO REVIEW',
      title: 'A calmer version',
      safetyTitle: 'Please get real-world support now',
      safetyBody: 'Contact someone you trust or local emergency services. Melo is not a crisis service, diagnosis tool or replacement for professional support.',
      providerFallbackTitle: 'AI rewrite did not complete',
      providerTimeoutBody: (provider) => `${provider} did not finish within the time limit. Melo used the offline rewrite below instead.`,
      providerNetworkBody: (provider) => `Melo could not reach ${provider}. Check this device’s network and the selected region/server. The result below is an offline rewrite.`,
      providerHttpBody: (provider, status) => {
        if (status === 401 || status === 403) return `${provider} rejected the key or its permissions. Check the key, plan and region/server.`;
        if (status === 404) return `${provider} could not find the endpoint or model. Check the Base URL and exact Model ID.`;
        if (status === 429) return `${provider} rate-limited the request or the account quota is unavailable. Check the provider console.`;
        if (status && status >= 500) return `${provider} reported a temporary server error. Try again or choose another region/server.`;
        return `${provider} rejected the request${status ? ` with HTTP ${status}` : ''}. Check the key, plan, region/server and Model ID.`;
      },
      providerInvalidBody: (provider) => `${provider} responded, but its OpenAI-compatible response contained no complete, readable message. Check the model and endpoint.`,
      providerConfigurationBody: (provider) => `The saved ${provider} settings are incomplete or invalid. No provider request was sent.`,
      providerUnsafeBody: (provider) => `${provider} returned a response that did not pass Melo’s prototype safety check. The result below is an offline rewrite.`,
      providerDiagnostic: (status, code, requestId) => [
        status ? `HTTP ${status}` : '',
        code ? `Code ${code}` : '',
        requestId ? `Request ID ${requestId}` : ''
      ].filter(Boolean).join(' · '),
      before: 'Before',
      after: 'After',
      rewardTitle: '✦ Calm Star earned',
      rewardBody: (stars) => `${stars} total · Accessories unlock at 3, 7 and 15 Calm Stars.`,
      why: 'What changed',
      copy: 'Copy',
      share: 'Share',
      retry: 'Try another tone',
      restart: 'Start over',
      copiedTitle: 'Copied',
      copiedBody: 'The message is ready to paste.',
      offlineLabel: 'Offline fallback',
      safetyPauseLabel: 'Safety pause',
      safetyFallbackLabel: 'Safety fallback',
      aiReasons: ['Keeps the original intent while reducing hostile language.', 'Adapts the wording to the selected recipient and tone.', 'Ends with a concrete next step.'],
      fallbackReasons: ['Uses an “I feel” structure instead of blame.', 'Keeps the request clear and practical.', 'Works even when an API is unavailable.'],
      safetyReasons: ['The draft may indicate immediate risk.', 'Melo pauses rewriting and encourages real-world support.', 'This keyword guard is a prototype, not a clinical assessment.'],
      safetyFallbackReasons: ['The provider response did not pass the prototype output guard.', 'Melo used the deterministic fallback instead.', 'The message still ends with a practical next step.']
    },
    settings: {
      pageTitle: 'Settings',
      languageEyebrow: 'GENERAL',
      languageTitle: 'App language',
      languageBody: 'Changes navigation, controls, safety notices and results. Message language remains selectable in each rewrite.',
      aiEyebrow: 'MELO',
      title: 'Connect your model',
      noticeTitle: 'Use your own account',
      noticeBody: 'Melo does not include model access.',
      provider: 'Service',
      alibabaCloud: 'Alibaba Cloud',
      alibabaPlanTitle: 'Plan',
      alibabaPlanBody: 'Match the plan and location where this key was created. Alibaba Cloud confirms access.',
      alibabaRegionTitle: 'Server location',
      alibabaRegionBody: 'Only servers supported by the selected plan are shown. Changing plan or region clears the previous key.',
      restrictedPlanTitle: 'This plan needs its own key',
      restrictedPlanBody: 'Use the key issued for this plan and location. Requests go only to the selected Alibaba Cloud server; Alibaba Cloud checks access.',
      detailsTitle: 'Connection details',
      detailsConfigured: (model) => `Key entered · ${model || 'Model not set'}`,
      detailsEmpty: 'Add your key, server and model',
      detailsShow: 'Show',
      detailsHide: 'Hide',
      planServerTitle: 'Plan & server',
      planServerSummary: (plan, region) => `${plan} · ${region}`,
      privacyNoteNative: 'Use your own model account. Messages and photos go to the service you choose; your key is encrypted on this device.',
      privacyNoteWeb: 'Use your own model account. Messages and photos go to the service you choose; your key stays only in this tab.',
      keyPlanMismatchTitle: 'Key and plan do not match',
      keyPlanMismatchBody: 'Pay-as-you-go uses a standard key. Coding Plan and Token Plan require their dedicated sk-sp- key. Choose the matching plan and region.',
      apiKey: 'API key',
      apiKeyPlaceholder: 'sk-… / service key',
      baseUrl: 'Base URL',
      modelId: 'Model ID',
      modelPlaceholder: 'Enter the exact model ID from your service',
      imageInputTitle: 'Allow photos',
      imageInputBody: 'Turn this on only if this model accepts images. The model service decides whether it is supported.',
      imageInputOn: 'Enabled',
      imageInputOff: 'Disabled',
      show: 'Show',
      hide: 'Hide',
      prototypeTitle: 'About this demo',
      prototypeBody: 'This demo connects directly with your key. A public release would use a protected server, usage limits, safety controls and a full privacy review.',
      save: 'Save connection',
      clear: 'Remove saved key',
      close: 'Close settings',
      missingBaseUrlTitle: 'Missing Base URL',
      missingBaseUrlBody: 'Please enter an OpenAI-compatible Base URL.',
      unsafeUrlTitle: 'Unsafe Base URL',
      unsafeUrlBody: 'Use HTTPS for remote model services. Plain HTTP is allowed only for localhost development.',
      unexpectedProviderHostTitle: 'Service and server do not match',
      unexpectedProviderHostBody: 'Use this service’s official server, or choose Custom API for another OpenAI-compatible endpoint.',
      missingModelTitle: 'Missing model',
      missingModelBody: 'Please enter the model ID used by your model service.',
      keyClearedTitle: 'API key cleared',
      keyClearedBody: 'Melo will use its offline fallback until a new key is added.'
    },
    emotions: { angry: 'Angry', overwhelmed: 'Overwhelmed', hurt: 'Hurt', anxious: 'Anxious', disappointed: 'Disappointed' },
    recipients: { friend: 'Friend', teammate: 'Teammate', teacher: 'Teacher', family: 'Family' },
    tones: { gentle: 'Gentle', direct: 'Direct', formal: 'Formal' },
    outputLanguages: { en: 'English', 'zh-Hant': '繁體中文', 'zh-Hans': '简体中文', yue: '廣東話' },
    providerNames: commonProviderNames,
    providerNotes: {
      openai: 'Connects to OpenAI using your own key and exact model name.',
      'google-ai-studio': 'Connects to Google AI Studio using your own key and exact model name.',
      deepseek: 'Connects to DeepSeek using your own key and exact model name.',
      kimi: 'Connects to Kimi in China. You can enter the international server manually.',
      minimax: 'Connects to MiniMax in China. You can enter the international server manually.',
      bailian: 'Pay-as-you-go. Uses a standard Alibaba Cloud API key.',
      'bailian-coding': 'Coding Plan. Use the key issued for this plan.',
      'bailian-token': 'Token Plan. Use the key issued for this plan.',
      bigmodel: 'Connects to Z.ai using your own key and exact model name.',
      custom: 'Any API that supports OpenAI-compatible /chat/completions.'
    },
    regions: {
      'cn-beijing': 'China · Beijing',
      singapore: 'Singapore',
      'us-virginia': 'US · Virginia',
      custom: 'Workspace / custom'
    }
  },
  'zh-Hant': {
    languageName: '繁體中文',
    brandTagline: '停一停，呼吸，再好好說。',
    settingsAccessibility: '開啟設定',
    progress: (current) => `第 ${current} 步，共 3 步`,
    pet: {
      home: '我是 Melo，陪你在發出難說的訊息前停一停。',
      draft: '告訴我你差點傳了甚麼，我不會批評你。',
      checkin: '說出感受，能為自己留出一點空間。',
      pause: '和我一起呼吸，等情緒慢下來再回覆。',
      result: '你為更友善、更清楚的下一步留出了空間。',
      chat: '我們可以一次整理一個想法。'
    },
    common: {
      back: '返回',
      errorTitle: '發生錯誤',
      errorBody: '請再試一次。沒有 API key 時，Melo 也能離線運作。'
    },
    home: {
      heroTitle: '傳送前，先停一停。',
      body: 'Melo 幫你把情緒化草稿整理成清楚、尊重對方的訊息。它協助表達，不提供心理健康服務。',
      connectionLabel: '模型連線',
      calmStarsLabel: 'Calm Stars',
      offlineReady: '離線模式已就緒',
      providerReady: (provider) => `${provider} 已設定`,
      offlineStatus: '草稿會保留在這部裝置。',
      aiStatus: '只有在你要求 Melo 改寫時，草稿才會送出。',
      start: '改寫一段訊息',
      chat: '和 Melo 聊聊',
      configure: '設定與模型服務',
      noGuiltTitle: '進度會等你回來',
      noGuiltBody: '不用維持連續紀錄。Calm Stars 會一直保留，Melo 也會在這裡等你。',
      petTapAccessibility: '點一下 Melo，看看它的回應',
      petTapLines: [
        '嗨，我在這裡陪你。',
        '停一停，也是一個小進步。',
        '我們可以一起走下一步。'
      ]
    },
    chat: {
      eyebrow: '可選功能 · 短對話',
      title: 'Melo',
      body: '用一段簡短 AI 對話整理目前最難受的部分，再找一個可做到的下一步。',
      sessionNotice: '最多 24 則訊息保留在這部裝置；傳送時，最近 8 則訊息及其中的附加圖片會送往你選擇的模型服務。',
      notTherapyNotice: '本機儲存 · 不提供治療、診斷或危機支援',
      emptyTitle: '你現在最想整理甚麼？',
      emptyBody: '可以從一小件事開始，不用一次說明全部。',
      quickPrompts: [
        '我感到不知所措，不知道應該從哪裏開始。',
        '我想為一段難以開口的對話做好準備。'
      ],
      inputLabel: '給 Melo 的訊息',
      placeholder: '寫下一個想法…',
      send: '傳送',
      sending: 'Melo 正在回覆…',
      clear: '清除',
      clearConfirmTitle: '要清除本機對話嗎？',
      clearConfirmBody: '這會從這部裝置永久移除已儲存的 Melo 對話。',
      clearConfirm: '從裝置清除',
      cancel: '取消',
      memoryLoading: '正在還原這部裝置的本機對話…',
      memoryUnavailable: '裝置本機記憶目前無法使用；App 重啟後可能無法還原新訊息。',
      configure: '設定模型服務',
      rewriteOffline: '使用離線冷靜改寫',
      rewriteLatest: '改寫最新訊息',
      you: '你',
      melo: 'Melo',
      aiMode: (provider) => provider,
      offlineMode: '設定模型後即可對話',
      aiLabel: (_provider, model) =>
        model ? `模型 · ${model}` : '模型未記錄',
      safetyLabel: '安全停頓',
      unavailableTitle: 'Melo 未能加入 AI 回覆',
      noKeyBody: '請先選擇自己的模型服務、key 與模型。Melo 不提供預設模型。',
      timeoutBody: (provider) => `${provider} 未能在時限內回覆；本次沒有加入助理訊息。`,
      networkBody: (provider) => `這部裝置無法連接 ${provider}。請檢查網絡及所選地區／伺服器。`,
      httpBody: (provider, status) => `${provider} 拒絕了對話請求${status ? `（HTTP ${status}）` : ''}。請檢查 key、模型、方案、地區及額度。`,
      invalidBody: (provider) => `${provider} 沒有傳回完整、可讀的對話訊息；對話中沒有加入任何內容。`,
      configurationBody: (provider) => `已儲存的 ${provider} 設定不完整，或伺服器與所選模型服務不相符。`,
      unsafeBody: (provider) => `${provider} 的回覆未能安全顯示；對話中沒有加入任何內容。`,
      retry: '重試',
      attachImage: '附加圖片',
      removeImage: '移除圖片',
      imageLabel: '已附加圖片',
      imageDisabled: '請先在這個模型的設定中啟用圖片輸入，才可附加照片。',
      imageDefaultMessage: '請幫我整理這張圖片中可以看見的內容。',
      imagePickerErrorTitle: '無法附加圖片',
      imagePickerErrorBody: '請選擇 JPEG、PNG 或 WebP 圖片後重試。',
      imageTooLargeBody: '請選擇較小的圖片；此原型把附件限制為 1.5 MB。',
      attachmentBody: '無法從這部裝置讀取已儲存的圖片；請移除後重新附加。',
      imageNotEnabledBody: '這個模型尚未標記為支援圖片。只有在所選模型確實支援時，才在設定中啟用圖片輸入。'
    },
    draft: {
      eyebrow: '第 1 步 · 寫下來',
      title: '你剛才差點傳出甚麼？',
      body: '貼上原本的草稿。Melo 會保留你的意思，而不是傷人的字眼。',
      accessibility: '原始訊息草稿',
      placeholder: '輸入或貼上一段難以開口的訊息…',
      demo: '使用示範內容',
      continue: '繼續',
      sample: '你從來都不做事，我不想再管這個小組項目了。'
    },
    checkin: {
      eyebrow: '第 2 步 · 感受確認',
      title: '為這段訊息補上一點背景。',
      emotion: '你現在感覺如何？',
      recipient: '誰會收到這段訊息？',
      tone: '希望使用的語氣',
      outputLanguage: '訊息語言',
      aiMode: (provider) => `AI 模式 · ${provider}`,
      offlineMode: '離線模式',
      aiNotice: (provider) => `這段草稿會直接傳送至 ${provider} 進行本次改寫；Melo 不會把它加入訊息歷史資料庫。`,
      offlineNotice: '草稿只保留在目前 App 工作階段；確定性離線模板不會發出網絡請求。',
      pause: '和 Melo 停一停'
    },
    pause: {
      eyebrow: '第 3 步 · 停一停',
      generating: '正在尋找更好的說法…',
      breatheIn: '吸氣',
      hold: '停住',
      breatheOut: '呼氣',
      body: '短暫重整能中斷衝動傳送；示範使用 12 秒呼吸循環。',
      skip: '示範：跳過呼吸'
    },
    result: {
      eyebrow: '可以檢視了',
      title: '更冷靜的版本',
      safetyTitle: '請立即尋求現實世界的支援',
      safetyBody: '請聯絡你信任的人或當地緊急服務。Melo 不是危機服務、診斷工具，也不能取代專業支援。',
      providerFallbackTitle: 'AI 改寫未完成',
      providerTimeoutBody: (provider) => `${provider} 未能在時限內完成。Melo 已改用下方的離線改寫。`,
      providerNetworkBody: (provider) => `Melo 無法連接 ${provider}。請檢查這部裝置的網絡及所選地區／伺服器；下方結果由離線改寫產生。`,
      providerHttpBody: (provider, status) => {
        if (status === 401 || status === 403) return `${provider} 拒絕了 key 或其權限。請檢查 key、方案及地區／伺服器。`;
        if (status === 404) return `${provider} 找不到 endpoint 或模型。請檢查 Base URL 及準確的模型 ID。`;
        if (status === 429) return `${provider} 已限制請求速率，或帳戶額度暫不可用。請檢查供應商控制台。`;
        if (status && status >= 500) return `${provider} 回報暫時性伺服器錯誤。請重試或選擇另一地區／伺服器。`;
        return `${provider} 拒絕了請求${status ? `（HTTP ${status}）` : ''}。請檢查 key、方案、地區／伺服器及模型 ID。`;
      },
      providerInvalidBody: (provider) => `${provider} 已回應，但其 OpenAI-compatible 回覆中沒有完整、可讀的訊息。請檢查模型及 endpoint。`,
      providerConfigurationBody: (provider) => `已儲存的 ${provider} 設定不完整或無效；本次沒有向供應商發出請求。`,
      providerUnsafeBody: (provider) => `${provider} 的回覆未通過 Melo 的原型安全檢查；下方結果由離線改寫產生。`,
      providerDiagnostic: (status, code, requestId) => [
        status ? `HTTP ${status}` : '',
        code ? `錯誤碼 ${code}` : '',
        requestId ? `請求 ID ${requestId}` : ''
      ].filter(Boolean).join(' · '),
      before: '改寫前',
      after: '改寫後',
      rewardTitle: '✦ 獲得一顆 Calm Star',
      rewardBody: (stars) => `目前共 ${stars} 顆 · 配件會在 3、7、15 顆時解鎖。`,
      why: '本次改寫重點',
      copy: '複製',
      share: '分享',
      retry: '換一種語氣',
      restart: '重新開始',
      copiedTitle: '已複製',
      copiedBody: '訊息已可貼上。',
      offlineLabel: '離線改寫',
      safetyPauseLabel: '安全停頓',
      safetyFallbackLabel: '安全後備方案',
      aiReasons: ['保留原本意思，同時減少敵意字眼。', '按收件人和所選語氣調整表達。', '以一個具體的下一步作結。'],
      fallbackReasons: ['以「我的感受」取代指責。', '讓請求保持清楚、實際。', '即使 AI 無法連線也能運作。'],
      safetyReasons: ['草稿可能涉及即時風險。', 'Melo 會停止一般改寫，並鼓勵尋求現實世界支援。', '此字詞檢查只是原型，並非臨床評估。'],
      safetyFallbackReasons: ['供應商的回覆未通過原型輸出檢查。', 'Melo 已改用確定性的離線方案。', '訊息仍會以實際下一步作結。']
    },
    settings: {
      pageTitle: '設定',
      languageEyebrow: '一般設定',
      languageTitle: '介面語言',
      languageBody: '會更改導覽、按鈕、安全提示與結果頁；每次改寫仍可獨立選擇訊息語言。',
      aiEyebrow: 'MELO',
      title: '連接你的模型',
      noticeTitle: '使用自己的模型帳戶',
      noticeBody: 'Melo 不附帶模型服務。',
      provider: '模型服務',
      alibabaCloud: '阿里雲百鍊',
      alibabaPlanTitle: '方案',
      alibabaPlanBody: '請選擇建立這個 key 時使用的方案與地區，存取權限由阿里雲確認。',
      alibabaRegionTitle: '伺服器地區',
      alibabaRegionBody: '只顯示目前方案支援的伺服器；切換方案或地區會清除先前的 key。',
      restrictedPlanTitle: '此方案需要專屬 key',
      restrictedPlanBody: '請使用此方案及地區簽發的 key。請求只會傳送到所選阿里雲伺服器，存取權限由阿里雲檢查。',
      detailsTitle: '連線詳情',
      detailsConfigured: (model) => `Key 已輸入 · ${model || '未設定模型'}`,
      detailsEmpty: '加入 key、伺服器與模型',
      detailsShow: '展開',
      detailsHide: '收起',
      planServerTitle: '方案與伺服器',
      planServerSummary: (plan, region) => `${plan} · ${region}`,
      privacyNoteNative: '使用你自己的模型帳戶。訊息與圖片會傳送到你選擇的服務；key 會加密保存在這部裝置。',
      privacyNoteWeb: '使用你自己的模型帳戶。訊息與圖片會傳送到你選擇的服務；key 只會保留在目前分頁。',
      keyPlanMismatchTitle: 'Key 與方案不相符',
      keyPlanMismatchBody: '按量付費使用一般 key；Coding Plan 與 Token Plan 必須使用各自 sk-sp- 開頭的專屬 key。請選擇相符的方案與地區。',
      apiKey: 'API key',
      apiKeyPlaceholder: 'sk-…／模型服務 key',
      baseUrl: 'Base URL',
      modelId: '模型 ID',
      modelPlaceholder: '輸入模型服務提供的準確模型 ID',
      imageInputTitle: '允許傳送圖片',
      imageInputBody: '只有在這個模型接受圖片時才開啟；是否支援以模型服務的回應為準。',
      imageInputOn: '已啟用',
      imageInputOff: '未啟用',
      show: '顯示',
      hide: '隱藏',
      prototypeTitle: '關於這個示範',
      prototypeBody: '此示範會使用你的 key 直接連線。公開版本會加入受保護伺服器、用量限制、安全控制及完整私隱評估。',
      save: '儲存連線',
      clear: '移除已儲存的 key',
      close: '關閉設定',
      missingBaseUrlTitle: '缺少 Base URL',
      missingBaseUrlBody: '請輸入 OpenAI-compatible Base URL。',
      unsafeUrlTitle: 'Base URL 不安全',
      unsafeUrlBody: '遠端模型服務必須使用 HTTPS；只有 localhost 開發環境可使用 HTTP。',
      unexpectedProviderHostTitle: '模型服務與伺服器不相符',
      unexpectedProviderHostBody: '請使用這個模型服務的官方伺服器；如要連接其他 OpenAI-compatible endpoint，請選擇自訂 API。',
      missingModelTitle: '缺少模型',
      missingModelBody: '請輸入模型服務使用的模型 ID。',
      keyClearedTitle: 'API key 已清除',
      keyClearedBody: '加入新的 key 前，Melo 會使用離線改寫。'
    },
    emotions: { angry: '生氣', overwhelmed: '不知所措', hurt: '受傷', anxious: '焦慮', disappointed: '失望' },
    recipients: { friend: '朋友', teammate: '組員', teacher: '老師', family: '家人' },
    tones: { gentle: '溫和', direct: '直接', formal: '正式' },
    outputLanguages: { en: 'English', 'zh-Hant': '繁體中文', 'zh-Hans': '简体中文', yue: '廣東話' },
    providerNames: {
      ...commonProviderNames,
      bailian: '阿里雲 · 按量付費',
      'bailian-coding': '阿里雲 · Coding Plan',
      'bailian-token': '阿里雲 · Token Plan',
      bigmodel: 'Z.ai BigModel',
      custom: '自訂相容服務'
    },
    providerNotes: {
      openai: '使用你自己的 key 與準確模型名稱連接 OpenAI。',
      'google-ai-studio': '使用你自己的 key 與準確模型名稱連接 Google AI Studio。',
      deepseek: '使用你自己的 key 與準確模型名稱連接 DeepSeek。',
      kimi: '連接 Kimi 中國區服務；國際伺服器可手動輸入。',
      minimax: '連接 MiniMax 中國區服務；國際伺服器可手動輸入。',
      bailian: '按量付費，使用一般阿里雲 API key。',
      'bailian-coding': 'Coding Plan，請使用此方案簽發的 key。',
      'bailian-token': 'Token Plan，請使用此方案簽發的 key。',
      bigmodel: '使用你自己的 key 與準確模型名稱連接 Z.ai。',
      custom: '任何支援 OpenAI-compatible /chat/completions 的 API。'
    },
    regions: {
      'cn-beijing': '中國 · 北京',
      singapore: '新加坡',
      'us-virginia': '美國 · 維珍尼亞',
      custom: '工作空間／自訂'
    }
  },
  'zh-Hans': {
    languageName: '简体中文',
    brandTagline: '停一停，呼吸，再好好说。',
    settingsAccessibility: '打开设置',
    progress: (current) => `第 ${current} 步，共 3 步`,
    pet: {
      home: '我是 Melo，陪你在发出难说的信息前停一停。',
      draft: '告诉我你差点发了什么，我不会批评你。',
      checkin: '说出感受，能为自己留出一点空间。',
      pause: '和我一起呼吸，等情绪慢下来再回复。',
      result: '你为更友善、更清楚的下一步留出了空间。',
      chat: '我们可以一次整理一个想法。'
    },
    common: {
      back: '返回',
      errorTitle: '发生错误',
      errorBody: '请再试一次。没有 API key 时，Melo 也能离线运行。'
    },
    home: {
      heroTitle: '发送前，先停一停。',
      body: 'Melo 帮你把情绪化草稿整理成清楚、尊重对方的信息。它帮助表达，不提供心理健康服务。',
      connectionLabel: '模型连接',
      calmStarsLabel: 'Calm Stars',
      offlineReady: '离线模式已就绪',
      providerReady: (provider) => `${provider} 已配置`,
      offlineStatus: '草稿会保留在这台设备。',
      aiStatus: '只有在你要求 Melo 改写时，草稿才会发送。',
      start: '改写一段信息',
      chat: '和 Melo 聊聊',
      configure: '设置与模型服务',
      noGuiltTitle: '进度会等你回来',
      noGuiltBody: '不用维持连续记录。Calm Stars 会一直保留，Melo 也会在这里等你。',
      petTapAccessibility: '点一下 Melo，看看它的回应',
      petTapLines: [
        '嗨，我在这里陪你。',
        '停一停，也是一个小进步。',
        '我们可以一起走下一步。'
      ]
    },
    chat: {
      eyebrow: '可选功能 · 短对话',
      title: 'Melo',
      body: '用一段简短 AI 对话整理目前最难受的部分，再找一个能做到的下一步。',
      sessionNotice: '最多 24 条信息保存在这台设备；发送时，最近 8 条信息及其中的附加图片会发送至你选择的模型服务。',
      notTherapyNotice: '本地存储 · 不提供治疗、诊断或危机支持',
      emptyTitle: '你现在最想整理什么？',
      emptyBody: '可以从一件小事开始，不用一次说明全部。',
      quickPrompts: [
        '我感到不知所措，不知道应该从哪里开始。',
        '我想为一段难以开口的对话做好准备。'
      ],
      inputLabel: '给 Melo 的信息',
      placeholder: '写下一个想法…',
      send: '发送',
      sending: 'Melo 正在回复…',
      clear: '清除',
      clearConfirmTitle: '要清除本地对话吗？',
      clearConfirmBody: '这会从这台设备永久移除已保存的 Melo 对话。',
      clearConfirm: '从设备清除',
      cancel: '取消',
      memoryLoading: '正在恢复这台设备的本地对话…',
      memoryUnavailable: '设备本地记忆目前无法使用；App 重启后可能无法恢复新信息。',
      configure: '设置模型服务',
      rewriteOffline: '使用离线冷静改写',
      rewriteLatest: '改写最新信息',
      you: '你',
      melo: 'Melo',
      aiMode: (provider) => provider,
      offlineMode: '设置模型后即可对话',
      aiLabel: (_provider, model) =>
        model ? `模型 · ${model}` : '模型未记录',
      safetyLabel: '安全停顿',
      unavailableTitle: 'Melo 未能加入 AI 回复',
      noKeyBody: '请先选择自己的模型服务、key 与模型。Melo 不提供默认模型。',
      timeoutBody: (provider) => `${provider} 未能在时限内回复；本次没有加入助手信息。`,
      networkBody: (provider) => `这台设备无法连接 ${provider}。请检查网络及所选地区／服务器。`,
      httpBody: (provider, status) => `${provider} 拒绝了对话请求${status ? `（HTTP ${status}）` : ''}。请检查 key、模型、方案、地区及额度。`,
      invalidBody: (provider) => `${provider} 没有返回完整、可读的对话信息；对话中没有加入任何内容。`,
      configurationBody: (provider) => `已保存的 ${provider} 设置不完整，或服务器与所选模型服务不相符。`,
      unsafeBody: (provider) => `${provider} 的回复未能安全显示；对话中没有加入任何内容。`,
      retry: '重试',
      attachImage: '附加图片',
      removeImage: '移除图片',
      imageLabel: '已附加图片',
      imageDisabled: '请先在这个模型的设置中启用图片输入，才可附加照片。',
      imageDefaultMessage: '请帮我整理这张图片中可以看见的内容。',
      imagePickerErrorTitle: '无法附加图片',
      imagePickerErrorBody: '请选择 JPEG、PNG 或 WebP 图片后重试。',
      imageTooLargeBody: '请选择较小的图片；此原型把附件限制为 1.5 MB。',
      attachmentBody: '无法从这台设备读取已保存的图片；请移除后重新附加。',
      imageNotEnabledBody: '这个模型尚未标记为支持图片。只有在所选模型确实支持时，才在设置中启用图片输入。'
    },
    draft: {
      eyebrow: '第 1 步 · 写下来',
      title: '你刚才差点发出什么？',
      body: '贴上原本的草稿。Melo 会保留你的意思，而不是伤人的字眼。',
      accessibility: '原始信息草稿',
      placeholder: '输入或贴上一段难以开口的信息…',
      demo: '使用演示内容',
      continue: '继续',
      sample: '你们从来都不做事，我不想再管这个小组项目了。'
    },
    checkin: {
      eyebrow: '第 2 步 · 感受确认',
      title: '为这段信息补上一点背景。',
      emotion: '你现在感觉如何？',
      recipient: '谁会收到这段信息？',
      tone: '希望使用的语气',
      outputLanguage: '信息语言',
      aiMode: (provider) => `AI 模式 · ${provider}`,
      offlineMode: '离线模式',
      aiNotice: (provider) => `这段草稿会直接发送至 ${provider} 进行本次改写；Melo 不会把它加入信息历史数据库。`,
      offlineNotice: '草稿只保留在当前 App 会话；确定性离线模板不会发出网络请求。',
      pause: '和 Melo 停一停'
    },
    pause: {
      eyebrow: '第 3 步 · 停一停',
      generating: '正在寻找更好的说法…',
      breatheIn: '吸气',
      hold: '屏住',
      breatheOut: '呼气',
      body: '短暂重整能中断冲动发送；演示使用 12 秒呼吸循环。',
      skip: '演示：跳过呼吸'
    },
    result: {
      eyebrow: '可以查看了',
      title: '更冷静的版本',
      safetyTitle: '请立即寻求现实世界的支持',
      safetyBody: '请联系你信任的人或当地紧急服务。Melo 不是危机服务、诊断工具，也不能取代专业支持。',
      providerFallbackTitle: 'AI 改写未完成',
      providerTimeoutBody: (provider) => `${provider} 未能在时限内完成。Melo 已改用下方的离线改写。`,
      providerNetworkBody: (provider) => `Melo 无法连接 ${provider}。请检查这台设备的网络及所选地区／服务器；下方结果由离线改写生成。`,
      providerHttpBody: (provider, status) => {
        if (status === 401 || status === 403) return `${provider} 拒绝了 key 或其权限。请检查 key、方案及地区／服务器。`;
        if (status === 404) return `${provider} 找不到 endpoint 或模型。请检查 Base URL 及准确的模型 ID。`;
        if (status === 429) return `${provider} 已限制请求速率，或账户额度暂不可用。请检查服务商控制台。`;
        if (status && status >= 500) return `${provider} 返回暂时性服务器错误。请重试或选择另一地区／服务器。`;
        return `${provider} 拒绝了请求${status ? `（HTTP ${status}）` : ''}。请检查 key、方案、地区／服务器及模型 ID。`;
      },
      providerInvalidBody: (provider) => `${provider} 已响应，但其 OpenAI-compatible 回复中没有完整、可读的信息。请检查模型及 endpoint。`,
      providerConfigurationBody: (provider) => `已保存的 ${provider} 设置不完整或无效；本次没有向服务商发送请求。`,
      providerUnsafeBody: (provider) => `${provider} 的回复未通过 Melo 的原型安全检查；下方结果由离线改写生成。`,
      providerDiagnostic: (status, code, requestId) => [
        status ? `HTTP ${status}` : '',
        code ? `错误码 ${code}` : '',
        requestId ? `请求 ID ${requestId}` : ''
      ].filter(Boolean).join(' · '),
      before: '改写前',
      after: '改写后',
      rewardTitle: '✦ 获得一颗 Calm Star',
      rewardBody: (stars) => `目前共 ${stars} 颗 · 配件会在 3、7、15 颗时解锁。`,
      why: '本次改写重点',
      copy: '复制',
      share: '分享',
      retry: '换一种语气',
      restart: '重新开始',
      copiedTitle: '已复制',
      copiedBody: '信息已可粘贴。',
      offlineLabel: '离线改写',
      safetyPauseLabel: '安全停顿',
      safetyFallbackLabel: '安全后备方案',
      aiReasons: ['保留原本意思，同时减少敌意字眼。', '按收件人和所选语气调整表达。', '以一个具体的下一步作结。'],
      fallbackReasons: ['以“我的感受”取代指责。', '让请求保持清楚、实际。', '即使 AI 无法连接也能运行。'],
      safetyReasons: ['草稿可能涉及即时风险。', 'Melo 会停止一般改写，并鼓励寻求现实世界支持。', '此关键词检查只是原型，并非临床评估。'],
      safetyFallbackReasons: ['服务商的回复未通过原型输出检查。', 'Melo 已改用确定性的离线方案。', '信息仍会以实际下一步作结。']
    },
    settings: {
      pageTitle: '设置',
      languageEyebrow: '一般设置',
      languageTitle: '界面语言',
      languageBody: '会更改导航、按钮、安全提示与结果页；每次改写仍可单独选择信息语言。',
      aiEyebrow: 'MELO',
      title: '连接你的模型',
      noticeTitle: '使用自己的模型账户',
      noticeBody: 'Melo 不附带模型服务。',
      provider: '模型服务',
      alibabaCloud: '阿里云百炼',
      alibabaPlanTitle: '方案',
      alibabaPlanBody: '请选择创建这个 key 时使用的方案和地区，访问权限由阿里云确认。',
      alibabaRegionTitle: '服务器地区',
      alibabaRegionBody: '只显示当前方案支持的服务器；切换方案或地区会清除之前的 key。',
      restrictedPlanTitle: '此方案需要专用 key',
      restrictedPlanBody: '请使用此方案及地区签发的 key。请求只会发送到所选阿里云服务器，访问权限由阿里云检查。',
      detailsTitle: '连接详情',
      detailsConfigured: (model) => `Key 已输入 · ${model || '未设置模型'}`,
      detailsEmpty: '添加 key、服务器与模型',
      detailsShow: '展开',
      detailsHide: '收起',
      planServerTitle: '方案与服务器',
      planServerSummary: (plan, region) => `${plan} · ${region}`,
      privacyNoteNative: '使用你自己的模型账户。信息与图片会发送到你选择的服务；key 会加密保存在这台设备。',
      privacyNoteWeb: '使用你自己的模型账户。信息与图片会发送到你选择的服务；key 只会保留在当前标签页。',
      keyPlanMismatchTitle: 'Key 与方案不相符',
      keyPlanMismatchBody: '按量付费使用普通 key；Coding Plan 与 Token Plan 必须使用各自 sk-sp- 开头的专用 key。请选择相符的方案与地区。',
      apiKey: 'API key',
      apiKeyPlaceholder: 'sk-…／模型服务 key',
      baseUrl: 'Base URL',
      modelId: '模型 ID',
      modelPlaceholder: '输入模型服务提供的准确模型 ID',
      imageInputTitle: '允许发送图片',
      imageInputBody: '只有在这个模型接受图片时才开启；是否支持以模型服务的响应为准。',
      imageInputOn: '已启用',
      imageInputOff: '未启用',
      show: '显示',
      hide: '隐藏',
      prototypeTitle: '关于这个演示',
      prototypeBody: '此演示会使用你的 key 直接连接。公开版本会加入受保护服务器、用量限制、安全控制及完整隐私评估。',
      save: '保存连接',
      clear: '移除已保存的 key',
      close: '关闭设置',
      missingBaseUrlTitle: '缺少 Base URL',
      missingBaseUrlBody: '请输入 OpenAI-compatible Base URL。',
      unsafeUrlTitle: 'Base URL 不安全',
      unsafeUrlBody: '远程模型服务必须使用 HTTPS；只有 localhost 开发环境可使用 HTTP。',
      unexpectedProviderHostTitle: '模型服务与服务器不相符',
      unexpectedProviderHostBody: '请使用这个模型服务的官方服务器；如需连接其他 OpenAI-compatible endpoint，请选择自定义 API。',
      missingModelTitle: '缺少模型',
      missingModelBody: '请输入模型服务使用的模型 ID。',
      keyClearedTitle: 'API key 已清除',
      keyClearedBody: '加入新的 key 前，Melo 会使用离线改写。'
    },
    emotions: { angry: '生气', overwhelmed: '不知所措', hurt: '受伤', anxious: '焦虑', disappointed: '失望' },
    recipients: { friend: '朋友', teammate: '组员', teacher: '老师', family: '家人' },
    tones: { gentle: '温和', direct: '直接', formal: '正式' },
    outputLanguages: { en: 'English', 'zh-Hant': '繁體中文', 'zh-Hans': '简体中文', yue: '廣東話' },
    providerNames: {
      ...commonProviderNames,
      bailian: '阿里云 · 按量付费',
      'bailian-coding': '阿里云 · Coding Plan',
      'bailian-token': '阿里云 · Token Plan',
      bigmodel: 'Z.ai BigModel',
      custom: '自定义兼容服务'
    },
    providerNotes: {
      openai: '使用你自己的 key 与准确模型名称连接 OpenAI。',
      'google-ai-studio': '使用你自己的 key 与准确模型名称连接 Google AI Studio。',
      deepseek: '使用你自己的 key 与准确模型名称连接 DeepSeek。',
      kimi: '连接 Kimi 中国区服务；国际服务器可手动输入。',
      minimax: '连接 MiniMax 中国区服务；国际服务器可手动输入。',
      bailian: '按量付费，使用普通阿里云 API key。',
      'bailian-coding': 'Coding Plan，请使用此方案签发的 key。',
      'bailian-token': 'Token Plan，请使用此方案签发的 key。',
      bigmodel: '使用你自己的 key 与准确模型名称连接 Z.ai。',
      custom: '任何支持 OpenAI-compatible /chat/completions 的 API。'
    },
    regions: {
      'cn-beijing': '中国 · 北京',
      singapore: '新加坡',
      'us-virginia': '美国 · 弗吉尼亚',
      custom: '工作空间／自定义'
    }
  }
};

export function getTranslations(language: UILanguage): UiCopy {
  return translations[language];
}

export function parseUILanguage(value: unknown): UILanguage | null {
  return value === 'en' || value === 'zh-Hant' || value === 'zh-Hans' ? value : null;
}

export function uiLanguageToOutputLanguage(language: UILanguage): AppLanguage {
  return language;
}
