import type {
  AppLanguage,
  EmotionId,
  RecipientId,
  RewriteInput,
  ToneId
} from '../types';

const emotionEnglish: Record<EmotionId, string> = {
  angry: 'angry',
  overwhelmed: 'overwhelmed',
  hurt: 'hurt',
  anxious: 'anxious',
  disappointed: 'disappointed'
};

const emotionChinese: Record<EmotionId, string> = {
  angry: '生氣',
  overwhelmed: '不知所措',
  hurt: '受傷',
  anxious: '焦慮',
  disappointed: '失望'
};

const recipientEnglish: Record<RecipientId, string> = {
  friend: 'you',
  teammate: 'the team',
  teacher: 'you',
  family: 'you'
};

function englishFallback(input: RewriteInput): string {
  const emotion = emotionEnglish[input.emotion];
  const target = recipientEnglish[input.recipient];

  if (input.tone === 'formal') {
    return `I am feeling ${emotion} about this situation. I would like to explain my concern calmly and avoid blaming anyone. Could we arrange a short conversation to clarify what happened and agree on a practical next step with ${target}?`;
  }

  if (input.tone === 'direct') {
    return `I feel ${emotion} about what happened. I do not want this to turn into an argument. Can we talk about the issue clearly and agree on a fair next step?`;
  }

  return `I’m feeling ${emotion} about this situation, and I want to explain it without blaming anyone. Could we pause, talk through what happened, and decide on a next step together?`;
}

function traditionalChineseFallback(input: RewriteInput): string {
  const emotion = emotionChinese[input.emotion];
  if (input.tone === 'formal') {
    return `我目前對這件事感到${emotion}。我希望能冷靜地說明我的顧慮，而不是互相指責。請問我們可以安排一段時間釐清情況，並一起商量一個實際的下一步嗎？`;
  }
  if (input.tone === 'direct') {
    return `我對剛才的情況感到${emotion}，但我不希望事情變成爭吵。我們可以直接談清楚問題，再決定一個公平的下一步嗎？`;
  }
  return `我現在對這件事感到${emotion}，但我想用不責怪任何人的方式說清楚。可以先冷靜談談發生了甚麼，再一起決定下一步嗎？`;
}

function cantoneseFallback(input: RewriteInput): string {
  const emotion = emotionChinese[input.emotion];
  if (input.tone === 'formal') {
    return `我而家對呢件事感到${emotion}。我希望可以冷靜咁講清楚我嘅顧慮，而唔係互相指責。請問我哋可唔可以搵個時間釐清情況，再一齊定一個實際嘅下一步？`;
  }
  if (input.tone === 'direct') {
    return `我對頭先嘅情況感到${emotion}，但我唔想件事變成鬧交。我哋可唔可以直接講清楚問題，再定一個公平嘅下一步？`;
  }
  return `我而家對呢件事感到${emotion}，但我想用唔責怪任何人嘅方式講清楚。可唔可以先冷靜傾下發生咗咩，再一齊諗下一步？`;
}

export function generateFallbackMessage(input: RewriteInput): string {
  const byLanguage: Record<AppLanguage, () => string> = {
    en: () => englishFallback(input),
    'zh-Hant': () => traditionalChineseFallback(input),
    yue: () => cantoneseFallback(input)
  };
  return byLanguage[input.language]();
}

export function safetyMessage(language: AppLanguage): string {
  if (language === 'en') {
    return `I’m not in a safe state to send this message right now. I’m going to pause and contact someone I trust for immediate support.`;
  }
  if (language === 'yue') {
    return `我而家未必適合即刻發出呢段訊息。我會先停一停，並即刻聯絡一位我信任嘅人尋求支援。`;
  }
  return `我現在未必適合立即發出這段訊息。我會先停一停，並立即聯絡一位我信任的人尋求支援。`;
}
