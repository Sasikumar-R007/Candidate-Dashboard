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

function applicationProgressDate(app: any): Date | null {
  return (
    parseClientMetricDate(app.updatedAt) ||
    parseClientMetricDate(app.salaryEditedAt) ||
    parseClientMetricDate(app.lastNudgedAt) ||
    parseClientMetricDate(app.appliedDate)
  );
}

function requirementFillDate(req: any): Date | null {
  return (
    parseClientMetricDate(req.completedAt) ||
    parseClientMetricDate(req.managedAt) ||
    parseClientMetricDate(req.updatedAt)
  );
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
  if (period === "overall") return applications;
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
      const updated = applicationProgressDate(app);
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
      const updated = applicationProgressDate(app);
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
      const managementStatus = String(req.managementStatus || "").toLowerCase();
      return (
        status === "closed" ||
        status === "filled" ||
        status === "completed" ||
        managementStatus === "closed"
      );
    })
    .map((req: any) => {
      const reqDate = parseClientMetricDate(req.createdAt);
      const fillDate = requirementFillDate(req);
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

type AdminMetricsStorage = {
  getClientById(id: string): Promise<
    | {
        brandName?: string | null;
        incorporatedName?: string | null;
        isLoginOnly?: boolean | null;
      }
    | undefined
  >;
  getAllClients(): Promise<
    Array<{
      brandName?: string | null;
      incorporatedName?: string | null;
      isLoginOnly?: boolean | null;
    }>
  >;
  getRequirementsByCompany(companyName: string): Promise<any[]>;
  getRequirements(): Promise<any[]>;
  getAllJobApplications(): Promise<any[]>;
};

function dedupeRequirements(requirements: any[]): any[] {
  const byId = new Map<string, any>();
  for (const req of requirements) {
    if (req?.id && !byId.has(req.id)) {
      byId.set(req.id, req);
    }
  }
  return Array.from(byId.values());
}

function collectApplicationsForCompanies(
  allApplications: any[],
  companyNames: Set<string>,
  requirementIds: Set<string>,
): any[] {
  const seen = new Set<string>();
  const scoped: any[] = [];

  for (const app of allApplications) {
    if (!app?.id || seen.has(app.id)) continue;

    const matchesRequirement =
      app.requirementId && requirementIds.has(app.requirementId);
    const matchesCompany = companyNames.has(
      (app.company || "").trim().toLowerCase(),
    );

    if (matchesRequirement || matchesCompany) {
      scoped.push(app);
      seen.add(app.id);
    }
  }

  return scoped;
}

function clientCompanyNames(client: {
  brandName?: string | null;
  incorporatedName?: string | null;
}): string[] {
  const names = new Set<string>();
  for (const value of [client.brandName, client.incorporatedName]) {
    const trimmed = (value || "").trim();
    if (trimmed) names.add(trimmed);
  }
  return Array.from(names);
}

export async function getAdminClientMetricsScope(
  storage: AdminMetricsStorage,
  clientId?: string | null,
): Promise<{ requirements: any[]; applications: any[] }> {
  const allApplications = await storage.getAllJobApplications();

  if (clientId && clientId !== "all") {
    const client = await storage.getClientById(clientId);
    if (!client) {
      return { requirements: [], applications: [] };
    }

    const requirements: any[] = [];
    for (const companyName of clientCompanyNames(client)) {
      const companyReqs = await storage.getRequirementsByCompany(companyName);
      requirements.push(...companyReqs);
    }

    const scopedRequirements = dedupeRequirements(
      requirements.filter((req) => !req.isArchived),
    );
    const requirementIds = new Set(scopedRequirements.map((req) => req.id));
    const companyNames = new Set(
      clientCompanyNames(client).map((name) => name.trim().toLowerCase()),
    );
    const applications = collectApplicationsForCompanies(
      allApplications,
      companyNames,
      requirementIds,
    );

    return { requirements: scopedRequirements, applications };
  }

  const allClients = await storage.getAllClients();
  const knownCompanies = new Set<string>();
  for (const client of allClients) {
    if (client.isLoginOnly) continue;
    for (const name of clientCompanyNames(client)) {
      knownCompanies.add(name.trim().toLowerCase());
    }
  }

  const allRequirements = await storage.getRequirements();
  const requirements = allRequirements.filter((req) => {
    if (req.isArchived) return false;
    const company = (req.company || "").trim().toLowerCase();
    return company && knownCompanies.has(company);
  });

  const requirementIds = new Set(requirements.map((req) => req.id));
  const applications = collectApplicationsForCompanies(
    allApplications,
    knownCompanies,
    requirementIds,
  );

  return { requirements, applications };
}

export function aggregateImpactMetricsRecords(records: any[]) {
  const defaults = {
    speedToHire: 0,
    revenueImpactOfDelay: 0,
    clientNps: 0,
    candidateNps: 0,
    feedbackTurnAround: 0,
    feedbackTurnAroundAvgDays: 5,
    firstYearRetentionRate: 0,
    fulfillmentRate: 0,
    revenueRecovered: 0,
  };

  if (!records.length) return defaults;

  const average = (key: keyof typeof defaults) => {
    const values = records
      .map((row) => Number(row?.[key]))
      .filter((value) => Number.isFinite(value));
    if (!values.length) return defaults[key];
    const total = values.reduce((sum, value) => sum + value, 0);
    const avg = total / values.length;
    return key.includes("Rate") || key.includes("Nps") || key === "fulfillmentRate"
      ? Math.round(avg)
      : Math.round(avg * 10) / 10;
  };

  return {
    speedToHire: average("speedToHire"),
    revenueImpactOfDelay: average("revenueImpactOfDelay"),
    clientNps: average("clientNps"),
    candidateNps: average("candidateNps"),
    feedbackTurnAround: average("feedbackTurnAround"),
    feedbackTurnAroundAvgDays: average("feedbackTurnAroundAvgDays"),
    firstYearRetentionRate: average("firstYearRetentionRate"),
    fulfillmentRate: average("fulfillmentRate"),
    revenueRecovered: average("revenueRecovered"),
  };
}
