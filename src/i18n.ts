import type {
  AppLanguage,
  EmotionId,
  ProviderId,
  RecipientId,
  ToneId,
  UILanguage
} from './types';
import type { AlibabaRegion } from './config/alibaba';

interface UiCopy {
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
  };
  common: {
    back: string;
    errorTitle: string;
    errorBody: string;
  };
  home: {
    heroTitle: string;
    body: string;
    offlineReady: string;
    providerReady: (provider: string, model: string) => string;
    offlineStatus: string;
    aiStatus: string;
    start: string;
    configure: string;
    noGuiltTitle: string;
    noGuiltBody: string;
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
  footer: {
    ai: (provider: string) => string;
    offline: string;
  };
  settings: {
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
    keyPlanMismatchTitle: string;
    keyPlanMismatchBody: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    baseUrl: string;
    modelId: string;
    modelPlaceholder: string;
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
  bigmodel: '智譜 BigModel',
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
      result: 'You made room for a kinder and clearer next step.'
    },
    common: {
      back: 'Back',
      errorTitle: 'Something went wrong',
      errorBody: 'Please try again. Melo can also work without an API key.'
    },
    home: {
      heroTitle: 'A calmer message starts with one small pause.',
      body: 'Melo helps students turn an emotional draft into a clearer message—without pretending to be a therapist.',
      offlineReady: 'Offline fallback ready',
      providerReady: (provider, model) => `${provider} · ${model}`,
      offlineStatus: 'No key needed. Try the complete demo offline.',
      aiStatus: 'Your selected provider will rewrite the message.',
      start: 'Start a calm rewrite',
      configure: 'Settings & AI provider',
      noGuiltTitle: '✦ Calm Stars, never streak pressure',
      noGuiltBody: 'Melo celebrates completed pauses. It never becomes sick, hungry or sad when you take a break from the app.'
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
    footer: {
      ai: (provider) => `Prototype only · No diagnosis · This draft is sent to ${provider}`,
      offline: 'Prototype only · No diagnosis · Offline mode makes no provider request'
    },
    settings: {
      languageEyebrow: 'GENERAL',
      languageTitle: 'App language',
      languageBody: 'Changes navigation, controls, safety notices and results. Message language remains selectable in each rewrite.',
      aiEyebrow: 'ADVANCED · BRING YOUR OWN KEY',
      title: 'AI provider',
      noticeTitle: 'Bring your own provider, key and model',
      noticeBody: 'Melo does not provide model access or a default model. Native builds store your key in encrypted SecureStore; Web preview keeps it only in this browser tab.',
      provider: 'Provider',
      alibabaCloud: 'Alibaba Cloud',
      alibabaPlanTitle: 'Alibaba Cloud billing plan',
      alibabaPlanBody: 'Choose the plan and region for your key. Melo checks the standard-versus-plan key family; Alibaba Cloud validates the exact scope.',
      alibabaRegionTitle: 'Region / server',
      alibabaRegionBody: 'Only servers supported by the selected plan are shown. Changing plan or region clears the previous key.',
      restrictedPlanTitle: 'Official usage restriction',
      restrictedPlanBody: 'Alibaba Cloud states that Coding Plan and Token Plan keys are for supported coding or agent tools, not custom apps. Using one here may suspend the plan or key.',
      keyPlanMismatchTitle: 'Key and plan do not match',
      keyPlanMismatchBody: 'Pay-as-you-go uses a standard key. Coding Plan and Token Plan require their dedicated sk-sp- key. Choose the matching plan and region.',
      apiKey: 'API key',
      apiKeyPlaceholder: 'sk-… / provider key',
      baseUrl: 'Base URL',
      modelId: 'Model ID',
      modelPlaceholder: 'Enter the exact model ID from your provider',
      show: 'Show',
      hide: 'Hide',
      prototypeTitle: 'Prototype note',
      prototypeBody: 'Direct BYOK calls suit an Expo prototype. Production needs a trusted backend, rate limits, provider moderation and a full privacy review.',
      save: 'Save AI settings',
      clear: 'Clear saved key',
      close: 'Close settings',
      missingBaseUrlTitle: 'Missing Base URL',
      missingBaseUrlBody: 'Please enter an OpenAI-compatible Base URL.',
      unsafeUrlTitle: 'Unsafe Base URL',
      unsafeUrlBody: 'Use HTTPS for remote providers. Plain HTTP is allowed only for localhost development.',
      missingModelTitle: 'Missing model',
      missingModelBody: 'Please enter the model ID used by your provider.',
      keyClearedTitle: 'API key cleared',
      keyClearedBody: 'Melo will use its offline fallback until a new key is added.'
    },
    emotions: { angry: 'Angry', overwhelmed: 'Overwhelmed', hurt: 'Hurt', anxious: 'Anxious', disappointed: 'Disappointed' },
    recipients: { friend: 'Friend', teammate: 'Teammate', teacher: 'Teacher', family: 'Family' },
    tones: { gentle: 'Gentle', direct: 'Direct', formal: 'Formal' },
    outputLanguages: { en: 'English', 'zh-Hant': '繁體中文', 'zh-Hans': '简体中文', yue: '廣東話' },
    providerNames: commonProviderNames,
    providerNotes: {
      openai: 'OpenAI-compatible Chat Completions endpoint.',
      'google-ai-studio': 'Google Gemini OpenAI-compatible endpoint. Enter your own API key and exact model ID.',
      deepseek: 'Official DeepSeek compatible endpoint. Enter your own API key and exact model ID.',
      kimi: 'Official Kimi compatible endpoint for China. The international endpoint can be entered manually.',
      minimax: 'Official MiniMax compatible endpoint for China. The international endpoint can be entered manually.',
      bailian: 'Standard pay-as-you-go API for custom applications in China (Beijing).',
      'bailian-coding': 'Coding Plan endpoint for China. Requires its dedicated sk-sp- key.',
      'bailian-token': 'Token Plan endpoint for China (Beijing). Requires its dedicated plan key.',
      bigmodel: 'Zhipu OpenAI-compatible endpoint.',
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
      result: '你為更友善、更清楚的下一步留出了空間。'
    },
    common: {
      back: '返回',
      errorTitle: '發生錯誤',
      errorBody: '請再試一次。沒有 API key 時，Melo 也能離線運作。'
    },
    home: {
      heroTitle: '一段更冷靜的訊息，從停一停開始。',
      body: 'Melo 幫助學生把情緒化草稿變成更清楚的訊息，但不會假裝自己是治療師。',
      offlineReady: '離線改寫已就緒',
      providerReady: (provider, model) => `${provider} · ${model}`,
      offlineStatus: '無需 API key，也可完整示範。',
      aiStatus: '將由你選擇的供應商改寫訊息。',
      start: '開始冷靜改寫',
      configure: '設定與 AI 供應商',
      noGuiltTitle: '✦ Calm Stars，不製造連續簽到壓力',
      noGuiltBody: 'Melo 只會慶祝你完成停頓；即使暫時不用 App，也不會生病、挨餓或難過。'
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
    footer: {
      ai: (provider) => `僅供原型示範 · 不作診斷 · 草稿會傳送至 ${provider}`,
      offline: '僅供原型示範 · 不作診斷 · 離線模式不會連接供應商'
    },
    settings: {
      languageEyebrow: '一般設定',
      languageTitle: '介面語言',
      languageBody: '會更改導覽、按鈕、安全提示與結果頁；每次改寫仍可獨立選擇訊息語言。',
      aiEyebrow: '進階 · 使用自己的 API KEY',
      title: 'AI 供應商',
      noticeTitle: '使用你自己的供應商、key 與模型',
      noticeBody: 'Melo 不提供模型服務或預設模型。原生版本以加密 SecureStore 儲存 key；Web 預覽只保留在目前分頁。',
      provider: '供應商',
      alibabaCloud: '阿里雲百鍊',
      alibabaPlanTitle: '阿里雲計費方案',
      alibabaPlanBody: '請選擇 key 對應的方案及地區；Melo 只檢查一般 key／套餐 key 類別，確切授權由阿里雲驗證。',
      alibabaRegionTitle: '地區／伺服器',
      alibabaRegionBody: '只顯示目前方案支援的伺服器；切換方案或地區會清除先前的 key。',
      restrictedPlanTitle: '官方使用範圍提醒',
      restrictedPlanBody: '阿里雲說明 Coding Plan 與 Token Plan 只供支援的編程或 Agent 工具使用，不適用於自訂 App；在此使用可能導致套餐或 key 被停用。',
      keyPlanMismatchTitle: 'Key 與方案不相符',
      keyPlanMismatchBody: '按量付費使用一般 key；Coding Plan 與 Token Plan 必須使用各自 sk-sp- 開頭的專屬 key。請選擇相符的方案與地區。',
      apiKey: 'API key',
      apiKeyPlaceholder: 'sk-…／供應商 key',
      baseUrl: 'Base URL',
      modelId: '模型 ID',
      modelPlaceholder: '輸入供應商提供的準確模型 ID',
      show: '顯示',
      hide: '隱藏',
      prototypeTitle: '原型說明',
      prototypeBody: 'Expo 原型可直接使用 BYOK；正式產品需要可信任後端、速率限制、供應商審核及完整私隱評估。',
      save: '儲存 AI 設定',
      clear: '清除已儲存的 key',
      close: '關閉設定',
      missingBaseUrlTitle: '缺少 Base URL',
      missingBaseUrlBody: '請輸入 OpenAI-compatible Base URL。',
      unsafeUrlTitle: 'Base URL 不安全',
      unsafeUrlBody: '遠端供應商必須使用 HTTPS；只有 localhost 開發環境可使用 HTTP。',
      missingModelTitle: '缺少模型',
      missingModelBody: '請輸入供應商使用的模型 ID。',
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
      custom: '自訂相容服務'
    },
    providerNotes: {
      openai: 'OpenAI-compatible Chat Completions endpoint。',
      'google-ai-studio': 'Google Gemini 的 OpenAI-compatible endpoint；請自行輸入 API key 與準確的模型 ID。',
      deepseek: 'DeepSeek 官方相容 endpoint；請自行輸入 API key 與準確的模型 ID。',
      kimi: 'Kimi 中國區官方相容 endpoint；國際 endpoint 可手動修改。',
      minimax: 'MiniMax 中國區官方相容 endpoint；國際 endpoint 可手動修改。',
      bailian: '中國（北京）按量付費 API，可用於自訂應用程式。',
      'bailian-coding': '中國區 Coding Plan endpoint，必須配合 sk-sp- 開頭的套餐專屬 key。',
      'bailian-token': '華北 2（北京）Token Plan endpoint，必須配合套餐專屬 key。',
      bigmodel: '智譜 OpenAI-compatible endpoint。',
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
      result: '你为更友善、更清楚的下一步留出了空间。'
    },
    common: {
      back: '返回',
      errorTitle: '发生错误',
      errorBody: '请再试一次。没有 API key 时，Melo 也能离线运行。'
    },
    home: {
      heroTitle: '一段更冷静的信息，从停一停开始。',
      body: 'Melo 帮助学生把情绪化草稿变成更清楚的信息，但不会假装自己是治疗师。',
      offlineReady: '离线改写已就绪',
      providerReady: (provider, model) => `${provider} · ${model}`,
      offlineStatus: '无需 API key，也可完整演示。',
      aiStatus: '将由你选择的服务商改写信息。',
      start: '开始冷静改写',
      configure: '设置与 AI 服务商',
      noGuiltTitle: '✦ Calm Stars，不制造连续签到压力',
      noGuiltBody: 'Melo 只会庆祝你完成停顿；即使暂时不用 App，也不会生病、挨饿或难过。'
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
    footer: {
      ai: (provider) => `仅供原型演示 · 不作诊断 · 草稿会发送至 ${provider}`,
      offline: '仅供原型演示 · 不作诊断 · 离线模式不会连接服务商'
    },
    settings: {
      languageEyebrow: '一般设置',
      languageTitle: '界面语言',
      languageBody: '会更改导航、按钮、安全提示与结果页；每次改写仍可单独选择信息语言。',
      aiEyebrow: '高级 · 使用自己的 API KEY',
      title: 'AI 服务商',
      noticeTitle: '使用你自己的服务商、key 与模型',
      noticeBody: 'Melo 不提供模型服务或默认模型。原生版本以加密 SecureStore 存储 key；Web 预览只保留在当前标签页。',
      provider: '服务商',
      alibabaCloud: '阿里云百炼',
      alibabaPlanTitle: '阿里云计费方案',
      alibabaPlanBody: '请选择 key 对应的方案及地区；Melo 只检查普通 key／套餐 key 类别，准确授权由阿里云验证。',
      alibabaRegionTitle: '地区／服务器',
      alibabaRegionBody: '只显示当前方案支持的服务器；切换方案或地区会清除之前的 key。',
      restrictedPlanTitle: '官方使用范围提醒',
      restrictedPlanBody: '阿里云说明 Coding Plan 与 Token Plan 只供支持的编程或 Agent 工具使用，不适用于自定义 App；在此使用可能导致套餐或 key 被停用。',
      keyPlanMismatchTitle: 'Key 与方案不相符',
      keyPlanMismatchBody: '按量付费使用普通 key；Coding Plan 与 Token Plan 必须使用各自 sk-sp- 开头的专用 key。请选择相符的方案与地区。',
      apiKey: 'API key',
      apiKeyPlaceholder: 'sk-…／服务商 key',
      baseUrl: 'Base URL',
      modelId: '模型 ID',
      modelPlaceholder: '输入服务商提供的准确模型 ID',
      show: '显示',
      hide: '隐藏',
      prototypeTitle: '原型说明',
      prototypeBody: 'Expo 原型可直接使用 BYOK；正式产品需要可信后端、速率限制、服务商审核及完整隐私评估。',
      save: '保存 AI 设置',
      clear: '清除已保存的 key',
      close: '关闭设置',
      missingBaseUrlTitle: '缺少 Base URL',
      missingBaseUrlBody: '请输入 OpenAI-compatible Base URL。',
      unsafeUrlTitle: 'Base URL 不安全',
      unsafeUrlBody: '远程服务商必须使用 HTTPS；只有 localhost 开发环境可使用 HTTP。',
      missingModelTitle: '缺少模型',
      missingModelBody: '请输入服务商使用的模型 ID。',
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
      bigmodel: '智谱 BigModel',
      custom: '自定义兼容服务'
    },
    providerNotes: {
      openai: 'OpenAI-compatible Chat Completions endpoint。',
      'google-ai-studio': 'Google Gemini 的 OpenAI-compatible endpoint；请自行输入 API key 与准确的模型 ID。',
      deepseek: 'DeepSeek 官方兼容 endpoint；请自行输入 API key 与准确的模型 ID。',
      kimi: 'Kimi 中国区官方兼容 endpoint；国际 endpoint 可手动修改。',
      minimax: 'MiniMax 中国区官方兼容 endpoint；国际 endpoint 可手动修改。',
      bailian: '中国（北京）按量付费 API，可用于自定义应用程序。',
      'bailian-coding': '中国区 Coding Plan endpoint，必须配合 sk-sp- 开头的套餐专属 key。',
      'bailian-token': '华北 2（北京）Token Plan endpoint，必须配合套餐专属 key。',
      bigmodel: '智谱 OpenAI-compatible endpoint。',
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
