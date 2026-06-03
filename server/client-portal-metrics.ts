import {
  resolvePipelineStageKey,
  type PipelineStageKey,
} from "@shared/pipeline-stages";

const STAGE_ORDER: PipelineStageKey[] = [
  "resumeReview",
  "screening",
  "shortlisted",
  "level1",
  "level2",
  "level3",
  "finalRound",
  "hrRound",
  "offerStage",
  "closure",
  "rejected",
];

function stageRank(key: PipelineStageKey): number {
  const idx = STAGE_ORDER.indexOf(key);
  return idx < 0 ? 0 : idx;
}

export function parseClientMetricDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw.includes("-") && raw.split("-").length === 3) {
    const parts = raw.split("-");
    if (parts[0].length <= 2 && parts[1].length <= 2) {
      const [day, month, year] = parts;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isAtLeastPipelineStage(
  status: string | null | undefined,
  minStage: PipelineStageKey,
): boolean {
  const key = resolvePipelineStageKey(status);
  if (key === "rejected") return false;
  return stageRank(key) >= stageRank(minStage);
}

export function filterApplicationsByPeriod(
  applications: any[],
  period: string,
  dateStr: string | undefined,
): any[] {
  if (!dateStr) return applications;
  const filterDate = new Date(dateStr);
  if (Number.isNaN(filterDate.getTime())) return applications;

  if (period === "daily") {
    return applications.filter((app: any) => {
      const appDate = parseClientMetricDate(app.appliedDate);
      return appDate && appDate.toDateString() === filterDate.toDateString();
    });
  }

  if (period === "weekly") {
    const weekStart = new Date(filterDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return applications.filter((app: any) => {
      const appDate = parseClientMetricDate(app.appliedDate);
      return appDate && appDate >= weekStart && appDate <= weekEnd;
    });
  }

  if (period === "monthly") {
    const monthStart = new Date(filterDate.getFullYear(), filterDate.getMonth(), 1);
    const monthEnd = new Date(
      filterDate.getFullYear(),
      filterDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return applications.filter((app: any) => {
      const appDate = parseClientMetricDate(app.appliedDate);
      return appDate && appDate >= monthStart && appDate <= monthEnd;
    });
  }

  return applications;
}

export function computeClientSpeedMetrics(
  scopedRequirements: any[],
  applications: any[],
): {
  timeToFirstSubmission: number;
  timeToInterview: number;
  timeToOffer: number;
  timeToFill: number;
} {
  const firstSubmissions = scopedRequirements
    .map((req: any) => {
      const firstApp = applications
        .filter((app: any) => app.requirementId === req.id)
        .sort((a: any, b: any) => {
          const aDate = parseClientMetricDate(a.appliedDate)?.getTime() ?? 0;
          const bDate = parseClientMetricDate(b.appliedDate)?.getTime() ?? 0;
          return aDate - bDate;
        })[0];
      if (!firstApp) return null;
      const reqDate = parseClientMetricDate(req.createdAt);
      const appDate = parseClientMetricDate(firstApp.appliedDate);
      if (!reqDate || !appDate) return null;
      const days = Math.floor(
        (appDate.getTime() - reqDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return days >= 0 ? days : null;
    })
    .filter((days): days is number => days !== null);

  const interviewTimes = applications
    .filter((app: any) => isAtLeastPipelineStage(app.status, "level1"))
    .map((app: any) => {
      const appDate = parseClientMetricDate(app.appliedDate);
      const updated = parseClientMetricDate(app.updatedAt);
      if (!appDate || !updated) return null;
      const days = Math.floor(
        (updated.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return days >= 0 ? days : null;
    })
    .filter((days): days is number => days !== null);

  const offerTimes = applications
    .filter((app: any) => isAtLeastPipelineStage(app.status, "offerStage"))
    .map((app: any) => {
      const appDate = parseClientMetricDate(app.appliedDate);
      const updated = parseClientMetricDate(app.updatedAt);
      if (!appDate || !updated) return null;
      const days = Math.floor(
        (updated.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return days >= 0 ? days : null;
    })
    .filter((days): days is number => days !== null);

  const fillTimes = scopedRequirements
    .filter((req: any) => {
      const status = String(req.status || "").toLowerCase();
      return status === "closed" || status === "filled" || status === "completed";
    })
    .map((req: any) => {
      const reqDate = parseClientMetricDate(req.createdAt);
      const fillDate = parseClientMetricDate(req.updatedAt);
      if (!reqDate || !fillDate) return null;
      const days = Math.floor(
        (fillDate.getTime() - reqDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return days >= 0 ? days : null;
    })
    .filter((days): days is number => days !== null);

  const avg = (vals: number[]) =>
    vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

  return {
    timeToFirstSubmission: avg(firstSubmissions),
    timeToInterview: avg(interviewTimes),
    timeToOffer: avg(offerTimes),
    timeToFill: avg(fillTimes),
  };
}

export function computeClientQualityMetrics(applications: any[]): {
  submissionToShortList: number;
  interviewToOffer: number;
  offerAcceptance: number;
  earlyAttrition: number;
} {
  const totalSubmissions = applications.length;
  const shortlisted = applications.filter((app: any) =>
    isAtLeastPipelineStage(app.status, "shortlisted"),
  ).length;
  const interviewed = applications.filter((app: any) =>
    isAtLeastPipelineStage(app.status, "level1"),
  ).length;
  const offersExtended = applications.filter((app: any) =>
    isAtLeastPipelineStage(app.status, "offerStage"),
  ).length;
  const acceptedOffers = applications.filter((app: any) =>
    isAtLeastPipelineStage(app.status, "closure"),
  ).length;

  return {
    submissionToShortList:
      totalSubmissions > 0 ? Math.round((shortlisted / totalSubmissions) * 100) : 0,
    interviewToOffer:
      interviewed > 0 ? Math.round((offersExtended / interviewed) * 100) : 0,
    offerAcceptance:
      offersExtended > 0 ? Math.round((acceptedOffers / offersExtended) * 100) : 0,
    earlyAttrition: 0,
  };
}

export function buildClientSpeedChartPoints(
  scopedRequirements: any[],
  clientApplications: any[],
): Array<{
  month: string;
  timeToFirstSubmission: number;
  timeToInterview: number;
  timeToOffer: number;
  timeToFill: number;
}> {
  const now = new Date();
  return Array.from({ length: 6 }, (_, idx) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const monthEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const monthLabel = monthDate.toLocaleString("en-US", { month: "short" });
    const appsInMonth = clientApplications.filter((app: any) => {
      const applied = parseClientMetricDate(app.appliedDate);
      return applied && applied >= monthDate && applied <= monthEnd;
    });
    const metrics = computeClientSpeedMetrics(scopedRequirements, appsInMonth);
    return { month: monthLabel, ...metrics };
  });
}

export function buildClientQualityChartPoints(
  clientApplications: any[],
): Array<{
  month: string;
  submissionToShortList: number;
  interviewToOffer: number;
  offerAcceptance: number;
  earlyAttrition: number;
}> {
  const now = new Date();
  return Array.from({ length: 6 }, (_, idx) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const monthEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const monthLabel = monthDate.toLocaleString("en-US", { month: "short" });
    const appsInMonth = clientApplications.filter((app: any) => {
      const applied = parseClientMetricDate(app.appliedDate);
      return applied && applied >= monthDate && applied <= monthEnd;
    });
    const metrics = computeClientQualityMetrics(appsInMonth);
    return { month: monthLabel, ...metrics };
  });
}
