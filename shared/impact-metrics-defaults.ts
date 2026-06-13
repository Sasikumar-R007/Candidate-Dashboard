/** Empty impact metrics — used when no admin-entered values exist yet. */
export const EMPTY_IMPACT_METRICS = {
  speedToHire: 0,
  revenueImpactOfDelay: 0,
  clientNps: 0,
  candidateNps: 0,
  feedbackTurnAround: 0,
  feedbackTurnAroundAvgDays: 0,
  firstYearRetentionRate: 0,
  fulfillmentRate: 0,
  revenueRecovered: 0,
} as const;

export type ImpactMetricsValues = typeof EMPTY_IMPACT_METRICS;
