const urgentPatterns = [
  /kill\s+myself/i,
  /end\s+my\s+life/i,
  /(?:want|wish)\s+to\s+die/i,
  /(?:do\s+not|don't|dont|no\s+longer)\s+want\s+to\s+live/i,
  /(?:cannot|can't|cant)\s+(?:keep\s+going|go\s+on|live\s+like\s+this)/i,
  /(?:want|going|plan(?:ning)?)\s+to\s+end\s+it\s+all/i,
  /better\s+off\s+dead/i,
  /hurt\s+myself/i,
  /suicid(?:e|al)/i,
  /kill\s+you/i,
  /(?:hope|wish)\s+(?:that\s+)?you\s+(?:would\s+)?die/i,
  /go\s+die/i,
  /hurt\s+you/i,
  /(?:kill|hurt)\s+(?:him|her|them|someone)/i,
  /自殺|自杀/,
  /我要死|我想死|想死/,
  /唔想活|不想活|不想再活|活不下去/,
  /不願再活|不愿再活|不想繼續活|不想继续活|撐不下去|撑不下去/,
  /唔想做人|不想做人/,
  /傷害自己|伤害自己/,
  /殺死你|杀死你|弄死你/,
  /跳樓|跳楼/
];

export function containsUrgentRisk(text: string): boolean {
  return urgentPatterns.some((pattern) => pattern.test(text));
}
