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

const emotionSimplifiedChinese: Record<EmotionId, string> = {
  angry: '生气',
  overwhelmed: '不知所措',
  hurt: '受伤',
  anxious: '焦虑',
  disappointed: '失望'
};

const recipientEnglish: Record<RecipientId, string> = {
  friend: 'you',
  teammate: 'the team',
  teacher: 'you',
  family: 'you'
};

const groupProjectPattern =
  /group\s+project|groupmate|teammate|team\s+task|workload|responsibilit|小組|小组|組員|组员|分工|功課|功课/i;

function isGroupProjectConflict(draft: string): boolean {
  return groupProjectPattern.test(draft);
}

function englishFallback(input: RewriteInput): string {
  const emotion = emotionEnglish[input.emotion];
  const target = recipientEnglish[input.recipient];

  if (isGroupProjectConflict(input.draft)) {
    if (input.tone === 'formal') {
      return `I am feeling ${emotion} because the group-project workload seems uneven. Could we review the tasks and agree on clear responsibilities and deadlines?`;
    }
    if (input.tone === 'direct') {
      return `I feel ${emotion} because the group-project workload seems uneven. We need to review the tasks and agree on fair responsibilities and deadlines.`;
    }
    return `I’m feeling ${emotion} because the group-project workload seems uneven. Could we review the tasks and agree on the responsibilities together?`;
  }

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
  if (isGroupProjectConflict(input.draft)) {
    if (input.tone === 'formal') {
      return `我目前感到${emotion}，因為小組項目的工作分配似乎不太平均。請問我們可以重新確認分工和期限嗎？`;
    }
    if (input.tone === 'direct') {
      return `我感到${emotion}，因為小組項目的工作分配似乎不太平均。我們需要重新確認分工和期限。`;
    }
    return `我現在感到${emotion}，因為小組項目的工作分配好像不太平均。我們可以一起重新確認分工和期限嗎？`;
  }
  if (input.tone === 'formal') {
    return `我目前對這件事感到${emotion}。我希望能冷靜地說明我的顧慮，而不是互相指責。請問我們可以安排一段時間釐清情況，並一起商量一個實際的下一步嗎？`;
  }
  if (input.tone === 'direct') {
    return `我對剛才的情況感到${emotion}，但我不希望事情變成爭吵。我們可以直接談清楚問題，再決定一個公平的下一步嗎？`;
  }
  return `我現在對這件事感到${emotion}，但我想用不責怪任何人的方式說清楚。可以先冷靜談談發生了甚麼，再一起決定下一步嗎？`;
}

function simplifiedChineseFallback(input: RewriteInput): string {
  const emotion = emotionSimplifiedChinese[input.emotion];
  if (isGroupProjectConflict(input.draft)) {
    if (input.tone === 'formal') {
      return `我目前感到${emotion}，因为小组项目的工作分配似乎不太平均。请问我们可以重新确认分工和期限吗？`;
    }
    if (input.tone === 'direct') {
      return `我感到${emotion}，因为小组项目的工作分配不太平均。我们需要重新确认分工和期限。`;
    }
    return `我现在感到${emotion}，因为小组项目的工作分配好像不太平均。我们可以一起重新确认分工和期限吗？`;
  }
  if (input.tone === 'formal') {
    return `我目前对这件事感到${emotion}。我希望能冷静地说明我的顾虑，而不是互相指责。请问我们可以安排一段时间厘清情况，并一起商量一个实际的下一步吗？`;
  }
  if (input.tone === 'direct') {
    return `我对刚才的情况感到${emotion}，但我不希望事情变成争吵。我们可以直接谈清楚问题，再决定一个公平的下一步吗？`;
  }
  return `我现在对这件事感到${emotion}，但我想用不责怪任何人的方式说清楚。可以先冷静谈谈发生了什么，再一起决定下一步吗？`;
}

function cantoneseFallback(input: RewriteInput): string {
  const emotion = emotionChinese[input.emotion];
  if (isGroupProjectConflict(input.draft)) {
    if (input.tone === 'formal') {
      return `我目前感到${emotion}，因為小組項目嘅工作分配似乎唔太平均。請問我哋可唔可以重新確認分工同死線？`;
    }
    if (input.tone === 'direct') {
      return `我感到${emotion}，因為小組項目嘅工作分配唔太平均。我哋需要重新確認分工同死線。`;
    }
    return `我而家感到${emotion}，因為小組項目嘅工作分配好似唔太平均。我哋可唔可以一齊重新確認分工同死線？`;
  }
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
    'zh-Hans': () => simplifiedChineseFallback(input),
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
  if (language === 'zh-Hans') {
    return `我现在未必适合立即发出这段信息。我会先停一停，并立即联系一位我信任的人寻求支持。`;
  }
  return `我現在未必適合立即發出這段訊息。我會先停一停，並立即聯絡一位我信任的人尋求支援。`;
}
