const urgentPatterns = [
  /kill\s+myself/i,
  /end\s+my\s+life/i,
  /hurt\s+myself/i,
  /suicid(?:e|al)/i,
  /kill\s+you/i,
  /hurt\s+you/i,
  /自殺|自杀/,
  /唔想活|不想活|不想再活/,
  /傷害自己|伤害自己/,
  /殺死你|杀死你|弄死你/,
  /跳樓|跳楼/
];

export function containsUrgentRisk(text: string): boolean {
  return urgentPatterns.some((pattern) => pattern.test(text));
}
