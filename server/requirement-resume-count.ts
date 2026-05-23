import { getResumeTarget } from "@shared/constants";
import { db } from "./db";
import { jobApplications, resumeSubmissions } from "@shared/schema";

export function padResumeCount(delivered: number, target: number): string {
  return `${String(Math.max(0, delivered)).padStart(2, "0")}/${String(Math.max(0, target)).padStart(2, "0")}`;
}

export async function enrichRequirementsWithResumeCount<T extends {
  id: string;
  criticality?: string | null;
  toughness?: string | null;
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
  const allSubmissions = await db.select().from(resumeSubmissions);
  const allTagged = await db.select().from(jobApplications);

  const submissionsByReq = new Map<string, number>();
  for (const s of allSubmissions) {
    if (!s.requirementId || !requirementIds.includes(s.requirementId)) continue;
    submissionsByReq.set(
      s.requirementId,
      (submissionsByReq.get(s.requirementId) || 0) + 1,
    );
  }

  const taggedByReq = new Map<string, number>();
  for (const app of allTagged) {
    if (
      app.source !== "recruiter_tagged" ||
      !app.requirementId ||
      !requirementIds.includes(app.requirementId)
    ) {
      continue;
    }
    taggedByReq.set(
      app.requirementId,
      (taggedByReq.get(app.requirementId) || 0) + 1,
    );
  }

  return requirements.map((req) => {
    const target = getResumeTarget(req.criticality || "MEDIUM", req.toughness || "Medium");
    const delivered =
      (submissionsByReq.get(req.id) || 0) + (taggedByReq.get(req.id) || 0);
    return {
      ...req,
      resumeCount: padResumeCount(delivered, target),
      resumeDelivered: delivered,
      resumeTarget: target,
    };
  });
}
