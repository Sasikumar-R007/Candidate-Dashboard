import { getRequirementResumeTarget } from "@shared/constants";
import { db } from "./db";
import { jobApplications, resumeSubmissions } from "@shared/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

export function padResumeCount(delivered: number, target: number): string {
  return `${String(Math.max(0, delivered)).padStart(2, "0")}/${String(Math.max(0, target)).padStart(2, "0")}`;
}

async function countResumeDeliveriesByRequirementIds(
  requirementIds: string[],
): Promise<Map<string, number>> {
  const totals = new Map<string, number>();
  if (requirementIds.length === 0) return totals;

  const [submissionRows, taggedRows] = await Promise.all([
    db
      .select({
        requirementId: resumeSubmissions.requirementId,
        count: sql<number>`count(*)::int`,
      })
      .from(resumeSubmissions)
      .where(inArray(resumeSubmissions.requirementId, requirementIds))
      .groupBy(resumeSubmissions.requirementId),
    db
      .select({
        requirementId: jobApplications.requirementId,
        count: sql<number>`count(*)::int`,
      })
      .from(jobApplications)
      .where(
        and(
          inArray(jobApplications.requirementId, requirementIds),
          eq(jobApplications.source, "recruiter_tagged"),
        ),
      )
      .groupBy(jobApplications.requirementId),
  ]);

  for (const row of submissionRows) {
    if (!row.requirementId) continue;
    totals.set(row.requirementId, (totals.get(row.requirementId) || 0) + Number(row.count || 0));
  }
  for (const row of taggedRows) {
    if (!row.requirementId) continue;
    totals.set(row.requirementId, (totals.get(row.requirementId) || 0) + Number(row.count || 0));
  }

  return totals;
}

export async function enrichRequirementsWithResumeCount<T extends {
  id: string;
  criticality?: string | null;
  toughness?: string | null;
  noOfPositions?: number | null;
}>(
  requirements: T[],
): Promise<
  Array<
    T & {
      resumeCount: string;
      resumeDelivered: number;
      resumeTarget: number;
    }
  >
> {
  if (requirements.length === 0) return [];

  const requirementIds = requirements.map((r) => r.id);
  const deliveriesByReq = await countResumeDeliveriesByRequirementIds(requirementIds);

  return requirements.map((req) => {
    const target = getRequirementResumeTarget(req);
    const delivered = deliveriesByReq.get(req.id) || 0;
    return {
      ...req,
      resumeCount: padResumeCount(delivered, target),
      resumeDelivered: delivered,
      resumeTarget: target,
    };
  });
}

export async function countJobApplicationsByRequirementIds(
  requirementIds: string[],
): Promise<Map<string, { count: number; lastAppliedDate: string | null }>> {
  const result = new Map<string, { count: number; lastAppliedDate: string | null }>();
  if (requirementIds.length === 0) return result;

  const rows = await db
    .select({
      requirementId: jobApplications.requirementId,
      count: sql<number>`count(*)::int`,
      lastApplied: sql<string | null>`max(${jobApplications.appliedDate})`,
    })
    .from(jobApplications)
    .where(inArray(jobApplications.requirementId, requirementIds))
    .groupBy(jobApplications.requirementId);

  for (const row of rows) {
    if (!row.requirementId) continue;
    result.set(row.requirementId, {
      count: Number(row.count || 0),
      lastAppliedDate: row.lastApplied ?? null,
    });
  }

  return result;
}
