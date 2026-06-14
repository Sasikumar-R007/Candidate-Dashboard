export const RESUME_TARGET_MATRIX: Record<string, Record<string, number>> = {
  HIGH: {
    Easy: 6,
    Medium: 4,
    Tough: 2,
  },
  MEDIUM: {
    Easy: 5,
    Medium: 3,
    Tough: 2,
  },
  LOW: {
    Easy: 4,
    Medium: 3,
    Tough: 2,
  },
};

/** Per-position resume target from priority × toughness matrix. */
export function getResumeTargetPerPosition(criticality: string, toughness: string): number {
  const criticalityUpper = criticality?.toUpperCase() || 'MEDIUM';
  const toughnessCapitalized = toughness
    ? toughness.charAt(0).toUpperCase() + toughness.slice(1).toLowerCase()
    : 'Medium';

  return RESUME_TARGET_MATRIX[criticalityUpper]?.[toughnessCapitalized] ?? 4;
}

/**
 * Total resumes to deliver for a requirement =
 * priority-distribution count (per position) × no. of positions.
 */
export function getResumeTarget(
  criticality: string,
  toughness: string,
  noOfPositions: number = 1,
): number {
  const positions = Math.max(1, Number(noOfPositions) || 1);
  return getResumeTargetPerPosition(criticality, toughness) * positions;
}

export function getRequirementResumeTarget(requirement: {
  criticality?: string | null;
  toughness?: string | null;
  noOfPositions?: number | null;
}): number {
  return getResumeTarget(
    requirement.criticality || 'MEDIUM',
    requirement.toughness || 'Medium',
    requirement.noOfPositions ?? 1,
  );
}

export type CriticalityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ToughnessLevel = 'Easy' | 'Medium' | 'Tough';
export type MetricsScope = 'recruiter' | 'team' | 'org';
