/** Standalone nudge reply — no timeframe suffix. */
export const STATUS_UPDATED_PIPELINE_MESSAGE =
  "Status Updated, Kindly check your Pipeline";

export function isStandaloneNudgeMessage(template: string): boolean {
  return template === STATUS_UPDATED_PIPELINE_MESSAGE;
}

export function buildNudgeUpdateMessage(
  template: string,
  timeframe: string,
): string {
  if (isStandaloneNudgeMessage(template)) {
    return template;
  }
  return `${template} ${timeframe}`.trim();
}
