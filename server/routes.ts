import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import fs from "fs";
import passport from "passport";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { insertProfileSchema, insertJobPreferencesSchema, insertSkillSchema, insertSavedJobSchema, insertJobApplicationSchema, insertRequirementSchema, insertEmployeeSchema, insertImpactMetricsSchema, supportConversations, supportMessages, insertMeetingSchema, meetings, insertTargetMappingsSchema, insertRevenueMappingSchema, revenueMappings, chatRooms, chatMessages, chatParticipants, chatAttachments, chatUnreadCounts, insertChatRoomSchema, insertChatMessageSchema, insertChatParticipantSchema, insertChatAttachmentSchema, insertRecruiterCommandSchema, recruiterCommands, employees, candidates, requirements, recruiterJobs, jobApplications, passwordResets, nudges, consentLogs, profiles, candidateApplicationComments } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { sql, eq, and, or, desc, lte, gte, inArray, isNull } from "drizzle-orm";
import multer from "multer";
import path from "path";
import "./types"; // Import session types
import { db } from "./db";

/** Public URL for client-member invite links (must match where the Vite app is served). */
function resolveClientInviteBaseUrl(req: Request): string {
  const fromEnv = (process.env.FRONTEND_URL || process.env.CLIENT_FRONTEND_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    const host = req.get("host");
    if (host) return `https://${host}`;
    return "https://staffos.io";
  }

  const origin = req.get("origin");
  if (origin) {
    try {
      const u = new URL(origin);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* ignore */
    }
  }

  const referer = req.get("referer");
  if (referer) {
    try {
      const u = new URL(referer);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* ignore */
    }
  }

  return "http://localhost:5173";
}

function calculateQuartersSince(joiningDate: string | Date | null | undefined): number {
  if (!joiningDate) return 0;
  const join = new Date(joiningDate);
  const now = new Date();
  if (isNaN(join.getTime())) return 0;

  // Fiscal year starts in April. 
  // Map month (0-11) to fiscal quarter index (0-3)
  // Apr(3), May(4), Jun(5) -> Q1 (index 0)
  // Jul(6), Aug(7), Sep(8) -> Q2 (index 1)
  // Oct(9), Nov(10), Dec(11) -> Q3 (index 2)
  // Jan(0), Feb(1), Mar(2) -> Q4 (index 3)
  
  const getFiscalQuarterIndex = (date: Date) => {
    const month = date.getMonth();
    if (month >= 3) return Math.floor((month - 3) / 3);
    return 3; // Jan-Mar is the 4th quarter
  };

  const getFiscalYear = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return month >= 3 ? year : year - 1;
  };

  const startFY = getFiscalYear(join);
  const startQ = getFiscalQuarterIndex(join);
  
  const currentFY = getFiscalYear(now);
  const currentQ = getFiscalQuarterIndex(now);

  const totalQuarters = (currentFY - startFY) * 4 + (currentQ - startQ);
  
  // We count the starting quarter as well if they joined at the beginning, 
  // but usually "Quarters Achieved" implies completed ones or participation.
  // The user says "based on joining date (month -> based on actual Quarter format)".
  // Let's return the number of quarters they have been active in.
  return Math.max(0, totalQuarters + 1); 
}

import { logRequirementAdded, logCandidateSubmitted, logClosureMade, logCandidatePipelineChanged } from "./activity-logger";
import { parseResumeFile, parseBulkResumes } from "./resume-parser";
import { parseJDWithAI } from "./ai-jd-parser";
import { sendEmployeeWelcomeEmail, sendCandidateWelcomeEmail, sendOTPEmail } from "./email-service";
import { setupGoogleAuth } from "./passport-google";
import { DEFAULT_EMPLOYEE_WELCOME_MESSAGE, EMPLOYEE_WELCOME_MESSAGE_KEY, getAppSetting, upsertAppSetting } from "./admin-settings";
import {
  buildSearchQuery,
  getSortOrder,
  calculateRelevanceScore,
  normalizeSkills,
  parseAndNormalizeSkills
} from "./source-resume-search";
import {
  isClientPortalRole,
  isClientAdminRole,
} from "@shared/client-roles";
import {
  resolveClientCompanyForEmployee,
  getJobApplicationsScopedToClientEmployee,
  clientEmployeeCanAccessApplication,
  getClientScopedRequirements,
  clientNudgeInScope,
} from "./client-org";
import {
  getClientTeamContext,
  createClientDepartment,
  createClientMemberInvite,
  createClientTeamMember,
  updateClientTeamMember,
  deleteClientTeamMember,
  assignRequirementToClientMember,
  getClientInvitePreview,
  acceptClientMemberInvite,
} from "./client-team";
import { sendClientMemberInviteEmail } from "./email-service";
import {
  syncAllTargetMappingsFromRevenue,
  enrichTargetMappingWithRevenue,
  computeTargetStatsFromRevenue,
  countQuartersTargetMet,
} from "./target-revenue-sync";
import { enrichRequirementsWithResumeCount } from "./requirement-resume-count";

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const chatUploadsDir = 'uploads/chat';
if (!fs.existsSync(chatUploadsDir)) {
  fs.mkdirSync(chatUploadsDir, { recursive: true });
}

const resumeUploadsDir = 'uploads/resumes';
if (!fs.existsSync(resumeUploadsDir)) {
  fs.mkdirSync(resumeUploadsDir, { recursive: true });
}

async function ensureClosureActionsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS closure_actions (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      revenue_mapping_id varchar NOT NULL UNIQUE,
      action_type text NOT NULL,
      action_date text,
      reason text,
      day_bucket text,
      created_at text NOT NULL,
      updated_at text NOT NULL
    )
  `);
}

async function ensureConsentLogsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS consent_logs (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id text NOT NULL,
      role text NOT NULL,
      consent_type text NOT NULL,
      policy_version text NOT NULL,
      accepted_at timestamp NOT NULL DEFAULT now(),
      ip_address text,
      user_agent text
    )
  `);
}

const ONE_TIME_CONSENT_TYPES = new Set([
  "platform_consent",
  "employee_agreement",
  "client_agreement",
]);

async function hasLoggedConsent(userId: string, consentType: string): Promise<boolean> {
  try {
    await ensureConsentLogsTable();
    const hit = await db
      .select({ id: consentLogs.id })
      .from(consentLogs)
      .where(and(eq(consentLogs.userId, userId), eq(consentLogs.consentType, consentType)))
      .limit(1);
    return hit.length > 0;
  } catch (error) {
    console.error("hasLoggedConsent error:", error);
    return false;
  }
}

async function getLatestConsentAcceptedAtIso(userId: string, consentType: string): Promise<string | null> {
  try {
    await ensureConsentLogsTable();
    const rows = await db
      .select({ acceptedAt: consentLogs.acceptedAt })
      .from(consentLogs)
      .where(and(eq(consentLogs.userId, userId), eq(consentLogs.consentType, consentType)))
      .orderBy(desc(consentLogs.acceptedAt))
      .limit(1);
    const at = rows[0]?.acceptedAt;
    if (!at) return null;
    return at instanceof Date ? at.toISOString() : new Date(String(at)).toISOString();
  } catch (error) {
    console.error("getLatestConsentAcceptedAtIso error:", error);
    return null;
  }
}

/** Must match client `ProtectedRoute` gated roles and `/api/auth/verify-session`. */
const GATED_EMPLOYEE_AGREEMENT_ROLES = new Set([
  "recruiter",
  "talent_advisor",
  "ta",
  "teamlead",
  "team_leader",
  "teamleader",
  "tl",
  "admin",
]);

function normalizeEmployeeRoleForAgreement(role: string | null | undefined): string {
  return String(role || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

async function computeEmployeeAgreementAccepted(employee: { id: string; role?: string | null }): Promise<boolean> {
  const normalizedRole = normalizeEmployeeRoleForAgreement(employee.role);
  const needsEmployeeAgreement = GATED_EMPLOYEE_AGREEMENT_ROLES.has(normalizedRole);
  if (!needsEmployeeAgreement) return true;
  return hasLoggedConsent(employee.id, "employee_agreement");
}

function parseAdminDate(value?: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const parts = value.split(/[/-]/).map((part) => Number(part));
  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    const [day, month, year] = parts;
    const fallbackDate = new Date(year, month - 1, day);
    return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

  return null;
}

function getEarlyExitDayBucket(joinedDate?: string | null, actionDate?: string | null) {
  const joinedOn = parseAdminDate(joinedDate);
  const selectedDate = parseAdminDate(actionDate);

  if (!joinedOn || !selectedDate) {
    return null;
  }

  const diffInMs = selectedDate.getTime() - joinedOn.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

  if (diffInDays <= 90) {
    return "<90";
  }

  return ">90";
}

// Helper to calculate working hours (9 AM - 6 PM)
function calculateWorkingHours(start: Date, end: Date): number {
  if (start >= end) return 0;
  
  let totalMinutes = 0;
  const current = new Date(start);
  const endLimit = new Date(end);
  
  // Iterate minute by minute or hour by hour for efficiency?
  // Hour by hour is better, then handle partial hours at start and end.
  
  while (current < endLimit) {
    const day = current.getDay();
    const isWorkingDay = day !== 0 && day !== 6;
    
    if (isWorkingDay) {
      const currentHour = current.getHours();
      
      // If we are in working hours
      if (currentHour >= 9 && currentHour < 18) {
        // Calculate minutes in this hour
        const hourStart = new Date(current);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(current);
        hourEnd.setMinutes(59, 59, 999);
        
        const effectiveStart = current > hourStart ? current : hourStart;
        const effectiveEnd = endLimit < hourEnd ? endLimit : hourEnd;
        
        const diffMs = effectiveEnd.getTime() - effectiveStart.getTime();
        if (diffMs > 0) {
          totalMinutes += diffMs / (1000 * 60);
        }
      }
    }
    
    // Advance to start of next hour
    current.setHours(current.getHours() + 1);
    current.setMinutes(0, 0, 0);
  }
  
  return totalMinutes / 60;
}

let lastNudgeEscalationSyncAt = 0;
let nudgeEscalationSyncInFlight: Promise<void> | null = null;

/** Throttled sync so notification feed requests do not block on every nudge update. */
async function maybeSyncActiveNudgeEscalations(): Promise<void> {
  const now = Date.now();
  if (now - lastNudgeEscalationSyncAt < 60_000) return;
  if (nudgeEscalationSyncInFlight) {
    await nudgeEscalationSyncInFlight;
    return;
  }
  nudgeEscalationSyncInFlight = (async () => {
    try {
      await syncActiveNudgeEscalations();
      lastNudgeEscalationSyncAt = Date.now();
    } catch (error) {
      console.error("[nudges] Escalation sync failed (feed will use current levels):", error);
    } finally {
      nudgeEscalationSyncInFlight = null;
    }
  })();
  await nudgeEscalationSyncInFlight;
}

async function syncActiveNudgeEscalations(): Promise<void> {
  const allNudges = await storage.getActiveNudges();
  const now = new Date();

  for (const nudge of allNudges) {
    if (nudge.isResponded) continue;

    const createdAt = nudge.createdAt;
    if (!createdAt) continue;

    const createdDate = new Date(createdAt as unknown as string);
    if (isNaN(createdDate.getTime())) continue;

    const elapsedWorkingHours = calculateWorkingHours(createdDate, now);
    const status = (nudge.currentStatus || "").toLowerCase();
    const isOfferStage = status.includes("offer");

    let requiredLevel = "recruiter";
    if (isOfferStage) {
      if (elapsedWorkingHours >= 9) requiredLevel = "client";
      else if (elapsedWorkingHours >= 6) requiredLevel = "admin";
      else if (elapsedWorkingHours >= 3) requiredLevel = "team_leader";
    } else {
      if (elapsedWorkingHours >= 18) requiredLevel = "client";
      else if (elapsedWorkingHours >= 12) requiredLevel = "admin";
      else if (elapsedWorkingHours >= 6) requiredLevel = "team_leader";
    }

    if (nudge.escalationLevel !== requiredLevel) {
      try {
        await storage.updateNudgeEscalation(nudge.id, requiredLevel, now);
      } catch (updateErr) {
        console.error(`Failed to update nudge ${nudge.id}:`, updateErr);
      }
    }
  }
}

function formatOrdinalShortDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";
  const day = d.getDate();
  const j = day % 10;
  const k = day % 100;
  const suffix =
    j === 1 && k !== 11 ? "st" : j === 2 && k !== 12 ? "nd" : j === 3 && k !== 13 ? "rd" : "th";
  const month = d.toLocaleString("en-GB", { month: "short" });
  return `${day}${suffix} ${month}`;
}

function getRevenueMappingRecencyTs(mapping: {
  closureDate?: string | null;
  createdAt?: string | null;
  offeredDate?: string | null;
}): number {
  const candidates = [mapping.closureDate, mapping.createdAt, mapping.offeredDate];
  for (const value of candidates) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed.getTime();
  }
  return 0;
}

function resolveTeamLeaderName(
  recruiterId: string | null | undefined,
  allEmployees: Array<{ id: string; employeeId: string; name: string; reportingTo: string | null }>,
): string {
  if (!recruiterId) return "Unknown TL";
  const rec = allEmployees.find((e) => e.id === recruiterId);
  if (!rec) return "Unknown TL";
  const key = rec.reportingTo?.trim();
  if (!key) return "Unknown TL";
  const tl = allEmployees.find((e) => e.id === key || e.employeeId === key);
  return tl?.name || "Unknown TL";
}

function isRecentNotification(dateInput: string | Date | null | undefined, hours = 24): boolean {
  if (!dateInput) return false;
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() <= hours * 60 * 60 * 1000;
}

/** Match nudge / feed rows where recruiterId may be employees.id or employees.employeeId */
function matchesEmployeeRef(
  employee: { id: string; employeeId?: string | null },
  ref: string | null | undefined,
): boolean {
  if (!ref) return false;
  if (ref === employee.id) return true;
  const code = employee.employeeId?.trim();
  return !!code && ref === code;
}

function getTeamLeaderRecruiters(teamLeader: { id: string; employeeId?: string | null; name?: string | null }, allEmployees: Array<{ id: string; employeeId?: string | null; name?: string | null; role?: string | null; reportingTo?: string | null }>) {
  const tlName = (teamLeader.name || "").toLowerCase();
  return allEmployees.filter(
    (emp) =>
      emp.role === "recruiter" &&
      (emp.reportingTo === teamLeader.employeeId ||
        emp.reportingTo === teamLeader.id ||
        (emp.reportingTo || "").toLowerCase() === tlName),
  );
}

function revenueMappingBelongsToRecruiter(
  mapping: { talentAdvisorId?: string | null; talentAdvisorName?: string | null },
  recruiter: { id: string; employeeId?: string | null; name?: string | null },
): boolean {
  return (
    matchesEmployeeRef(recruiter, mapping.talentAdvisorId) ||
    (mapping.talentAdvisorName || "").toLowerCase() === (recruiter.name || "").toLowerCase()
  );
}

function isClosedRevenueMapping(mapping: {
  status?: string | null;
  managementStatus?: string | null;
  closureDate?: string | null;
  offeredDate?: string | null;
}): boolean {
  const status = (mapping.status || mapping.managementStatus || "").toLowerCase();
  if (status === "closed") return true;
  if (mapping.closureDate && String(mapping.closureDate).trim()) return true;
  if (mapping.offeredDate && String(mapping.offeredDate).trim()) return true;
  // Revenue mapping rows represent placements/closures when recorded by Admin
  return true;
}

const REVENUE_QUARTER_CODES = ["JFM", "AMJ", "JAS", "OND"] as const;

function normalizeRevenueQuarterCode(raw: string | null | undefined): string {
  const u = (raw || "").toUpperCase().trim();
  if (REVENUE_QUARTER_CODES.includes(u as (typeof REVENUE_QUARTER_CODES)[number])) return u;
  const qNum = parseInt(u.replace(/\D/g, ""), 10);
  if (qNum >= 1 && qNum <= 4) return REVENUE_QUARTER_CODES[qNum - 1];
  return u || "Unknown";
}

function chartQuarterLabelFromCode(year: number, quarterCode: string): string {
  const idx = REVENUE_QUARTER_CODES.indexOf(quarterCode as (typeof REVENUE_QUARTER_CODES)[number]);
  return idx >= 0 ? `Q${idx + 1} ${year}` : `${quarterCode} ${year}`;
}

async function canonicalizeEmployeeIdForNudge(ref: string | null | undefined): Promise<string | null> {
  if (!ref) return null;
  const trimmed = ref.trim();
  if (!trimmed) return null;
  const byId = await storage.getEmployeeById(trimmed);
  if (byId) return byId.id;
  const byCode = await storage.getEmployeeByEmployeeId(trimmed);
  if (byCode) return byCode.id;
  return trimmed;
}

function normalizeStatusToken(status: string | null | undefined): string {
  return (status || "").trim().toLowerCase().replace(/\s+/g, "");
}

function isShortlistedApplicationStatus(status: string | null | undefined): boolean {
  const n = normalizeStatusToken(status);
  if (!n) return false;
  return n === "shortlisted" || n.includes("shortlist");
}

function notificationFeedLine(...segments: (string | null | undefined)[]): string {
  return segments
    .map((s) => (s == null ? "" : String(s).trim()))
    .filter(Boolean)
    .join(" - ");
}

function taEscalationFeedLine(n: { jobTitle?: string | null; candidateName?: string | null; escalationLevel?: string | null }): string {
  const lvl = (n.escalationLevel || "").toLowerCase();
  const job = n.jobTitle || "Role";
  const cand = n.candidateName || "Candidate";
  if (lvl === "team_leader") return notificationFeedLine([job, cand, "Escalated to TL"]);
  if (lvl === "admin") return notificationFeedLine([job, cand, "Escalated to Admin"]);
  if (lvl === "client") return notificationFeedLine([job, cand, "Escalated to Client"]);
  return notificationFeedLine([job, cand, "Escalated"]);
}

async function buildEmployeeNotificationsFeed(employee: any) {
  const role = (employee?.role || "").toLowerCase();
  const isTA = role === "recruiter" || role === "talent_advisor" || role === "ta";
  const isTL = role === "team_leader";
  const isAdmin = role === "admin";

  void maybeSyncActiveNudgeEscalations().catch(() => {});
  const [allNudges, allEmployees, allRevenueMappings, allRequirements, allApplications] = await Promise.all([
    storage.getActiveNudges().catch((err) => {
      console.error("[notifications-feed] getActiveNudges failed:", err);
      return [] as Awaited<ReturnType<typeof storage.getActiveNudges>>;
    }),
    storage.getAllEmployees().catch((err) => {
      console.error("[notifications-feed] getAllEmployees failed:", err);
      return [] as Awaited<ReturnType<typeof storage.getAllEmployees>>;
    }),
    storage.getAllRevenueMappings().catch((err) => {
      console.error("[notifications-feed] getAllRevenueMappings failed:", err);
      return [] as Awaited<ReturnType<typeof storage.getAllRevenueMappings>>;
    }),
    storage.getRequirements().catch((err) => {
      console.error("[notifications-feed] getRequirements failed:", err);
      return [] as Awaited<ReturnType<typeof storage.getRequirements>>;
    }),
    storage.getAllJobApplications().catch((err) => {
      console.error("[notifications-feed] getAllJobApplications failed:", err);
      return [] as Awaited<ReturnType<typeof storage.getAllJobApplications>>;
    }),
  ]);

  const toIso = (value: any): string | null => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  if (isAdmin) {
    const adminNudges = allNudges
      .filter((n) => !n.isResponded && !n.isRead && n.escalationLevel === "admin")
      .map((n) => ({
        id: n.id,
        line: notificationFeedLine([n.jobTitle, resolveTeamLeaderName(n.recruiterId, allEmployees)]),
        createdAt: toIso(n.createdAt),
        isUnread: !n.isRead,
      }));

    const clientEscalations = allNudges
      .filter((n) => !n.isResponded && !n.isRead && n.escalationLevel === "client")
      .map((n) => ({
        id: n.id,
        line: notificationFeedLine([
          n.candidateName,
          resolveTeamLeaderName(n.recruiterId, allEmployees),
          `Escalated to ${n.company}`,
        ]),
        createdAt: toIso(n.createdAt),
        isUnread: !n.isRead,
      }));

    const closures = [...allRevenueMappings]
      .sort((a, b) => getRevenueMappingRecencyTs(b) - getRevenueMappingRecencyTs(a))
      .slice(0, 100)
      .map((rm) => {
        const createdAt = toIso(rm.createdAt);
        return {
          id: rm.id,
          line: notificationFeedLine([
            rm.position,
            rm.teamLeadName,
            formatOrdinalShortDate(rm.closureDate || rm.createdAt),
          ]),
          createdAt,
          isUnread: isRecentNotification(createdAt),
        };
      });

    return {
      role: "admin",
      closures,
      nudges: adminNudges,
      escalatedNudges: clientEscalations,
      newRequirements: [],
      newCandidateApplied: [],
      unreadCount:
        adminNudges.filter((i) => i.isUnread).length +
        clientEscalations.filter((i) => i.isUnread).length +
        closures.filter((i) => i.isUnread).length,
    };
  }

  if (isTL) {
    const teamMemberKeys = new Set<string>();
    for (const emp of allEmployees.filter(
      (e) => e.reportingTo === employee.employeeId || e.reportingTo === employee.id,
    )) {
      teamMemberKeys.add(emp.id);
      if (emp.employeeId) teamMemberKeys.add(emp.employeeId);
    }
    const myIds = [employee.id, employee.employeeId].filter(Boolean) as string[];
    const belongsToTeam = (recruiterId?: string | null) =>
      !!recruiterId && (myIds.includes(recruiterId) || teamMemberKeys.has(recruiterId));

    const newRequirements = allRequirements
      .filter((r) => (r.teamLead || "").toLowerCase() === (employee.name || "").toLowerCase())
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 100)
      .map((r) => {
        const createdAt = toIso(r.createdAt);
        return {
          id: r.id,
          line: notificationFeedLine([r.position, r.company]),
          createdAt,
          isUnread: isRecentNotification(createdAt),
        };
      });

    const nudges = allNudges
      .filter(
        (n) =>
          !n.isResponded &&
          !n.isRead &&
          n.escalationLevel === "team_leader" &&
          belongsToTeam(n.recruiterId),
      )
      .map((n) => ({
        id: n.id,
        line: notificationFeedLine([
          n.jobTitle,
          allEmployees.find((e) => matchesEmployeeRef(e, n.recruiterId))?.name || "TA",
        ]),
        createdAt: toIso(n.createdAt),
        isUnread: !n.isRead,
      }));

    const escalatedNudges = allNudges
      .filter(
        (n) =>
          !n.isResponded &&
          !n.isRead &&
          (n.escalationLevel === "admin" || n.escalationLevel === "client") &&
          belongsToTeam(n.recruiterId),
      )
      .map((n) => ({
        id: n.id,
        line:
          n.escalationLevel === "client"
            ? notificationFeedLine([n.candidateName, n.jobTitle, "Escalated to Client"])
            : notificationFeedLine([n.candidateName, n.jobTitle, "Escalated to Admin"]),
        createdAt: toIso(n.createdAt),
        isUnread: !n.isRead,
      }));

    const closures = [...allRevenueMappings]
      .filter((rm) => rm.teamLeadId === employee.id || (rm.teamLeadName || "").toLowerCase() === (employee.name || "").toLowerCase())
      .sort((a, b) => getRevenueMappingRecencyTs(b) - getRevenueMappingRecencyTs(a))
      .slice(0, 100)
      .map((rm) => {
        const createdAt = toIso(rm.createdAt);
        return {
          id: rm.id,
          line: notificationFeedLine([
            rm.position,
            rm.talentAdvisorName,
            formatOrdinalShortDate(rm.closureDate || rm.createdAt),
          ]),
          createdAt,
          isUnread: isRecentNotification(createdAt),
        };
      });

    return {
      role: "team_leader",
      newRequirements,
      nudges,
      escalatedNudges,
      closures,
      newCandidateApplied: [],
      unreadCount:
        newRequirements.filter((i) => i.isUnread).length +
        nudges.length +
        escalatedNudges.length +
        closures.filter((i) => i.isUnread).length,
    };
  }

  if (isClientPortalRole(role)) {
    const { companyName, requirements: clientRequirements, memberRequirementIds } =
      await getClientScopedRequirements({
        id: employee.id,
        role: employee.role,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        clientCompanyId: employee.clientCompanyId,
      });

    const normalizedClientCompany = (companyName || "").trim().toLowerCase();
    const clientRequirementIds = new Set(clientRequirements.map((r) => r.id));
    const clientRequirementPositions = new Set(
      clientRequirements.map((r) => (r.position || "").trim().toLowerCase()).filter(Boolean),
    );

    const applicationById = new Map(
      allApplications.map((app: any) => [app.id, app]),
    );

    const nudges = allNudges
      .filter(
        (n) =>
          !n.isResponded &&
          n.escalationLevel === "client" &&
          clientNudgeInScope(n, companyName, memberRequirementIds, applicationById),
      )
      .map((n) => ({
        id: n.id,
        line: notificationFeedLine([n.candidateName || "Candidate", n.jobTitle || "Role"]),
        createdAt: toIso(n.createdAt),
        isUnread: !n.isRead,
      }));

    let revenueClosures = [...allRevenueMappings].filter(
      (rm) => (rm.clientName || "").trim().toLowerCase() === normalizedClientCompany,
    );
    if (memberRequirementIds !== null) {
      revenueClosures = revenueClosures.filter((rm) =>
        clientRequirementPositions.has((rm.position || "").trim().toLowerCase()),
      );
    }

    const closures = revenueClosures
      .sort((a, b) => getRevenueMappingRecencyTs(b) - getRevenueMappingRecencyTs(a))
      .slice(0, 100)
      .map((rm) => {
        const createdAt = toIso(rm.closureDate || rm.createdAt);
        return {
          id: rm.id,
          line: notificationFeedLine([
            rm.candidateName || "Candidate",
            rm.position || "Role",
            rm.talentAdvisorName || "TA",
          ]),
          createdAt,
          isUnread: isRecentNotification(createdAt, 72),
        };
      });

    const newCandidateApplied = allApplications
      .filter((app: any) => {
        if (!isShortlistedApplicationStatus(app.status)) return false;

        const reqId = (app.requirementId || "").trim();
        if (memberRequirementIds !== null) {
          return !!reqId && memberRequirementIds.has(reqId);
        }

        const appCompany = (app.company || "").trim().toLowerCase();
        const appRole = (app.jobTitle || app.requirementPosition || "").trim().toLowerCase();

        return (
          (reqId && clientRequirementIds.has(reqId)) ||
          (appCompany && appCompany === normalizedClientCompany) ||
          (appRole && clientRequirementPositions.has(appRole))
        );
      })
      .sort((a: any, b: any) => new Date(b.updatedAt || b.appliedDate || 0).getTime() - new Date(a.updatedAt || a.appliedDate || 0).getTime())
      .slice(0, 100)
      .map((app: any) => {
        const createdAt = toIso(app.updatedAt || app.appliedDate);
        return {
          id: app.id,
          line: notificationFeedLine([
            app.candidateName || "Candidate",
            app.jobTitle || app.requirementPosition || "Role",
            "Shortlisted",
          ]),
          createdAt,
          isUnread: isRecentNotification(createdAt, 72),
        };
      });

    return {
      role: "client",
      newRequirements: [],
      nudges,
      escalatedNudges: [],
      closures,
      newCandidateApplied,
      unreadCount:
        nudges.filter((i) => i.isUnread).length +
        closures.filter((i) => i.isUnread).length +
        newCandidateApplied.filter((i) => i.isUnread).length,
    };
  }

  if (isTA) {
    const newRequirements = allRequirements
      .filter(
        (r) =>
          matchesEmployeeRef(employee, r.talentAdvisorId) ||
          (r.talentAdvisor || "").toLowerCase() === (employee.name || "").toLowerCase(),
      )
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 100)
      .map((r) => {
        const createdAt = toIso(r.createdAt);
        return {
          id: r.id,
          line: notificationFeedLine([r.position, r.company]),
          createdAt,
          isUnread: isRecentNotification(createdAt),
        };
      });

    const nudges = allNudges
      .filter(
        (n) =>
          !n.isResponded &&
          !n.isRead &&
          n.escalationLevel === "recruiter" &&
          matchesEmployeeRef(employee, n.recruiterId),
      )
      .map((n) => ({
        id: n.id,
        line: notificationFeedLine([n.jobTitle, n.candidateName]),
        createdAt: toIso(n.createdAt),
        isUnread: !n.isRead,
      }));

    const taEscalatedLevels = new Set(["team_leader", "admin", "client"]);
    const escalatedNudges = allNudges
      .filter(
        (n) =>
          !n.isResponded &&
          taEscalatedLevels.has((n.escalationLevel || "").toLowerCase()) &&
          matchesEmployeeRef(employee, n.recruiterId),
      )
      .map((n) => ({
        id: n.id,
        line: taEscalationFeedLine(n),
        createdAt: toIso(n.createdAt),
        isUnread: !n.isRead,
      }));

    const closures = [...allRevenueMappings]
      .filter(
        (rm) =>
          rm.talentAdvisorId === employee.id ||
          matchesEmployeeRef(employee, rm.talentAdvisorId) ||
          (rm.talentAdvisorName || "").toLowerCase() === (employee.name || "").toLowerCase(),
      )
      .sort((a, b) => getRevenueMappingRecencyTs(b) - getRevenueMappingRecencyTs(a))
      .slice(0, 100)
      .map((rm) => {
        const createdAt = toIso(rm.closureDate || rm.createdAt);
        return {
          id: rm.id,
          line: notificationFeedLine([
            rm.position,
            rm.clientName || "Client",
            formatOrdinalShortDate(rm.closureDate || rm.createdAt),
          ]),
          createdAt,
          isUnread: isRecentNotification(createdAt, 72),
        };
      });

    const recruiterJobIds = new Set((await storage.getRecruiterJobsByRecruiterId(employee.id)).map((j) => j.id));
    const newCandidateApplied = allApplications
      .filter((app) => {
        const ownJob = !!app.recruiterJobId && recruiterJobIds.has(app.recruiterJobId);
        const ownTagged = matchesEmployeeRef(employee, app.ownerEmployeeId);
        const isApplied = (app.source || "").toLowerCase() !== "recruiter_tagged";
        return (ownJob || ownTagged) && isApplied;
      })
      .sort((a, b) => new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime())
      .slice(0, 100)
      .map((app) => {
        const createdAt = toIso(app.appliedDate);
        return {
          id: app.id,
          line: notificationFeedLine([app.candidateName || "Candidate", app.jobTitle || "Role"]),
          createdAt,
          isUnread: isRecentNotification(createdAt, 72),
        };
      });

    return {
      role: "recruiter",
      newRequirements,
      nudges,
      escalatedNudges,
      closures,
      newCandidateApplied,
      unreadCount:
        newRequirements.filter((i) => i.isUnread).length +
        nudges.length +
        escalatedNudges.length +
        closures.filter((i) => i.isUnread).length +
        newCandidateApplied.filter((i) => i.isUnread).length,
    };
  }

  return {
    role,
    newRequirements: [],
    nudges: [],
    escalatedNudges: [],
    closures: [],
    newCandidateApplied: [],
    unreadCount: 0,
  };
}


const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    const originalName = file.originalname.toLowerCase();
    const isPdf = originalName.endsWith('.pdf') || file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');

    if (isImage || isPdf) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed.'));
    }
  }
});

const chatUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, chatUploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for chat files
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, document files, and videos
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|avif|pdf|doc|docx|mp4|mov|avi|wmv|flv|webm|mkv)$/i;
    const extname = allowedExtensions.test(file.originalname.toLowerCase());

    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/webp', 'image/avif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv',
      'video/x-flv', 'video/webm', 'video/x-matroska'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, Word documents, and videos are allowed!'));
    }
  }
});

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, resumeUploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for resumes
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, Word documents, and images (for scanned/photographed resumes)
    const allowedExtensions = /\.(pdf|doc|docx|jpg|jpeg|png)$/i;
    const extname = allowedExtensions.test(file.originalname.toLowerCase());

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, Word documents, and images (JPG, PNG) are allowed!'));
    }
  }
});

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const candidateRegistrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format")
});

const candidateLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const otpVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(4, "OTP must be 4 digits")
});

// Authentication middleware for candidate routes
function requireCandidateAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.candidateId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Authentication middleware for employee routes
function requireEmployeeAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.employeeId) {
    return res.status(401).json({ message: "Employee authentication required" });
  }
  next();
}

function requireAnyAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.employeeId && !req.session.candidateId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Authentication middleware for support team ONLY
function requireSupportAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.employeeId || req.session.employeeRole !== 'support') {
    return res.status(403).json({ message: "Access denied. Support team authentication required." });
  }
  next();
}

// Authentication middleware for admin routes ONLY
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.employeeId || req.session.employeeRole !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin authentication required." });
  }
  next();
}

function normalizeSourcingRole(role: string | null | undefined): "recruiter" | "team_leader" | null {
  const raw = (role || "").toLowerCase().trim();
  const r = raw.replace(/[\s-]+/g, "_");
  if (
    r === "team_leader" ||
    r === "teamleader" ||
    r === "tl" ||
    (raw.includes("team") && raw.includes("lead"))
  ) {
    return "team_leader";
  }
  if (
    r === "recruiter" ||
    r === "talent_advisor" ||
    r === "ta" ||
    r === "talent_advisor_ta" ||
    (raw.includes("talent") &&
      (raw.includes("advisor") || raw.includes("acquisition") || raw.includes("consultant"))) ||
    (raw.includes("recruit") && !raw.includes("manager") && !raw.includes("head"))
  ) {
    return "recruiter";
  }
  return null;
}

function buildCandidateOwnershipFilter(employee: { id: string; name: string; role: string }) {
  const ownerRole = normalizeSourcingRole(employee.role);
  if (!ownerRole) {
    return null;
  }

  const ownedByActor = and(
    eq(candidates.ownerEmployeeId, employee.id),
    eq(candidates.ownerRole, ownerRole),
  );

  if (ownerRole === "recruiter") {
    const legacyRecruiterRecords = and(
      isNull(candidates.ownerEmployeeId),
      eq(candidates.addedBy, employee.name),
    );
    return or(ownedByActor, legacyRecruiterRecords);
  }

  return ownedByActor;
}

function isMissingCandidateOwnershipColumnError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes('owner_employee_id') || message.includes('owner_role');
}

async function getOwnedCandidatesForEmployee(employee: { id: string; name: string; role: string }) {
  const ownerRole = normalizeSourcingRole(employee.role);
  if (!ownerRole) {
    return null;
  }

  const allCandidates = await storage.getAllCandidates();
  return allCandidates.filter((candidate: any) => {
    const matchesOwnedRecord =
      candidate.ownerEmployeeId === employee.id &&
      candidate.ownerRole === ownerRole;

    if (matchesOwnedRecord) {
      return true;
    }

    return ownerRole === "recruiter" &&
      !candidate.ownerEmployeeId &&
      candidate.addedBy === employee.name;
  });
}

function buildJobOwnershipFilter(employee: { id: string; role: string }) {
  const ownerRole = normalizeSourcingRole(employee.role);
  if (!ownerRole) {
    return null;
  }

  const ownedByActor = and(
    eq(recruiterJobs.ownerEmployeeId, employee.id),
    eq(recruiterJobs.ownerRole, ownerRole),
  );

  const assignedToActor = eq(recruiterJobs.assignedTaId, employee.id);

  if (ownerRole === "recruiter") {
    const legacyRecruiterRecords = and(
      isNull(recruiterJobs.ownerEmployeeId),
      eq(recruiterJobs.recruiterId, employee.id),
    );
    return or(ownedByActor, assignedToActor, legacyRecruiterRecords);
  }

  return or(ownedByActor, assignedToActor);
}

function buildApplicationOwnershipFilter(employee: { id: string; role: string }) {
  const ownerRole = normalizeSourcingRole(employee.role);
  if (!ownerRole) {
    return null;
  }

  const ownedByActor = and(
    eq(jobApplications.ownerEmployeeId, employee.id),
    eq(jobApplications.ownerRole, ownerRole),
  );

  // Applications for jobs assigned to this actor
  const assignedToActor = sql`EXISTS (
    SELECT 1 FROM ${recruiterJobs}
    WHERE ${recruiterJobs.id} = ${jobApplications.recruiterJobId}
    AND ${recruiterJobs.assignedTaId} = ${employee.id}
  )`;

  return or(ownedByActor, assignedToActor);
}

function formatCommentAuthorRole(role: string | null | undefined): string {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "Admin";
  if (r === "team_leader" || r === "teamleader") return "TL";
  if (r === "recruiter" || r === "talent_advisor" || r === "ta") return "TA";
  if (r === "client") return "Client";
  if (r === "hr" || r === "human_resources") return "HR";
  return role || "Staff";
}

async function employeeCanAccessRecruiterApplication(
  employee: { id: string; role: string; employeeId?: string | null },
  application: {
    ownerEmployeeId?: string | null;
    ownerRole?: string | null;
    recruiterJobId?: string | null;
    requirementId?: string | null;
  },
): Promise<boolean> {
  const roleLower = (employee.role || "").toLowerCase().replace(/[\s-]+/g, "_");
  if (
    roleLower === "admin" ||
    roleLower === "manager" ||
    roleLower.includes("admin") ||
    roleLower.includes("manager")
  ) {
    return true;
  }

  const ownerRole = normalizeSourcingRole(employee.role);

  if (ownerRole === "team_leader") {
    const allEmployees = await storage.getAllEmployees();
    const tlEmployeeId = employee.employeeId || employee.id;
    const teamRecruiterIds = new Set(
      allEmployees
        .filter(
          (emp) =>
            normalizeSourcingRole(emp.role) === "recruiter" &&
            (emp.reportingTo === tlEmployeeId || emp.reportingTo === employee.id),
        )
        .map((emp) => emp.id),
    );

    if (application.ownerEmployeeId && teamRecruiterIds.has(application.ownerEmployeeId)) {
      return true;
    }

    if (application.recruiterJobId) {
      const job = await storage.getRecruiterJobById(application.recruiterJobId);
      if (job?.recruiterId && teamRecruiterIds.has(job.recruiterId)) {
        return true;
      }
      if (job?.ownerEmployeeId && teamRecruiterIds.has(job.ownerEmployeeId)) {
        return true;
      }
      if ((job as any)?.assignedTaId && teamRecruiterIds.has((job as any).assignedTaId)) {
        return true;
      }
    }
  }

  if (!ownerRole) {
    return false;
  }

  let hasAccess =
    application.ownerEmployeeId === employee.id &&
    application.ownerRole === ownerRole;

  if (!hasAccess && application.recruiterJobId) {
    const job = await storage.getRecruiterJobById(application.recruiterJobId);
    if (job) {
      hasAccess =
        (job.ownerEmployeeId === employee.id && job.ownerRole === ownerRole) ||
        job.recruiterId === employee.id ||
        (job as any).assignedTaId === employee.id;
    }
  }

  return hasAccess;
}

async function employeeCanViewCandidateRecord(
  employee: { id: string; name: string; role: string },
  candidate: {
    id: string;
    email?: string | null;
    ownerEmployeeId?: string | null;
    ownerRole?: string | null;
    addedBy?: string | null;
    isActive?: boolean | null;
  },
): Promise<boolean> {
  const roleLower = (employee.role || "").toLowerCase();
  if (roleLower === "admin" || roleLower === "manager") {
    return true;
  }

  const ownerRole = normalizeSourcingRole(employee.role);
  if (ownerRole) {
    const ownsRecord =
      (candidate.ownerEmployeeId === employee.id && candidate.ownerRole === ownerRole) ||
      (ownerRole === "recruiter" && !candidate.ownerEmployeeId && candidate.addedBy === employee.name);

    if (ownsRecord) {
      return true;
    }

    // Source Resume lists active candidates across the database for recruiters/TLs.
    if (candidate.isActive !== false) {
      return true;
    }

    if (candidate.email) {
      const email = candidate.email.trim().toLowerCase();
      const relatedApps = await db
        .select({ id: jobApplications.id, ownerEmployeeId: jobApplications.ownerEmployeeId, ownerRole: jobApplications.ownerRole, recruiterJobId: jobApplications.recruiterJobId })
        .from(jobApplications)
        .where(sql`lower(${jobApplications.candidateEmail}) = ${email}`);

      for (const app of relatedApps) {
        if (await employeeCanAccessRecruiterApplication(employee, app)) {
          return true;
        }
      }
    }
  }

  return false;
}

function parseSkillsValue(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch {
        // fall through
      }
    }
    return trimmed.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

async function resolveApplicationCandidateDetails(application: {
  id: string;
  profileId?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  status?: string | null;
  source?: string | null;
  appliedDate?: Date | string | null;
  experience?: string | null;
  location?: string | null;
  skills?: string | null;
  statusNote?: string | null;
  rejectionReason?: string | null;
}) {
  let skills = parseSkillsValue(application.skills);
  const email = application.candidateEmail?.trim().toLowerCase() || null;

  let candidateRow: Awaited<ReturnType<typeof storage.getCandidateByEmail>> | undefined;
  if (email) {
    candidateRow = await storage.getCandidateByEmail(email);
  }

  let profileRow: (typeof profiles.$inferSelect) | undefined;
  if (candidateRow?.id) {
    const byUserId = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, candidateRow.id))
      .limit(1);
    profileRow = byUserId[0];
  }
  if (!profileRow && email) {
    const byEmail = await db
      .select()
      .from(profiles)
      .where(sql`lower(${profiles.email}) = ${email}`)
      .limit(1);
    profileRow = byEmail[0];
  }
  if (!profileRow && application.profileId && !String(application.profileId).startsWith("recruiter-tagged-")) {
    const byId = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, application.profileId))
      .limit(1);
    profileRow = byId[0];
  }

  const preferencesProfileId = profileRow?.id || candidateRow?.id;
  let preferences: Awaited<ReturnType<typeof storage.getJobPreferences>> | undefined;
  if (preferencesProfileId) {
    preferences = await storage.getJobPreferences(preferencesProfileId);
  }

  const resumeFile =
    candidateRow?.resumeFile ||
    profileRow?.resumeFile ||
    null;

  const linkedinUrl =
    candidateRow?.linkedinUrl ||
    profileRow?.linkedinUrl ||
    null;

  const location =
    application.location ||
    candidateRow?.location ||
    profileRow?.currentLocation ||
    profileRow?.location ||
    null;

  const experience =
    application.experience ||
    candidateRow?.experience ||
    profileRow?.totalExperience ||
    null;

  const currentCompany =
    candidateRow?.company ||
    profileRow?.currentCompany ||
    application.company ||
    null;

  const currentRole =
    candidateRow?.currentRole ||
    candidateRow?.designation ||
    profileRow?.currentRole ||
    profileRow?.title ||
    application.jobTitle ||
    null;

  const education =
    candidateRow?.education ||
    profileRow?.education ||
    [profileRow?.highestQualification, profileRow?.collegeName].filter(Boolean).join(" · ") ||
    null;

  const noticePeriod =
    candidateRow?.noticePeriod ||
    profileRow?.noticePeriod ||
    null;

  const ctc =
    candidateRow?.ctc ||
    candidateRow?.ectc ||
    profileRow?.salaryRange ||
    null;

  const preferredLocation =
    profileRow?.preferredLocation ||
    null;

  if (!skills.length) {
    skills = parseSkillsValue(candidateRow?.skills || profileRow?.skills);
  }

  const workSummary =
    candidateRow?.resumeText ||
    profileRow?.resumeText ||
    null;

  const preferencesSummary = preferences
    ? [
        preferences.jobTitles ? `Roles: ${preferences.jobTitles}` : null,
        preferences.workMode ? `Work mode: ${preferences.workMode}` : null,
        preferences.employmentType ? `Employment: ${preferences.employmentType}` : null,
        preferences.locations ? `Locations: ${preferences.locations}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return {
    id: application.id,
    candidateName:
      application.candidateName ||
      candidateRow?.fullName ||
      (profileRow ? `${profileRow.firstName} ${profileRow.lastName}`.trim() : null) ||
      "Candidate",
    candidateEmail: application.candidateEmail || candidateRow?.email || profileRow?.email || null,
    candidatePhone:
      application.candidatePhone ||
      candidateRow?.phone ||
      profileRow?.phone ||
      profileRow?.mobile ||
      null,
    jobTitle: application.jobTitle,
    company: application.company,
    status: application.status,
    source: application.source,
    appliedDate: application.appliedDate,
    candidateRecordId: candidateRow?.id || null,
    profileId: profileRow?.id || null,
    experience,
    location,
    preferredLocation,
    currentCompany,
    currentRole,
    skills,
    resumeFile,
    linkedinUrl,
    education,
    highestQualification: profileRow?.highestQualification || null,
    collegeName: profileRow?.collegeName || null,
    noticePeriod,
    ctc,
    ectc: candidateRow?.ectc || null,
    workSummary,
    preferences: preferences
      ? {
          jobTitles: preferences.jobTitles,
          workMode: preferences.workMode,
          employmentType: preferences.employmentType,
          locations: preferences.locations,
          summary: preferencesSummary,
        }
      : null,
    portfolioUrl: candidateRow?.portfolioUrl || profileRow?.portfolioUrl || null,
    websiteUrl: candidateRow?.websiteUrl || profileRow?.websiteUrl || null,
    pedigreeLevel: candidateRow?.pedigreeLevel || profileRow?.pedigreeLevel || null,
    companyLevel: candidateRow?.companyLevel || profileRow?.companyLevel || null,
    statusNote: application.statusNote,
    rejectionReason: application.rejectionReason,
    profilePicture: candidateRow?.profilePicture || profileRow?.profilePicture || null,
  };
}

// Authentication middleware for client routes ONLY
function requireClientAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.employeeId || !isClientPortalRole(req.session.employeeRole)) {
    return res.status(403).json({ message: "Access denied. Client authentication required." });
  }
  next();
}

function requireClientAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.employeeId || !isClientAdminRole(req.session.employeeRole)) {
    return res.status(403).json({ message: "Access denied. Client Admin privileges required." });
  }
  next();
}

const findCompanyForEmployee = resolveClientCompanyForEmployee;

async function getJobApplicationsScopedToClient(employee: any) {
  return getJobApplicationsScopedToClientEmployee({
    id: employee.id,
    role: employee.role,
    name: employee.name,
    email: employee.email,
    employeeId: employee.employeeId,
    clientCompanyId: employee.clientCompanyId,
    clientDepartmentId: employee.clientDepartmentId,
  });
}

function serializeApplicationComment(comment: {
  id: string;
  applicationId: string;
  authorEmployeeId: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: Date | string | null;
}) {
  const raw = comment.createdAt;
  let createdAt: string;
  if (raw instanceof Date) {
    createdAt = raw.toISOString();
  } else if (typeof raw === "string" && raw.trim()) {
    const parsed = new Date(raw);
    createdAt = Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString();
  } else {
    createdAt = new Date().toISOString();
  }
  return { ...comment, createdAt };
}

async function clientCanAccessJobApplication(
  employee: {
    id: string;
    role?: string;
    name?: string | null;
    email?: string;
    employeeId?: string | null;
    clientCompanyId?: string | null;
  },
  applicationId: string,
): Promise<{ allowed: boolean; application?: Awaited<ReturnType<typeof storage.getJobApplicationById>> }> {
  const application = await storage.getJobApplicationById(applicationId);
  if (!application) {
    return { allowed: false };
  }
  const allowed = await clientEmployeeCanAccessApplication(
    {
      id: employee.id,
      role: employee.role || "",
      name: employee.name || "",
      email: employee.email || "",
      employeeId: employee.employeeId,
      clientCompanyId: employee.clientCompanyId,
    },
    application,
  );
  return { allowed, application: allowed ? application : undefined };
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('[DEBUG] Registering all routes...');
  // Initialize Passport for Google OAuth
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Google OAuth (will only work if credentials are configured)
  const googleAuthEnabled = setupGoogleAuth();

  // Google OAuth routes for candidates
  app.get("/api/auth/google", (req, res, next) => {
    if (!googleAuthEnabled) {
      return res.status(503).json({
        message: "Google login is not configured. Please contact the administrator."
      });
    }
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })(req, res, next);
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    if (!googleAuthEnabled) {
      return res.redirect("/candidate-login?error=google_not_configured");
    }
    passport.authenticate("google", {
      failureRedirect: "/candidate-login?error=google_auth_failed"
    })(req, res, () => {
      const candidate = req.user as any;
      if (candidate && candidate.candidateId) {
        // Regenerate session to prevent session fixation attacks and ensure isolation
        req.session.regenerate((err) => {
          if (err) {
            console.error('Session regeneration error:', err);
            return res.redirect("/candidate-login?error=session_error");
          }

          // Set session after regeneration to ensure proper isolation
          req.session.candidateId = candidate.candidateId;
          req.session.userType = 'candidate';

          // Save session before redirecting
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error('Session save error:', saveErr);
              return res.redirect("/candidate-login?error=session_error");
            }
            res.redirect("/candidate");
          });
        });
      } else {
        res.redirect("/candidate-login?error=authentication_failed");
      }
    });
  });

  // Health check endpoint for Render and monitoring
  app.get("/api/health", async (req, res) => {
    try {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
      });
    } catch (error) {
      res.status(500).json({ status: "unhealthy", error: "Health check failed" });
    }
  });

  // Public Jobs API for Landing Page (Renamed to avoid potential conflicts)
  app.get("/api/public-jobs", async (req, res) => {
    console.log(`[DEBUG] Received request for /api/public-jobs`);
    try {
      const allJobs = await storage.getAllRecruiterJobs();
      console.log(`[DEBUG] Found ${allJobs.length} total jobs in storage`);

      // Filter for active jobs and sort by newest first
      const activeJobs = allJobs
        .filter(job => job.status === "Active");
      
      console.log(`[DEBUG] Found ${activeJobs.length} active jobs`);

      // Sort real jobs by newest first
      const sortedJobs = activeJobs.sort((a, b) => {
        const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
        const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
        return dateB - dateA;
      });

      res.json(sortedJobs);
    } catch (error) {
      console.error('Error fetching public jobs:', error);
      res.status(500).json({ message: "Failed to fetch job postings" });
    }
  });

  // Keep old route as an alias for now to prevent breaking changes if cached
  app.get("/api/jobs/public", async (req, res) => {
    console.log(`[DEBUG] Received request for /api/jobs/public (LEGACY)`);
    res.redirect("/api/public-jobs");
  });

  // Session Verification Route - Check if user session is valid and return user data
  app.get("/api/auth/verify-session", async (req, res) => {
    try {
      // Check for employee session
      if (req.session.employeeId) {
        const employee = await storage.getEmployeeById(req.session.employeeId);
        if (employee && employee.isActive) {
          const { password: _, ...employeeData } = employee;
          const employeeAgreementAccepted = await computeEmployeeAgreementAccepted(employee);
          return res.json({
            authenticated: true,
            userType: "employee",
            user: { ...employeeData, employeeAgreementAccepted },
          });
        }
      }

      // Check for candidate session
      if (req.session.candidateId) {
        const candidate = await storage.getCandidateByCandidateId(req.session.candidateId);
        if (candidate) {
          const { password: _, ...candidateData } = candidate;
          const platformConsentAccepted = await hasLoggedConsent(candidate.id, "platform_consent");
          return res.json({
            authenticated: true,
            userType: "candidate",
            user: { ...candidateData, platformConsentAccepted },
          });
        }
      }

      // No valid session
      return res.json({ authenticated: false });
    } catch (error) {
      console.error('Session verification error:', error);
      return res.json({ authenticated: false });
    }
  });

  app.post("/api/consent/log", requireAnyAuth, async (req, res) => {
    try {
      await ensureConsentLogsTable();

      const payloadSchema = z.object({
        user_id: z.string().min(1),
        role: z.enum(["candidate", "client", "employee"]),
        consent_type: z.enum(["platform_consent", "job_consent", "client_agreement", "employee_agreement"]),
        policy_version: z.string().min(1),
      });

      const parsed = payloadSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid consent log payload" });
      }

      const { user_id, role, consent_type, policy_version } = parsed.data;

      if (req.session.candidateId) {
        const candidate = await storage.getCandidateByCandidateId(req.session.candidateId);
        if (!candidate || candidate.id !== user_id) {
          return res.status(403).json({ message: "Consent user does not match session" });
        }
        if (role !== "candidate") {
          return res.status(400).json({ message: "Invalid role for candidate session" });
        }
        if (consent_type !== "platform_consent" && consent_type !== "job_consent") {
          return res.status(400).json({ message: "Invalid consent type for candidate session" });
        }
      } else if (req.session.employeeId) {
        if (req.session.employeeId !== user_id) {
          return res.status(403).json({ message: "Consent user does not match session" });
        }
        const employee = await storage.getEmployeeById(req.session.employeeId);
        if (!employee) {
          return res.status(403).json({ message: "Employee not found" });
        }
        const er = String(employee.role || "").toLowerCase();
        if (role === "client") {
          if (!isClientPortalRole(er) || consent_type !== "client_agreement") {
            return res.status(400).json({ message: "Invalid client consent request" });
          }
        } else if (role === "employee") {
          if (consent_type !== "employee_agreement") {
            return res.status(400).json({ message: "Invalid employee consent request" });
          }
        } else {
          return res.status(400).json({ message: "Invalid role for employee session" });
        }
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (ONE_TIME_CONSENT_TYPES.has(consent_type) && (await hasLoggedConsent(user_id, consent_type))) {
        return res.status(200).json({ success: true, idempotent: true });
      }

      const xForwardedFor = req.headers["x-forwarded-for"];
      const forwarded = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
      const ipAddress = (forwarded?.split(",")[0] || req.ip || null)?.trim() || null;
      const userAgent = (req.headers["user-agent"] || null) as string | null;

      const [inserted] = await db
        .insert(consentLogs)
        .values({
          userId: user_id,
          role,
          consentType: consent_type,
          policyVersion: policy_version,
          ipAddress,
          userAgent,
        })
        .returning();

      return res.status(201).json({ success: true, consentLog: inserted });
    } catch (error) {
      console.error("Consent log error:", error);
      return res.status(500).json({ message: "Failed to log consent" });
    }
  });

  app.get("/api/consent/acceptance-status", requireAnyAuth, async (req, res) => {
    try {
      await ensureConsentLogsTable();

      if (req.session.candidateId) {
        const candidate = await storage.getCandidateByCandidateId(req.session.candidateId);
        if (!candidate) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        const platformConsentAt = await getLatestConsentAcceptedAtIso(candidate.id, "platform_consent");
        return res.json({
          userType: "candidate",
          platformConsentAt,
          employeeAgreementAt: null,
          clientAgreementAt: null,
        });
      }

      if (req.session.employeeId) {
        const employee = await storage.getEmployeeById(req.session.employeeId);
        if (!employee) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        const er = String(employee.role || "").toLowerCase();
        if (isClientPortalRole(er)) {
          const clientAgreementAt = await getLatestConsentAcceptedAtIso(employee.id, "client_agreement");
          return res.json({
            userType: "client",
            platformConsentAt: null,
            employeeAgreementAt: null,
            clientAgreementAt,
          });
        }
        const employeeAgreementAt = await getLatestConsentAcceptedAtIso(employee.id, "employee_agreement");
        return res.json({
          userType: "employee",
          platformConsentAt: null,
          employeeAgreementAt,
          clientAgreementAt: null,
        });
      }

      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("Consent acceptance-status error:", error);
      return res.status(500).json({ message: "Failed to load consent acceptance" });
    }
  });

  app.get("/api/admin/consent-logs", requireAdminAuth, async (req, res) => {
    try {
      await ensureConsentLogsTable();
      const limitRaw = Number(req.query.limit);
      const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 200, 1), 1000);
      const rows = await db
        .select()
        .from(consentLogs)
        .orderBy(desc(consentLogs.acceptedAt))
        .limit(limit);
      return res.json(rows);
    } catch (error) {
      console.error("Admin consent logs error:", error);
      return res.status(500).json({ message: "Failed to fetch consent logs" });
    }
  });

  // Logout Route - Clear session and redirect
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      // Clear both cookie names (legacy and current)
      res.clearCookie('connect.sid', { path: '/' });
      res.clearCookie('staffos.sid', { path: '/' });
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Password Change Route
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      let user: any = null;
      let userType: 'employee' | 'candidate' | null = null;

      // Identify user type from session
      if (req.session.employeeId) {
        user = await storage.getEmployeeById(req.session.employeeId);
        userType = 'employee';
      } else if (req.session.candidateId) {
        user = await storage.getCandidateByCandidateId(req.session.candidateId);
        userType = 'candidate';
      }

      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify current password
      if (!user.password) {
        return res.status(400).json({ message: "Password not set for this account" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect current password" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update database
      if (userType === 'employee') {
        await storage.updateEmployee(user.id, { password: hashedPassword });
      } else if (userType === 'candidate') {
        await storage.updateCandidate(user.id, { password: hashedPassword });
      }

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Nudges API for Recruiters/TLs
  app.get("/api/nudges", requireEmployeeAuth, async (req, res) => {
    try {
      const employeeUuid = req.session.employeeId!;
      const employee = await storage.getEmployeeById(employeeUuid);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await syncActiveNudgeEscalations();
      const updatedNudges = await storage.getActiveNudges();
      
      const role = (employee.role || '').toLowerCase();
      const isTA = role === 'recruiter' || role === 'talent_advisor' || role === 'ta';
      let activeNudges = [];

      // Filter for Actionable Nudges only (Current level's turn and not responded)
      if (role === 'admin') {
        activeNudges = updatedNudges.filter(n => !n.isResponded && n.escalationLevel === 'admin');
      } else if (isClientPortalRole(role)) {
        const { companyName, memberRequirementIds } = await getClientScopedRequirements({
          id: employee.id,
          role: employee.role,
          name: employee.name,
          email: employee.email,
          employeeId: employee.employeeId,
          clientCompanyId: employee.clientCompanyId,
        });
        const allApps = await storage.getAllJobApplications();
        const applicationById = new Map(allApps.map((a: any) => [a.id, a]));
        activeNudges = updatedNudges.filter(
          (n) =>
            !n.isResponded &&
            n.escalationLevel === "client" &&
            clientNudgeInScope(n, companyName, memberRequirementIds, applicationById),
        );
      } else if (role === 'team_leader') {
        const allEmployees = await storage.getAllEmployees();
        const teamMemberKeys = new Set<string>();
        for (const emp of allEmployees.filter(
          (e) => e.reportingTo === employee.employeeId || e.reportingTo === employee.id,
        )) {
          teamMemberKeys.add(emp.id);
          if (emp.employeeId) teamMemberKeys.add(emp.employeeId);
        }
        const myIds = [employee.id, employee.employeeId].filter(Boolean) as string[];

        activeNudges = updatedNudges.filter(n => {
          if (n.isResponded || n.escalationLevel !== 'team_leader') return false;
          
          // Show if it's their own job or a team member's job
          return !!(n.recruiterId && (myIds.includes(n.recruiterId) || teamMemberKeys.has(n.recruiterId)));
        });
      } else if (isTA) {
        // Recruiter (TA)
        activeNudges = updatedNudges.filter(n => 
          !n.isResponded && n.escalationLevel === 'recruiter' && matchesEmployeeRef(employee, n.recruiterId)
        );
      }

      res.json(activeNudges);
    } catch (error) {
      console.error('Fetch nudges error:', error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/nudges/logs", requireEmployeeAuth, async (req, res) => {
    try {
      const employeeUuid = req.session.employeeId!;
      const employee = await storage.getEmployeeById(employeeUuid);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const allNudges = await storage.getActiveNudges();
      const role = (employee.role || '').toLowerCase();
      let logNudges = [];

      if (role === 'admin') {
        // Admin sees nudges they responded to OR nudges that escalated past admin
        logNudges = allNudges.filter(n => 
          (n.isResponded && n.escalationLevel === 'admin') || 
          (['client'].includes(n.escalationLevel || ''))
        );
      } else if (isClientPortalRole(role)) {
        // Client sees nudges they responded to
        logNudges = allNudges.filter(n => n.isResponded && n.escalationLevel === 'client');
      } else if (role === 'team_leader') {
        const allEmployees = await storage.getAllEmployees();
        const teamMemberKeys = new Set<string>();
        for (const emp of allEmployees.filter(
          (e) => e.reportingTo === employee.employeeId || e.reportingTo === employee.id,
        )) {
          teamMemberKeys.add(emp.id);
          if (emp.employeeId) teamMemberKeys.add(emp.employeeId);
        }
        const myIds = [employee.id, employee.employeeId].filter(Boolean) as string[];

        logNudges = allNudges.filter(n => {
          const isRelevant = n.recruiterId && (myIds.includes(n.recruiterId) || teamMemberKeys.has(n.recruiterId));
          if (!isRelevant) return false;

          // In logs if responded at TL level OR escalated past TL level
          return (n.isResponded && n.escalationLevel === 'team_leader') || 
                 (['admin', 'client'].includes(n.escalationLevel || ''));
        });
      } else {
        // Recruiter (TA)
        logNudges = allNudges.filter(n => {
          if (!matchesEmployeeRef(employee, n.recruiterId)) return false;

          // In logs if responded at recruiter level OR escalated past recruiter level
          return (n.isResponded && n.escalationLevel === 'recruiter') || 
                 (['team_leader', 'admin', 'client'].includes(n.escalationLevel || ''));
        });
      }

      res.json(logNudges);
    } catch (error) {
      console.error('Fetch nudge logs error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


  app.post("/api/nudges/:id/respond", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const employeeUuid = req.session.employeeId!;
      const employee = await storage.getEmployeeById(employeeUuid);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Mark as responded and update the escalation level to the responder's role
      // This stops the escalation flow and shows who responded
      const nudge = await storage.markNudgeAsResponded(id, message, employee.role);
      
      if (!nudge) {
        return res.status(404).json({ message: "Nudge not found" });
      }

      res.json(nudge);
    } catch (error) {
      console.error('Respond to nudge error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Employee Authentication Routes
  app.post("/api/auth/employee-login", async (req, res) => {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const { email, password } = validationResult.data;

      // Find employee by email
      const employee = await storage.getEmployeeByEmail(email);
      console.log('[DEBUG] Employee found:', employee ? `Yes (${employee.email})` : 'No');
      if (!employee) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if employee has login credentials configured
      if (!employee.password) {
        return res.status(401).json({ message: "Login credentials not configured for this account. Please contact your administrator." });
      }

      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, employee.password);
      console.log('[DEBUG] Password valid:', isPasswordValid);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if employee is active
      if (!employee.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Update lastLoginAt
      try {
        await db.execute(sql`
          UPDATE employees 
          SET last_login_at = ${new Date().toISOString()} 
          WHERE id = ${employee.id}
        `);
      } catch (err) {
        console.error('Failed to update lastLoginAt:', err);
      }

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error('Session error details:', errorMessage);
          return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
          });
        }

        // Set session after regeneration
        req.session.employeeId = employee.id;
        req.session.employeeRole = employee.role;
        req.session.userType = 'employee';

        // Save session before responding
        req.session.save(async (saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            const errorMessage = saveErr instanceof Error ? saveErr.message : String(saveErr);
            console.error('Session save error details:', errorMessage);
            return res.status(500).json({
              message: "Internal server error",
              error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
          }

          try {
            const employeeAgreementAccepted = await computeEmployeeAgreementAccepted(employee);
          const { password: _, ...employeeData } = employee;
          res.json({
            success: true,
              employee: { ...employeeData, employeeAgreementAccepted },
            message: "Login successful"
          });
          } catch (agreementErr) {
            console.error("Employee login agreement flag error:", agreementErr);
            const { password: _, ...employeeData } = employee;
            res.json({
              success: true,
              employee: { ...employeeData, employeeAgreementAccepted: false },
              message: "Login successful"
            });
          }
        });
      });
    } catch (error) {
      console.error('Employee login error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('Login error details:', { errorMessage, errorStack });
      res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  });

  // Support Team Authentication Route
  app.post("/api/auth/support-login", async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const { email, password } = validationResult.data;

      // Find employee by email
      const employee = await storage.getEmployeeByEmail(email);

      // Check if employee exists and has support role
      if (!employee || employee.role !== 'support') {
        return res.status(401).json({ message: "Invalid credentials or access denied" });
      }

      // Check if employee has login credentials configured
      if (!employee.password) {
        return res.status(401).json({ message: "Login credentials not configured for this account. Please contact your administrator." });
      }

      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, employee.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials or access denied" });
      }

      // Check if employee is active
      if (!employee.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ message: "Internal server error" });
        }

        // Set session with support role
        req.session.employeeId = employee.id;
        req.session.employeeRole = 'support';
        req.session.userType = 'support';

        // Save session before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: "Internal server error" });
          }

          // Return employee data (excluding password)
          const { password: _, ...employeeData } = employee;
          res.json({
            success: true,
            employee: employeeData,
            message: "Support login successful"
          });
        });
      });
    } catch (error) {
      console.error('Support login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Test endpoint to create a verified candidate (for testing without email)
  app.post("/api/test/create-candidate", async (req, res) => {
    try {
      const { email = "testcandidate@example.com", password = "test123456", fullName = "Test Candidate" } = req.body;

      // Check if candidate already exists
      const existingCandidate = await storage.getCandidateByEmail(email);
      if (existingCandidate) {
        return res.json({
          success: true,
          message: "Candidate already exists",
          email: email,
          password: password,
          candidateId: existingCandidate.candidateId,
          isVerified: existingCandidate.isVerified
        });
      }

      // Generate candidate ID and create candidate
      const candidateId = await storage.generateNextCandidateId();
      const newCandidate = await storage.createCandidate({
        fullName,
        email,
        password,
        candidateId,
        isActive: true,
        isVerified: false, // Will be set to true below
        createdAt: new Date().toISOString()
      });

      // Update to verified status (bypassing OTP requirement)
      const updatedCandidate = await storage.updateCandidate(newCandidate.id, { isVerified: true });

      if (!updatedCandidate) {
        throw new Error("Failed to update candidate verification status");
      }

      res.json({
        success: true,
        message: "Test candidate created successfully and verified",
        email: email,
        password: password,
        candidateId: updatedCandidate.candidateId,
        fullName: fullName,
        isVerified: true
      });
    } catch (error: any) {
      console.error('Create test candidate error:', error);
      res.status(500).json({ message: "Failed to create test candidate: " + error.message });
    }
  });

  // Candidate Authentication Routes
  app.post("/api/auth/candidate-register", async (req, res) => {
    try {
      // Validate request body
      console.log("[Registration] Received registration request:", req.body);
      const validationResult = candidateRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.warn("[Registration] Validation failed:", validationResult.error.errors);
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const candidateData = validationResult.data;

      // Check if candidate already exists
      const existingCandidate = await storage.getCandidateByEmail(candidateData.email);
      if (existingCandidate) {
        if (existingCandidate.isVerified) {
          return res.status(409).json({ message: "Email already registered. Please sign in." });
        }

        // Generate new 4-digit OTP for unverified accounts
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await storage.storeOTP(candidateData.email, otp);

        // Send OTP via email
        await sendOTPEmail({
          fullName: existingCandidate.fullName,
          email: existingCandidate.email,
          otp: otp,
          expiresInMinutes: 10
        });

        return res.json({
          success: true,
          message: "A new verification code has been sent to your email.",
          candidateId: existingCandidate.candidateId,
          email: existingCandidate.email,
          requiresVerification: true
        });
      }

      // Generate candidate ID and create candidate
      const candidateId = await storage.generateNextCandidateId();
      const newCandidate = await storage.createCandidate({
        ...candidateData,
        candidateId,
        isActive: true,
        isVerified: false,
        registrationStage: 'registered',
        onboardingSource: 'manual',
        createdAt: new Date().toISOString()
      });

      // Generate 4-digit OTP for verification
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Store OTP with expiry (10 minutes)
      await storage.storeOTP(candidateData.email, otp);

      // Send welcome email to new candidate
      // Use FRONTEND_URL for production, fallback to localhost for development
      const loginUrl = process.env.FRONTEND_URL
        || (process.env.NODE_ENV === 'production'
          ? 'https://staffosdemo.vercel.app'
          : 'http://localhost:5000');

      await sendCandidateWelcomeEmail({
        fullName: newCandidate.fullName,
        email: newCandidate.email,
        candidateId: newCandidate.candidateId,
        loginUrl
      });

      // Send OTP via email
      const otpEmailSent = await sendOTPEmail({
        fullName: newCandidate.fullName,
        email: newCandidate.email,
        otp: otp,
        expiresInMinutes: 10
      });

      if (!otpEmailSent) {
        console.error(`[Registration] Failed to send OTP email to ${newCandidate.email}`);
      }

      res.json({
        success: true,
        message: "Registration successful! Please check your email for the verification code.",
        candidateId: newCandidate.candidateId,
        email: newCandidate.email,
        requiresVerification: true
      });
    } catch (error) {
      console.error('Candidate registration error:', error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  app.post("/api/auth/candidate-login", async (req, res) => {
    try {
      // Validate request body
      const validationResult = candidateLoginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const { email, password } = validationResult.data;

      // Check login attempts and lockout
      const loginAttempts = await storage.getLoginAttempts(email);
      const now = new Date().toISOString();

      if (loginAttempts?.lockedUntil && new Date(loginAttempts.lockedUntil) > new Date()) {
        return res.status(423).json({
          message: "You can't login for next 30 mins",
          locked: true,
          lockedUntil: loginAttempts.lockedUntil
        });
      }

      // Find candidate by email
      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) {
        // Increment login attempts for failed login
        await storage.createOrUpdateLoginAttempts({
          email,
          attempts: loginAttempts ? (parseInt(loginAttempts.attempts) + 1).toString() : "1",
          lastAttemptAt: now,
          lockedUntil: null,
          createdAt: loginAttempts?.createdAt || now
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, candidate.password);
      if (!isPasswordValid) {
        const currentAttempts = loginAttempts ? parseInt(loginAttempts.attempts) + 1 : 1;

        // Check if this is the 3rd failed attempt
        if (currentAttempts >= 3) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + 30);

          await storage.createOrUpdateLoginAttempts({
            email,
            attempts: currentAttempts.toString(),
            lastAttemptAt: now,
            lockedUntil: lockUntil.toISOString(),
            createdAt: loginAttempts?.createdAt || now
          });

          return res.status(423).json({
            message: "You can't login for next 30 mins",
            locked: true,
            lockedUntil: lockUntil.toISOString()
          });
        } else {
          await storage.createOrUpdateLoginAttempts({
            email,
            attempts: currentAttempts.toString(),
            lastAttemptAt: now,
            lockedUntil: null,
            createdAt: loginAttempts?.createdAt || now
          });

          return res.status(401).json({
            message: "Invalid credentials",
            attemptsRemaining: 3 - currentAttempts
          });
        }
      }

      // Check if candidate is active
      if (!candidate.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Check if candidate is verified
      if (!candidate.isVerified) {
        // Generate new 4-digit OTP for unverified accounts
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await storage.storeOTP(candidate.email, otp);

        // Send OTP via email
        const otpEmailSent = await sendOTPEmail({
          fullName: candidate.fullName,
          email: candidate.email,
          otp: otp,
          expiresInMinutes: 10
        });

        if (!otpEmailSent) {
          console.error(`[Login] Failed to send OTP email to ${candidate.email}`);
        }

        return res.status(403).json({
          message: "Account not verified. Please check your email for the verification code.",
          requiresVerification: true,
          email: candidate.email
        });
      }

      // Reset login attempts on successful login
      await storage.resetLoginAttempts(email);

      // Regenerate session to prevent session fixation attacks and ensure isolation
      req.session.regenerate(async (err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
          });
        }

        // Ensure candidate has a candidateId (for legacy records)
        if (!candidate.candidateId) {
          const nextId = await storage.generateNextCandidateId();
          await storage.updateCandidate(candidate.id, { candidateId: nextId });
          candidate.candidateId = nextId;
        }

        // Set session after regeneration to ensure proper isolation
        req.session.candidateId = candidate.candidateId;
        req.session.userType = 'candidate';

        // Save session before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({
              message: "Internal server error",
              error: process.env.NODE_ENV === 'development' ? (saveErr instanceof Error ? saveErr.message : String(saveErr)) : undefined
            });
          }

          // Return candidate data (excluding password) for frontend routing
          const { password: _, ...candidateData } = candidate;
          res.json({
            success: true,
            candidate: candidateData,
            message: "Login successful"
          });
        });
      });
    } catch (error) {
      console.error('Candidate login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resend OTP endpoint
  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Generate new OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await storage.storeOTP(email, otp);

      // Send OTP via email
      const otpEmailSent = await sendOTPEmail({
        fullName: candidate.fullName,
        email: candidate.email,
        otp: otp,
        expiresInMinutes: 10
      });

      if (!otpEmailSent) {
        console.error(`[Resend OTP] Failed to send OTP email to ${candidate.email}`);
      }

      res.json({
        success: true,
        message: "New verification code has been sent to your email"
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ message: "Failed to resend OTP" });
    }
  });

  app.post("/api/auth/candidate-verify-otp", async (req, res) => {
    try {
      const validationResult = otpVerificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const { email, otp } = validationResult.data;

      // Find candidate by email
      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Verify OTP against stored value with expiry check
      const isOtpValid = await storage.verifyOTP(email, otp);

      if (isOtpValid) {
        // Mark candidate as verified and update registration stage
        await storage.updateCandidate(candidate.id, {
          isVerified: true,
          registrationStage: 'verified'
        });

        // Reset login attempts
        await storage.resetLoginAttempts(email);

        // Regenerate session to prevent session fixation attacks and ensure isolation
        req.session.regenerate((err) => {
          if (err) {
            console.error('Session regeneration error:', err);
            return res.status(500).json({
              message: "Internal server error",
              error: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
            });
          }

          // Set session after regeneration to ensure proper isolation
          req.session.candidateId = candidate.candidateId;
          req.session.userType = 'candidate';

          // Save session before responding
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error('Session save error:', saveErr);
              return res.status(500).json({
                message: "Internal server error",
                error: process.env.NODE_ENV === 'development' ? (saveErr instanceof Error ? saveErr.message : String(saveErr)) : undefined
              });
            }

            const { password: _, ...candidateData } = candidate;
            res.json({
              success: true,
              candidate: { ...candidateData, isVerified: true },
              message: "Verification successful"
            });
          });
        });
      } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/candidate-complete-registration", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Update candidate with password and set isVerified just in case
      await storage.updateCandidate(candidate.id, {
        password: password,
        isVerified: true,
        registrationStage: 'verified'
      });

      // Set session for the candidate
      req.session.candidateId = candidate.candidateId;

      res.json({
        success: true,
        message: "Registration complete! You can now upload your resume.",
        candidateId: candidate.candidateId
      });
    } catch (error) {
      console.error('Complete registration error:', error);
      res.status(500).json({ message: "Failed to complete registration." });
    }
  });

  app.post("/api/auth/skip-onboarding", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId;
      console.log(`[Skip Onboarding] Request received for candidateId: ${candidateId}`);
      
      const candidate = await storage.getCandidateByCandidateId(candidateId!);
      
      if (!candidate) {
        console.error(`[Skip Onboarding] Candidate not found for ID: ${candidateId}`);
        return res.status(404).json({ message: "Candidate not found" });
      }

      console.log(`[Skip Onboarding] Updating candidate ${candidate.id} (${candidate.fullName}) to 'completed'`);
      await storage.updateCandidate(candidate.id, {
        registrationStage: 'completed'
      });

      res.json({ success: true, message: "Onboarding skipped" });
    } catch (error) {
      console.error('[Skip Onboarding] CRITICAL ERROR:', error);
      res.status(500).json({ message: "Failed to skip onboarding" });
    }
  });

  app.post("/api/onboarding/finalize", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId;
      const { fullName } = req.body;
      
      const candidate = await storage.getCandidateByCandidateId(candidateId!);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const updateData: any = {
        registration_stage: 'completed',
        registrationStage: 'completed'
      };

      if (fullName) {
        updateData.fullName = fullName;
      }

      await storage.updateCandidate(candidate.id, updateData);

      res.json({ success: true, message: "Onboarding completed! Welcome aboard." });
    } catch (error) {
      console.error('Finalize onboarding error:', error);
      res.status(500).json({ message: "Failed to finalize onboarding" });
    }
  });

  // Password change endpoints
  app.post("/api/employee/change-password", requireEmployeeAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in storage
      const updateSuccess = await storage.updateEmployeePassword(employee.email, hashedNewPassword);
      if (!updateSuccess) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error('Employee password change error:', error);
      res.status(500).json({ message: "Password change failed" });
    }
  });

  app.post("/api/candidate/change-password", requireCandidateAuth, async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      // Find candidate by email
      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Verify OTP
      const isOtpValid = await storage.verifyOTP(email, otp);
      if (!isOtpValid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in storage
      const updateSuccess = await storage.updateCandidatePassword(email, hashedNewPassword);
      if (!updateSuccess) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error('Candidate password change error:', error);
      res.status(500).json({ message: "Password change failed" });
    }
  });

  // Request OTP for sensitive actions (Password change, Delete account)
  app.post("/api/auth/candidate-request-action-otp", requireCandidateAuth, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await storage.storeOTP(email, otp);

      // For now, show in alert via frontend, but also call email service
      await sendOTPEmail({
        fullName: candidate.fullName,
        email: candidate.email,
        otp: otp,
        expiresInMinutes: 10
      });

      res.json({ success: true, message: "Verification code sent to your email" });
    } catch (error) {
      console.error('Action OTP request error:', error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  // Verify password (for account deletion)
  app.post("/api/auth/candidate-verify-password", requireCandidateAuth, async (req, res) => {
    try {
      const { email, password } = req.body;
      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });

      const isPasswordValid = await bcrypt.compare(password, candidate.password);
      if (!isPasswordValid) return res.status(401).json({ message: "Incorrect password" });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Delete Candidate Account
  app.post("/api/candidate/delete-account", requireCandidateAuth, async (req, res) => {
    try {
      const { email, confirmCode } = req.body;
      if (confirmCode !== 'DELETE') return res.status(400).json({ message: "Invalid confirmation code" });

      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });

      // Profile is linked to candidateId/userId
      // We should delete applications, saved jobs, profile, and candidate record
      // For now, use the deleteCandidate which should ideally handle cascades in DB
      await storage.deleteCandidate(candidate.id);

      req.session.destroy((err) => {
         if (err) console.error('Session destruction error:', err);
         res.clearCookie('connect.sid', { path: '/' });
         res.clearCookie('staffos.sid', { path: '/' });
         res.json({ success: true, message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Candidate Registration Stepper Endpoint
  app.post("/api/candidate/registration", async (req, res) => {
    try {
      const { candidateId, step, data, isComplete } = req.body;

      if (!candidateId || !step || !data) {
        return res.status(400).json({ message: "candidateId, step, and data are required" });
      }

      // Get existing candidate
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Map step data to candidate fields
      const updateData: any = {};

      switch (step) {
        case 1: // Resume Upload
          if (data.resume) {
            updateData.resumeFile = data.resume.name || 'resume.pdf';
          }
          break;
        case 2: // About You
          updateData.fullName = `${data.firstName} ${data.lastName}`;
          updateData.phone = data.mobileNumber;
          break;
        case 3: // Your Strength
          updateData.skills = data.primarySkills;
          updateData.education = data.collegeName;
          updateData.pedigreeLevel = data.proficiencyLevel;
          break;
        case 4: // Your Journey
          updateData.company = data.currentCompany;
          updateData.currentRole = data.companyRole;
          updateData.companyLevel = data.companyType;
          break;
        case 5: // Online Presence
          updateData.linkedinUrl = data.linkedinUrl;
          updateData.portfolioUrl = data.portfolioUrl;
          updateData.location = data.currentLocation;
          updateData.websiteUrl = data.websiteUrl;
          break;
        case 6: // Job Preferences & Password
          updateData.position = data.jobTitle;
          updateData.employmentType = data.employmentType;

          // Handle password creation on final step
          if (isComplete && data.password) {
            if (data.password !== data.confirmPassword) {
              return res.status(400).json({ message: "Passwords do not match" });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            updateData.password = hashedPassword;
            updateData.isVerified = true; // Mark as verified after registration
          }
          break;
      }

      // Update candidate
      const updatedCandidate = await storage.updateCandidate(candidate.id, updateData);

      res.json({
        success: true,
        message: `Step ${step} saved successfully`,
        candidate: updatedCandidate,
        isComplete: isComplete || false
      });
    } catch (error) {
      console.error('Candidate registration error:', error);
      res.status(500).json({ message: "Failed to save registration data" });
    }
  });

  // Logout endpoints
  app.post("/api/auth/candidate-logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        // Clear both cookie names (legacy and current)
        res.clearCookie('connect.sid', { path: '/' });
        res.clearCookie('staffos.sid', { path: '/' });
        res.json({
          success: true,
          message: "Logged out successfully"
        });
      });
    } catch (error) {
      console.error('Candidate logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.post("/api/auth/employee-logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        // Clear both cookie names (legacy and current)
        res.clearCookie('connect.sid', { path: '/' });
        res.clearCookie('staffos.sid', { path: '/' });
        res.json({
          success: true,
          message: "Logged out successfully"
        });
      });
    } catch (error) {
      console.error('Employee logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Temporary seed endpoint to initialize sample employees for testing
  app.post("/api/seed-employees", async (req, res) => {
    try {
      // Check if employees already exist
      const existingEmployees = await storage.getAllEmployees();
      if (existingEmployees.length > 0) {
        return res.json({ message: "Employees already exist", count: existingEmployees.length });
      }

      // Create sample employees
      const currentTimestamp = new Date().toISOString();
      const sampleEmployees = [
        {
          employeeId: "STTA001",
          name: "Ram Kumar",
          email: "ram@gmail.com",
          password: "ram123",
          role: "recruiter",
          age: "28",
          phone: "9876543210",
          department: "Talent Acquisition",
          joiningDate: "2024-01-15",
          reportingTo: "Team Lead",
          createdAt: currentTimestamp
        },
        {
          employeeId: "STTL001",
          name: "Priya Sharma",
          email: "priya@gmail.com",
          password: "priya123",
          role: "team_leader",
          age: "32",
          phone: "9876543211",
          department: "Talent Acquisition",
          joiningDate: "2023-06-10",
          reportingTo: "Admin",
          createdAt: currentTimestamp
        },
        {
          employeeId: "STCL001",
          name: "Arjun Patel",
          email: "arjun@gmail.com",
          password: "arjun123",
          role: "client",
          age: "35",
          phone: "9876543212",
          department: "Client Relations",
          joiningDate: "2023-03-20",
          reportingTo: "Admin",
          createdAt: currentTimestamp
        },
        {
          employeeId: "ADMIN",
          name: "Admin User",
          email: "admin@gmail.com",
          password: "admin123",
          role: "admin",
          age: "40",
          phone: "9876543213",
          department: "Administration",
          joiningDate: "2022-01-01",
          reportingTo: "CEO",
          createdAt: currentTimestamp
        }
      ];

      const createdEmployees = [];
      for (const emp of sampleEmployees) {
        const employee = await storage.createEmployee(emp);
        createdEmployees.push({ id: employee.id, name: employee.name, email: employee.email, role: employee.role });
      }

      res.json({
        message: "Sample employees created successfully",
        employees: createdEmployees
      });
    } catch (error) {
      console.error('Seed employees error:', error);
      res.status(500).json({ message: "Failed to create sample employees", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // NOTE: Admin endpoints disabled for security - require proper authentication before enabling

  // Get current candidate profile
  app.get("/api/profile", requireCandidateAuth, async (req, res) => {
    // Force no-cache to ensure onboarding status is always fresh
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      if (!candidate.candidateId) {
        const nextId = await storage.generateNextCandidateId();
        await storage.updateCandidate(candidate.id, { candidateId: nextId });
        candidate.candidateId = nextId;
      }

      const profileData = await storage.getProfile(candidate.id);

      // Ensure candidateId is synced to profiles table if missing
      if (profileData && !profileData.candidateId) {
        await storage.updateProfile(candidate.id, { candidateId: candidate.candidateId });
      }

      // Transform merged data to match profile structure expected by frontend
      const fullName = candidate.fullName || '';
      const nameParts = fullName.trim().split(/\s+/);
      
      const profile = {
        id: candidate.id,
        candidateId: candidate.candidateId,
        registrationStage: (candidate.resumeFile && (candidate.registrationStage === 'registered' || candidate.registrationStage === 'verified')) ? 'resume_uploaded' : candidate.registrationStage,
        userId: candidate.id,
        firstName: profileData?.firstName || nameParts[0] || '',
        lastName: profileData?.lastName || nameParts.slice(1).join(' ') || '',
        email: candidate.email,
        phone: profileData?.phone || candidate.phone || '',
        whatsapp: profileData?.whatsapp || '',
        title: profileData?.title || candidate.designation || '',
        location: profileData?.location || candidate.location || '',
        gender: profileData?.gender || candidate.gender || '',
        isVerified: candidate.isVerified,
        profilePicture: candidate.profilePicture || '',
        bannerImage: candidate.bannerImage || '',
        resumeFile: candidate.resumeFile || '',
        resumeText: candidate.resumeText || '',
        skills: candidate.skills || '',
        currentCompany: profileData?.currentCompany || candidate.company || '',
        currentRole: profileData?.currentRole || candidate.currentRole || '',
        education: profileData?.education || candidate.education || '',
        highestQualification: profileData?.highestQualification || '',
        collegeName: profileData?.collegeName || '',
        portfolioUrl: profileData?.portfolioUrl || candidate.portfolioUrl || '',
        websiteUrl: profileData?.websiteUrl || candidate.websiteUrl || '',
        linkedinUrl: profileData?.linkedinUrl || candidate.linkedinUrl || '',
        currentLocation: profileData?.currentLocation || '',
        preferredLocation: profileData?.preferredLocation || '',
        dateOfBirth: profileData?.dateOfBirth || '',
        registrationStage: (candidate.resumeFile && (candidate.registrationStage === 'registered' || candidate.registrationStage === 'verified' || candidate.registration_stage === 'registered' || candidate.registration_stage === 'verified')) ? 'resume_uploaded' : (candidate.registrationStage || 'verified'),
        noticePeriod: profileData?.noticePeriod || candidate.noticePeriod || '',
        pedigreeLevel: profileData?.pedigreeLevel || candidate.pedigreeLevel || '',
        companyLevel: profileData?.companyLevel || candidate.companyLevel || '',
        productService: profileData?.productService || '',
        currentDomain: profileData?.currentDomain || '',
        experience: candidate.experience || '',
        totalExperience: profileData?.totalExperience || candidate.experience || '',
        educationHistory: profileData?.educationHistory || [],
        graduationYear: profileData?.graduationYear || '',
        salaryRange: profileData?.salaryRange || '',
        secondaryEmail: profileData?.secondaryEmail || '',
        platformConsentAccepted: await hasLoggedConsent(candidate.id, "platform_consent"),
      };

      res.json(profile);
    } catch (error: any) {
      console.error('Get profile error detailed:', {
        message: error.message,
        stack: error.stack,
        candidateId: req.session.candidateId
      });
      res.status(500).json({ 
        message: "Internal server error", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  });

  // Legacy profile route for demo user (keeping for other parts of the app)
  app.get("/api/profile/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update profile
  app.patch("/api/profile", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Prepare updates for both tables
      const candidateUpdates: any = {};
      const profileUpdates: any = {};

      // Map incoming fields to candidate updates
      if (req.body.firstName || req.body.lastName) {
        const currentFirstName = candidate.fullName.split(' ')[0];
        const currentLastName = candidate.fullName.split(' ').slice(1).join(' ');
        const firstName = req.body.firstName || currentFirstName;
        const lastName = req.body.lastName || currentLastName;
        candidateUpdates.fullName = `${firstName} ${lastName}`.trim();
        profileUpdates.firstName = firstName;
        profileUpdates.lastName = lastName;
      }

      if (req.body.phone !== undefined) {
        candidateUpdates.phone = req.body.phone;
        profileUpdates.phone = req.body.phone;
      }
      if (req.body.title !== undefined) candidateUpdates.designation = req.body.title;
      if (req.body.location !== undefined) candidateUpdates.location = req.body.location;
      if (req.body.gender !== undefined) candidateUpdates.gender = req.body.gender;
      if (req.body.skills !== undefined) {
        candidateUpdates.skills = req.body.skills;
        profileUpdates.skills = req.body.skills;
      }
      if (req.body.currentCompany !== undefined) {
        candidateUpdates.company = req.body.currentCompany;
        profileUpdates.currentCompany = req.body.currentCompany;
      }
      if (req.body.currentRole !== undefined) {
        candidateUpdates.currentRole = req.body.currentRole;
        profileUpdates.currentRole = req.body.currentRole;
      }
      if (req.body.education !== undefined) {
        candidateUpdates.education = req.body.education;
        profileUpdates.education = req.body.education;
      }
      if (req.body.profilePicture !== undefined) candidateUpdates.profilePicture = req.body.profilePicture;
      if (req.body.bannerImage !== undefined) candidateUpdates.bannerImage = req.body.bannerImage;
      if (req.body.resumeFile !== undefined) candidateUpdates.resumeFile = req.body.resumeFile;
      if (req.body.resumeText !== undefined) candidateUpdates.resumeText = req.body.resumeText;
      
      if (req.body.whatsapp !== undefined) profileUpdates.whatsapp = req.body.whatsapp;
      if (req.body.currentLocation !== undefined) {
        candidateUpdates.location = req.body.currentLocation;
        profileUpdates.currentLocation = req.body.currentLocation;
      }
      if (req.body.preferredLocation !== undefined) {
        profileUpdates.preferredLocation = req.body.preferredLocation;
      }
      if (req.body.dateOfBirth !== undefined) profileUpdates.dateOfBirth = req.body.dateOfBirth;
      
      if (req.body.linkedinUrl !== undefined) {
        candidateUpdates.linkedinUrl = req.body.linkedinUrl;
        profileUpdates.linkedinUrl = req.body.linkedinUrl;
      }
      if (req.body.portfolioUrl !== undefined) {
        candidateUpdates.portfolioUrl = req.body.portfolioUrl;
        profileUpdates.portfolioUrl = req.body.portfolioUrl;
      }
      if (req.body.websiteUrl !== undefined) {
        candidateUpdates.websiteUrl = req.body.websiteUrl;
        profileUpdates.websiteUrl = req.body.websiteUrl;
      }

      // Add new professional fields synchronization
      if (req.body.collegeName !== undefined) {
        profileUpdates.collegeName = req.body.collegeName;
      }
      if (req.body.pedigreeLevel !== undefined) {
        candidateUpdates.pedigreeLevel = req.body.pedigreeLevel;
        profileUpdates.pedigreeLevel = req.body.pedigreeLevel;
      }
      if (req.body.companyLevel !== undefined) {
        candidateUpdates.companyLevel = req.body.companyLevel;
        profileUpdates.companyLevel = req.body.companyLevel;
      }
      if (req.body.currentDomain !== undefined) {
        candidateUpdates.productDomain = req.body.currentDomain;
        profileUpdates.currentDomain = req.body.currentDomain;
      }
      if (req.body.productService !== undefined) {
        candidateUpdates.productService = req.body.productService;
        profileUpdates.productService = req.body.productService;
      }
      if (req.body.noticePeriod !== undefined) {
        candidateUpdates.noticePeriod = req.body.noticePeriod;
        profileUpdates.noticePeriod = req.body.noticePeriod;
      }
      if (req.body.secondaryEmail !== undefined) profileUpdates.secondaryEmail = req.body.secondaryEmail;
      if (req.body.gender !== undefined) {
        candidateUpdates.gender = req.body.gender;
        profileUpdates.gender = req.body.gender;
      }
      if (req.body.currentLocation !== undefined) profileUpdates.currentLocation = req.body.currentLocation;
      if (req.body.preferredLocation !== undefined) profileUpdates.preferredLocation = req.body.preferredLocation;
      if (req.body.dateOfBirth !== undefined) profileUpdates.dateOfBirth = req.body.dateOfBirth;
      if (req.body.course !== undefined) profileUpdates.course = req.body.course;
      if (req.body.degreeLevel !== undefined) profileUpdates.degreeLevel = req.body.degreeLevel;
      if (req.body.highestQualification !== undefined) {
        candidateUpdates.education = req.body.highestQualification; // Sync to candidate table
        profileUpdates.highestQualification = req.body.highestQualification;
      }
      if (req.body.totalExperience !== undefined) {
        candidateUpdates.experience = req.body.totalExperience;
        profileUpdates.totalExperience = req.body.totalExperience;
      }
      if (req.body.salaryRange !== undefined) {
        profileUpdates.salaryRange = req.body.salaryRange;
      }
      if (req.body.educationHistory !== undefined) {
        profileUpdates.educationHistory = req.body.educationHistory;
      }
      if (req.body.graduationYear !== undefined) {
        profileUpdates.graduationYear = req.body.graduationYear;
      }

      // Ensure STCA ID is preserved
      profileUpdates.candidateId = candidate.candidateId;

      // Update candidate in storage
      if (Object.keys(candidateUpdates).length > 0) {
        await storage.updateCandidate(candidate.id, candidateUpdates);
      }

      // Update or create profile in storage
      const existingProfile = await storage.getProfile(candidate.id);
      if (existingProfile) {
        await storage.updateProfile(candidate.id, profileUpdates);
      } else {
        await storage.createProfile({ ...profileUpdates, userId: candidate.id });
      }

      // Fetch fresh merged data for response
      const finalCandidate = await storage.getCandidateByCandidateId(candidateId);
      const finalProfileData = await storage.getProfile(candidate.id);

      if (!finalCandidate) {
        return res.status(404).json({ message: "Failed to fetch updated candidate" });
      }

      // Return data in profile format expected by frontend
      const profile = {
        id: finalCandidate.id,
        candidateId: finalCandidate.candidateId,
        userId: finalCandidate.id,
        firstName: finalProfileData?.firstName || finalCandidate.fullName.split(' ')[0] || '',
        lastName: finalProfileData?.lastName || finalCandidate.fullName.split(' ').slice(1).join(' ') || '',
        email: finalCandidate.email,
        phone: finalProfileData?.phone || finalCandidate.phone || '',
        whatsapp: finalProfileData?.whatsapp || '',
        title: finalProfileData?.title || finalCandidate.designation || '',
        location: finalProfileData?.location || finalCandidate.location || '',
        gender: finalProfileData?.gender || finalCandidate.gender || '',
        profilePicture: finalCandidate.profilePicture || '',
        bannerImage: finalCandidate.bannerImage || '',
        resumeFile: finalCandidate.resumeFile || '',
        resumeText: finalCandidate.resumeText || '',
        skills: finalCandidate.skills || '',
        currentCompany: finalProfileData?.currentCompany || finalCandidate.company || '',
        currentRole: finalProfileData?.currentRole || finalCandidate.currentRole || '',
        education: finalProfileData?.education || finalCandidate.education || '',
        highestQualification: finalProfileData?.highestQualification || '',
        collegeName: finalProfileData?.collegeName || '',
        portfolioUrl: finalProfileData?.portfolioUrl || finalCandidate.portfolioUrl || '',
        websiteUrl: finalProfileData?.websiteUrl || finalCandidate.websiteUrl || '',
        linkedinUrl: finalProfileData?.linkedinUrl || finalCandidate.linkedinUrl || '',
        currentLocation: finalProfileData?.currentLocation || '',
        preferredLocation: finalProfileData?.preferredLocation || '',
        dateOfBirth: finalProfileData?.dateOfBirth || '',
        registrationStage: finalCandidate.registrationStage || 'verified',
        noticePeriod: finalProfileData?.noticePeriod || finalCandidate.noticePeriod || '',
        pedigreeLevel: finalProfileData?.pedigreeLevel || finalCandidate.pedigreeLevel || '',
        companyLevel: finalProfileData?.companyLevel || finalCandidate.companyLevel || '',
        productService: finalProfileData?.productService || '',
        currentDomain: finalProfileData?.currentDomain || '',
        experience: finalCandidate.experience || '',
        totalExperience: finalProfileData?.totalExperience || finalCandidate.experience || '',
        educationHistory: finalProfileData?.educationHistory || [],
        graduationYear: finalProfileData?.graduationYear || '',
        salaryRange: finalProfileData?.salaryRange || '',
        secondaryEmail: finalProfileData?.secondaryEmail || '',
      };

      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/job-preferences", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const profile = await storage.getProfile(candidate.id);
      if (!profile) {
        // Return default preferences if profile doesn't exist yet
        return res.json({
          jobTitles: '',
          workMode: 'Remote',
          employmentType: 'Full-time',
          locations: '',
          startDate: 'Immediate',
        });
      }

      const jobPreferences = await storage.getJobPreferences(profile.id);
      res.json(jobPreferences || {
        profileId: profile.id,
        jobTitles: '',
        workMode: 'Remote',
        employmentType: 'Full-time',
        locations: '',
        startDate: 'Immediate',
      });
    } catch (error) {
      console.error('Get job preferences error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Legacy job preferences route
  app.get("/api/job-preferences/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const preferences = await storage.getJobPreferences(profile.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update job preferences
  app.patch("/api/job-preferences", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const profile = await storage.getProfile(candidate.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const updatedPreferences = await storage.updateJobPreferences(profile.id, req.body);
      res.json(updatedPreferences);
    } catch (error) {
      console.error('Update job preferences error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get skills for candidate
  app.get("/api/skills", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate || !candidate.skills) {
        return res.json([]);
      }

      // Parse skills string into array of skill objects
      const skillsArray = candidate.skills.split(',').map((skill, index) => ({
        id: `skill-${index}`,
        profileId: candidateId,
        name: skill.trim(),
        category: 'primary'
      }));

      res.json(skillsArray);
    } catch (error) {
      console.error('Get skills error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Legacy skills route
  app.get("/api/skills/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const skills = await storage.getSkillsByProfile(profile.id);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get activities
  app.get("/api/activities", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Ensure profile exists for activity association
      let profile = await storage.getProfile(candidate.id);
      if (!profile) {
        // Auto-create profile if missing for legacy candidates
        profile = await storage.createProfile({
          userId: candidate.id,
          candidateId: candidate.candidateId,
          firstName: candidate.fullName.split(' ')[0] || '',
          lastName: candidate.fullName.split(' ').slice(1).join(' ') || '',
          email: candidate.email,
          phone: candidate.phone || '',
          title: candidate.designation || 'Candidate',
          location: candidate.location || '',
        });
      }

      const activities = await storage.getActivitiesByProfile(profile.id);
      res.json(activities);
    } catch (error) {
      console.error('Fetch activities error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create activity
  app.post("/api/activities", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found for activity logging" });
      }

      let profile = await storage.getProfile(candidate.id);
      if (!profile) {
        // Auto-create profile if missing
        profile = await storage.createProfile({
          userId: candidate.id,
          candidateId: candidate.candidateId,
          firstName: candidate.fullName.split(' ')[0] || '',
          lastName: candidate.fullName.split(' ').slice(1).join(' ') || '',
          email: candidate.email,
          phone: candidate.phone || '',
          title: candidate.designation || 'Candidate',
          location: candidate.location || '',
        });
      }

      const activityData = {
        ...req.body,
        profileId: profile.id,
        date: new Date().toLocaleDateString()
      };

      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error('Create activity error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get job applications for candidate
  app.get("/api/job-applications", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Get real job applications from database
      let candidateJobApplications = await storage.getJobApplicationsByProfile(candidate.id);

      // Legacy cleanup:
      // If candidate has already confirmed at least one recruiter-tagged application,
      // auto-confirm any older pending recruiter-tagged rows to avoid repeated consent prompts.
      const hasRecruiterConsent = candidateJobApplications.some(
        (app: any) =>
          String(app.source || "").toLowerCase() === "recruiter_tagged" &&
          app.isCandidateConfirmed === true,
      );
      const pendingRecruiterTaggedIds = candidateJobApplications
        .filter(
          (app: any) =>
            String(app.source || "").toLowerCase() === "recruiter_tagged" &&
            app.isCandidateConfirmed === false,
        )
        .map((app: any) => app.id)
        .filter(Boolean);

      if (hasRecruiterConsent && pendingRecruiterTaggedIds.length > 0) {
        await db
          .update(jobApplications)
          .set({ isCandidateConfirmed: true })
          .where(inArray(jobApplications.id, pendingRecruiterTaggedIds));

        candidateJobApplications = await storage.getJobApplicationsByProfile(candidate.id);
      }

      res.json(candidateJobApplications);
    } catch (error) {
      console.error('Get job applications error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Nudge application for candidate
  app.post("/api/applications/:id/nudge", requireCandidateAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const application = await storage.getJobApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const [requirement, job] = await Promise.all([
        application.requirementId ? storage.getRequirementById(application.requirementId) : Promise.resolve(null),
        application.recruiterJobId ? storage.getRecruiterJobById(application.recruiterJobId) : Promise.resolve(null),
      ]);

      // Identify the recruiter/TA who should receive the nudge (canonical employees.id after resolve)
      let recruiterRef: string | null = null;
      let attributionSource = "none";

      if (requirement?.talentAdvisorId) {
        recruiterRef = requirement.talentAdvisorId;
        attributionSource = "requirement.talentAdvisorId";
      } else if (job?.assignedTaId) {
        recruiterRef = job.assignedTaId;
        attributionSource = "recruiterJob.assignedTaId";
      } else if (job?.recruiterId) {
        recruiterRef = job.recruiterId;
        attributionSource = "recruiterJob.recruiterId";
      } else if (job?.ownerEmployeeId) {
        recruiterRef = job.ownerEmployeeId;
        attributionSource = "recruiterJob.ownerEmployeeId";
      } else if (application.ownerEmployeeId) {
        recruiterRef = application.ownerEmployeeId;
        attributionSource = "application.ownerEmployeeId";
      }

      const recruiterId = await canonicalizeEmployeeIdForNudge(recruiterRef);

      console.log(`Nudge attribution: application=${id}, recruiterRef=${recruiterRef}, recruiterId=${recruiterId}, source=${attributionSource}`);

      const nudgeData = {
        applicationId: application.id,
        candidateId: application.profileId,
        candidateName: application.candidateName || "Candidate",
        jobTitle: application.jobTitle,
        company: application.company,
        currentStatus: application.status,
        recruiterId: recruiterId,
        isRead: false,
        isResponded: false,
        escalationLevel: 'recruiter',
        createdAt: new Date(),
        lastEscalatedAt: new Date()
      };

      const nudge = await storage.createNudge(nudgeData as any);

      
      // Update the application's last nudged time
      await storage.updateJobApplicationNudgeTime(application.id, new Date());

      res.status(201).json(nudge);
    } catch (error) {
      console.error('Nudge application error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all nudges for the logged-in candidate
  app.get("/api/candidate/nudges", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const candidateNudges = await storage.getNudgesByCandidate(candidate.id);
      res.json(candidateNudges);
    } catch (error) {
      console.error('Get candidate nudges error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark a nudge as read for candidate
  app.patch("/api/candidate/nudges/:id/read", requireCandidateAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // We use a simplified update since it's just marking as read
      const [nudge] = await db
        .update(nudges)
        .set({ isRead: true })
        .where(and(eq(nudges.id, id), eq(nudges.candidateId, candidate.id)))
        .returning();

      if (!nudge) {
        return res.status(404).json({ message: "Nudge not found or access denied" });
      }

      res.json(nudge);
    } catch (error) {
      console.error('Mark nudge as read error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create job application for candidate
  app.post("/api/job-applications", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Validate request body using zod
      const validationResult = insertJobApplicationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      // Check for duplicate application
      const existingApplications = await storage.getJobApplicationsByProfile(candidate.id);
      const isDuplicate = existingApplications.some(
        app => app.jobTitle === validationResult.data.jobTitle && app.company === validationResult.data.company
      );

      if (isDuplicate) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }

      // Check if job has an assigned TA who should own the application
      let ownerEmployeeId = null;
      let ownerRole = null;

      if (validationResult.data.recruiterJobId) {
        try {
          const job = await storage.getRecruiterJobById(validationResult.data.recruiterJobId);
          if (job && job.assignedTaId) {
            ownerEmployeeId = job.assignedTaId;
            ownerRole = "recruiter"; // TAs are recruiters in the system
            console.log(`[JOB APP] Assigning ownership to TA ${job.assignedTaName} (${job.assignedTaId}) for job ${job.role}`);
          } else if (job) {
            // Default to job owner if no TA assigned
            ownerEmployeeId = job.ownerEmployeeId;
            ownerRole = job.ownerRole;
          }
        } catch (err) {
          console.error("Failed to check job assignment for ownership:", err);
        }
      }

      // Create the job application with server-side defaults
      // Populate candidate details from profile if not provided
      const applicationData = {
        ...validationResult.data,
        profileId: candidate.id,
        candidateName: validationResult.data.candidateName || candidate.fullName || null,
        candidateEmail: validationResult.data.candidateEmail || candidate.email || null,
        candidatePhone: validationResult.data.candidatePhone || candidate.phone || null,
        ownerEmployeeId: ownerEmployeeId || validationResult.data.ownerEmployeeId || null,
        ownerRole: ownerRole || validationResult.data.ownerRole || null,
      };

      const application = await storage.createJobApplication(applicationData);

      // Increment application count for the recruiter job if applicable
      if (validationResult.data.recruiterJobId) {
        try {
          const job = await storage.getRecruiterJobById(validationResult.data.recruiterJobId);
          if (job) {
            await storage.updateRecruiterJob(job.id, {
              applicationCount: (job.applicationCount || 0) + 1
            });
          }
        } catch (incrementError) {
          console.error('Failed to increment job application count:', incrementError);
          // Don't fail the application request if just the count increment fails
        }
      }

      res.status(201).json(application);
    } catch (error) {
      console.error('Create job application error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Candidate can update status for own applications (e.g., Withdrawn, Archived)
  app.patch("/api/job-applications/:id/status", requireCandidateAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, statusNote, rejectionReason } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const application = await storage.getJobApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (application.profileId !== candidate.id) {
        return res.status(403).json({ message: "You can only update your own applications" });
      }

      const allowedStatuses = new Set(["Withdrawn", "Archived"]);
      if (!allowedStatuses.has(status)) {
        return res.status(400).json({ message: "Invalid status for candidate action" });
      }

      const updated = await storage.updateJobApplicationStatus(id, status, undefined, statusNote, rejectionReason);
      if (!updated) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json({ message: "Application status updated", application: updated });
    } catch (error) {
      console.error("Candidate update application status error:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Legacy job applications route
  app.get("/api/job-applications/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const applications = await storage.getJobApplicationsByProfile(profile.id);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File upload endpoints
  app.post("/api/upload/banner", requireCandidateAuth, upload.single('banner'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // In production, consider using cloud storage like AWS S3, Cloudinary, etc.
      // For now, using local storage with proper URL generation
      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      // Save banner URL to candidate profile
      await storage.updateCandidate(candidate.id, { bannerImage: fileUrl });

      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/upload/profile", requireCandidateAuth, upload.single('profile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      // Save profile picture URL to candidate profile
      await storage.updateCandidate(candidate.id, { profilePicture: fileUrl });

      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/upload/resume", requireCandidateAuth, upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);

      // 1. IMMEDIATELY update registration stage and commit file URL
      // This ensures the page transitions to 'SCANNING' state
      await storage.updateCandidate(candidate.id, {
        resumeFile: fileUrl,
        registrationStage: 'resume_uploaded',
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
      });
      
      console.log(`[Initial Upload] Set stage to 'resume_uploaded' for candidate UUID: ${candidate.id}`);

      // 2. IMMEDIATELY Return success to the client
      res.json({ 
        url: fileUrl, 
        registrationStage: 'resume_uploaded'
      });

      // Process with AI in background
      (async () => {
        try {
          console.log("File Path:", filePath);
          console.log("File URL:", fileUrl);
          console.log(`[Background AI] Starting parse for candidate ${candidate.candidateId} (UUID: ${candidate.id})`);
          
          // CRITICAL FIX: Pass mimetype instead of fileUrl
          const parsedData = await parseResumeFile(filePath, req.file!.mimetype);
          
          if (parsedData && parsedData.aiParsed) {
            const ai = parsedData.aiParsed;

            // 1. Update Candidate Master Record
            await storage.updateCandidate(candidate.id, {
              fullName: ai.full_name || candidate.fullName,
              phone: ai.phone || candidate.phone,
              company: ai.company || candidate.company,
              designation: ai.designation || null,
              experience: ai.experience || null,
              location: ai.location || null,
              skills: ai.skills || null,
              education: ai.education || null,
              currentRole: ai.current_role || null,
              portfolioUrl: ai.portfolio_url || null,
              website_url: ai.website_url || null,
              linkedin_url: ai.linkedin_url || null,
              ctc: ai.ctc || null,
              ectc: ai.ectc || null,
              noticePeriod: ai.notice_period || null,
              position: ai.position || null,
              employmentType: ai.employment_type || null,
              productService: ai.product_service || null,
              productCategory: ai.product_category || null,
              productDomain: ai.product_domain || null,
            });

            // 2. Create/Update Profile Table
            const existingProfile = await storage.getProfile(candidate.id);
            const nameParts = (ai.full_name || candidate.fullName).split(' ');
            
            // Priority Mapping: AI directly provides Degree Level and Title now
            const highestQualification = ai.degree_level || 'Under Graduate';
            const professionalTitle = ai.current_role || ai.designation || 'Candidate';

            const profileData = {
              candidateId: candidate.candidateId,
              firstName: nameParts[0] || 'Unknown',
              lastName: nameParts.slice(1).join(' ') || 'Unknown',
              email: ai.email || candidate.email,
              phone: ai.phone || candidate.phone || 'Unknown',
              title: professionalTitle,
              location: ai.location || 'Unknown',
              mobile: ai.phone || null,
              whatsapp: ai.phone || null,
              primaryEmail: ai.email || null,
              secondaryEmail: ai.secondary_email || null,
              currentLocation: ai.location || null,
              preferredLocation: null,
              dateOfBirth: ai.age || null,
              portfolioUrl: ai.portfolio_url || null,
              websiteUrl: ai.website_url || null,
              linkedinUrl: ai.linkedin_url || null,
              resumeFile: fileUrl,
              resumeText: parsedData.rawText || null,
              highestQualification: highestQualification,
              collegeName: ai.college || ai.university || null,
              course: ai.course || null,
              graduationYear: ai.graduation_year || null,
              skills: ai.skills || null,
              currentCompany: ai.company || null,
              currentRole: ai.current_role || null,
              noticePeriod: ai.notice_period || null,
              currentDomain: ai.product_domain || null,
            };

            const savedProfile = existingProfile 
              ? await storage.updateProfile(candidate.id, profileData)
              : await storage.createProfile({ ...profileData, userId: candidate.id } as any);

            // 3. Sync Skills Table (Convert CSV to separate rows)
            if (savedProfile && ai.skills) {
              const skillList = ai.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
              const skillInsertions = skillList.map((skill: string, index: number) => ({
                profileId: savedProfile.id,
                name: skill.charAt(0).toUpperCase() + skill.slice(1),
                category: index < 3 ? 'primary' : 'secondary' 
              }));
              
              await storage.updateSkillsByProfile(savedProfile.id, skillInsertions);
              console.log(`[AI Parser] Synced ${skillInsertions.length} skills to profile ${savedProfile.id}`);
            }

            // 3. Final Step: Mark registration as COMPLETED
            const updatedCandidate = await storage.updateCandidate(candidate.id, {
              registrationStage: 'completed'
            });
            
            console.log(`[Background AI] Successfully parsed and refined. Stage set to: ${updatedCandidate?.registrationStage}`);
          }
        } catch (error) {
          console.error(`[Resume Background Parsing] Failed for candidate ${candidateId}:`, error);
        }
      })();
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Logo upload endpoint for client logos
  app.post("/api/admin/upload-logo", requireAdminAuth, upload.single('logo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate file type (images only for logos)
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
      if (!allowedImageTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Only image files are allowed for logos" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Placeholder image generator
  app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    const size = Math.min(parseInt(width) || 60, parseInt(height) || 60);

    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="12" fill="#666">
          Logo
        </text>
      </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Get saved jobs for candidate
  app.get("/api/saved-jobs", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Use candidate's UUID as profileId for saved jobs
      const savedJobs = await storage.getSavedJobsByProfile(candidate.id);
      res.json(savedJobs);
    } catch (error) {
      console.error('Get saved jobs error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Legacy saved jobs route
  app.get("/api/saved-jobs/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const savedJobs = await storage.getSavedJobsByProfile(profile.id);
      res.json(savedJobs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save a job
  app.post("/api/saved-jobs", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const validatedData = insertSavedJobSchema.parse({
        ...req.body,
        profileId: candidate.id,
        savedDate: new Date().toISOString()
      });

      const savedJob = await storage.createSavedJob(validatedData);
      res.json(savedJob);
    } catch (error) {
      console.error('Save job error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove saved job
  app.delete("/api/saved-jobs", requireCandidateAuth, async (req, res) => {
    try {
      const { jobTitle, company } = req.body;
      const candidateId = req.session.candidateId!;

      const candidate = await storage.getCandidateByCandidateId(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const removed = await storage.removeSavedJob(candidate.id, jobTitle, company);
      if (removed) {
        res.json({ message: "Job removed from saved jobs" });
      } else {
        res.status(404).json({ message: "Saved job not found" });
      }
    } catch (error) {
      console.error('Remove saved job error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Team Leader Dashboard API routes
  app.get("/api/team-leader/team-members", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const allEmployees = await storage.getAllEmployees();
      const recruiters = getTeamLeaderRecruiters(employee, allEmployees);

      const teamMembers = await Promise.all(recruiters.map(async (rec) => {
        const allMappings = await storage.getAllRevenueMappings();
        const revenueMappings = allMappings.filter((m) => revenueMappingBelongsToRecruiter(m, rec));
        const totalRevenue = revenueMappings.reduce((sum, rm) => sum + (rm.revenue || 0), 0);

        let tenure = "0";
        if (rec.joiningDate) {
          try {
            const joinDate = new Date(rec.joiningDate);
            if (!isNaN(joinDate.getTime())) {
              const now = new Date();
              tenure = ((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
            }
          } catch (e) {
            tenure = "0";
          }
        }

        return {
          id: rec.id,
          employeeId: rec.employeeId,
          name: rec.name,
          email: rec.email,
          position: rec.designation || 'Recruiter',
          department: rec.department || 'Recruitment',
          salary: totalRevenue > 0 ? `${totalRevenue.toLocaleString('en-IN')} INR` : "0 INR",
          profilesCount: String(revenueMappings.length),
          closures: revenueMappings.filter((rm) => isClosedRevenueMapping(rm)).length,
          joiningDate: rec.joiningDate ? new Date(rec.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          tenure: tenure,
          status: 'online',
          profilePicture: rec.profilePicture || null
        };
      }));

      res.json(teamMembers);
    } catch (error) {
      console.error('Get team leader team members error:', error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Legacy endpoint - returns 0 defaults for backward compatibility
  app.get("/api/team-leader/target-metrics", (req, res) => {
    const targetMetrics = {
      id: "target-001",
      currentQuarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`,
      minimumTarget: "0",
      targetAchieved: "0",
      incentiveEarned: "0"
    };
    res.json(targetMetrics);
  });

  // Get aggregated target data for team leader
  app.get("/api/team-leader/aggregated-targets", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied - Team Leaders only" });
      }

      const targetSummary = await storage.getTeamLeaderTargetSummary(employee.id);
      res.json(targetSummary);
    } catch (error) {
      console.error('Get aggregated targets error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/team-leader/daily-metrics", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      // Get date parameter for filtering
      const dateParam = req.query.date as string | undefined;
      const requirementId = req.query.requirementId as string | undefined;
      const today = dateParam || new Date().toISOString().split('T')[0];

      // Import getResumeTarget for calculations
      const { getResumeTarget } = await import("@shared/constants");

      // Get filter parameter - now uses member ID instead of name for security
      const memberIdFilter = req.query.memberId as string | undefined;

      const allEmployees = await storage.getAllEmployees();
      const teamRecruiters = allEmployees.filter(
        emp => emp.role === 'recruiter' && emp.reportingTo === employee.employeeId
      );
      const teamRecruiterIds = teamRecruiters.map(r => r.id);

      // Get requirements based on filter - using strict ID-based lookup
      let allRequirements: any[] = [];
      let filteredRecruiters = teamRecruiters;

      if (memberIdFilter && memberIdFilter !== 'overall') {
        // Validate that memberId belongs to this TL's team (ID-based security check)
        if (!teamRecruiterIds.includes(memberIdFilter)) {
          return res.status(403).json({ message: "Access denied. Member does not belong to your team." });
        }
        const selectedRecruiter = teamRecruiters.find(r => r.id === memberIdFilter);
        if (selectedRecruiter) {
          allRequirements = await storage.getRequirementsByTalentAdvisorId(selectedRecruiter.id);
          filteredRecruiters = [selectedRecruiter];
        }
      } else {
        // Overall - get all requirements for team members using their IDs
        for (const rec of teamRecruiters) {
          const recReqs = await storage.getRequirementsByTalentAdvisorId(rec.id);
          allRequirements.push(...recReqs);
        }
      }

      // Get assignment status to filter out reassigned requirements
      const { requirementAssignments } = await import("@shared/schema");
      const requirementIds = allRequirements.map(r => r.id);
      const allAssignments = requirementIds.length > 0
        ? await db.select().from(requirementAssignments)
          .where(inArray(requirementAssignments.requirementId, requirementIds))
        : [];

      // Filter to only active assignments (exclude reassigned)
      const activeRequirementIds = new Set(
        allAssignments
          .filter(a => {
            const recruiterId = filteredRecruiters.find(r => r.id === a.recruiterId)?.id;
            return recruiterId && a.status === "active";
          })
          .map(a => a.requirementId)
      );

      // Also include requirements assigned via talentAdvisorId (even if no assignment record exists)
      allRequirements.forEach(req => {
        if (req.talentAdvisorId) {
          const recruiter = filteredRecruiters.find(r => r.id === req.talentAdvisorId);
          if (recruiter) {
            activeRequirementIds.add(req.id);
          }
        }
      });

      // Filter requirements by date and exclude reassigned - only count requirements created on or before the selected date
      const filteredRequirements = allRequirements.filter(req => {
        const createdDate = new Date(req.createdAt).toISOString().split('T')[0];
        return createdDate <= today && activeRequirementIds.has(req.id);
      });

      // Get all resume submissions by team recruiters
      const { resumeSubmissions, jobApplications } = await import("@shared/schema");
      const recruiterIds = filteredRecruiters.map(r => r.id);
      const allSubmissionsRaw = await db.select().from(resumeSubmissions);
      const teamSubmissionsRaw = allSubmissionsRaw.filter(s => recruiterIds.includes(s.recruiterId));

      // Filter submissions cumulatively (up to selected date) for metrics calculation
      const teamSubmissions = teamSubmissionsRaw.filter(sub => {
        if (!sub.submittedAt) return false;
        const subDate = new Date(sub.submittedAt).toISOString().split('T')[0];
        return subDate <= today;
      });

      // Get submissions for the specific date (for delivered items modal)
      const submissionsForDate = teamSubmissionsRaw.filter(sub => {
        if (!sub.submittedAt) return false;
        const subDate = new Date(sub.submittedAt).toISOString().split('T')[0];
        return subDate === today;
      });

      // Get tagged applications (recruiter_tagged) for team recruiters
      const allTaggedApplicationsRaw = await db.select().from(jobApplications)
        .where(eq(jobApplications.source, 'recruiter_tagged'));

      // Filter tagged applications by recruiter IDs (through requirement assignments)
      const taggedApplicationsRaw = allTaggedApplicationsRaw.filter(app => {
        if (!app.requirementId) return false;
        // Check if this requirement belongs to any of the filtered recruiters
        return filteredRequirements.some(req => req.id === app.requirementId);
      });

      // Filter tagged applications by recruiter and date (cumulative up to selected date)
      const filteredRequirementIds = filteredRequirements.map(r => r.id);
      const taggedApplications = taggedApplicationsRaw.filter(app => {
        if (!app.appliedDate || !app.requirementId) return false;
        const appDate = new Date(app.appliedDate).toISOString().split('T')[0];
        return appDate <= today && filteredRequirementIds.includes(app.requirementId);
      });

      // Get tagged applications for the specific date
      const taggedForDate = taggedApplicationsRaw.filter(app => {
        if (!app.appliedDate || !app.requirementId) return false;
        const appDate = new Date(app.appliedDate).toISOString().split('T')[0];
        return appDate === today && filteredRequirementIds.includes(app.requirementId);
      });

      // Calculate metrics for filtered requirements (created on or before selected date)
      let totalResumesRequired = 0;
      let totalResumesDelivered = 0;
      let completedRequirements = 0;

      for (const req of filteredRequirements) {
        const target = getResumeTarget(req.criticality, req.toughness);
        totalResumesRequired += target;

        // Count resumes submitted for this requirement (cumulative up to selected date)
        const deliveredFromSubmissions = teamSubmissions.filter(s => s.requirementId === req.id).length;

        // Count candidates tagged to this requirement (cumulative up to selected date)
        const deliveredFromTagged = taggedApplications.filter(app => app.requirementId === req.id).length;

        const deliveredForReq = deliveredFromSubmissions + deliveredFromTagged;
        totalResumesDelivered += deliveredForReq;

        // Check if this requirement is fully delivered
        if (deliveredForReq >= target) {
          completedRequirements++;
        }
      }

      const performanceData = await Promise.all(teamRecruiters.map(async (rec) => {
        const recReqs = await storage.getRequirementsByTalentAdvisorId(rec.id);
        const filteredRecReqs = recReqs.filter(req => {
          const createdDate = new Date(req.createdAt).toISOString().split('T')[0];
          return createdDate <= today && activeRequirementIds.has(req.id);
        });

        let profilesRequired = 0;
        let profilesDelivered = 0;
        for (const req of filteredRecReqs) {
          const target = getResumeTarget(req.criticality, req.toughness);
          profilesRequired += target;
          profilesDelivered += teamSubmissions.filter(s => s.requirementId === req.id).length;
          profilesDelivered += taggedApplications.filter(app => app.requirementId === req.id).length;
        }

        const recRevenueMappings = await storage.getRevenueMappingsByRecruiterId(rec.id);
        const closures = recRevenueMappings.length;

        return {
          member: rec.name,
          requirements: filteredRecReqs.length,
          profilesDelivered,
          profilesRequired,
          closures,
        };
      }));

      const totalRequirements = filteredRequirements.length;

      // Calculate averages (return as numbers, frontend will format)
      const avgResumesPerRequirement = totalRequirements > 0
        ? Math.round((totalResumesDelivered / totalRequirements) * 100) / 100
        : 0;
      const requirementsPerRecruiter = filteredRecruiters.length > 0
        ? Math.round((totalRequirements / filteredRecruiters.length) * 100) / 100
        : 0;

      // Build delivered items for the selected date
      const deliveredItems: Array<{
        requirement: string;
        candidate: string;
        client: string;
        deliveredDate: string;
        status: string;
      }> = [];

      for (const sub of submissionsForDate) {
        const req = filteredRequirements.find(r => r.id === sub.requirementId);
        if (req) {
          deliveredItems.push({
            requirement: req.position,
            candidate: sub.candidateName || 'Unknown',
            client: req.company,
            deliveredDate: new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            status: sub.status || 'Submitted'
          });
        }
      }

      for (const app of taggedForDate) {
        const req = filteredRequirements.find(r => r.id === app.requirementId);
        if (req) {
          deliveredItems.push({
            requirement: app.jobTitle || req.position,
            candidate: app.candidateName || 'Unknown',
            client: app.company || req.company,
            deliveredDate: new Date(app.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            status: app.status || 'Tagged'
          });
        }
      }

      // Build defaulted items (requirements that should have been delivered by the selected date but weren't)
      const defaultedItems: Array<{
        requirement: string;
        candidate: string;
        client: string;
        expectedDate: string;
        status: string;
      }> = [];

      for (const req of filteredRequirements) {
        const target = getResumeTarget(req.criticality, req.toughness);
        const deliveredFromSubmissions = teamSubmissions.filter(s => s.requirementId === req.id).length;
        const deliveredFromTagged = taggedApplications.filter(app => app.requirementId === req.id).length;
        const deliveredForReq = deliveredFromSubmissions + deliveredFromTagged;

        if (deliveredForReq < target) {
          defaultedItems.push({
            requirement: req.position,
            candidate: 'Pending',
            client: req.company,
            expectedDate: today,
            status: `${deliveredForReq}/${target}`
          });
        }
      }

      const dailyMetrics = {
        id: `daily-tl-${employee.id}`,
        date: new Date(today).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        totalRequirements,
        completedRequirements,
        avgResumesPerRequirement,
        requirementsPerRecruiter,
        totalResumes: totalResumesDelivered,
        totalResumesDelivered,
        totalResumesRequired,
        dailyDeliveryDelivered: submissionsForDate.length + taggedForDate.length,
        dailyDeliveryDefaulted: defaultedItems.length,
        overallPerformance: (() => {
          if (totalResumesRequired === 0) return "G";
          const performanceRatio = totalResumesDelivered / totalResumesRequired;
          if (performanceRatio >= 1.0) return "G"; // Good: 100% or more
          if (performanceRatio >= 0.5) return "A"; // Average: 50-99%
          return "B"; // Bad: less than 50%
        })(),
        deliveredItems,
        defaultedItems,
        performanceData,
        teamMembers: teamRecruiters.map(r => ({ id: r.id, name: r.name }))
      };
      res.json(dailyMetrics);
    } catch (error) {
      console.error('Get team leader daily metrics error:', error);
      res.status(500).json({ message: "Failed to fetch daily metrics" });
    }
  });

  app.get("/api/team-leader/meetings", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const allMeetings = await db.select().from(meetings).orderBy(desc(meetings.createdAt));
      const teamLeaderMeetings = allMeetings.filter(m =>
        m.personId === employee.id || m.person === employee.name
      );

      const meetingSummary = [];
      const tlMeetings = teamLeaderMeetings.filter(m => m.meetingType === "TL's Meeting");
      const ceoMeetings = teamLeaderMeetings.filter(m => m.meetingType === "CEO's Meeting");

      if (tlMeetings.length > 0) {
        meetingSummary.push({ id: "meeting-tl", type: "TL's Meeting", count: String(tlMeetings.length) });
      }
      if (ceoMeetings.length > 0) {
        meetingSummary.push({ id: "meeting-ceo", type: "CEO's Meeting", count: String(ceoMeetings.length) });
      }

      res.json(meetingSummary);
    } catch (error) {
      console.error('Get team leader meetings error:', error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Team leader detailed meetings endpoint for modal
  app.get("/api/team-leader/meetings/details", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const allMeetings = await db.select().from(meetings).orderBy(desc(meetings.createdAt));
      const teamLeaderMeetings = allMeetings.filter(m =>
        m.personId === employee.id || m.person === employee.name
      );

      const formattedMeetings = teamLeaderMeetings.map(m => ({
        id: m.id,
        meetingType: m.meetingType,
        date: m.meetingDate,
        time: m.meetingTime,
        person: m.person,
        agenda: m.agenda,
        status: m.status || 'Pending'
      }));

      res.json(formattedMeetings);
    } catch (error) {
      console.error('Get team leader detailed meetings error:', error);
      res.status(500).json({ message: "Failed to fetch detailed meetings" });
    }
  });

  app.get("/api/team-leader/ceo-comments", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const commands = await db.select().from(recruiterCommands)
        .where(eq(recruiterCommands.recruiterId, employee.id))
        .orderBy(desc(recruiterCommands.createdAt));

      const comments = commands.map((cmd: any) => ({
        id: cmd.id,
        comment: cmd.command,
        date: cmd.commandDate || new Date(cmd.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
      }));

      res.json(comments);
    } catch (error) {
      console.error('Get team leader ceo comments error:', error);
      res.status(500).json({ message: "Failed to fetch CEO comments" });
    }
  });

  // Team leader pipeline endpoint - fetch job applications from team members (TAs)
  app.get("/api/team-leader/pipeline", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      // Get optional TA filter from query parameter
      const taFilter = req.query.ta as string | undefined;

      // Get team members (recruiters/TAs reporting to this TL)
      const allEmployees = await storage.getAllEmployees();
      const teamRecruiters = allEmployees.filter(
        emp => emp.role === 'recruiter' && emp.reportingTo === employee.employeeId
      );

      // If TA filter is specified, filter to that specific TA
      let filteredTeamRecruiters = teamRecruiters;
      if (taFilter && taFilter !== 'all') {
        filteredTeamRecruiters = teamRecruiters.filter(ta => ta.id === taFilter || ta.employeeId === taFilter);
      }

      const teamRecruiterIds = new Set(filteredTeamRecruiters.map(r => r.id));
      const teamRecruiterEmployeeIds = new Set(filteredTeamRecruiters.map(r => r.employeeId));

      // Get all job applications
      const allApplications = await storage.getAllJobApplications();

      // Filter applications by TAs who report to this TL
      // Applications are linked via recruiterId (session.employeeId when created)
      const teamApplications = allApplications.filter((app: any) => {
        // Check if application was created by one of the team recruiters
        // We need to find the recruiter who created this application
        // Applications have recruiterJobId which links to recruiter_jobs table
        // Or we can check if the application's recruiterId matches any team recruiter

        // Try to match by recruiter ID from the application
        // Since we don't have direct recruiterId in job_applications, we'll use a different approach
        // We'll get all recruiter jobs for the team and match applications to those jobs
        return true; // We'll filter this properly below
      });

      // Get all recruiter jobs for team members to match applications
      const allRecruiterJobs = await storage.getAllRecruiterJobs();
      const teamRecruiterJobIds = new Set(
        allRecruiterJobs
          .filter((job: any) => teamRecruiterIds.has(job.recruiterId) || teamRecruiterEmployeeIds.has(job.recruiterId))
          .map((job: any) => job.id)
      );

      // Get requirements assigned to team TAs (using active assignments only)
      const allRequirements = await storage.getRequirements();
      const { requirementAssignments } = await import("@shared/schema");

      // Get requirement IDs assigned to team TAs (both from requirements table and assignments table)
      const teamRequirementIds = new Set<string>();

      // Method 1: From requirements table (talentAdvisorId)
      allRequirements.forEach((req: any) => {
        if (req.talentAdvisorId && teamRecruiterIds.has(req.talentAdvisorId)) {
          teamRequirementIds.add(req.id);
        }
      });

      // Method 2: From requirementAssignments table (active assignments for team recruiters)
      const teamRecruiterIdsArray = Array.from(teamRecruiterIds);
      let allAssignments: any[] = [];
      if (teamRecruiterIdsArray.length > 0) {
        allAssignments = await db.select().from(requirementAssignments)
          .where(
            and(
              eq(requirementAssignments.status, "active"),
              inArray(requirementAssignments.recruiterId, teamRecruiterIdsArray)
            )
          );

        allAssignments.forEach((assignment: any) => {
          teamRequirementIds.add(assignment.requirementId);
        });
      }

      // Also get resume submissions for team TAs (these are also part of pipeline)
      const { resumeSubmissions } = await import("@shared/schema");
      const teamResumeSubmissions = teamRecruiterIdsArray.length > 0
        ? await db.select().from(resumeSubmissions)
          .where(inArray(resumeSubmissions.recruiterId, teamRecruiterIdsArray))
        : [];

      // Filter applications that belong to team recruiter jobs OR tagged to team requirements
      const finalApplications = allApplications.filter((app: any) => {
        // Check if application belongs to team recruiter's job
        if (app.recruiterJobId && teamRecruiterJobIds.has(app.recruiterJobId)) {
          return true;
        }
        // Check if application is tagged to a requirement assigned to team TA
        if (app.requirementId && teamRequirementIds.has(app.requirementId)) {
          return true;
        }
        return false;
      });

      // Also include resume submissions as applications (convert them to application format)
      const submissionApplications = teamResumeSubmissions.map((sub: any) => ({
        id: `submission-${sub.id}`,
        profileId: sub.candidateId || sub.id,
        recruiterJobId: null,
        requirementId: sub.requirementId,
        jobTitle: 'N/A', // Will be filled from requirement
        company: 'N/A', // Will be filled from requirement
        status: sub.status || 'Submitted',
        source: 'recruiter_tagged',
        appliedDate: sub.submittedAt ? new Date(sub.submittedAt) : new Date(),
        candidateName: sub.candidateName,
        candidateEmail: sub.candidateEmail,
        candidatePhone: null,
        location: null,
        experience: null,
        skills: null
      }));

      // Merge regular applications with submission-based applications
      const allPipelineApplications = [...finalApplications, ...submissionApplications];

      // Define valid pipeline statuses (only candidates in pipeline stages)
      const validPipelineStatuses = new Set([
        'In-Process', 'In Process', 'Sourced', 'Applied',
        'Shortlisted',
        'Intro Call',
        'Assignment',
        'L1', 'Level 1',
        'L2', 'Level 2',
        'L3', 'Level 3',
        'Final Round',
        'HR Round',
        'Offer Stage', 'Selected',
        'Closure', 'Joined',
        'Offer Drop', 'Declined',
        'Interview Scheduled' // Maps to L1
      ]);

      // Filter to only include candidates in pipeline stages (exclude Rejected, Screened Out, Archived, etc.)
      const pipelineApplications = allPipelineApplications.filter((app: any) => {
        const status = (app.status || '').trim();
        return validPipelineStatuses.has(status);
      });

      // Format pipeline data similar to recruiter pipeline
      const pipelineData = pipelineApplications.map((app: any) => {
        // Find which TA this application belongs to
        let recruiterName = 'Unknown';
        let recruiterId = null;

        // For submission-based applications, get recruiter from submission
        if (app.id && app.id.startsWith('submission-')) {
          const submissionId = app.id.replace('submission-', '');
          const submission = teamResumeSubmissions.find((s: any) => s.id === submissionId);
          if (submission) {
            const recruiter = allEmployees.find((e: any) => e.id === submission.recruiterId);
            if (recruiter) {
              recruiterName = recruiter.name;
              recruiterId = recruiter.id;
            }
            // Also get job title and company from requirement
            if (submission.requirementId) {
              const req = allRequirements.find((r: any) => r.id === submission.requirementId);
              if (req) {
                app.jobTitle = req.position;
                app.company = req.company;
              }
            }
          }
        }

        // Try to find from recruiter job
        if (app.recruiterJobId && recruiterName === 'Unknown') {
          const job = allRecruiterJobs.find((j: any) => j.id === app.recruiterJobId);
          if (job) {
            const recruiter = allEmployees.find((e: any) => e.id === job.recruiterId || e.employeeId === job.recruiterId);
            if (recruiter) {
              recruiterName = recruiter.name;
              recruiterId = recruiter.id;
            }
          }
        }

        // Try to find from requirement
        if (app.requirementId && recruiterName === 'Unknown') {
          const req = allRequirements.find((r: any) => r.id === app.requirementId);
          if (req && req.talentAdvisorId) {
            const recruiter = allEmployees.find((e: any) => e.id === req.talentAdvisorId);
            if (recruiter) {
              recruiterName = recruiter.name;
              recruiterId = recruiter.id;
            }
          } else {
            // Try to find from requirementAssignments
            const assignment = allAssignments.find((a: any) =>
              a.requirementId === app.requirementId &&
              teamRecruiterIds.has(a.recruiterId) &&
              a.status === "active"
            );
            if (assignment) {
              const recruiter = allEmployees.find((e: any) => e.id === assignment.recruiterId);
              if (recruiter) {
                recruiterName = recruiter.name;
                recruiterId = recruiter.id;
              }
            }
          }
        }

        // Map status to pipeline format (normalize to match frontend expectations)
        const statusMap: Record<string, string> = {
          'In Process': 'In-Process',
          'In-Process': 'In-Process',
          'Sourced': 'In-Process',
          'Shortlisted': 'Shortlisted',
          'Intro Call': 'Intro Call',
          'Assignment': 'Assignment',
          'L1': 'L1',
          'Level 1': 'L1',
          'L2': 'L2',
          'Level 2': 'L2',
          'L3': 'L3',
          'Level 3': 'L3',
          'Final Round': 'Final Round',
          'HR Round': 'HR Round',
          'Offer Stage': 'Offer Stage',
          'Selected': 'Offer Stage',
          'Closure': 'Closure',
          'Joined': 'Closure',
          'Offer Drop': 'Offer Drop',
          'Declined': 'Offer Drop',
          'Interview Scheduled': 'L1',
          'Applied': 'In-Process',
          'Submitted': 'In-Process'
        };

        const mappedStatus = statusMap[app.status] || app.status || 'In-Process';

        return {
          id: app.id,
          name: app.candidateName || 'Unknown Candidate',
          candidateName: app.candidateName || 'Unknown Candidate',
          company: app.company || 'N/A',
          position: app.jobTitle || 'N/A',
          roleApplied: app.jobTitle || 'N/A',
          status: mappedStatus,
          currentStatus: mappedStatus,
          recruiter: recruiterName,
          recruiterId: recruiterId,
          email: app.candidateEmail || null,
          phone: app.candidatePhone || null,
          location: app.location || 'N/A',
          experience: app.experience || 'N/A',
          skills: (() => {
            try {
              if (!app.skills) return [];
              if (typeof app.skills === 'string') {
                return JSON.parse(app.skills);
              }
              return Array.isArray(app.skills) ? app.skills : [];
            } catch {
              return [];
            }
          })(),
          appliedDate: app.appliedDate || null,
          appliedOn: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : 'N/A',
          createdAt: app.appliedDate || new Date().toISOString(),
          updatedAt: app.appliedDate || new Date().toISOString(),
          profileId: app.profileId || null,
          requirementId: app.requirementId || null
        };
      });

      res.json(pipelineData);
    } catch (error) {
      console.error('Get team leader pipeline error:', error);
      res.status(500).json({ message: "Failed to fetch pipeline data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Team leader pipeline counts endpoint - get counts for each pipeline stage
  app.get("/api/team-leader/pipeline-counts", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const role = (employee.role || '').toLowerCase();
      if (role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      // Get team members (recruiters reporting to this TL)
      const allEmployees = await storage.getAllEmployees();
      const teamRecruiters = allEmployees.filter(
        emp => emp.role === 'recruiter' && emp.reportingTo === employee.employeeId
      );
      const teamRecruiterNames = teamRecruiters.map(r => r.name.toLowerCase());
      const teamRecruiterIdsArray = teamRecruiters.map(r => r.id);

      // Get team data similarly to the main pipeline endpoint
      const allApplications = await db.select().from(jobApplications);
      const recruiterJobsList = await db.select().from(recruiterJobs);
      const teamRecruiterJobIds = new Set(
        recruiterJobsList
          .filter(job => job.recruiterId && teamRecruiterIdsArray.includes(job.recruiterId))
          .map(job => job.id)
      );

      const assignments = await storage.getActiveRequirementAssignments();
      const teamRequirementIds = new Set<string>();
      if (assignments && assignments.length > 0) {
        assignments.forEach((assignment: any) => {
          if (teamRecruiterIdsArray.includes(assignment.recruiterId)) {
            teamRequirementIds.add(assignment.requirementId);
          }
        });
      }

      // Filter applications that belong to team
      const teamApplications = allApplications.filter((app: any) => {
        if (app.recruiterJobId && teamRecruiterJobIds.has(app.recruiterJobId)) return true;
        if (app.requirementId && teamRequirementIds.has(app.requirementId)) return true;
        return false;
      });

      // Also get resume submissions for team
      const { resumeSubmissions } = await import("@shared/schema");
      const teamResumeSubmissions = teamRecruiterIdsArray.length > 0
        ? await db.select().from(resumeSubmissions)
          .where(inArray(resumeSubmissions.recruiterId, teamRecruiterIdsArray))
        : [];

      // Combine all "pipeline entities"
      const allPipelineItems = [
        ...teamApplications.map(a => ({ status: a.status })),
        ...teamResumeSubmissions.map(s => ({ status: s.status || 'Submitted' }))
      ];

      // Count by stage
      const stageCounts: Record<string, number> = {
        SOURCED: 0,
        SHORTLISTED: 0,
        INTRO_CALL: 0,
        ASSIGNMENT: 0,
        L1: 0,
        L2: 0,
        L3: 0,
        FINAL_ROUND: 0,
        HR_ROUND: 0,
        OFFER: 0,
        CLOSURE: 0
      };
      allPipelineItems.forEach(item => {
        const status = (item.status || "").toUpperCase();
        if (status.includes("SOURCED") || status.includes("APPLIED")) stageCounts.SOURCED++;
        else if (status.includes("SHORTLISTED")) stageCounts.SHORTLISTED++;
        else if (status.includes("INTRO CALL")) stageCounts.INTRO_CALL++;
        else if (status.includes("ASSIGNMENT")) stageCounts.ASSIGNMENT++;
        else if (status.includes("L1") || status.includes("LEVEL 1") || status.includes("INTERVIEW SCHEDULED")) stageCounts.L1++;
        else if (status.includes("L2") || status.includes("LEVEL 2")) stageCounts.L2++;
        else if (status.includes("L3") || status.includes("LEVEL 3")) stageCounts.L3++;
        else if (status.includes("FINAL ROUND")) stageCounts.FINAL_ROUND++;
        else if (status.includes("HR ROUND")) stageCounts.HR_ROUND++;
        else if (status.includes("OFFER") || status.includes("SELECTED")) stageCounts.OFFER++;
        else if (status.includes("CLOSURE") || status.includes("JOINED")) stageCounts.CLOSURE++;
      });

      res.json(stageCounts);
    } catch (error) {
      console.error('Get team leader pipeline counts error:', error);
      res.status(500).json({ message: "Failed to fetch pipeline counts" });
    }
  });

  // Team leader requirements endpoint - fetch requirements assigned to logged-in TL
  app.get("/api/team-leader/requirements", requireEmployeeAuth, async (req, res) => {
    try {
      // Get the employee from session
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(401).json({ message: "Employee not found" });
      }

      // Verify employee is a team leader
      if (employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      // Get all team members (recruiters reporting to this TL) - ID-based lookup
      const allEmployees = await storage.getAllEmployees();
      const teamRecruiters = allEmployees.filter(
        emp => emp.role === 'recruiter' && emp.reportingTo === employee.employeeId
      );

      const allReqs = await storage.getRequirements();
      const teamRecruiterIds = new Set(teamRecruiters.map((rec) => rec.id));
      const allRequirements = allReqs.filter((req: any) =>
        !req.isArchived && (
          req.teamLead === employee.name ||
          (!req.teamLead && req.talentAdvisorId && teamRecruiterIds.has(req.talentAdvisorId))
        )
      );

      // Get assignment status for all requirements
      const { requirementAssignments } = await import("@shared/schema");
      const requirementIds = allRequirements.map(r => r.id);
      const allAssignments = requirementIds.length > 0
        ? await db.select().from(requirementAssignments)
          .where(inArray(requirementAssignments.requirementId, requirementIds))
        : [];

      // Add assignment status to each requirement
      const requirementsWithStatus = allRequirements.map(req => {
        const activeAssignmentForThisTL = allAssignments.find(a =>
          a.requirementId === req.id &&
          a.teamLeadId === employee.id &&
          a.status === "active"
        );
        const hasActiveAssignmentForOtherTL = allAssignments.some(a =>
          a.requirementId === req.id &&
          a.teamLeadId &&
          a.teamLeadId !== employee.id &&
          a.status === "active"
        );
        const assignedTalentAdvisorInThisTeam = req.talentAdvisorId
          ? teamRecruiterIds.has(req.talentAdvisorId)
          : teamRecruiters.some(rec => rec.name === req.talentAdvisor);
        const needsTalentAdvisorReassignment = Boolean(
          req.teamLead === employee.name &&
          req.talentAdvisor &&
          !assignedTalentAdvisorInThisTeam &&
          !activeAssignmentForThisTL
        );

        return {
          ...req,
          assignmentStatus: hasActiveAssignmentForOtherTL
            ? "reassigned"
            : (activeAssignmentForThisTL?.status || (needsTalentAdvisorReassignment ? "pending_reassignment" : "active")),
          needsTalentAdvisorReassignment,
        };
      });

      const recentClosedArchivedRequirements = (await storage.getArchivedRequirements())
        .filter((req: any) => {
          if (req.managementStatus !== "closed" || !req.managedAt) return false;
          const closedAt = new Date(req.managedAt).getTime();
          if (Number.isNaN(closedAt) || Date.now() - closedAt > 24 * 60 * 60 * 1000) return false;
          return req.teamLead === employee.name || teamRecruiters.some(rec => rec.name === req.talentAdvisor);
        })
        .map((req: any) => ({
          ...req,
          id: `recent-closed-${req.id}`,
          isRecentlyClosed: true,
          assignmentStatus: "archived",
        }));

      const allRequirementsForResume = [...recentClosedArchivedRequirements, ...requirementsWithStatus];
      const requirementIdsForResume = allRequirementsForResume.map((r: any) =>
        r.isRecentlyClosed ? r.id.replace(/^recent-closed-/, "") : r.id
      );

      const { getResumeTarget: getTarget } = await import("@shared/constants");
      const { resumeSubmissions, jobApplications: jobAppsTable } = await import("@shared/schema");
      const allSubmissionsForResume = requirementIdsForResume.length > 0
        ? (await db.select().from(resumeSubmissions)).filter((s: any) => requirementIdsForResume.includes(s.requirementId))
        : [];
      const allTaggedForResume = requirementIdsForResume.length > 0
        ? (await db.select().from(jobAppsTable)).filter(
            (app: any) =>
              app.source === "recruiter_tagged" &&
              app.requirementId &&
              requirementIdsForResume.includes(app.requirementId)
          )
        : [];

      const padResumeCount = (delivered: number, target: number) =>
        `${String(Math.max(0, delivered)).padStart(2, "0")}/${String(Math.max(0, target)).padStart(2, "0")}`;

      const enrichedRequirements = allRequirementsForResume.map((req: any) => {
        const lookupId = req.isRecentlyClosed ? req.id.replace(/^recent-closed-/, "") : req.id;
        const target = getTarget(req.criticality, req.toughness);
        const delivered =
          allSubmissionsForResume.filter((s: any) => s.requirementId === lookupId).length +
          allTaggedForResume.filter((app: any) => app.requirementId === lookupId).length;
        return {
          ...req,
          resumeCount: padResumeCount(delivered, target),
          resumeDelivered: delivered,
          resumeTarget: target,
        };
      });

      res.json(enrichedRequirements);
    } catch (error) {
      console.error('Get team leader requirements error:', error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Assign talent advisor to a requirement (Team Leader only)
  app.post("/api/team-leader/requirements/:id/assign-ta", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { talentAdvisor, jdText } = req.body;

      if (!talentAdvisor) {
        return res.status(400).json({ message: "Talent Advisor is required" });
      }

      // Get the employee from session
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(401).json({ message: "Employee not found" });
      }

      // Verify employee is a team leader
      if (employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      // Get team members first (recruiters reporting to this TL) - ID-based lookup
      const allEmployees = await storage.getAllEmployees();
      const teamRecruiters = allEmployees.filter(
        emp => emp.role === 'recruiter' && emp.reportingTo === employee.employeeId
      );
      const teamRecruiterIds = teamRecruiters.map(rec => rec.id);
      const allowedTalentAdvisors = teamRecruiters.map(rec => rec.name);

      // Get the requirement and verify it belongs to this TL's team (ID-based check)
      const requirements = await storage.getRequirements();
      const requirement = requirements.find(r => r.id === id);

      if (!requirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      // Check if requirement belongs to this TL's team (ID-based)
      // Requirement must either have talentAdvisorId belonging to this TL's team,
      // OR be unassigned and have teamLead matching this TL's name (legacy fallback)
      const belongsToTeam = requirement.talentAdvisorId
        ? teamRecruiterIds.includes(requirement.talentAdvisorId)
        : requirement.teamLead === employee.name;

      if (!belongsToTeam) {
        return res.status(403).json({ message: "Access denied. This requirement is not assigned to your team." });
      }

      if (!allowedTalentAdvisors.includes(talentAdvisor)) {
        return res.status(400).json({
          message: allowedTalentAdvisors.length > 0
            ? "Invalid Talent Advisor. Must be one of your team members: " + allowedTalentAdvisors.join(', ')
            : "No team members available to assign. Please add recruiters to your team first."
        });
      }

      // Find the recruiter's ID to set talentAdvisorId
      const recruiter = teamRecruiters.find(rec => rec.name === talentAdvisor);
      if (!recruiter) {
        return res.status(400).json({ message: "Could not find recruiter ID for assignment" });
      }

      // Check if there's an existing active assignment for this requirement
      const { requirementAssignments } = await import("@shared/schema");
      const existingAssignments = await db.select().from(requirementAssignments)
        .where(and(
          eq(requirementAssignments.requirementId, id),
          eq(requirementAssignments.status, "active")
        ));

      // If there's an existing assignment with a different recruiter, mark it as reassigned
      if (existingAssignments.length > 0) {
        for (const assignment of existingAssignments) {
          if (assignment.recruiterId !== recruiter.id) {
            await storage.updateRequirementAssignment(assignment.id, {
              status: "reassigned"
            });
          }
        }
      }

      // Create or update assignment record
      const today = new Date().toISOString().split('T')[0];
      const existingAssignmentForRecruiter = existingAssignments.find(a => a.recruiterId === recruiter.id);

      if (existingAssignmentForRecruiter) {
        // Reactivate if it was previously reassigned
        await storage.updateRequirementAssignment(existingAssignmentForRecruiter.id, {
          status: "active"
        });
      } else {
        // Create new assignment
        await storage.createRequirementAssignment({
          requirementId: id,
          recruiterId: recruiter.id,
          recruiterName: recruiter.name,
          teamLeadId: employee.id,
          teamLeadName: employee.name,
          assignedDate: today,
          status: "active"
        });
      }

      // Prepare update object - include jdText if provided
      const updateData: any = {
        talentAdvisor,
        talentAdvisorId: recruiter.id
      };

      // If jdText is provided, include it in the update (JD file is NOT shared to TA)
      if (jdText !== undefined && jdText !== null) {
        updateData.jdText = jdText;
      }

      // Update the requirement with both talentAdvisor name, talentAdvisorId, and optionally jdText
      const updated = await storage.updateRequirement(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error('Assign talent advisor error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Team Leader file upload endpoints
  app.post("/api/team-leader/upload/banner", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/team-leader/upload/profile", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get team leader profile from database based on logged-in user
  app.get("/api/team-leader/profile", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      // Get team members count
      const allEmployees = await storage.getAllEmployees();
      const teamMembers = allEmployees.filter(
        emp => emp.role === 'recruiter' && emp.reportingTo === employee.employeeId
      );

      // Get revenue mappings for total contribution calculation
      const revenueMappings = await storage.getRevenueMappingsByTeamLeaderId(employee.id);
      const totalContribution = revenueMappings.reduce((sum, rm) => sum + (rm.revenue || 0), 0);

      // Find reporting manager's name
      let reportingToName = '-';
      if (employee.reportingTo) {
        const manager = allEmployees.find(emp => emp.employeeId === employee.reportingTo);
        if (manager) {
          reportingToName = manager.name;
        }
      }

      const profile = {
        id: employee.id,
        name: employee.name,
        role: "Team Leader",
        employeeId: employee.employeeId,
        phone: employee.phone || employee.phoneNumber || '-',
        email: employee.email,
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, '-') : '-',
        department: employee.department || 'Talent Advisory',
        reportingTo: reportingToName,
        totalContribution: totalContribution.toLocaleString('en-IN'),
        bannerImage: null,
        profilePicture: employee.profilePicture || null,
        teamMembersCount: teamMembers.length
      };

      res.json(profile);
    } catch (error) {
      console.error('Get team leader profile error:', error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Team Leader profile update endpoint
  app.patch("/api/team-leader/profile", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const updates = req.body;

      const employeeUpdates: any = {};
      if (updates.name !== undefined) employeeUpdates.name = updates.name;
      if (updates.phone !== undefined) {
        employeeUpdates.phone = updates.phone;
        employeeUpdates.phoneNumber = updates.phone;
      }
      if (updates.email !== undefined) employeeUpdates.email = updates.email;
      if (updates.department !== undefined) employeeUpdates.department = updates.department;
      if (updates.bannerImage !== undefined) employeeUpdates.bannerImage = updates.bannerImage;
      if (updates.profilePicture !== undefined) employeeUpdates.profilePicture = updates.profilePicture;

      const updatedEmployee = await storage.updateEmployee(employee.id, employeeUpdates);

      if (!updatedEmployee) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      const allEmployees = await storage.getAllEmployees();
      const teamMembers = allEmployees.filter(
        emp => emp.role === 'recruiter' && emp.reportingTo === updatedEmployee.employeeId
      );

      const revenueMappings = await storage.getRevenueMappingsByTeamLeaderId(updatedEmployee.id);
      const totalContribution = revenueMappings.reduce((sum, rm) => sum + (rm.revenue || 0), 0);

      let reportingToName = '-';
      if (updatedEmployee.reportingTo) {
        const manager = allEmployees.find(emp => emp.employeeId === updatedEmployee.reportingTo);
        if (manager) {
          reportingToName = manager.name;
        }
      }

      const profile = {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        role: "Team Leader",
        employeeId: updatedEmployee.employeeId,
        phone: updatedEmployee.phone || updatedEmployee.phoneNumber || '-',
        email: updatedEmployee.email,
        joiningDate: updatedEmployee.joiningDate ? new Date(updatedEmployee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, '-') : '-',
        department: updatedEmployee.department || 'Talent Advisory',
        reportingTo: reportingToName,
        totalContribution: totalContribution.toLocaleString('en-IN'),
        bannerImage: updatedEmployee.bannerImage || null,
        profilePicture: updatedEmployee.profilePicture || null,
        teamMembersCount: teamMembers.length
      };

      res.json(profile);
    } catch (error) {
      console.error('Update team leader profile error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Team Leader stats endpoint - returns profile data for the team boxes component
  app.get("/api/team-leader/stats", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const allEmployees = await storage.getAllEmployees();
      const teamMembers = allEmployees.filter(
        emp => emp.role === 'recruiter' && emp.reportingTo === employee.employeeId
      );

      let joiningDate = employee.joiningDate;
      let tenure = "0";
      if (joiningDate) {
        try {
          const date = new Date(joiningDate);
          if (!isNaN(date.getTime())) {
            const now = new Date();
            tenure = ((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
          }
        } catch (e) {
          tenure = "0";
        }
      }

      const revenueMappings = await storage.getRevenueMappingsByTeamLeaderId(employee.id);
      const closedRevenueMappings = revenueMappings.filter(rm => rm.status === 'closed');
      const qtrsAchieved = new Set(
        closedRevenueMappings
          .map(rm => rm.quarter)
          .filter((quarter): quarter is string => Boolean(quarter))
      ).size;
      const nextMilestone = qtrsAchieved > 0 ? `+${Math.ceil(qtrsAchieved / 4) * 4 - qtrsAchieved}` : "0";

      // Calculate performance score based on requirements and resume delivery
      let performanceScore = 0;

      if (teamMembers.length > 0) {
        // Get all requirements assigned to team TAs
        const allRequirements = await storage.getRequirements();
        const teamRequirementIds = new Set(teamMembers.map(ta => ta.id));
        const teamRequirements = allRequirements.filter(req =>
          req.talentAdvisorId && teamRequirementIds.has(req.talentAdvisorId) && !req.isArchived
        );

        const totalRequirements = teamRequirements.length;

        if (totalRequirements > 0) {
          // Import getResumeTarget for calculations
          const { getResumeTarget } = await import("@shared/constants");

          // Get all resume submissions for team TAs using database directly
          const { resumeSubmissions, jobApplications } = await import("@shared/schema");
          const recruiterIds = teamMembers.map(ta => ta.id);
          const allSubmissionsRaw = await db.select().from(resumeSubmissions);
          const teamSubmissions = allSubmissionsRaw.filter(s => recruiterIds.includes(s.recruiterId));

          // Get all tagged applications for team requirements
          const allApplications = await storage.getAllJobApplications();
          const requirementIds = teamRequirements.map(req => req.id);
          const taggedApplications = allApplications.filter(app =>
            app.requirementId && requirementIds.includes(app.requirementId) &&
            app.source === 'recruiter_tagged'
          );

          let totalResumesRequired = 0;
          let totalResumesDelivered = 0;
          let totalCompletionPercentage = 0;

          // Calculate for each requirement
          for (const req of teamRequirements) {
            const target = getResumeTarget(req.criticality, req.toughness);
            totalResumesRequired += target;

            // Get unique candidate emails delivered for this requirement
            const deliveredEmails = new Set<string>();

            // From submissions
            teamSubmissions
              .filter(s => s.requirementId === req.id && s.candidateEmail)
              .forEach(s => deliveredEmails.add(s.candidateEmail!.toLowerCase()));

            // From tagged applications
            taggedApplications
              .filter(app => app.requirementId === req.id && app.candidateEmail)
              .forEach(app => deliveredEmails.add(app.candidateEmail!.toLowerCase()));

            const uniqueDelivered = deliveredEmails.size;
            totalResumesDelivered += uniqueDelivered;

            // Calculate percentage completion for this requirement (capped at 100%)
            const reqCompletion = Math.min(100, (uniqueDelivered / target) * 100);
            totalCompletionPercentage += reqCompletion;
          }

          // Calculate performance metrics
          // 1. Average requirements completion percentage
          const avgRequirementsCompletion = totalRequirements > 0
            ? totalCompletionPercentage / totalRequirements
            : 0;

          // 2. Total resume delivery rate across all requirements
          const overallResumeDeliveryRate = totalResumesRequired > 0
            ? Math.min(100, (totalResumesDelivered / totalResumesRequired) * 100)
            : 0;

          // Overall performance: Average of both metrics
          performanceScore = (avgRequirementsCompletion + overallResumeDeliveryRate) / 2;
        } else {
          // No requirements assigned yet - default to 0
          performanceScore = 0;
        }
      }

      res.json({
        id: employee.id,
        name: employee.name,
        image: employee.profilePicture || null,
        members: teamMembers.length,
        tenure: tenure,
        qtrsAchieved,
        nextMilestone,
        email: employee.email,
        position: "Team Leader",
        department: employee.department || "Recruitment",
        performanceScore: Math.round(performanceScore * 10) / 10
      });
    } catch (error) {
      console.error('Get team leader stats error:', error);
      res.status(500).json({ message: "Failed to fetch team leader stats" });
    }
  });

  // Team Leader team performance endpoint
  app.get("/api/team-leader/team-performance", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const allEmployees = await storage.getAllEmployees();
      const recruiters = getTeamLeaderRecruiters(employee, allEmployees);
      const allMappings = await storage.getAllRevenueMappings();

      const performanceData = await Promise.all(recruiters.map(async (rec) => {
        const revenueMappings = allMappings.filter((m) => revenueMappingBelongsToRecruiter(m, rec));
        const closures = revenueMappings.filter((rm) => isClosedRevenueMapping(rm)).length;

        let tenure = "0";
        if (rec.joiningDate) {
          try {
            const joinDate = new Date(rec.joiningDate);
            if (!isNaN(joinDate.getTime())) {
              const now = new Date();
              const years = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
              const months = Math.floor(((now.getTime() - joinDate.getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
              tenure = years > 0 ? `${years}y ${months}m` : `${months}m`;
            }
          } catch (e) {
            tenure = "0";
          }
        }

        // Count unique quarters with closures
        const closedMappings = revenueMappings.filter((rm) => isClosedRevenueMapping(rm));
        const qtrsAchieved = new Set(closedMappings.map(rm => rm.quarter)).size;

        // Find last closure date
        const lastClosure = closedMappings.length > 0
          ? closedMappings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0]
          : null;

        return {
          name: rec.name,
          joiningDate: rec.joiningDate ? new Date(rec.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          tenure,
          closures,
          lastClosure: lastClosure ? new Date(lastClosure.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '-',
          qtrsAchieved
        };
      }));

      res.json(performanceData);
    } catch (error) {
      console.error('Get team leader team performance error:', error);
      res.status(500).json({ message: "Failed to fetch team performance" });
    }
  });

  // Team Leader team member performance graph data endpoint
  app.get("/api/team-leader/team-performance-graph", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const memberId = req.query.memberId as string | undefined;
      const allEmployees = await storage.getAllEmployees();
      const recruiters = getTeamLeaderRecruiters(employee, allEmployees);

      const members = recruiters.map((rec) => ({
        id: rec.id,
        name: rec.name,
      }));

      const tlName = (employee.name || "").toLowerCase();
      const tlRefs = new Set(
        [employee.id, employee.employeeId].filter(Boolean) as string[],
      );

      const allMappings = await storage.getAllRevenueMappings();
      let teamMappings = allMappings.filter((mapping) => {
        const onTeamLead =
          tlRefs.has(mapping.teamLeadId) ||
          (mapping.teamLeadName || "").toLowerCase() === tlName;
        const onTeamRecruiter = recruiters.some((rec) =>
          revenueMappingBelongsToRecruiter(mapping, rec),
        );
        return onTeamLead || onTeamRecruiter;
      });

      const targetRecruiters =
        memberId && memberId !== "all"
          ? recruiters.filter((rec) => rec.id === memberId)
          : recruiters;

      if (memberId && memberId !== "all") {
        const selected = recruiters.find((rec) => rec.id === memberId);
        teamMappings = selected
          ? teamMappings.filter((mapping) => revenueMappingBelongsToRecruiter(mapping, selected))
          : [];
      }

      const { jobApplications, requirements } = await import("@shared/schema");
      const recruiterIds = new Set(targetRecruiters.map((r) => r.id));
      const recruiterNames = new Set(
        targetRecruiters.map((r) => (r.name || "").toLowerCase()).filter(Boolean),
      );

      const allApplications = await db.select({ appliedDate: jobApplications.appliedDate, requirementId: jobApplications.requirementId }).from(jobApplications);
      const allRequirements = await db.select({
        id: requirements.id,
        talentAdvisorId: requirements.talentAdvisorId,
        talentAdvisor: requirements.talentAdvisor,
      }).from(requirements);

      const teamRequirementIds = new Set(
        allRequirements
          .filter(
            (req) =>
              (req.talentAdvisorId && recruiterIds.has(req.talentAdvisorId)) ||
              (req.talentAdvisor && recruiterNames.has(req.talentAdvisor.toLowerCase())),
          )
          .map((req) => req.id),
      );

      const quarterlyData: Record<string, { resumesDelivered: number; closures: number }> = {};

      const ensureQuarter = (label: string) => {
        if (!quarterlyData[label]) {
          quarterlyData[label] = { resumesDelivered: 0, closures: 0 };
        }
        return quarterlyData[label];
      };

      for (const rm of teamMappings) {
        const year = Number(rm.year) || new Date().getFullYear();
        const code = normalizeRevenueQuarterCode(rm.quarter);
        const label = chartQuarterLabelFromCode(year, code);
        ensureQuarter(label).closures += 1;
      }

      for (const app of allApplications) {
        if (!app.requirementId || !teamRequirementIds.has(app.requirementId) || !app.appliedDate) continue;
        const date = new Date(app.appliedDate);
        if (isNaN(date.getTime())) continue;
        const year = date.getFullYear();
        const month = date.getMonth();
        const code = REVENUE_QUARTER_CODES[Math.floor(month / 3)];
        const label = chartQuarterLabelFromCode(year, code);
        ensureQuarter(label).resumesDelivered += 1;
      }

      const chartData = Object.entries(quarterlyData)
        .map(([quarter, data]) => ({
          quarter,
          resumesDelivered: data.resumesDelivered,
          closures: data.closures,
        }))
        .sort((a, b) => {
          const parse = (label: string) => {
            const parts = label.split(/\s+/);
            const qKey = (parts[0] || "").toUpperCase();
            const year = parseInt(parts[1] || "0", 10) || 0;
            const qMap: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
            return { year, q: qMap[qKey] || 0 };
          };
          const pa = parse(a.quarter);
          const pb = parse(b.quarter);
          if (pa.year !== pb.year) return pa.year - pb.year;
          return pa.q - pb.q;
        });

      res.json({
        members,
        chartData,
        selectedMemberId: memberId || "all",
      });
    } catch (error) {
      console.error('Get team leader team performance graph error:', error);
      res.status(500).json({ message: "Failed to fetch team performance graph data" });
    }
  });

  // Team Leader closures list endpoint
  app.get("/api/team-leader/closures", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const allEmployees = await storage.getAllEmployees();
      const tlName = (employee.name || "").toLowerCase();
      const tlRefs = new Set(
        [employee.id, employee.employeeId].filter(Boolean) as string[],
      );

      const recruiters = getTeamLeaderRecruiters(employee, allEmployees);

      const teamRecruiterRefs = new Set<string>();
      for (const rec of recruiters) {
        teamRecruiterRefs.add(rec.id);
        if (rec.employeeId) teamRecruiterRefs.add(rec.employeeId);
      }

      const allMappings = await storage.getAllRevenueMappings();
      const closures = allMappings
        .filter((mapping) => {
          const onTeamLead =
            tlRefs.has(mapping.teamLeadId) ||
            (mapping.teamLeadName || "").toLowerCase() === tlName;
          const onTeamRecruiter =
            teamRecruiterRefs.has(mapping.talentAdvisorId) ||
            recruiters.some(
              (rec) =>
                matchesEmployeeRef(rec, mapping.talentAdvisorId) ||
                (mapping.talentAdvisorName || "").toLowerCase() === (rec.name || "").toLowerCase(),
            );
          return onTeamLead || onTeamRecruiter;
        })
        .sort((a, b) => getRevenueMappingRecencyTs(b) - getRevenueMappingRecencyTs(a))
        .map((mapping) => ({
          id: mapping.id,
          name: mapping.candidateName || "Unknown",
          position: mapping.position || "Unknown Position",
          company: mapping.clientName || "Unknown Company",
          closureMonth: mapping.quarter
            ? `${mapping.quarter}${mapping.year ? ` ${mapping.year}` : ""}`
            : "N/A",
          talentAdvisor: mapping.talentAdvisorName || "Unassigned",
          package: mapping.revenue
            ? `${Number(mapping.revenue).toLocaleString("en-IN")}`
            : "0",
          revenue: mapping.revenue
            ? `${Number(mapping.revenue).toLocaleString("en-IN")}`
            : "0",
          offeredDate: mapping.offeredDate || null,
          joinedDate: mapping.closureDate || null,
        }));

      res.json(closures);
    } catch (error) {
      console.error('Get team leader closures error:', error);
      res.status(500).json({ message: "Failed to fetch closures" });
    }
  });

  // Admin Dashboard API routes and file uploads
  // Session-based admin profile endpoint - fetches from database based on logged-in user
  app.get("/api/admin/profile", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      // Get all revenue mappings for total contribution calculation (admin sees all)
      const allRevenueMappings = await storage.getAllRevenueMappings();
      const totalContribution = allRevenueMappings.reduce((sum, rm) => sum + (rm.revenue || 0), 0);

      const profile = {
        id: employee.id,
        name: employee.name,
        role: employee.designation || "CEO",
        employeeId: employee.employeeId,
        phone: employee.phone || '-',
        email: employee.email,
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, '-') : '-',
        department: employee.department || 'Administration',
        reportingTo: 'Board of Directors',
        totalContribution: totalContribution.toLocaleString('en-IN'),
        bannerImage: employee.bannerImage || null,
        profilePicture: employee.profilePicture || null
      };

      res.json(profile);
    } catch (error) {
      console.error('Get admin profile error:', error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get("/api/admin/notifications-feed", requireEmployeeAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      const sessionRole = (req.session.employeeRole || "").toLowerCase().replace(/[\s-]+/g, "_");
      const dbRole = (employee?.role || "").toLowerCase().replace(/[\s-]+/g, "_");
      const isAdminUser =
        sessionRole === "admin" ||
        dbRole === "admin" ||
        sessionRole.includes("admin") ||
        dbRole.includes("admin");
      if (!employee || !isAdminUser) {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const feed = await buildEmployeeNotificationsFeed(employee);
      res.json({
        closures: feed.closures,
        adminNudges: feed.nudges,
        clientEscalations: feed.escalatedNudges,
        unreadAdminNudges: feed.nudges.filter((i: any) => i.isUnread).length,
        unreadClientEscalations: feed.escalatedNudges.filter((i: any) => i.isUnread).length,
      });
    } catch (error) {
      console.error("Admin notifications feed error:", error);
      res.json({
        closures: [],
        adminNudges: [],
        clientEscalations: [],
        unreadAdminNudges: 0,
        unreadClientEscalations: 0,
      });
    }
  });

  app.get("/api/employee/notifications-feed", requireEmployeeAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const feed = await buildEmployeeNotificationsFeed(employee);
      res.json(feed);
    } catch (error) {
      console.error("Employee notifications feed error:", error);
      res.json({
        role: "employee",
        closures: [],
        nudges: [],
        escalatedNudges: [],
        newRequirements: [],
        newCandidateApplied: [],
        unreadCount: 0,
      });
    }
  });

  app.patch("/api/employee/notifications/dismiss", requireEmployeeAuth, async (req, res) => {
    try {
      const { kind, id } = req.body as { kind?: string; id?: string };
      if (!id) {
        return res.status(400).json({ message: "Notification id is required" });
      }
      const nudgeKinds = new Set(["nudge", "escalation", "escalatedNudge"]);
      if (kind && nudgeKinds.has(kind)) {
        const { nudges: nudgesTable } = await import("@shared/schema");
        await db
          .update(nudgesTable)
          .set({ isRead: true })
          .where(eq(nudgesTable.id, id));
      }
      res.json({ ok: true });
    } catch (error) {
      console.error("Dismiss notification error:", error);
      res.status(500).json({ message: "Failed to dismiss notification" });
    }
  });

  app.patch("/api/admin/notifications/mark-all-read", requireAdminAuth, async (_req, res) => {
    try {
      await db
        .update(nudges)
        .set({ isRead: true })
        .where(
          and(
            eq(nudges.isResponded, false),
            inArray(nudges.escalationLevel, ["admin", "client"]),
          ),
        );
      res.json({ ok: true });
    } catch (error) {
      console.error("Mark admin notifications read error:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  app.patch("/api/admin/notifications/nudges/:id/read", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const [updated] = await db
        .update(nudges)
        .set({ isRead: true })
        .where(and(eq(nudges.id, id), eq(nudges.isResponded, false)))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Nudge not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Mark nudge read (admin) error:", error);
      res.status(500).json({ message: "Failed to update nudge" });
    }
  });

  app.patch("/api/admin/profile", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const updates = req.body;

      // Update the employee record in database
      const updatedEmployee = await storage.updateEmployee(employee.id, {
        name: updates.name !== undefined ? updates.name : employee.name,
        phone: updates.phone !== undefined ? updates.phone : employee.phone,
        bannerImage: updates.bannerImage !== undefined ? updates.bannerImage : employee.bannerImage,
        profilePicture: updates.profilePicture !== undefined ? updates.profilePicture : employee.profilePicture,
        department: updates.department !== undefined ? updates.department : employee.department
      });

      if (!updatedEmployee) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      // Get all revenue mappings for total contribution calculation
      const allRevenueMappings = await storage.getAllRevenueMappings();
      const totalContribution = allRevenueMappings.reduce((sum, rm) => sum + (rm.revenue || 0), 0);

      const profile = {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        role: updatedEmployee.designation || "CEO",
        employeeId: updatedEmployee.employeeId,
        phone: updatedEmployee.phone || '-',
        email: updatedEmployee.email,
        joiningDate: updatedEmployee.joiningDate ? new Date(updatedEmployee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, '-') : '-',
        department: updatedEmployee.department || 'Administration',
        reportingTo: 'Board of Directors',
        totalContribution: totalContribution.toLocaleString('en-IN'),
        bannerImage: updatedEmployee.bannerImage || null,
        profilePicture: updatedEmployee.profilePicture || null
      };

      res.json(profile);
    } catch (error) {
      console.error('Update admin profile error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/admin/system-settings", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const welcomeMessage = await getAppSetting(EMPLOYEE_WELCOME_MESSAGE_KEY);

      res.json({
        employeeWelcomeMessage: welcomeMessage?.trim() || DEFAULT_EMPLOYEE_WELCOME_MESSAGE,
      });
    } catch (error) {
      console.error('Get admin system settings error:', error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.patch("/api/admin/system-settings", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const welcomeMessage = typeof req.body?.employeeWelcomeMessage === 'string'
        ? req.body.employeeWelcomeMessage.trim()
        : '';

      await upsertAppSetting(
        EMPLOYEE_WELCOME_MESSAGE_KEY,
        welcomeMessage || DEFAULT_EMPLOYEE_WELCOME_MESSAGE,
        employee.id,
      );

      res.json({
        employeeWelcomeMessage: welcomeMessage || DEFAULT_EMPLOYEE_WELCOME_MESSAGE,
      });
    } catch (error) {
      console.error('Update admin system settings error:', error);
      res.status(500).json({ message: "Failed to update system settings" });
    }
  });

  // Admin file upload endpoints
  app.post("/api/admin/upload/banner", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/admin/upload/profile", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Admin Upload JD File (similar to client JD upload, allows PDF, DOC, DOCX)
  app.post("/api/admin/upload/jd-file", requireAdminAuth, chatUpload.single('jdFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const url = `${baseUrl}/uploads/chat/${req.file.filename}`;
      res.json({ url, filename: req.file.filename });
    } catch (error) {
      console.error('JD file upload error:', error);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Admin team leaders endpoint - fetch all team leaders with their recruiter counts
  app.get("/api/admin/team-leaders", requireAdminAuth, async (req, res) => {
    try {
      const allEmployees = await storage.getAllEmployees();
      const allTargetMappings = await storage.getAllTargetMappings();
      const allRevenueMappings = await storage.getAllRevenueMappings();

      // Filter team leaders
      const teamLeaders = allEmployees.filter(emp => emp.role === 'team_leader');

      // For each team leader, count their recruiters and calculate metrics
      const teamLeadersWithCounts = await Promise.all(teamLeaders.map(async (tl) => {
        // Count recruiters reporting to this team leader
        const recruiters = allEmployees.filter(
          emp => emp.role === 'recruiter' && emp.reportingTo === tl.employeeId
        );
        const recruiterCount = recruiters.length;

        // Calculate tenure
        let tenure = '0';
        if (tl.joiningDate) {
          try {
            const joinDate = new Date(tl.joiningDate);
            if (!isNaN(joinDate.getTime())) {
              const now = new Date();
              const years = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
              const months = Math.floor(((now.getTime() - joinDate.getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
              tenure = years > 0 ? `${years}y ${months}m` : `${months}m`;
            }
          } catch (e) {
            tenure = '0';
          }
        }

        // Get target mappings for this team leader
        const tlTargets = allTargetMappings.filter(tm => tm.teamLeadId === tl.id || tm.teamLeadName === tl.name);

        // Calculate quarters since joining (as requested: based on joining date)
        const qtrsAchieved = calculateQuartersSince(tl.joiningDate);

        // Get revenue mappings for this team leader (sum of all their recruiters' closures)
        const recruiterIds = recruiters.map(r => r.id);
        const recruiterNames = recruiters.map(r => r.name);
        const tlRevenueMappings = allRevenueMappings.filter(rm =>
          recruiterIds.includes(rm.talentAdvisorId) ||
          recruiterNames.some(name => name.toLowerCase() === (rm.talentAdvisorName || '').toLowerCase())
        );

        const totalClosures = tlRevenueMappings.filter(rm => rm.status === 'closed').length;

        // Calculate total revenue
        const totalRevenue = tlRevenueMappings
          .filter(rm => rm.status === 'closed')
          .reduce((sum, rm) => sum + (parseFloat(rm.revenue || '0') || 0), 0);

        // Calculate target achievement percentage
        const totalTarget = tlTargets.reduce((sum, tm) => sum + (tm.minimumTarget || 0), 0);
        const totalAchieved = tlTargets.reduce((sum, tm) => sum + (tm.targetAchieved || 0), 0);
        const targetAchievement = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

        // Get last closure date
        const closedMappings = tlRevenueMappings.filter(rm => rm.status === 'closed');
        let lastClosure = 'N/A';
        if (closedMappings.length > 0) {
          const lastClosureRecord = closedMappings.sort((a, b) => {
            const dateA = a.closureDate ? new Date(a.closureDate).getTime() : 0;
            const dateB = b.closureDate ? new Date(b.closureDate).getTime() : 0;
            return dateB - dateA;
          })[0];
          if (lastClosureRecord.closureDate) {
            lastClosure = new Date(lastClosureRecord.closureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          }
        }

        // Get last login
        let lastLogin = 'N/A';
        if (tl.lastLoginAt) {
          try {
            lastLogin = new Date(tl.lastLoginAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          } catch (e) {
            lastLogin = 'N/A';
          }
        }

        // Calculate next milestone (next quarter target) - return just the number
        const nextMilestone = qtrsAchieved + 1;

        return {
          id: tl.id,
          employeeId: tl.employeeId,
          name: tl.name,
          email: tl.email || 'N/A',
          phone: tl.phone || 'N/A',
          age: tl.age || 'N/A',
          department: tl.department || 'N/A',
          joiningDate: tl.joiningDate ? new Date(tl.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          reportingTo: tl.reportingTo || 'N/A',
          members: recruiterCount,
          tenure: tenure,
          qtrsAchieved: qtrsAchieved,
          nextMilestone: nextMilestone.toString(),
          totalClosures: totalClosures,
          targetAchievement: targetAchievement,
          totalRevenue: totalRevenue.toLocaleString('en-IN'),
          role: 'Team Leader',
          image: tl.profilePicture || null,
          lastLogin: lastLogin,
          lastClosure: lastClosure
        };
      }));

      res.json(teamLeadersWithCounts);
    } catch (error) {
      console.error('Get team leaders error:', error);
      res.status(500).json({ message: "Failed to fetch team leaders", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Admin API: Get recruiter performance data for profile modals
  app.get("/api/admin/recruiter-performance/:recruiterId", requireAdminAuth, async (req, res) => {
    try {
      const { recruiterId } = req.params;
      const allEmployees = await storage.getAllEmployees();
      const allTargetMappings = await storage.getAllTargetMappings();
      const allRevenueMappings = await storage.getAllRevenueMappings();

      const recruiter = allEmployees.find(emp => emp.id === recruiterId || emp.employeeId === recruiterId);
      if (!recruiter) {
        return res.status(404).json({ message: "Recruiter not found" });
      }

      // Calculate tenure
      let tenure = '0';
      if (recruiter.joiningDate) {
        try {
          const joinDate = new Date(recruiter.joiningDate);
          if (!isNaN(joinDate.getTime())) {
            const now = new Date();
            const years = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
            const months = Math.floor(((now.getTime() - joinDate.getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
            tenure = years > 0 ? `${years}y ${months}m` : `${months}m`;
          }
        } catch (e) {
          tenure = '0';
        }
      }

      // Get target mappings for this recruiter
      const recruiterTargets = allTargetMappings.filter(tm => tm.teamMemberId === recruiter.id);
      const enrichedRecruiterTargets = recruiterTargets.map((tm) =>
        enrichTargetMappingWithRevenue(tm, allRevenueMappings),
      );

      const quartersAchieved = countQuartersTargetMet(enrichedRecruiterTargets);

      // Get revenue mappings for this recruiter
      const recruiterRevenueMappings = allRevenueMappings.filter(rm =>
        rm.talentAdvisorId === recruiter.id ||
        (rm.talentAdvisorName || '').toLowerCase() === recruiter.name.toLowerCase()
      );

      const totalClosures = recruiterRevenueMappings.length;

      const totalRevenue = recruiterRevenueMappings.reduce(
        (sum, rm) => sum + (Number(rm.revenue) || 0),
        0,
      );

      const totalTarget = enrichedRecruiterTargets.reduce(
        (sum, tm) => sum + (tm.minimumTarget || 0),
        0,
      );
      const totalAchieved = enrichedRecruiterTargets.reduce(
        (sum, tm) => sum + (tm.targetAchieved || 0),
        0,
      );
      const targetAchievement =
        totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

      // Get last closure date
      const closedMappings = recruiterRevenueMappings.filter(rm => rm.status === 'closed');
      let lastClosure = 'N/A';
      if (closedMappings.length > 0) {
        const lastClosureRecord = closedMappings.sort((a, b) => {
          const dateA = a.closureDate ? new Date(a.closureDate).getTime() : 0;
          const dateB = b.closureDate ? new Date(b.closureDate).getTime() : 0;
          return dateB - dateA;
        })[0];
        if (lastClosureRecord.closureDate) {
          lastClosure = new Date(lastClosureRecord.closureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      }

      // Get last login
      let lastLogin = 'N/A';
      if (recruiter.lastLoginAt) {
        try {
          lastLogin = new Date(recruiter.lastLoginAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
          lastLogin = 'N/A';
        }
      }

      res.json({
        id: recruiter.id,
        employeeId: recruiter.employeeId,
        name: recruiter.name,
        email: recruiter.email || 'N/A',
        phone: recruiter.phone || 'N/A',
        age: recruiter.age || 'N/A',
        department: recruiter.department || 'N/A',
        joiningDate: recruiter.joiningDate ? new Date(recruiter.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        role: recruiter.role === 'recruiter' ? 'Recruiter' : recruiter.role === 'talent_advisor' ? 'Talent Advisor' : recruiter.role,
        image: recruiter.profilePicture || null,
        lastLogin: lastLogin,
        lastClosure: lastClosure,
        tenure: tenure,
        totalClosures: totalClosures,
        quartersAchieved: quartersAchieved,
        targetAchievement: targetAchievement,
        totalRevenue: totalRevenue.toLocaleString('en-IN'),
        teamLeaderName: recruiter.reportingTo ? (() => {
          const teamLeader = allEmployees.find(emp => emp.employeeId === recruiter.reportingTo && emp.role === 'team_leader');
          return teamLeader?.name || 'N/A';
        })() : 'N/A',
        teamLeaderId: recruiter.reportingTo || 'N/A'
      });
    } catch (error) {
      console.error('Get recruiter performance error:', error);
      res.status(500).json({ message: "Failed to fetch recruiter performance", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Recruiter Dashboard API routes
  // Get recruiter profile from database based on logged-in user (session-based)
  app.get("/api/recruiter/profile", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter role required." });
      }

      let reportingToName = '-';
      if (employee.reportingTo) {
        const manager = await storage.getEmployeeByEmployeeId(employee.reportingTo);
        if (manager) {
          reportingToName = manager.name;
        }
      }

      // Get revenue mappings for total contribution calculation
      const revenueMappings = await storage.getRevenueMappingsByTalentAdvisorId(employee.id);
      const totalContribution = revenueMappings.reduce((sum, rm) => sum + (rm.revenue || 0), 0);

      const profile = {
        id: employee.id,
        name: employee.name,
        role: "Talent Advisor",
        employeeId: employee.employeeId,
        phone: employee.phone || '-',
        email: employee.email,
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, '-') : '-',
        department: employee.department || 'Talent Advisory',
        reportingTo: reportingToName,
        totalContribution: totalContribution.toLocaleString('en-IN'),
        bannerImage: employee.bannerImage || null,
        profilePicture: employee.profilePicture || null
      };

      res.json(profile);
    } catch (error) {
      console.error('Get recruiter profile error:', error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Recruiter profile update endpoint - updates the employee record in database
  app.patch("/api/recruiter/profile", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter role required." });
      }

      const updates = req.body;

      // Map profile fields to employee fields for database update
      const employeeUpdates: any = {};
      if (updates.name) employeeUpdates.name = updates.name;
      if (updates.phone) employeeUpdates.phone = updates.phone;
      if (updates.email) employeeUpdates.email = updates.email;
      if (updates.department) employeeUpdates.department = updates.department;
      if (updates.bannerImage !== undefined) employeeUpdates.bannerImage = updates.bannerImage;
      if (updates.profilePicture !== undefined) employeeUpdates.profilePicture = updates.profilePicture;

      // Update employee record in database
      const updatedEmployee = await storage.updateEmployee(employee.id, employeeUpdates);

      if (!updatedEmployee) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      // Return the updated profile in the expected format
      let reportingToName = '-';
      if (updatedEmployee.reportingTo) {
        const manager = await storage.getEmployeeByEmployeeId(updatedEmployee.reportingTo);
        if (manager) {
          reportingToName = manager.name;
        }
      }

      const revenueMappings = await storage.getRevenueMappingsByTalentAdvisorId(updatedEmployee.id);
      const totalContribution = revenueMappings.reduce((sum, rm) => sum + (rm.revenue || 0), 0);

      const profile = {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        role: "Talent Advisor",
        employeeId: updatedEmployee.employeeId,
        phone: updatedEmployee.phone || '-',
        email: updatedEmployee.email,
        joiningDate: updatedEmployee.joiningDate ? new Date(updatedEmployee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, '-') : '-',
        department: updatedEmployee.department || 'Talent Advisory',
        reportingTo: reportingToName,
        totalContribution: totalContribution.toLocaleString('en-IN'),
        bannerImage: updatedEmployee.bannerImage || null,
        profilePicture: updatedEmployee.profilePicture || null
      };

      res.json(profile);
    } catch (error) {
      console.error('Update recruiter profile error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Interview Tracker API routes
  // Get interviews for the logged-in recruiter
  app.get("/api/recruiter/interviews", requireEmployeeAuth, async (req, res) => {
    try {
      console.log('GET /api/recruiter/interviews - Request received');
      const session = req.session as any;

      if (!session || !session.employeeId) {
        console.log('GET /api/recruiter/interviews - No session found');
        return res.status(401).json({ message: "Unauthorized" });
      }

      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        console.log('GET /api/recruiter/interviews - Employee not found:', session.employeeId);
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'recruiter') {
        console.log('GET /api/recruiter/interviews - Not a recruiter:', employee.role);
        return res.status(403).json({ message: "Access denied. Recruiter role required." });
      }

      console.log('GET /api/recruiter/interviews - Fetching interviews for:', employee.name);
      const interviews = await storage.getInterviewsByRecruiterName(employee.name);
      console.log('GET /api/recruiter/interviews - Found interviews:', interviews.length);

      // Transform to match frontend expected format
      const transformedInterviews = interviews.map(interview => ({
        id: interview.id,
        candidateName: interview.candidateName,
        position: interview.position,
        client: interview.client,
        interviewDate: interview.interviewDate,
        interviewTime: interview.interviewTime,
        interviewType: interview.interviewType,
        interviewRound: interview.interviewRound,
        status: interview.status
      }));

      res.json(transformedInterviews);
    } catch (error) {
      console.error('Get recruiter interviews error:', error);
      res.status(500).json({ message: "Failed to fetch interviews", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Create a new interview for the logged-in recruiter
  app.post("/api/recruiter/interviews", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (employee.role !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter role required." });
      }

      const { candidateName, position, client, interviewDate, interviewTime, interviewType, interviewRound, status } = req.body;

      if (!candidateName || !position || !client || !interviewDate || !interviewTime || !interviewType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const interview = await storage.createInterview({
        candidateName,
        position,
        client,
        interviewDate,
        interviewTime,
        interviewType,
        interviewRound: interviewRound || 'L1',
        status: status || 'scheduled',
        recruiterName: employee.name,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({
        id: interview.id,
        candidateName: interview.candidateName,
        position: interview.position,
        client: interview.client,
        interviewDate: interview.interviewDate,
        interviewTime: interview.interviewTime,
        interviewType: interview.interviewType,
        interviewRound: interview.interviewRound,
        status: interview.status
      });
    } catch (error) {
      console.error('Create recruiter interview error:', error);
      res.status(500).json({ message: "Failed to create interview" });
    }
  });

  // Recruiter file upload endpoints
  // Recruiter data endpoints - same as team leader
  // Legacy endpoint - returns 0 defaults for backward compatibility
  app.get("/api/recruiter/target-metrics", (req, res) => {
    const targetMetrics = {
      id: "target-rec-001",
      currentQuarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`,
      minimumTarget: "0",
      targetAchieved: "0",
      incentiveEarned: "0"
    };
    res.json(targetMetrics);
  });

  // Get aggregated target data for recruiter/TA based on their individual target mappings
  app.get("/api/recruiter/aggregated-targets", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      if (!session?.employeeId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Fetch target summary for this recruiter (they are the teamMemberId)
      const targetSummary = await storage.getRecruiterTargetSummary(employee.id);
      res.json(targetSummary);
    } catch (error) {
      console.error('Get recruiter aggregated targets error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/recruiter/daily-metrics", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // CRITICAL: Verify we're using the correct employee ID
      console.log('[RECRUITER DAILY METRICS] Employee ID:', employee.id, 'Employee Name:', employee.name, 'Email:', employee.email);

      const dateParam = req.query.date as string | undefined;
      const requirementId = req.query.requirementId as string | undefined;
      const today = dateParam || new Date().toISOString().split('T')[0];

      // Import getResumeTarget for calculations
      const { getResumeTarget } = await import("@shared/constants");

      // Get requirements assigned to this recruiter directly from requirements table
      // Filter out reassigned requirements for counts
      // IMPORTANT: Use employee.id (database ID), not employee.employeeId
      let allRequirements = await storage.getRequirementsByTalentAdvisorId(employee.id);
      if (!allRequirements.length) {
        allRequirements = await storage.getRequirementsByTalentAdvisor(employee.name);
      }
      console.log('[RECRUITER DAILY METRICS] Found requirements for', employee.name, ':', allRequirements.length);

      // Get assignment status to filter out reassigned requirements
      const { requirementAssignments } = await import("@shared/schema");
      const requirementIds = allRequirements.map(r => r.id);
      let allAssignments: any[] = [];
      if (requirementIds.length > 0) {
        try {
          allAssignments = await db.select().from(requirementAssignments)
            .where(inArray(requirementAssignments.requirementId, requirementIds));
        } catch (assignmentError) {
          console.warn('[RECRUITER DAILY METRICS] requirement_assignments unavailable, continuing without assignment filters:', assignmentError);
        }
      }

      // Filter to only active assignments (exclude reassigned)
      const activeRequirementIds = new Set(
        allAssignments
          .filter(a => a.recruiterId === employee.id && a.status === "active")
          .map(a => a.requirementId)
      );

      // Also include requirements assigned via talentAdvisorId (even if no assignment record exists)
      allRequirements.forEach(req => {
        if (req.talentAdvisorId === employee.id) {
          activeRequirementIds.add(req.id);
        }
      });

      // Filter requirements - include if assigned via talentAdvisorId OR has active assignment
      // Exclude if reassigned to another recruiter
      let requirements = allRequirements.filter(req => {
        // If assigned via talentAdvisorId to this recruiter
        if (req.talentAdvisorId === employee.id) {
          // Check if it's been reassigned to another recruiter via assignment
          const hasActiveAssignmentForOtherRecruiter = allAssignments.some(a =>
            a.requirementId === req.id &&
            a.recruiterId !== employee.id &&
            a.status === "active"
          );
          // If not reassigned, include it
          return !hasActiveAssignmentForOtherRecruiter;
        }

        // If has active assignment for this recruiter, include it
        return activeRequirementIds.has(req.id);
      });

      // Filter by requirementId if provided
      if (requirementId && requirementId !== 'Overall') {
        requirements = requirements.filter(req => req.id === requirementId);
      }

      // Calculate total required resumes and track per-requirement delivery
      let totalResumesRequired = 0;
      let totalResumesDelivered = 0;
      let completedRequirements = 0;

      // Get requirements created on or before the selected date (for this recruiter)
      const filteredRequirements = requirements.filter(req => {
        const createdDate = new Date(req.createdAt).toISOString().split('T')[0];
        return createdDate <= today;
      });

      // Get all resume submissions by this recruiter for their requirements
      const { resumeSubmissions, jobApplications } = await import("@shared/schema");
      let allSubmissionsRaw: any[] = [];
      try {
        allSubmissionsRaw = await db.select().from(resumeSubmissions)
          .where(eq(resumeSubmissions.recruiterId, employee.id));
      } catch (submissionError) {
        console.warn('[RECRUITER DAILY METRICS] resume_submissions unavailable, continuing with tagged applications only:', submissionError);
      }

      // Get all resume submissions by this recruiter (up to selected date - cumulative)
      const allSubmissions = allSubmissionsRaw.filter(sub => {
        if (!sub.submittedAt) return false;
        const subDate = new Date(sub.submittedAt).toISOString().split('T')[0];
        return subDate <= today;
      });

      // Get all job applications tagged by this recruiter (up to selected date - cumulative)
      // These are candidates tagged to requirements (source: 'recruiter_tagged')
      let taggedApplicationsRaw: any[] = [];
      try {
        taggedApplicationsRaw = await db.select().from(jobApplications)
          .where(eq(jobApplications.source, 'recruiter_tagged'));
      } catch (applicationError) {
        console.warn('[RECRUITER DAILY METRICS] job_applications unavailable, continuing with resume submissions only:', applicationError);
      }

      // Filter applications up to the selected date (cumulative)
      const taggedApplications = taggedApplicationsRaw.filter(app => {
        if (!app.appliedDate) return false;
        const appDate = new Date(app.appliedDate).toISOString().split('T')[0];
        return appDate <= today;
      });

      // Get requirement IDs assigned to this recruiter (filtered by date)
      const recruiterRequirementIds = filteredRequirements.map(r => r.id);

      // Filter tagged applications to only those for this recruiter's requirements
      const recruiterTaggedApps = taggedApplications.filter(app =>
        app.requirementId && recruiterRequirementIds.includes(app.requirementId)
      );

      // Get delivered candidates for the specific date (for modal display)
      const deliveredCandidatesForDate: Array<{
        candidate: string;
        position: string;
        client: string;
        deliveredDate: string;
        status: string;
      }> = [];

      // Get submissions for the specific date
      const submissionsForDate = allSubmissionsRaw.filter(sub => {
        if (!sub.submittedAt) return false;
        const subDate = new Date(sub.submittedAt).toISOString().split('T')[0];
        return subDate === today;
      });

      // Get tagged applications for the specific date
      const taggedForDate = taggedApplicationsRaw.filter(app => {
        if (!app.appliedDate) return false;
        const appDate = new Date(app.appliedDate).toISOString().split('T')[0];
        return appDate === today && app.requirementId && recruiterRequirementIds.includes(app.requirementId);
      });

      // Also get all tagged applications (not just for today) for delivered candidates count
      // This includes candidates tagged to requirements at any time (cumulative)
      const allTaggedForRecruiter = taggedApplicationsRaw.filter(app =>
        app.requirementId && recruiterRequirementIds.includes(app.requirementId)
      );

      // Build delivered candidates list for the selected date
      for (const sub of submissionsForDate) {
        const req = filteredRequirements.find(r => r.id === sub.requirementId);
        if (req) {
          deliveredCandidatesForDate.push({
            candidate: sub.candidateName || 'Unknown',
            position: req.position,
            client: req.company,
            deliveredDate: new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            status: sub.status || 'Submitted'
          });
        }
      }

      for (const app of taggedForDate) {
        const req = filteredRequirements.find(r => r.id === app.requirementId);
        if (req) {
          deliveredCandidatesForDate.push({
            candidate: app.candidateName || 'Unknown',
            position: app.jobTitle,
            client: app.company,
            deliveredDate: new Date(app.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            status: app.status || 'Tagged'
          });
        }
      }

      // Build defaulted requirements list (requirements with pending profiles)
      const defaultedRequirements: Array<{
        requirement: string;
        client: string;
        pendingProfiles: string;
        target: number;
        delivered: number;
        status: string;
      }> = [];

      // Calculate metrics for requirements that existed on or before the selected date
      for (const req of filteredRequirements) {
        const target = getResumeTarget(req.criticality, req.toughness);
        totalResumesRequired += target;

        // Count resumes submitted for this requirement (cumulative up to selected date)
        const deliveredFromSubmissions = allSubmissions.filter(s => s.requirementId === req.id).length;

        // Count candidates tagged to this requirement (cumulative up to selected date)
        const deliveredFromTagged = recruiterTaggedApps.filter(app => app.requirementId === req.id).length;

        // Total delivered = resume submissions + tagged candidates (cumulative)
        const deliveredForReq = deliveredFromSubmissions + deliveredFromTagged;
        totalResumesDelivered += deliveredForReq;

        // Check if this requirement is fully delivered
        if (deliveredForReq >= target) {
          completedRequirements++;
        } else {
          // Add to defaulted requirements if not fully delivered
          const pending = target - deliveredForReq;
          defaultedRequirements.push({
            requirement: req.position,
            client: req.company,
            pendingProfiles: `${pending} pending`,
            target: target,
            delivered: deliveredForReq,
            status: `${deliveredForReq}/${target}`
          });
        }
      }

      // Update totalRequirements to use filtered requirements
      const totalRequirements = filteredRequirements.length;

      // Calculate daily delivery count (for the specific date, not cumulative)
      const dailyDeliveryCount = submissionsForDate.length + taggedForDate.length;

      // Calculate total delivered candidates count (cumulative - all tagged candidates to requirements)
      // This counts all candidates tagged to recruiter's requirements, not just today's
      const totalDeliveredCandidatesCount = allSubmissions.length + allTaggedForRecruiter.length;

      // Build requirements data for graph - group by criticality
      const requirementsByCriticality: Record<string, { delivered: number; required: number }> = {};
      for (const req of filteredRequirements) {
        const target = getResumeTarget(req.criticality, req.toughness);
        const deliveredFromSubmissions = allSubmissions.filter(s => s.requirementId === req.id).length;
        const deliveredFromTagged = recruiterTaggedApps.filter(app => app.requirementId === req.id).length;
        const deliveredForReq = deliveredFromSubmissions + deliveredFromTagged;

        if (!requirementsByCriticality[req.criticality]) {
          requirementsByCriticality[req.criticality] = { delivered: 0, required: 0 };
        }
        requirementsByCriticality[req.criticality].delivered += deliveredForReq;
        requirementsByCriticality[req.criticality].required += target;
      }

      // Convert to array format for graph
      const requirementsData = Object.entries(requirementsByCriticality).map(([criticality, data]) => ({
        criticality,
        delivered: data.delivered,
        required: data.required
      }));

      // Calculate average resumes per requirement
      const avgResumesPerRequirement = totalRequirements > 0
        ? Math.round(totalResumesDelivered / totalRequirements)
        : 0;

      const dailyMetrics = {
        id: `daily-rec-${employee.id}`,
        date: new Date(today).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        totalRequirements,
        completedRequirements,
        avgResumesPerRequirement, // Add calculated average
        totalResumes: totalResumesDelivered,
        totalResumesDelivered,
        totalResumesRequired,
        dailyDeliveryDelivered: totalDeliveredCandidatesCount, // Total delivered candidates (cumulative - all tagged to requirements)
        dailyDeliveryDeliveredToday: dailyDeliveryCount, // Count for the specific date only
        dailyDeliveryDefaulted: Math.max(0, totalResumesRequired - totalResumesDelivered), // Cumulative defaulted
        overallPerformance: (() => {
          if (totalResumesRequired === 0) return "G";
          const performanceRatio = totalResumesDelivered / totalResumesRequired;
          if (performanceRatio >= 1.0) return "G"; // Good: 100% or more
          if (performanceRatio >= 0.5) return "A"; // Average: 50-99%
          return "B"; // Bad: less than 50%
        })(),
        delivered: totalResumesDelivered,
        defaulted: Math.max(0, totalResumesRequired - totalResumesDelivered),
        required: totalResumesRequired,
        requirementCount: totalRequirements,
        deliveredCandidates: deliveredCandidatesForDate, // Add delivered candidates list for modal
        defaultedRequirements: defaultedRequirements, // Add defaulted requirements list for modal
        requirements: requirementsData // Add requirements data for graph
      };
      res.json(dailyMetrics);
    } catch (error) {
      console.error('Get recruiter daily metrics error:', error);
      res.status(500).json({ message: "Failed to fetch daily metrics" });
    }
  });

  // Calculate and store daily metrics snapshot for recruiter
  app.post("/api/recruiter/daily-metrics/calculate", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const { date } = req.body;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const metrics = await storage.calculateRecruiterDailyMetrics(employee.id, targetDate);

      // Check if snapshot exists and update, otherwise create
      const existingSnapshot = await storage.getDailyMetricsSnapshot(targetDate, 'recruiter', employee.id);

      let snapshot;
      if (existingSnapshot) {
        snapshot = await storage.updateDailyMetricsSnapshot(existingSnapshot.id, {
          delivered: metrics.delivered,
          defaulted: metrics.defaulted,
          requirementCount: metrics.requirementCount
        });
      } else {
        snapshot = await storage.createDailyMetricsSnapshot({
          date: targetDate,
          scopeType: 'recruiter',
          scopeId: employee.id,
          scopeName: employee.name,
          delivered: metrics.delivered,
          defaulted: metrics.defaulted,
          requirementCount: metrics.requirementCount
        });
      }

      res.json({ ...metrics, snapshot });
    } catch (error) {
      console.error('Calculate recruiter daily metrics error:', error);
      res.status(500).json({ message: "Failed to calculate daily metrics" });
    }
  });

  // Get daily metrics history for recruiter (for charts)
  app.get("/api/recruiter/daily-metrics/history", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const { startDate, endDate } = req.query;
      const today = new Date().toISOString().split('T')[0];
      const start = (startDate as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = (endDate as string) || today;

      const snapshots = await storage.getDailyMetricsSnapshotsByDateRange(start, end, 'recruiter', employee.id);
      res.json(snapshots);
    } catch (error) {
      console.error('Get recruiter daily metrics history error:', error);
      res.status(500).json({ message: "Failed to fetch daily metrics history" });
    }
  });

  // Get delivered candidates for a specific date
  app.get("/api/recruiter/delivered-candidates", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // CRITICAL: Verify we're using the correct employee ID
      console.log('[RECRUITER DELIVERED CANDIDATES] Employee ID:', employee.id, 'Employee Name:', employee.name, 'Email:', employee.email);

      const dateParam = req.query.date as string | undefined;
      const requirementId = req.query.requirementId as string | undefined;
      const today = dateParam || new Date().toISOString().split('T')[0];

      const { resumeSubmissions, jobApplications, requirements } = await import("@shared/schema");

      // Get recruiter's requirements first (CRITICAL for data isolation)
      const recruiterRequirements = await storage.getRequirementsByTalentAdvisorId(employee.id);
      const recruiterRequirementIds = recruiterRequirements.map(r => r.id);
      console.log('[RECRUITER DELIVERED CANDIDATES] Found requirements for', employee.name, ':', recruiterRequirementIds.length);

      // Get resume submissions for this date (filtered by recruiter ID)
      const submissionsRaw = await db.select().from(resumeSubmissions)
        .where(eq(resumeSubmissions.recruiterId, employee.id));

      const submissions = submissionsRaw.filter(sub => {
        if (!sub.submittedAt) return false;
        const subDate = new Date(sub.submittedAt).toISOString().split('T')[0];
        return subDate === today;
      });

      // Get tagged applications for this date (CRITICAL: filter by recruiter's requirements only)
      const taggedAppsRaw = await db.select().from(jobApplications)
        .where(eq(jobApplications.source, 'recruiter_tagged'));

      const recruiterTaggedApps = taggedAppsRaw.filter(app => {
        if (!app.appliedDate) return false;
        const appDate = new Date(app.appliedDate).toISOString().split('T')[0];
        // CRITICAL: Only include if it's for this recruiter's requirements
        return appDate === today && app.requirementId && recruiterRequirementIds.includes(app.requirementId);
      });

      // Get all requirements for company/position lookup
      const allRequirements = await db.select().from(requirements);

      // Combine and format delivered candidates
      const deliveredCandidates = [];

      // Add resume submissions
      for (const sub of submissions) {
        const requirement = allRequirements.find(r => r.id === sub.requirementId);
        deliveredCandidates.push({
          id: sub.id,
          candidate: sub.candidateName || 'N/A',
          position: requirement?.position || 'N/A',
          client: requirement?.company || 'N/A',
          deliveredDate: new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
          status: sub.status || 'Delivered',
          type: 'Resume Submission'
        });
      }

      // Add tagged candidates
      for (const app of recruiterTaggedApps) {
        const requirement = allRequirements.find(r => r.id === app.requirementId);
        deliveredCandidates.push({
          id: app.id,
          candidate: app.candidateName || 'N/A',
          position: app.jobTitle || requirement?.position || 'N/A',
          client: app.company || requirement?.company || 'N/A',
          deliveredDate: new Date(app.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
          status: app.status || 'Tagged',
          type: 'Tagged Candidate'
        });
      }

      res.json(deliveredCandidates);
    } catch (error) {
      console.error('Get delivered candidates error:', error);
      res.status(500).json({ message: "Failed to fetch delivered candidates" });
    }
  });

  // Team Lead daily metrics - aggregated team view
  app.get("/api/team-leader/daily-metrics", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const dateParam = req.query.date as string | undefined;
      const today = dateParam || new Date().toISOString().split('T')[0];

      const metrics = await storage.calculateTeamDailyMetrics(employee.id, today);

      res.json({
        id: `daily-team-${employee.id}`,
        date: new Date(today).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        delivered: metrics.delivered,
        defaulted: metrics.defaulted,
        required: metrics.required,
        requirementCount: metrics.requirementCount,
        performanceRatio: metrics.required > 0 ? (metrics.delivered / metrics.required * 100).toFixed(1) : '100',
        overallPerformance: (() => {
          if (metrics.required === 0) return "G";
          const performanceRatio = metrics.delivered / metrics.required;
          if (performanceRatio >= 1.0) return "G"; // Good: 100% or more
          if (performanceRatio >= 0.5) return "A"; // Average: 50-99%
          return "B"; // Bad: less than 50%
        })()
      });
    } catch (error) {
      console.error('Get team leader daily metrics error:', error);
      res.status(500).json({ message: "Failed to fetch team daily metrics" });
    }
  });

  // Team Lead daily metrics history (for charts)
  app.get("/api/team-leader/daily-metrics/history", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const { startDate, endDate } = req.query;
      const today = new Date().toISOString().split('T')[0];
      const start = (startDate as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = (endDate as string) || today;

      const snapshots = await storage.getDailyMetricsSnapshotsByDateRange(start, end, 'team', employee.id);
      res.json(snapshots);
    } catch (error) {
      console.error('Get team leader daily metrics history error:', error);
      res.status(500).json({ message: "Failed to fetch team daily metrics history" });
    }
  });

  // Admin org-wide daily metrics (new algorithm-based)
  app.get("/api/admin/daily-metrics/new", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || (employee.role !== 'admin' && employee.role !== 'manager')) {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const dateParam = req.query.date as string | undefined;
      const today = dateParam || new Date().toISOString().split('T')[0];

      const metrics = await storage.calculateOrgDailyMetrics(today);

      res.json({
        id: `daily-org-${today}`,
        date: new Date(today).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        delivered: metrics.delivered,
        defaulted: metrics.defaulted,
        required: metrics.required,
        requirementCount: metrics.requirementCount,
        performanceRatio: metrics.required > 0 ? (metrics.delivered / metrics.required * 100).toFixed(1) : '100',
        overallPerformance: (() => {
          if (metrics.required === 0) return "G";
          const performanceRatio = metrics.delivered / metrics.required;
          if (performanceRatio >= 1.0) return "G"; // Good: 100% or more
          if (performanceRatio >= 0.5) return "A"; // Average: 50-99%
          return "B"; // Bad: less than 50%
        })()
      });
    } catch (error) {
      console.error('Get admin daily metrics error:', error);
      res.status(500).json({ message: "Failed to fetch org daily metrics" });
    }
  });

  // Admin daily metrics history (for charts)
  app.get("/api/admin/daily-metrics/history", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || (employee.role !== 'admin' && employee.role !== 'manager')) {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const { startDate, endDate } = req.query;
      const today = new Date().toISOString().split('T')[0];
      const start = (startDate as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = (endDate as string) || today;

      const snapshots = await storage.getDailyMetricsSnapshotsByDateRange(start, end, 'organization');
      res.json(snapshots);
    } catch (error) {
      console.error('Get admin daily metrics history error:', error);
      res.status(500).json({ message: "Failed to fetch org daily metrics history" });
    }
  });

  app.get("/api/recruiter/meetings", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Fetch meetings assigned to this recruiter by personId first, fallback to name
      const allMeetings = await db.select().from(meetings).orderBy(desc(meetings.createdAt));

      // Filter meetings by personId (primary) or person name (fallback)
      const recruiterMeetings = allMeetings.filter(m =>
        m.personId === employee.id || m.person === employee.name
      );

      res.json(recruiterMeetings);
    } catch (error) {
      console.error('Get recruiter meetings error:', error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get("/api/recruiter/ceo-comments", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Fetch commands assigned to this recruiter
      const commands = await db.select().from(recruiterCommands)
        .where(eq(recruiterCommands.recruiterId, employee.id))
        .orderBy(desc(recruiterCommands.createdAt));

      res.json(commands);
    } catch (error) {
      console.error('Get recruiter commands error:', error);
      res.status(500).json({ message: "Failed to fetch commands" });
    }
  });

  // Get requirements assigned to the logged-in recruiter (Talent Advisor)
  app.get("/api/recruiter/requirements", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const role = (employee.role || '').toLowerCase();
      if (role === 'team_leader' || role === 'tl') {
        const allEmployees = await storage.getAllEmployees();
        const teamRecruiters = allEmployees.filter(
          emp => (emp.role === 'recruiter' || emp.role === 'talent_advisor' || emp.role === 'ta') && 
                 (emp.reportingTo === employee.employeeId || emp.reportingTo === employee.id)
        );

        const allRequirements: any[] = [];
        const addedIds = new Set<string>();

        // Optimization: Use Promise.all if the number of recruiters is small, or just batch
        const recruiterReqsResults = await Promise.all(
          teamRecruiters.map(async (recruiter) => {
            const byId = await storage.getRequirementsByTalentAdvisorId(recruiter.id);
            if (byId.length > 0) return byId;
            return storage.getRequirementsByTalentAdvisor(recruiter.name);
          })
        );

        for (const recruiterRequirements of recruiterReqsResults) {
          for (const req of recruiterRequirements) {
            if (!addedIds.has(req.id)) {
              allRequirements.push(req);
              addedIds.add(req.id);
            }
          }
        }

        const allReqs = await storage.getRequirements();
        const unassignedTLRequirements = allReqs.filter(req =>
          req.teamLead === employee.name &&
          !req.talentAdvisorId &&
          !req.isArchived
        );

        for (const req of unassignedTLRequirements) {
          if (!addedIds.has(req.id)) {
            allRequirements.push(req);
            addedIds.add(req.id);
          }
        }

        const { requirementAssignments } = await import("@shared/schema");
        const requirementIds = allRequirements.map(r => r.id);
        let allAssignments: any[] = [];
        if (requirementIds.length > 0) {
          try {
            allAssignments = await db.select().from(requirementAssignments)
              .where(inArray(requirementAssignments.requirementId, requirementIds));
          } catch (assignmentError) {
            console.warn('[RECRUITER REQUIREMENTS] requirement_assignments unavailable, continuing without assignment status:', assignmentError);
          }
        }

        const requirementsWithStatus = allRequirements.map(req => {
          const assignment = allAssignments.find(a => a.requirementId === req.id);
          const hasActiveAssignmentForOtherTL = allAssignments.some(a =>
            a.requirementId === req.id &&
            a.teamLeadId &&
            a.teamLeadId !== employee.id &&
            a.status === "active"
          );

          const isReassigned = assignment?.status === "reassigned" ||
            (assignment && hasActiveAssignmentForOtherTL);

          return {
            ...req,
            assignmentStatus: isReassigned ? "reassigned" : (assignment?.status || "active")
          };
        });

        const recentClosedArchivedRequirements = (await storage.getArchivedRequirements())
          .filter((req: any) => {
            if (req.managementStatus !== "closed" || !req.managedAt) return false;
            const closedAt = new Date(req.managedAt).getTime();
            if (Number.isNaN(closedAt) || Date.now() - closedAt > 24 * 60 * 60 * 1000) return false;
            return req.teamLead === employee.name || teamRecruiters.some(rec => rec.name === req.talentAdvisor);
          })
          .map((req: any) => ({
            ...req,
            id: `recent-closed-${req.id}`,
            isRecentlyClosed: true,
            assignmentStatus: "archived",
          }));

        return res.json([...recentClosedArchivedRequirements, ...requirementsWithStatus]);
      }

      const isTA = role === 'recruiter' || role === 'talent_advisor' || role === 'ta';
      if (!isTA) {
        return res.status(403).json({ message: "Access denied. Recruiter or Talent Advisor role required." });
      }

      // CRITICAL: Verify we're using the correct employee ID
      console.log('[RECRUITER REQUIREMENTS] Employee ID:', employee.id, 'Employee Name:', employee.name, 'Email:', employee.email);

      // Fetch requirements assigned to this recruiter/talent advisor (using ID-based lookup)
      // IMPORTANT: Use employee.id (database ID), not employee.employeeId
      let recruiterRequirements = await storage.getRequirementsByTalentAdvisorId(employee.id);
      if (!recruiterRequirements.length) {
        recruiterRequirements = await storage.getRequirementsByTalentAdvisor(employee.name);
      }
      console.log('[RECRUITER REQUIREMENTS] Found requirements for', employee.name, ':', recruiterRequirements.length);

      // Get assignment status for each requirement
      const { requirementAssignments } = await import("@shared/schema");
      const requirementIds = recruiterRequirements.map(r => r.id);
      let allAssignments: any[] = [];
      if (requirementIds.length > 0) {
        try {
          allAssignments = await db.select().from(requirementAssignments)
            .where(inArray(requirementAssignments.requirementId, requirementIds));
        } catch (assignmentError) {
          console.warn('[RECRUITER REQUIREMENTS] requirement_assignments unavailable, continuing without assignment status:', assignmentError);
        }
      }

      // Filter out reassigned requirements - only show active assignments
      // First, get requirements that are actively assigned to this recruiter
      const activeRequirementIds = new Set(
        allAssignments
          .filter(a => a.recruiterId === employee.id && a.status === "active")
          .map(a => a.requirementId)
      );

      // Also include requirements assigned via talentAdvisorId (even if no assignment record exists)
      recruiterRequirements.forEach(req => {
        if (req.talentAdvisorId === employee.id) {
          activeRequirementIds.add(req.id);
        }
      });

      // Filter to only active requirements (exclude reassigned)
      const activeRequirements = recruiterRequirements.filter(req => {
        // If requirement is assigned via talentAdvisorId to this recruiter, include it
        if (req.talentAdvisorId === employee.id) {
          // But check if it's been reassigned to another recruiter via assignment
          const hasActiveAssignmentForOtherRecruiter = allAssignments.some(a =>
            a.requirementId === req.id &&
            a.recruiterId !== employee.id &&
            a.status === "active"
          );
          // If reassigned, exclude it
          return !hasActiveAssignmentForOtherRecruiter;
        }

        // If requirement has an active assignment for this recruiter, include it
        return activeRequirementIds.has(req.id);
      });


      // Also get job applications for each requirement to calculate delivery counts
      const requirementsWithCounts = await Promise.all(
        activeRequirements.map(async (req) => {
          const applications = await storage.getJobApplicationsByRequirementId(req.id);

          // Find assignment status for this requirement and recruiter
          const assignment = allAssignments.find(a =>
            a.requirementId === req.id && a.recruiterId === employee.id
          );

          const isReassigned = assignment?.status === "reassigned";

          return {
            ...req,
            deliveredCount: applications.length,
            assignmentStatus: isReassigned ? "reassigned" : (assignment?.status || "active")
          };
        })
      );

      const recentClosedArchivedRequirements = (await storage.getArchivedRequirements())
        .filter((req: any) => {
          if (req.managementStatus !== "closed" || !req.managedAt) return false;
          const closedAt = new Date(req.managedAt).getTime();
          if (Number.isNaN(closedAt) || Date.now() - closedAt > 24 * 60 * 60 * 1000) return false;
          return req.talentAdvisor === employee.name;
        })
        .map((req: any) => ({
          ...req,
          id: `recent-closed-${req.id}`,
          isRecentlyClosed: true,
          deliveredCount: 0,
          assignmentStatus: "archived",
        }));

      res.json([...recentClosedArchivedRequirements, ...requirementsWithCounts]);
    } catch (error) {
      console.error('Get recruiter requirements error:', error);
      res.status(500).json({ message: "Failed to fetch requirements" });
    }
  });

  // Get closure reports (revenue mappings) for the logged-in recruiter
  app.get("/api/recruiter/closure-reports", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Fetch revenue mappings where this recruiter is the talent advisor (use employee.id which is the UUID)
      const revenueMappings = await storage.getRevenueMappingsByTalentAdvisorId(employee.id);

      // Transform to closure report format for frontend with full data
      const closureReports = revenueMappings.map((mapping) => ({
        id: mapping.id,
        candidate: mapping.candidateName || 'N/A',
        position: mapping.position || 'N/A',
        client: mapping.clientName || 'N/A',
        offeredOn: mapping.offeredDate || 'N/A',
        joinedOn: mapping.closureDate || 'N/A',
        quarter: mapping.quarter || 'N/A',
        closureValue: mapping.revenue ? mapping.revenue.toLocaleString('en-IN') : '0',
        incentive: mapping.incentive ? mapping.incentive.toLocaleString('en-IN') : '0',
        revenue: mapping.revenue ? mapping.revenue.toLocaleString('en-IN') : '0'
      }));

      res.json(closureReports);
    } catch (error) {
      console.error('Get recruiter closure reports error:', error);
      res.status(500).json({ message: "Failed to fetch closure reports" });
    }
  });

  // Get recruiter quarterly performance data (resumes delivered and closures per quarter)
  app.get("/api/recruiter/quarterly-performance", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const quarterlyData = await storage.getRecruiterQuarterlyPerformance(employee.id);
      res.json(quarterlyData);
    } catch (error) {
      console.error('Get recruiter quarterly performance error:', error);
      res.status(500).json({ message: "Failed to fetch quarterly performance data" });
    }
  });

  // Get recruiter performance summary (tenure, total closures, recent closure, etc.)
  app.get("/api/recruiter/performance-summary", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const summary = await storage.getRecruiterPerformanceSummary(employee.id);
      res.json(summary);
    } catch (error) {
      console.error('Get recruiter performance summary error:', error);
      res.status(500).json({ message: "Failed to fetch performance summary" });
    }
  });

  app.post("/api/recruiter/upload/banner", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Recruiter parse resume file (extract details)
  app.post("/api/recruiter/parse-resume", requireEmployeeAuth, (req, res, next) => {
    // Handle multer errors
    resumeUpload.single('resume')(req, res, (err: any) => {
      if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File size exceeds 10MB limit" });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: "Unexpected file field. Please use 'resume' as the field name." });
        }
        return res.status(400).json({ message: "File upload error: " + (err.message || 'Unknown error') });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No resume file uploaded" });
      }

      // Validate file type
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type. Please upload a PDF, DOC, DOCX, or image file." });
      }

      const parsed = await parseResumeFile(req.file.path, req.file.mimetype);

      // Clean up uploaded file after parsing
      try {
        if (fs.existsSync(req.file.path)) {
          // Keep file for now, will be used when creating candidate
          // fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }

      res.json({
        success: true,
        data: {
          fullName: parsed.fullName,
          email: parsed.email,
          phone: parsed.phone,
          designation: parsed.designation,
          experience: parsed.experience,
          skills: parsed.skills,
          location: parsed.location,
          company: parsed.company,
          education: parsed.education,
          highestQualification: parsed.highestQualification,
          collegeName: parsed.collegeName,
          linkedinUrl: parsed.linkedinUrl,
          portfolioUrl: parsed.portfolioUrl,
          websiteUrl: parsed.websiteUrl,
          currentRole: parsed.currentRole
        }
      });
    } catch (error: any) {
      console.error('[CRITICAL] Parse resume error:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Clean up file on error
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
      
      res.status(500).json({
        message: `Failed to parse resume: ${errorMessage}`,
        error: errorMessage,
        success: false
      });
    }
  });

  // Diagnostic route to check OpenAI configuration
  app.get("/api/admin/check-openai", requireEmployeeAuth, async (req, res) => {
    console.log("[DIAGNOSTIC] Checking OpenAI configuration...");
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.json({ 
        status: "error", 
        message: "OPENAI_API_KEY is not set in environment variables." 
      });
    }

    try {
      const { parseResumeWithAI } = await import('./ai-resume-parser');
      const testResult = await parseResumeWithAI("This is a test resume for API verification.");
      
      if (testResult === null) {
        return res.json({ 
          status: "error", 
          message: "OpenAI call returned null. Check your API key and quota." 
        });
      }

      res.json({ 
        status: "ok", 
        message: "OpenAI is configured and responding correctly.",
        model: process.env.OPENAI_MODEL || "gpt-4o-mini"
      });
    } catch (error: any) {
      console.error("[DIAGNOSTIC] OpenAI check failed:", error);
      res.json({ 
        status: "error", 
        message: `OpenAI check failed: ${error.message || String(error)}` 
      });
    }
  });

  // Recruiter upload resume file
  app.post("/api/recruiter/upload/resume", requireEmployeeAuth, resumeUpload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const filePath = `${baseUrl}/uploads/resumes/${req.file.filename}`;

      res.json({
        success: true,
        filePath: filePath,
        url: filePath,
        filename: req.file.filename
      });
    } catch (error: any) {
      console.error('Resume upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error.message || 'Unknown error' });
    }
  });

  app.post("/api/recruiter/upload/profile", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Requirements API endpoints
  // Get client-submitted JDs (requirements with STR... Role ID format)
  app.get("/api/admin/client-jds", requireAdminAuth, async (req, res) => {
    try {
      const allRequirements = await storage.getRequirements();
      console.log(`Total requirements found: ${allRequirements.length}`);
      // Filter requirements that have Role ID format (STR + year + number)
      const clientJDs = allRequirements.filter((req: any) => {
        const matches = req.id && /^STR\d{5}$/.test(req.id);
        if (matches) {
          console.log(`Found client JD: ${req.id} - ${req.position} - ${req.company}`);
        }
        return matches;
      });
      console.log(`Client JDs found: ${clientJDs.length}`);

      // Transform to JD table format
      const jdData = await Promise.all(clientJDs.map(async (req: any) => {
        // Find SPOC employee for this requirement
        const spocName = req.spoc || 'N/A';

        // Get client code from company name
        const allClients = await storage.getAllClients();
        const clientRecord = allClients.find((c: any) =>
          c.brandName === req.company && !c.isLoginOnly
        );
        const clientId = clientRecord?.clientCode || req.company;

        return {
          id: req.id, // Role ID (STR format)
          clientId: clientId, // Client code (e.g., STCL001)
          company: clientRecord?.brandName || req.company || 'N/A', // Company name (brandName)
          spocName: spocName,
          role: req.position,
          sharedDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-') : 'N/A',
          requirement: {
            ...req,
            jdFile: req.jdFile || null,
            jdText: req.jdText || null
          } // Full requirement object for JD preview with JD details
        };
      }));

      res.json(jdData);
    } catch (error) {
      console.error('Get client JDs error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/requirements", requireAdminAuth, async (req, res) => {
    try {
      const allRequirements = await storage.getRequirements();
      // Exclude client-submitted JDs (those with STR format Role IDs)
      // Client JDs should only appear in the "JD from Client" table
      const adminRequirements = allRequirements.filter((req: any) => {
        return !req.id || !/^STR\d{5}$/.test(req.id);
      });
      const enriched = await enrichRequirementsWithResumeCount(adminRequirements);
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/requirements", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertRequirementSchema.parse(req.body);
      const requirement = await storage.createRequirement(validatedData);

      logRequirementAdded(
        storage,
        'admin',
        'Admin',
        'admin',
        requirement.position,
        requirement.company,
        requirement.id
      );

      // Recalculate and update daily metrics snapshot for today
      try {
        const today = new Date().toISOString().split('T')[0];
        const metrics = await storage.calculateOrgDailyMetrics(today);

        // Get or create snapshot for today
        const existingSnapshot = await storage.getDailyMetricsSnapshot(today, 'organization');

        if (existingSnapshot) {
          // Update existing snapshot
          await storage.updateDailyMetricsSnapshot(existingSnapshot.id, {
            delivered: metrics.delivered,
            defaulted: metrics.defaulted,
            requirementCount: metrics.requirementCount,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Create new snapshot
          await storage.createDailyMetricsSnapshot({
            date: today,
            scopeType: 'organization',
            scopeId: null,
            scopeName: 'Organization',
            delivered: metrics.delivered,
            defaulted: metrics.defaulted,
            requirementCount: metrics.requirementCount,
            createdAt: new Date().toISOString()
          });
        }
      } catch (metricsError) {
        // Log error but don't fail the requirement creation
        console.error('Error updating daily metrics after requirement creation:', metricsError);
      }

      res.status(201).json(requirement);
    } catch (error) {
      res.status(400).json({ message: "Invalid requirement data" });
    }
  });

  app.patch("/api/admin/requirements/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      // If teamLead is being updated, handle reassignment tracking
      if (updates.teamLead) {
        const { requirementAssignments } = await import("@shared/schema");
        const requirement = (await storage.getRequirements()).find((req: any) => req.id === id);
        if (!requirement) {
          return res.status(404).json({ message: "Requirement not found" });
        }

        const existingAssignments = await db.select().from(requirementAssignments)
          .where(and(
            eq(requirementAssignments.requirementId, id),
            eq(requirementAssignments.status, "active")
          ));

        // Get the new TL employee
        const allEmployees = await storage.getAllEmployees();
        const newTL = allEmployees.find(emp =>
          emp.role === 'team_leader' && (emp.name === updates.teamLead || emp.id === updates.teamLead)
        );
        if (!newTL) {
          return res.status(400).json({ message: "Selected employee is not a valid team leader" });
        }

        updates.teamLead = newTL.name;

        // Mark existing assignments as reassigned if TL changed
        if (existingAssignments.length > 0) {
          const oldTL = allEmployees.find(emp =>
            emp.role === 'team_leader' && emp.name === requirement.teamLead
          );

          // If TL changed, mark all active assignments for this requirement as reassigned
          if (oldTL && oldTL.id !== newTL.id) {
            for (const assignment of existingAssignments) {
              await storage.updateRequirementAssignment(assignment.id, {
                status: "reassigned"
              });
            }
          }
        }
      }

      const updatedRequirement = await storage.updateRequirement(id, updates);
      if (!updatedRequirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      res.json(updatedRequirement);
    } catch (error) {
      console.error('Update requirement error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Share JD file to existing requirement
  app.post("/api/admin/requirements/:id/share-jd", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { jdFile } = req.body;

      if (!jdFile) {
        return res.status(400).json({ message: "JD file is required" });
      }

      // Get the requirement
      const requirements = await storage.getRequirements();
      const requirement = requirements.find(r => r.id === id);

      if (!requirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      // Update the requirement with JD file
      const updated = await storage.updateRequirement(id, { jdFile });
      if (!updated) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      // Get admin employee for notification
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      const actorName = employee?.name || 'Admin';

      // Create notification for JD sharing (using existing logRequirementAdded for consistency)
      await logRequirementAdded(
        storage,
        session.employeeId || 'admin',
        actorName,
        'admin',
        requirement.position,
        requirement.company,
        id
      );

      res.json(updated);
    } catch (error) {
      console.error('Share JD error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/requirements/:id/archive", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const archivedRequirement = await storage.archiveRequirement(id, req.body || {});
      if (!archivedRequirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      res.json(archivedRequirement);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/requirements/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRequirement(id);
      if (!deleted) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      res.json({ success: true, message: "Requirement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/archived-requirements", requireAdminAuth, async (req, res) => {
    try {
      const archivedRequirements = await storage.getArchivedRequirements();
      res.json(archivedRequirements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/team-leader/archived-requirements", requireEmployeeAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(401).json({ message: "Employee not found" });
      }

      if (employee.role !== "team_leader" && employee.role !== "teamLead") {
        return res.status(403).json({ message: "Access denied. Team Leader role required." });
      }

      const archivedRequirements = await storage.getArchivedRequirements();
      const teamLeaderArchivedRequirements = archivedRequirements.filter((requirement: any) =>
        requirement.teamLead === employee.name
      );

      res.json(teamLeaderArchivedRequirements);
    } catch (error) {
      console.error("Get team leader archived requirements error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/recruiter/archived-requirements", requireEmployeeAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(401).json({ message: "Employee not found" });
      }

      if (!["recruiter", "talent_advisor"].includes(employee.role)) {
        return res.status(403).json({ message: "Access denied. Recruiter role required." });
      }

      const archivedRequirements = await storage.getArchivedRequirements();
      const recruiterArchivedRequirements = archivedRequirements.filter((requirement: any) =>
        requirement.talentAdvisor === employee.name
      );

      res.json(recruiterArchivedRequirements);
    } catch (error) {
      console.error("Get recruiter archived requirements error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Meetings API endpoints
  app.get("/api/admin/meetings", requireAdminAuth, async (req, res) => {
    try {
      const { category } = req.query;
      const allMeetings = await db.select().from(meetings).orderBy(meetings.createdAt);

      if (category && (category === 'tl' || category === 'ceo_ta')) {
        const filteredMeetings = allMeetings.filter(m => m.meetingCategory === category);
        return res.json(filteredMeetings);
      }

      res.json(allMeetings);
    } catch (error) {
      console.error('Get meetings error:', error);
      res.status(500).json({ message: "Failed to get meetings" });
    }
  });

  app.post("/api/admin/meetings", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertMeetingSchema.parse(req.body);

      const [meeting] = await db.insert(meetings).values([{
        ...validatedData,
        createdAt: new Date().toISOString(),
      }]).returning();
      res.status(201).json(meeting);
    } catch (error: any) {
      console.error('Create meeting error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.patch("/api/admin/meetings/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertMeetingSchema.partial().parse(req.body);

      const [updatedMeeting] = await db.update(meetings)
        .set(updateData)
        .where(eq(meetings.id, id))
        .returning();

      if (!updatedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json(updatedMeeting);
    } catch (error: any) {
      console.error('Update meeting error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete("/api/admin/meetings/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const [deletedMeeting] = await db.delete(meetings)
        .where(eq(meetings.id, id))
        .returning();

      if (!deletedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
      console.error('Delete meeting error:', error);
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Recruiter Commands API endpoints for Admin
  app.get("/api/admin/recruiter-commands", requireAdminAuth, async (req, res) => {
    try {
      const allCommands = await db.select().from(recruiterCommands).orderBy(desc(recruiterCommands.createdAt));
      res.json(allCommands);
    } catch (error) {
      console.error('Get recruiter commands error:', error);
      res.status(500).json({ message: "Failed to get recruiter commands" });
    }
  });

  app.post("/api/admin/recruiter-commands", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertRecruiterCommandSchema.parse(req.body);

      const [command] = await db.insert(recruiterCommands).values({
        ...validatedData,
        createdAt: new Date().toISOString(),
      }).returning();
      res.status(201).json(command);
    } catch (error: any) {
      console.error('Create recruiter command error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid command data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recruiter command" });
    }
  });

  app.patch("/api/admin/recruiter-commands/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertRecruiterCommandSchema.partial().parse(req.body);

      const [updatedCommand] = await db.update(recruiterCommands)
        .set(updateData)
        .where(eq(recruiterCommands.id, id))
        .returning();

      if (!updatedCommand) {
        return res.status(404).json({ message: "Recruiter command not found" });
      }

      res.json(updatedCommand);
    } catch (error: any) {
      console.error('Update recruiter command error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid command data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recruiter command" });
    }
  });

  app.delete("/api/admin/recruiter-commands/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const [deletedCommand] = await db.delete(recruiterCommands)
        .where(eq(recruiterCommands.id, id))
        .returning();

      if (!deletedCommand) {
        return res.status(404).json({ message: "Recruiter command not found" });
      }

      res.json({ message: "Recruiter command deleted successfully" });
    } catch (error) {
      console.error('Delete recruiter command error:', error);
      res.status(500).json({ message: "Failed to delete recruiter command" });
    }
  });

  // Get all recruiters for admin selection (when assigning commands/meetings)
  app.get("/api/admin/recruiters", requireAdminAuth, async (req, res) => {
    try {
      // Use raw SQL to exclude last_login_at column (which may not exist in production)
      const result = await db.execute(sql`
        3SELECT id, employee_id, name, email, password, role, address, designation, phone, 
               department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
               father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
               increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
               current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
               branch, city, reporting_to, is_active, created_at, profile_picture
        FROM employees 
        WHERE role = 'recruiter'
        ORDER BY name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Get recruiters error:', error);
      res.status(500).json({ message: "Failed to get recruiters" });
    }
  });

  // Daily Metrics API endpoint with date filtering
  app.get("/api/admin/daily-metrics", requireAdminAuth, async (req, res) => {
    try {
      // Get date query parameter (format: yyyy-MM-dd)
      const selectedDate = req.query.date as string || new Date().toISOString().split('T')[0];
      const team = req.query.team as string || 'overall';

      // Import getResumeTarget for calculations
      const { getResumeTarget } = await import("@shared/constants");

      // Import schema tables
      const { requirements, resumeSubmissions, jobApplications } = await import("@shared/schema");

      // Get all active (non-archived) requirements created on or before the selected date
      const allRequirements = await db.select().from(requirements)
        .where(eq(requirements.isArchived, false));

      // Use raw SQL to exclude last_login_at column (which may not exist in production)
      const employeesResult = await db.execute(sql`
        SELECT id, employee_id, name, email, password, role, address, designation, phone, 
               department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
               father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
               increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
               current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
               branch, city, reporting_to, is_active, created_at, profile_picture
        FROM employees
      `);
      const allEmployees = employeesResult.rows as any[];

      const { requirementAssignments } = await import("@shared/schema");
      const allAssignments = await db.select().from(requirementAssignments);

      let filteredRequirements = allRequirements.filter(req => {
        const createdDate = new Date(req.createdAt).toISOString().split('T')[0];
        return createdDate <= selectedDate;
      });

      let selectedTeamLead: any = null;
      let teamRecruiters: any[] = [];
      if (team && team !== 'overall') {
        selectedTeamLead = allEmployees.find((emp: any) =>
          emp.role === 'team_leader' && (emp.id === team || emp.employee_id === team)
        );

        if (!selectedTeamLead) {
          return res.json({
            totalRequirements: 0,
            avgResumesPerRequirement: "0.00",
            requirementsPerRecruiter: "0.00",
            completedRequirements: 0,
            totalResumes: 0,
            totalResumesDelivered: 0,
            totalResumesRequired: 0,
            dailyDeliveryDelivered: 0,
            dailyDeliveryDefaulted: 0,
            overallPerformance: "G",
            date: selectedDate
          });
        }

        teamRecruiters = allEmployees.filter((emp: any) =>
          emp.role === 'recruiter' &&
          (emp.reporting_to === selectedTeamLead.employee_id ||
            emp.reporting_to === selectedTeamLead.id ||
            emp.reporting_to === selectedTeamLead.name)
        );

        const teamRecruiterIds = new Set(teamRecruiters.map((rec: any) => rec.id));
        const assignedRequirementIds = new Set(
          allAssignments
            .filter((assignment: any) => assignment.status === 'active' && teamRecruiterIds.has(assignment.recruiterId))
            .map((assignment: any) => assignment.requirementId)
        );

        filteredRequirements = filteredRequirements.filter((req: any) =>
          req.teamLeadId === selectedTeamLead.id ||
          req.teamLead === selectedTeamLead.name ||
          (req.talentAdvisorId && teamRecruiterIds.has(req.talentAdvisorId)) ||
          assignedRequirementIds.has(req.id)
        );
      }

      const totalRequirements = filteredRequirements.length;

      // Get all resume submissions up to the selected date
      const allSubmissions = await db.select().from(resumeSubmissions);

      // Filter submissions by date
      const filteredSubmissions = allSubmissions.filter(sub => {
        const submittedDate = new Date(sub.submittedAt).toISOString().split('T')[0];
        return submittedDate <= selectedDate;
      });

      // Also count recruiter-tagged applications for delivered/pipeline metrics
      const allTaggedApplications = (await storage.getAllJobApplications())
        .filter((app: any) => app.source === 'recruiter_tagged');

      const filteredRequirementIds = new Set(filteredRequirements.map((req: any) => req.id));
      const filteredTaggedApplications = allTaggedApplications.filter(app => {
        if (!app.appliedDate || !app.requirementId) return false;
        const appliedDate = new Date(app.appliedDate).toISOString().split('T')[0];
        return appliedDate <= selectedDate && filteredRequirementIds.has(app.requirementId);
      });

      const getUniqueDeliveryCount = (requirementId: string) => {
        const requirementSubmissions = filteredSubmissions.filter(s => s.requirementId === requirementId);
        const requirementTaggedApplications = filteredTaggedApplications.filter(app => app.requirementId === requirementId);
        const uniqueDeliveries = new Set<string>();

        requirementSubmissions.forEach((submission: any) => {
          uniqueDeliveries.add(
            `${requirementId}::${(submission.candidateEmail || submission.candidateName || submission.id || '').toString().trim().toLowerCase()}`
          );
        });

        requirementTaggedApplications.forEach((application: any) => {
          uniqueDeliveries.add(
            `${requirementId}::${(application.candidateEmail || application.candidateName || application.id || '').toString().trim().toLowerCase()}`
          );
        });

        return uniqueDeliveries.size;
      };

      // Calculate metrics for all requirements
      let totalResumesRequired = 0;
      let totalResumesDelivered = 0;
      let completedRequirements = 0;

      for (const req of filteredRequirements) {
        const target = getResumeTarget(req.criticality, req.toughness);
        totalResumesRequired += target;

        // Count resumes submitted for this requirement up to selected date
        const deliveredForReq = getUniqueDeliveryCount(req.id);
        totalResumesDelivered += deliveredForReq;

        // Check if this requirement is fully delivered
        if (deliveredForReq >= target) {
          completedRequirements++;
        }
      }

      // Calculate averages
      const avgResumesPerRequirement = totalRequirements > 0
        ? (totalResumesDelivered / totalRequirements).toFixed(2)
        : "0.00";

      // Get count of active recruiters for requirements per recruiter calculation
      const activeRecruiters = team && team !== 'overall'
        ? teamRecruiters.filter((emp: any) => emp.is_active === true)
        : allEmployees.filter((emp: any) =>
          (emp.role === 'recruiter' || emp.role === 'team_leader') && emp.is_active === true
        );
      const recruiterCount = activeRecruiters.length;
      const requirementsPerRecruiter = recruiterCount > 0
        ? (totalRequirements / recruiterCount).toFixed(2)
        : "0.00";

      const aggregateMetrics = team && team !== 'overall' && selectedTeamLead
        ? await storage.calculateTeamDailyMetrics(selectedTeamLead.id, selectedDate)
        : await storage.calculateOrgDailyMetrics(selectedDate);

      // Return the calculated metrics
      res.json({
        totalRequirements,
        avgResumesPerRequirement,
        requirementsPerRecruiter,
        completedRequirements,
        totalResumes: totalResumesDelivered,
        totalResumesDelivered,
        totalResumesRequired,
        dailyDeliveryDelivered: aggregateMetrics.delivered,
        dailyDeliveryDefaulted: aggregateMetrics.defaulted,
        overallPerformance: (() => {
          if (aggregateMetrics.required === 0) return "G";
          const performanceRatio = aggregateMetrics.delivered / aggregateMetrics.required;
          if (performanceRatio >= 1.0) return "G"; // Good: 100% or more
          if (performanceRatio >= 0.5) return "A"; // Average: 50-99%
          return "B"; // Bad: less than 50%
        })(),
        date: selectedDate
      });
    } catch (error) {
      console.error('Daily metrics error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Key Aspects API endpoint for Key Metrics chart data
  app.get("/api/admin/key-aspects", requireAdminAuth, async (req, res) => {
    try {
      const { revenueMappings, cashOutflows, employees, clients } = await import("@shared/schema");
      const requestedClientId = typeof req.query.clientId === 'string' && req.query.clientId !== 'all'
        ? req.query.clientId
        : null;
      const requestedPeriod = typeof req.query.period === 'string' && ['monthly', 'quarterly', 'yearly'].includes(req.query.period)
        ? req.query.period
        : 'monthly';

      let allRevenueMappings: any[] = [];
      try {
        allRevenueMappings = await db.select().from(revenueMappings);
      } catch (error) {
        console.warn("Key aspects revenue mappings fallback:", error);
      }

      // Helper function to safely parse date (handles both Date objects and string formats)
      const parseDate = (dateValue: string | Date | null | undefined): Date | null => {
        if (!dateValue) return null;
        if (dateValue instanceof Date) return dateValue;
        try {
          // Handle "yyyy-MM-dd" format
          const parsed = new Date(dateValue);
          if (isNaN(parsed.getTime())) return null;
          return parsed;
        } catch {
          return null;
        }
      };

      const monthMap: Record<string, number> = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4,
        'may': 5, 'june': 6, 'july': 7, 'august': 8,
        'september': 9, 'october': 10, 'november': 11, 'december': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
        'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9,
        'oct': 10, 'nov': 11, 'dec': 12
      };

      let allCashOutflows: any[] = [];
      try {
        allCashOutflows = await db.select().from(cashOutflows);
      } catch (error) {
        console.warn("Key aspects cash outflows fallback:", error);
      }

      const allClients = await storage.getAllClients();
      const selectedClient = requestedClientId
        ? allClients.find((client) => client.id === requestedClientId)
        : null;

      const filteredRevenueMappings = selectedClient
        ? allRevenueMappings.filter((rm) => {
          const clientNames = [
            selectedClient.brandName,
            selectedClient.incorporatedName,
          ]
            .filter(Boolean)
            .map((name) => String(name).trim().toLowerCase());

          return rm.clientId === selectedClient.id ||
            clientNames.includes(String(rm.clientName || '').trim().toLowerCase());
        })
        : allRevenueMappings;

      const filteredClients = selectedClient ? allClients.filter((client) => client.id === selectedClient.id) : allClients;

      const getMonthNumber = (value: string | number | null | undefined) => {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        return monthMap[String(value).toLowerCase()] || parseInt(String(value)) || 0;
      };

      const getPeriodStart = (date: Date, period: 'monthly' | 'quarterly' | 'yearly') => {
        if (period === 'yearly') {
          return new Date(date.getFullYear(), 0, 1);
        }
        if (period === 'quarterly') {
          return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
        }
        return new Date(date.getFullYear(), date.getMonth(), 1);
      };

      const shiftPeriod = (date: Date, period: 'monthly' | 'quarterly' | 'yearly', amount: number) => {
        if (period === 'yearly') {
          return new Date(date.getFullYear() + amount, 0, 1);
        }
        if (period === 'quarterly') {
          return new Date(date.getFullYear(), date.getMonth() + amount * 3, 1);
        }
        return new Date(date.getFullYear(), date.getMonth() + amount, 1);
      };

      const getPeriodLabel = (date: Date, period: 'monthly' | 'quarterly' | 'yearly') => {
        if (period === 'yearly') {
          return String(date.getFullYear());
        }
        if (period === 'quarterly') {
          return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      };

      const getRevenueForPeriod = (periodStart: Date, period: 'monthly' | 'quarterly' | 'yearly') => {
        return filteredRevenueMappings
          .filter((rm) => {
            if (!rm.closureDate) return false;
            const closureDate = parseDate(rm.closureDate);
            if (!closureDate) return false;
            const normalizedDate = getPeriodStart(closureDate, period);
            return normalizedDate.getTime() === periodStart.getTime();
          })
          .reduce((sum, rm) => sum + (rm.revenue || 0), 0);
      };

      const getExpensesForPeriod = (periodStart: Date, period: 'monthly' | 'quarterly' | 'yearly') => {
        return allCashOutflows
          .filter((cf) => {
            const monthNum = getMonthNumber(cf.month);
            const yearNum = Number(cf.year) || 0;
            if (monthNum < 1 || monthNum > 12 || yearNum <= 0) return false;
            const cashDate = new Date(yearNum, monthNum - 1, 1);
            const normalizedDate = getPeriodStart(cashDate, period);
            return normalizedDate.getTime() === periodStart.getTime();
          })
          .reduce((sum, cf) => {
            return sum + (cf.totalSalary || 0) + (cf.rent || 0) + (cf.toolsCost || 0) + (cf.otherExpenses || 0) + (cf.incentive || 0);
          }, 0);
      };

      const reportingDates: Date[] = [];
      for (const revenueMapping of filteredRevenueMappings) {
        const closureDate = parseDate(revenueMapping.closureDate);
        if (closureDate) {
          reportingDates.push(getPeriodStart(closureDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly'));
        }
      }

      for (const cashOutflow of allCashOutflows) {
        const monthNum = getMonthNumber(cashOutflow.month);
        const yearNum = Number(cashOutflow.year) || 0;

        if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
          reportingDates.push(getPeriodStart(new Date(yearNum, monthNum - 1, 1), requestedPeriod as 'monthly' | 'quarterly' | 'yearly'));
        }
      }

      // Use the latest month with actual data so the dashboard doesn't stay at zero
      // when the current calendar month has not been entered yet.
      const now = new Date();
      const activeReportingDate = reportingDates.length > 0
        ? new Date(Math.max(...reportingDates.map((date) => date.getTime())))
        : now;
      const currentMonth = activeReportingDate.getMonth() + 1; // retained for debug
      const currentYear = activeReportingDate.getFullYear();
      const currentPeriodStart = getPeriodStart(activeReportingDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly');
      const previousPeriodStart = shiftPeriod(currentPeriodStart, requestedPeriod as 'monthly' | 'quarterly' | 'yearly', -1);
      const samePeriodLastYearStart = shiftPeriod(
        currentPeriodStart,
        requestedPeriod as 'monthly' | 'quarterly' | 'yearly',
        requestedPeriod === 'quarterly' ? -4 : -1
      );

      const currentMonthRevenue = getRevenueForPeriod(currentPeriodStart, requestedPeriod as 'monthly' | 'quarterly' | 'yearly');
      const previousMonthRevenue = getRevenueForPeriod(previousPeriodStart, requestedPeriod as 'monthly' | 'quarterly' | 'yearly');
      const sameMonthLastYearRevenue = getRevenueForPeriod(samePeriodLastYearStart, requestedPeriod as 'monthly' | 'quarterly' | 'yearly');

      // 1. Growth MoM (Month-over-Month Growth %)
      // Formula: (Revenue in Current Month - Revenue in Previous Month) / Revenue in Previous Month × 100
      let growthMoM = 0;
      if (previousMonthRevenue > 0) {
        growthMoM = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
      } else if (currentMonthRevenue > 0) {
        growthMoM = 100; // 100% growth if previous month had 0 revenue
      }

      // 2. Growth YoY (Year-over-Year Growth %)
      // Formula: (Revenue in Current Month (This Year) - Revenue in Same Month (Last Year)) / Revenue in Same Month (Last Year) × 100
      let growthYoY = 0;
      if (sameMonthLastYearRevenue > 0) {
        growthYoY = ((currentMonthRevenue - sameMonthLastYearRevenue) / sameMonthLastYearRevenue) * 100;
      } else if (currentMonthRevenue > 0) {
        growthYoY = 100; // 100% growth if same month last year had 0 revenue
      }

      // Get all revenue for total calculations
      const totalRevenue = filteredRevenueMappings.reduce((sum, rm) => sum + (rm.revenue || 0), 0);

      const totalExpenses = allCashOutflows.reduce((sum, outflow) => {
        return sum + (outflow.totalSalary || 0) + (outflow.rent || 0) + (outflow.toolsCost || 0) + (outflow.otherExpenses || 0) + (outflow.incentive || 0);
      }, 0);

      // Calculate current month expenses for Burn Rate
      const currentMonthExpenses = getExpensesForPeriod(currentPeriodStart, requestedPeriod as 'monthly' | 'quarterly' | 'yearly');

      // 7. Burn Rate (%)
      // Formula: Burn Rate % = (Total Monthly Expenses / Monthly Revenue) × 100
      let burnRate = 0;
      if (currentMonthRevenue > 0) {
        burnRate = (currentMonthExpenses / currentMonthRevenue) * 100;
      } else if (currentMonthExpenses > 0) {
        burnRate = Infinity; // If no revenue but expenses exist, set to a high number (we'll cap it)
      }

      // 3. Net Profit
      // Formula: Net Profit = Total Revenue – Total Expenses
      const netProfit = totalRevenue - totalExpenses;

      // Get head count (active employees - team leaders, talent advisors, recruiters)
      const employeesResult = await db.execute(sql`
        SELECT id, employee_id, name, email, password, role, address, designation, phone, 
               department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
               father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
               increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
               current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
               branch, city, reporting_to, is_active, created_at, profile_picture
        FROM employees
      `);
      const allEmployees = employeesResult.rows as any[];
      const headCount = allEmployees.filter(e =>
        e.is_active === true &&
        e.role &&
        (e.role.toLowerCase() === 'team_leader' ||
          e.role.toLowerCase() === 'talent_advisor' ||
          e.role.toLowerCase() === 'teamlead' ||
          e.role.toLowerCase() === 'recruiter') &&
        e.role.toLowerCase() !== 'admin' &&
        e.role.toLowerCase() !== 'client' &&
        e.role.toLowerCase() !== 'candidate'
      ).length;

      // 4. Revenue per Employee
      // Formula: Revenue per Employee = Total Revenue / Total Number of Employees
      const revenuePerEmployee = headCount > 0 ? totalRevenue / headCount : 0;

      // 5. Employee Attrition Rate
      // Formula: Attrition Rate (%) = (Number of Employees Who Left During the Period / Average Number of Employees During the Period) × 100
      // Average Number of Employees = (Employees at Start + Employees at End) / 2
      const employeesAtStart = allEmployees.filter(e =>
        e.role &&
        (e.role.toLowerCase() === 'team_leader' ||
          e.role.toLowerCase() === 'talent_advisor' ||
          e.role.toLowerCase() === 'teamlead' ||
          e.role.toLowerCase() === 'recruiter') &&
        e.role.toLowerCase() !== 'admin' &&
        e.role.toLowerCase() !== 'client' &&
        e.role.toLowerCase() !== 'candidate'
      ).length;

      const employeesAtEnd = headCount; // Active employees
      const averageEmployees = (employeesAtStart + employeesAtEnd) / 2;

      // Employees who left during current month (resigned or inactive)
      const employeesWhoLeft = allEmployees.filter(e => {
        const isRelevantRole = e.role &&
          (e.role.toLowerCase() === 'team_leader' ||
            e.role.toLowerCase() === 'talent_advisor' ||
            e.role.toLowerCase() === 'teamlead' ||
            e.role.toLowerCase() === 'recruiter') &&
          e.role.toLowerCase() !== 'admin' &&
          e.role.toLowerCase() !== 'client' &&
          e.role.toLowerCase() !== 'candidate';

        if (!isRelevantRole) return false;

        // Check if employee left (resigned or inactive)
        const isResigned = e.employment_status && e.employment_status.toLowerCase() === 'resigned';
        const isInactive = e.is_active === false;

        // Check if they left during current month
        if (isResigned || isInactive) {
          if (e.created_at) {
            const createdAt = new Date(e.created_at);
            // Consider employees who left this month (simplified - check if they're not active)
            return true;
          }
        }
        return false;
      }).length;

      let attrition = 0;
      if (averageEmployees > 0) {
        attrition = (employeesWhoLeft / averageEmployees) * 100;
      }

      // Get all clients for Churn Rate calculation
      // 8. Churn Rate (Customer Churn Rate %)
      // Formula: Churn Rate % = (Number of Customers Lost During Period / Total Customers at Start of Period) × 100
      // Calculate clients at start of month (active clients from previous month)
      const activeClientsAtStart = filteredClients.filter(client => {
        if (client.isLoginOnly) return false;
        const clientDate = parseDate(client.createdAt || client.startDate);
        if (!clientDate) return false;
        return getPeriodStart(clientDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly').getTime() <
          currentPeriodStart.getTime();
      }).length;

      // Clients lost this month (changed to frozen/churned status or became inactive)
      const clientsLostThisMonth = filteredClients.filter(client => {
        if (client.isLoginOnly) return false;
        // Check if client status changed to frozen or churned this month
        if (client.currentStatus === 'frozen' || client.currentStatus === 'churned') {
          // Simple check: if status is not active, consider them lost
          // In a more sophisticated implementation, you'd track status change dates
          return true;
        }
        return false;
      }).length;

      let churnRate = 0;
      if (activeClientsAtStart > 0) {
        churnRate = (clientsLostThisMonth / activeClientsAtStart) * 100;
      }

      // 6. Customer Acquisition Cost (CAC)
      // Formula: CAC = (Total Sales + Marketing Costs for the Period) / Number of New Customers Acquired in the Period
      // For this calculation, we'll use current month's data
      const currentMonthSales = currentMonthRevenue;

      // Marketing costs from current month's cash outflows (using otherExpenses as marketing costs proxy)
      const currentMonthMarketingCosts = allCashOutflows
        .filter(cf => {
          const monthNum = getMonthNumber(cf.month);
          const yearNum = Number(cf.year) || 0;
          if (monthNum < 1 || yearNum <= 0) return false;
          const cashDate = new Date(yearNum, monthNum - 1, 1);
          return getPeriodStart(cashDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly').getTime() === currentPeriodStart.getTime();
        })
        .reduce((sum, cf) => sum + (cf.otherExpenses || 0), 0);

      // Get new customers acquired in current month
      const newCustomersThisMonth = filteredClients.filter(client => {
        if (client.isLoginOnly) return false;
        if (!client.createdAt && !client.startDate) return false;
        const clientDate = parseDate(client.createdAt || client.startDate);
        if (!clientDate) return false;
        return getPeriodStart(clientDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly').getTime() === currentPeriodStart.getTime();
      }).length;

      let clientAcquisitionCost = 0;
      if (newCustomersThisMonth > 0) {
        clientAcquisitionCost = (currentMonthSales + currentMonthMarketingCosts) / newCustomersThisMonth;
      }

      // Generate chart data for last 12 months
      const chartData: Array<{ name: string; growthMoM: number; burnRate: number; churnRate: number; attrition: number }> = [];

      const chartPointCount = requestedPeriod === 'monthly' ? 12 : requestedPeriod === 'quarterly' ? 8 : 5;
      for (let i = chartPointCount - 1; i >= 0; i--) {
        const targetDate = shiftPeriod(currentPeriodStart, requestedPeriod as 'monthly' | 'quarterly' | 'yearly', -i);
        const monthRevenue = getRevenueForPeriod(targetDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly');
        const prevMonthRevenue = getRevenueForPeriod(
          shiftPeriod(targetDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly', -1),
          requestedPeriod as 'monthly' | 'quarterly' | 'yearly'
        );

        // Calculate Growth MoM for this month
        let monthGrowthMoM = 0;
        if (prevMonthRevenue > 0) {
          monthGrowthMoM = ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
        } else if (monthRevenue > 0) {
          monthGrowthMoM = 100;
        }

        // Calculate expenses for this month (Burn Rate)
        const monthExpenses = getExpensesForPeriod(targetDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly');

        // Calculate Burn Rate for this month
        let monthBurnRate = 0;
        if (monthRevenue > 0) {
          monthBurnRate = (monthExpenses / monthRevenue) * 100;
        } else if (monthExpenses > 0) {
          monthBurnRate = 9999; // High number to indicate issue
        }

        // Calculate Churn Rate for this month (simplified - using all-time data)
        // For proper monthly churn, you'd need to track status changes by date
        let monthChurnRate = 0;
        const activeClientsAtMonthStart = filteredClients.filter(client => {
          if (client.isLoginOnly) return false;
          const clientDate = parseDate(client.createdAt || client.startDate);
          if (!clientDate) return false;
          return getPeriodStart(clientDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly').getTime() <
            targetDate.getTime();
        }).length;
        if (activeClientsAtMonthStart > 0) {
          // Simplified: assume same churn rate for all months
          monthChurnRate = churnRate;
        }

        const monthName = getPeriodLabel(targetDate, requestedPeriod as 'monthly' | 'quarterly' | 'yearly');
        chartData.push({
          name: monthName,
          growthMoM: Math.round(monthGrowthMoM * 100) / 100,
          burnRate: Math.round(monthBurnRate * 100) / 100,
          churnRate: Math.round(monthChurnRate * 100) / 100,
          attrition: Math.round(attrition * 100) / 100 // Using overall attrition for all months
        });
      }

      // Cap burn rate at 10000% for display purposes
      const displayBurnRate = burnRate > 10000 ? 10000 : burnRate;

      // Log debug information (can be removed in production or made conditional)
      console.log('[Key Aspects Debug]', {
        currentMonth,
        currentYear,
        currentMonthRevenue,
        previousMonthRevenue,
        sameMonthLastYearRevenue,
        totalRevenue,
        totalExpenses,
        currentMonthExpenses,
        headCount,
        activeClientsAtStart,
        clientsLostThisMonth,
        newCustomersThisMonth,
        revenueMappingsCount: allRevenueMappings.length,
        cashOutflowsCount: allCashOutflows.length,
        employeesCount: allEmployees.length,
        clientsCount: allClients.length
      });

      res.json({
        growthMoM: Math.round(growthMoM * 100) / 100,
        growthYoY: Math.round(growthYoY * 100) / 100,
        burnRate: Math.round(displayBurnRate * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
        attrition: Math.round(attrition * 100) / 100,
        netProfit: Math.round(netProfit),
        revenuePerEmployee: Math.round(revenuePerEmployee),
        clientAcquisitionCost: Math.round(clientAcquisitionCost),
        chartData: chartData,
        period: requestedPeriod,
        // Debug information (optional - remove in production if not needed)
        _debug: {
          currentMonthRevenue,
          previousMonthRevenue,
          sameMonthLastYearRevenue,
          totalRevenue,
          totalExpenses,
          currentMonthExpenses,
          headCount,
          revenueMappingsCount: allRevenueMappings.length,
          cashOutflowsCount: allCashOutflows.length
        }
      });
    } catch (error) {
      console.error('Key aspects error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Master Data Totals API endpoint
  app.get("/api/admin/master-data-totals", requireAdminAuth, async (req, res) => {
    try {
      // Use static imports instead of dynamic import to avoid production issues
      const { candidates, cashOutflows } = await import("@shared/schema");

      // Get counts from database with better error handling
      let allEmployees: any[] = [];
      let allCandidates: any[] = [];
      let allCashOutflows: any[] = [];

      try {
        // Use raw SQL to exclude last_login_at column (which may not exist in production)
        const employeesResult = await db.execute(sql`
          SELECT id, employee_id, name, email, password, role, address, designation, phone, 
                 department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
                 father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
                 increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
                 current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
                 branch, city, reporting_to, is_active, created_at, profile_picture
          FROM employees
        `);
        allEmployees = employeesResult.rows as any[];
      } catch (empError: any) {
        console.error('Error fetching employees:', empError);
        // Continue with empty array if employees query fails
      }

      try {
        allCandidates = await db.select().from(candidates);
      } catch (candError: any) {
        console.error('Error fetching candidates:', candError);
        // Continue with empty array if candidates query fails
      }

      // Calculate totals
      const resumes = allCandidates.length;

      // Direct Uploads: Candidates uploaded via bulk import (addedBy is null/empty or "Admin"/"admin")
      const directUploads = allCandidates.filter(c =>
        !c.addedBy || c.addedBy.trim() === '' ||
        c.addedBy.toLowerCase() === 'admin' ||
        c.addedBy.toLowerCase() === 'bulk upload'
      ).length;

      // Recruiter Uploads: Candidates uploaded by recruiters (addedBy has a recruiter name)
      const recruiterUploads = allCandidates.filter(c =>
        c.addedBy &&
        c.addedBy.trim() !== '' &&
        c.addedBy.toLowerCase() !== 'admin' &&
        c.addedBy.toLowerCase() !== 'bulk upload'
      ).length;

      // Head Count: Count of employees with role 'team_leader' or 'talent_advisor' (excluding admin, client, candidate)
      const headCount = allEmployees.filter(e =>
        e.role &&
        (e.role.toLowerCase() === 'team_leader' ||
          e.role.toLowerCase() === 'talent_advisor' ||
          e.role.toLowerCase() === 'teamlead' ||
          e.role.toLowerCase() === 'recruiter') &&
        e.role.toLowerCase() !== 'admin' &&
        e.role.toLowerCase() !== 'client' &&
        e.role.toLowerCase() !== 'candidate'
      ).length;

      // RESUMES count should be the sum of DIRECT UPLOADS + RECRUITER UPLOADS
      const totalResumes = directUploads + recruiterUploads;

      // Calculate financial totals from cash_outflows table
      try {
        allCashOutflows = await db.select().from(cashOutflows);
      } catch (cashError: any) {
        console.error('Error fetching cash outflows:', cashError);
        // Continue with empty array if cash outflows query fails
      }

      const salaryPaid = allCashOutflows.reduce((sum, outflow) => sum + (outflow.totalSalary || 0), 0);
      const otherExpenses = allCashOutflows.reduce((sum, outflow) => sum + (outflow.otherExpenses || 0), 0);
      const toolsAndDatabases = allCashOutflows.reduce((sum, outflow) => sum + (outflow.toolsCost || 0), 0);
      const rentPaid = allCashOutflows.reduce((sum, outflow) => sum + (outflow.rent || 0), 0);

      res.json({
        directUploads: directUploads,
        recruiterUploads: recruiterUploads,
        resumes: totalResumes, // Sum of directUploads + recruiterUploads
        headCount: headCount,
        salaryPaid: salaryPaid,
        otherExpenses: otherExpenses,
        toolsAndDatabases: toolsAndDatabases,
        rentPaid: rentPaid
      });
    } catch (error: any) {
      console.error('Master data totals error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Employer/Employee forgot password request
  app.post("/api/auth/forgot-password/request", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if email exists in employees OR candidates
      const [employee] = await db.select().from(employees).where(eq(employees.email, email)).limit(1);
      const [candidate] = await db.select().from(candidates).where(eq(candidates.email, email)).limit(1);

      if (!employee && !candidate) {
        return res.status(404).json({ message: "No account found with this email address" });
      }

      const userName = employee ? employee.name : candidate.fullName;

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save OTP to database
      await db.insert(passwordResets).values({
        email,
        otp,
        expiresAt,
        isVerified: false
      });

      // Send OTP via email
      const emailSent = await sendOTPEmail({
        fullName: userName,
        email,
        otp,
        expiresInMinutes: 15
      });

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email. Please try again." });
      }

      res.json({ message: "Verification code sent to your email" });
    } catch (error) {
      console.error('Forgot password request error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify OTP
  app.post("/api/auth/forgot-password/verify", async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      // Find the latest unverified OTP for this email
      const [resetRecord] = await db.select()
        .from(passwordResets)
        .where(and(
          eq(passwordResets.email, email),
          eq(passwordResets.otp, otp),
          eq(passwordResets.isVerified, false)
        ))
        .orderBy(desc(passwordResets.createdAt))
        .limit(1);

      if (!resetRecord) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      if (new Date() > resetRecord.expiresAt) {
        return res.status(400).json({ message: "Verification code has expired" });
      }

      // Mark as verified
      await db.update(passwordResets)
        .set({ isVerified: true })
        .where(eq(passwordResets.id, resetRecord.id));

      res.json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset Password
  app.post("/api/auth/forgot-password/reset", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
      }

      // Check if OTP was verified
      const [resetRecord] = await db.select()
        .from(passwordResets)
        .where(and(
          eq(passwordResets.email, email),
          eq(passwordResets.otp, otp),
          eq(passwordResets.isVerified, true)
        ))
        .orderBy(desc(passwordResets.createdAt))
        .limit(1);

      if (!resetRecord) {
        return res.status(400).json({ message: "Please verify your email first" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update in employees OR candidates
      const [employee] = await db.select().from(employees).where(eq(employees.email, email)).limit(1);
      const [candidate] = await db.select().from(candidates).where(eq(candidates.email, email)).limit(1);

      if (employee) {
        await db.update(employees)
          .set({ password: hashedPassword })
          .where(eq(employees.id, employee.id));
      } else if (candidate) {
        // Find user by username (which is email for candidates)
        const [candidateUser] = await db.select()
          .from(users)
          .where(eq(users.username, email))
          .limit(1);
          
        if (candidateUser) {
          await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, candidateUser.id));
        }
      } else {
        return res.status(404).json({ message: "Account not found" });
      }

      // Delete the reset record so it can't be used again
      await db.delete(passwordResets).where(eq(passwordResets.id, resetRecord.id));

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Google OAuth endpoints (placeholder for future implementation)
  app.get("/api/auth/google", async (req, res) => {
    // Placeholder for Google OAuth initiation
    res.status(501).json({ message: "Google OAuth not yet implemented" });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    // Placeholder for Google OAuth callback
    res.status(501).json({ message: "Google OAuth callback not yet implemented" });
  });

  // Get notifications for user
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getNotificationsByUserId(userId);

      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(notification);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Get user activities for role (Admin/TL/Recruiter notifications)
  app.get("/api/user-activities/:role", async (req, res) => {
    try {
      const { role } = req.params;
      
      // Candidates do not have internal staff activities
      if (role === 'Candidate') {
        return res.json([]);
      }

      const limit = parseInt(req.query.limit as string) || 5;
      const activities = await storage.getUserActivities(role, limit);
      res.json(activities);
    } catch (error) {
      console.error('[API] Get user activities error:', error);
      res.status(500).json({ 
        message: "Failed to get user activities",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create user activity (for logging actions)
  app.post("/api/user-activities", async (req, res) => {
    try {
      const activityData = {
        ...req.body,
        createdAt: new Date().toISOString()
      };
      const activity = await storage.createUserActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      console.error('Create user activity error:', error);
      res.status(500).json({ message: "Failed to create user activity" });
    }
  });

  // Bootstrap admin - UNAUTHENTICATED endpoint for first-time setup
  app.post("/api/bootstrap/admin", async (req, res) => {
    try {
      // Check if any admin already exists
      const allEmployees = await storage.getAllEmployees();
      const existingAdmins = allEmployees.filter(emp => emp.role === 'admin');

      if (existingAdmins.length > 0) {
        return res.status(403).json({
          message: "Admin account already exists. Please use the login page.",
          adminExists: true
        });
      }

      // Validate using Zod schema
      const bootstrapAdminSchema = insertEmployeeSchema.omit({
        createdAt: true,
        employeeId: true
      }).extend({
        role: z.literal('admin'),
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
      });

      const validatedData = bootstrapAdminSchema.parse(req.body);

      // Store raw password for email before it gets hashed
      const rawPassword = validatedData.password;

      // Generate admin employee ID
      const employeeId = await storage.generateNextEmployeeId('admin');

      const employeeData = {
        ...validatedData,
        employeeId,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      // Password will be hashed by storage layer
      const admin = await storage.createEmployee(employeeData);

      // Send welcome email to new admin
      // Prefer configured FRONTEND_URL; otherwise use public StaffOS URL
      const envLoginUrlAdmin = process.env.FRONTEND_URL;
      const loginUrl = envLoginUrlAdmin && !envLoginUrlAdmin.includes('localhost')
        ? envLoginUrlAdmin
        : 'https://staffos.io';

      try {
        await sendEmployeeWelcomeEmail({
          name: admin.name,
          email: admin.email,
          employeeId: admin.employeeId,
          role: admin.role,
          password: rawPassword,
          loginUrl
        });
        console.log(`Welcome email sent to admin: ${admin.email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email to admin:', emailError);
        // Continue with success response - email failure shouldn't block admin creation
      }

      res.status(201).json({
        message: "Admin account created successfully",
        employee: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error: any) {
      console.error('Bootstrap admin error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: "Invalid admin data",
          errors: error.errors
        });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({
          message: "An account with this email already exists"
        });
      }
      res.status(500).json({ message: "Failed to create admin account" });
    }
  });

  // Check if admin exists - UNAUTHENTICATED endpoint
  app.get("/api/bootstrap/check", async (req, res) => {
    try {
      const allEmployees = await storage.getAllEmployees();
      const existingAdmins = allEmployees.filter(emp => emp.role === 'admin');

      // For testing purposes, return admin email if exists
      const adminInfo = existingAdmins.length > 0 ? {
        email: existingAdmins[0].email,
        name: existingAdmins[0].name,
        note: "Password is encrypted and cannot be displayed for security"
      } : null;

      res.json({
        adminExists: existingAdmins.length > 0,
        setupRequired: existingAdmins.length === 0,
        adminInfo
      });
    } catch (error) {
      console.error('Admin check error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('Error details:', { errorMessage, errorStack });
      res.status(500).json({
        message: "Failed to check admin status",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  });

  // Delete admin - UNAUTHENTICATED endpoint (protected by security key)
  app.delete("/api/bootstrap/admin", async (req, res) => {
    try {
      const { securityKey } = req.body;

      // Verify security key
      const ADMIN_RESET_KEY = process.env.ADMIN_RESET_KEY;

      if (!ADMIN_RESET_KEY) {
        return res.status(500).json({
          message: "Admin reset feature is not configured. Please contact system administrator."
        });
      }

      if (!securityKey || securityKey !== ADMIN_RESET_KEY) {
        return res.status(403).json({
          message: "Invalid security key. Access denied."
        });
      }

      // Get all admin accounts
      const allEmployees = await storage.getAllEmployees();
      const existingAdmins = allEmployees.filter(emp => emp.role === 'admin');

      if (existingAdmins.length === 0) {
        return res.status(404).json({
          message: "No admin account found to delete."
        });
      }

      // Delete all admin accounts
      let deletedCount = 0;
      for (const admin of existingAdmins) {
        const deleted = await storage.deleteEmployee(admin.id);
        if (deleted) {
          deletedCount++;
        }
      }

      res.json({
        message: `Successfully deleted ${deletedCount} admin account(s). You can now create a new admin.`,
        deletedCount
      });
    } catch (error) {
      console.error('Delete admin error:', error);
      res.status(500).json({ message: "Failed to delete admin account" });
    }
  });

  // Bootstrap support - UNAUTHENTICATED endpoint for first-time setup
  app.post("/api/bootstrap/support", async (req, res) => {
    try {
      // Check if any support already exists
      const allEmployees = await storage.getAllEmployees();
      const existingSupport = allEmployees.filter(emp => emp.role === 'support');

      if (existingSupport.length > 0) {
        return res.status(403).json({
          message: "Support account already exists. Please use the login page.",
          supportExists: true
        });
      }

      // Validate using Zod schema
      const bootstrapSupportSchema = insertEmployeeSchema.omit({
        createdAt: true,
        employeeId: true
      }).extend({
        role: z.literal('support'),
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
      });

      const validatedData = bootstrapSupportSchema.parse(req.body);

      // Generate support employee ID
      const employeeId = await storage.generateNextEmployeeId('support');

      const employeeData = {
        ...validatedData,
        employeeId,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      // Password will be hashed by storage layer
      const support = await storage.createEmployee(employeeData);

      res.status(201).json({
        message: "Support account created successfully",
        employee: {
          id: support.id,
          name: support.name,
          email: support.email,
          role: support.role
        }
      });
    } catch (error: any) {
      console.error('Bootstrap support error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: "Invalid support data",
          errors: error.errors
        });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({
          message: "An account with this email already exists"
        });
      }
      res.status(500).json({ message: "Failed to create support account" });
    }
  });

  // Check if support exists - UNAUTHENTICATED endpoint
  app.get("/api/bootstrap/support/check", async (req, res) => {
    try {
      const allEmployees = await storage.getAllEmployees();
      const existingSupport = allEmployees.filter(emp => emp.role === 'support');

      // For testing purposes, return support email if exists
      const supportInfo = existingSupport.length > 0 ? {
        email: existingSupport[0].email,
        name: existingSupport[0].name,
        note: "Password is encrypted and cannot be displayed for security"
      } : null;

      res.json({
        supportExists: existingSupport.length > 0,
        setupRequired: existingSupport.length === 0,
        supportInfo
      });
    } catch (error) {
      console.error('Support check error:', error);
      res.status(500).json({ message: "Failed to check support status" });
    }
  });

  // Delete support - UNAUTHENTICATED endpoint (protected by security key)
  app.delete("/api/bootstrap/support", async (req, res) => {
    try {
      const { securityKey } = req.body;

      // Verify security key - use same key as admin for simplicity
      const SUPPORT_RESET_KEY = process.env.ADMIN_RESET_KEY;

      if (!SUPPORT_RESET_KEY) {
        return res.status(500).json({
          message: "Support reset feature is not configured. Please contact system administrator."
        });
      }

      if (!securityKey || securityKey !== SUPPORT_RESET_KEY) {
        return res.status(403).json({
          message: "Invalid security key. Access denied."
        });
      }

      // Get all support accounts
      const allEmployees = await storage.getAllEmployees();
      const existingSupport = allEmployees.filter(emp => emp.role === 'support');

      if (existingSupport.length === 0) {
        return res.status(404).json({
          message: "No support account found to delete."
        });
      }

      // Delete all support accounts
      let deletedCount = 0;
      for (const support of existingSupport) {
        const deleted = await storage.deleteEmployee(support.id);
        if (deleted) {
          deletedCount++;
        }
      }

      res.json({
        message: `Successfully deleted ${deletedCount} support account(s). You can now create a new support account.`,
        deletedCount
      });
    } catch (error) {
      console.error('Delete support error:', error);
      res.status(500).json({ message: "Failed to delete support account" });
    }
  });

  // Get active user sessions (for Status column in User Management)
  app.get("/api/admin/active-sessions", requireAdminAuth, async (req, res) => {
    try {
      const { pool } = await import('./db');

      // Query the session table to get active sessions
      const result = await pool.query(`
        SELECT sess 
        FROM session 
        WHERE expire > NOW()
      `);

      const activeEmployeeIds = new Set<string>();

      // Parse session data to extract employeeId
      for (const row of result.rows) {
        try {
          const sessData = typeof row.sess === 'string' ? JSON.parse(row.sess) : row.sess;
          if (sessData?.employeeId) {
            // Get employee by ID to use the correct ID format
            const employee = await storage.getEmployeeById(sessData.employeeId);
            if (employee) {
              activeEmployeeIds.add(employee.id);
            }
          }
        } catch (error) {
          // Skip invalid session data
          console.error('Error parsing session data:', error);
        }
      }

      res.json({ activeEmployeeIds: Array.from(activeEmployeeIds) });
    } catch (error) {
      console.error('Get active sessions error:', error);
      res.status(500).json({ message: "Failed to get active sessions" });
    }
  });

  // Create employee OR attach login credentials to an existing Master Data employee
  app.post("/api/admin/employees", requireAdminAuth, async (req, res) => {
    try {
      // Always generate employee ID on backend (SCE001, SCE002, etc.) for brand new employees
      const generatedEmployeeId = await storage.generateNextEmployeeId(req.body.role || 'employee');

      const employeeData = insertEmployeeSchema.parse({
        ...req.body,
        employeeId: generatedEmployeeId, // Override any client-provided ID for new employees
        createdAt: new Date().toISOString(),
      });

      // Store raw password for email before it gets hashed (must match exactly what admin entered)
      const rawPassword = employeeData.password;

      // If an employee already exists in Master Data with this email, (create or) update login on that same record
      if (employeeData.email) {
        const existingEmployee = await storage.getEmployeeByEmail(employeeData.email);

        if (existingEmployee) {
          if (!rawPassword) {
            return res.status(400).json({
              message: "Password is required to create or update a login for an existing employee record",
            });
          }

          // Hash password and update existing Master Data employee record
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

          const updatedEmployee = await storage.updateEmployee(existingEmployee.id, {
            password: hashedPassword,
            // Set / update role for login users (team_leader / recruiter / client, etc.)
            role: employeeData.role || existingEmployee.role,
            phone: employeeData.phone ?? existingEmployee.phone,
            department: employeeData.department ?? existingEmployee.department,
            joiningDate: employeeData.joiningDate ?? existingEmployee.joiningDate,
            reportingTo: (employeeData as any).reportingTo ?? (existingEmployee as any).reportingTo,
          });

          const finalEmployee = updatedEmployee || existingEmployee;

          // Send welcome email for (new or updated) login
          if (finalEmployee.email) {
            const envLoginUrl = process.env.FRONTEND_URL;
            const loginUrl = envLoginUrl && !envLoginUrl.includes('localhost')
              ? envLoginUrl
              : 'https://staffos.io';

            await sendEmployeeWelcomeEmail({
              name: finalEmployee.name,
              email: finalEmployee.email,
              employeeId: finalEmployee.employeeId,
              role: finalEmployee.role,
              password: rawPassword,
              loginUrl,
            });
          }

          return res.status(200).json({
            message: "Login created/updated successfully for existing employee",
            employee: finalEmployee,
          });
        }
      }

      // No existing Master Data record with this email – create a brand new employee + login
      // Password will be hashed by storage layer
      const employee = await storage.createEmployee(employeeData);

      // Send welcome email to new employee
      if (employee.email && rawPassword) {
        // Prefer configured FRONTEND_URL; otherwise use public StaffOS URL
        const envLoginUrl = process.env.FRONTEND_URL;
        const loginUrl = envLoginUrl && !envLoginUrl.includes('localhost')
          ? envLoginUrl
          : 'https://staffos.io';

        await sendEmployeeWelcomeEmail({
          name: employee.name,
          email: employee.email,
          employeeId: employee.employeeId,
          role: employee.role,
          password: rawPassword,
          loginUrl
        });
      }

      res.status(201).json({ message: "Employee created successfully", employee });
    } catch (error: any) {
      console.error('Create employee error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Employee with this email or ID already exists" });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Create client
  app.post("/api/admin/clients", requireAdminAuth, async (req, res) => {
    try {
      const clientSchema = z.object({
        clientCode: z.string().optional(),
        brandName: z.string().min(1),
        incorporatedName: z.string().optional(),
        gstin: z.string().optional(),
        address: z.string().optional(),
        location: z.string().optional(),
        spoc: z.string().optional(),
        email: z.string().email(),
        password: z.string().optional(),
        website: z.string().optional(),
        linkedin: z.string().optional(),
        agreement: z.string().optional(),
        percentage: z.string().optional(),
        category: z.string().optional(),
        paymentTerms: z.string().optional(),
        source: z.string().optional(),
        startDate: z.string().optional(),
        currentStatus: z.string().optional(),
        logo: z.string().optional(),
        createdAt: z.string(),
      });

      let clientCode = req.body.clientCode;
      if (!clientCode) {
        clientCode = await storage.generateNextClientCode();
      }

      const validatedData = clientSchema.parse({
        ...req.body,
        clientCode,
        createdAt: new Date().toISOString(),
      });

      // Create client record (without password)
      const { password, ...clientDataWithoutPassword } = validatedData;
      // Ensure clientCode is included in the data and explicitly set isLoginOnly to false for Master Database
      const clientDataToInsert = {
        ...clientDataWithoutPassword,
        clientCode,
        isLoginOnly: false  // This is a Master Database client, not a User Management login-only client
      };
      const client = await storage.createClient(clientDataToInsert);

      // NOTE: Master Data "New Client" creates ONLY the company/client record
      // Employee login profiles are created separately via User Management "Add Client"
      // This ensures proper separation: Company (Master Data) vs SPOC Login (User Management)

      res.status(201).json({ message: "Client company created successfully", client });
    } catch (error: any) {
      console.error('Create client error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Client with this email or code already exists" });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Create client credentials (SPOC login profile - for User Management)
  app.post("/api/admin/clients/credentials", requireAdminAuth, async (req, res) => {
    try {
      const credentialsSchema = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        name: z.string().min(1),
        phoneNumber: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        joiningDate: z.string(),
        clientId: z.string().min(1), // Company ID from Master Data
      });

      const validatedData = credentialsSchema.parse(req.body);

      // Get the selected company from Master Data
      const allClients = await storage.getAllClients();
      const selectedCompany = allClients.find(c => c.id === validatedData.clientId);

      if (!selectedCompany) {
        return res.status(404).json({
          message: "Selected company not found. Please select a valid company from Master Data."
        });
      }

      // Client Admin ID: {clientCode}A (e.g. STCL001A)
      const { formatClientAdminEmployeeId } = await import("@shared/client-ids");
      const employeeId = formatClientAdminEmployeeId(selectedCompany.clientCode);
      const existingEmployees = await storage.getAllEmployees();
      const idTaken = existingEmployees.some(
        (emp) =>
          emp.employeeId?.toUpperCase() === employeeId.toUpperCase() &&
          emp.clientCompanyId !== selectedCompany.id,
      );
      if (idTaken) {
        return res.status(409).json({
          message: `Employee ID ${employeeId} is already in use.`,
        });
      }

      // Create employee profile for SPOC login (linked to company)
      const existingAdmins = existingEmployees.filter(
        (emp) =>
          emp.clientCompanyId === selectedCompany.id &&
          isClientAdminRole(emp.role) &&
          emp.isActive,
      );
      if (existingAdmins.length > 0) {
        return res.status(409).json({
          message:
            "This company already has an active Client Admin. Deactivate the existing admin before creating a new one.",
        });
      }

      // SECURITY: Always set role to client_admin on server-side
      const employeeData = {
        employeeId: employeeId,
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        role: CLIENT_ADMIN_ROLE,
        clientCompanyId: selectedCompany.id,
        phone: validatedData.phoneNumber,
        department: "Client",
        joiningDate: validatedData.joiningDate,
        reportingTo: "Admin",
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      try {
        // Create ONLY the employee record - no client record should be created
        const createdEmployee = await storage.createEmployee(employeeData);
        console.log('SPOC employee created successfully:', employeeId, 'for company:', selectedCompany.brandName);
        console.log('No client record created - SPOC login profile only');

        res.status(201).json({
          message: "Client Admin login created successfully",
          employee: createdEmployee,
          company: {
            id: selectedCompany.id,
            brandName: selectedCompany.brandName,
            clientCode: selectedCompany.clientCode
          },
          employeeId: employeeId
        });
      } catch (error: any) {
        console.error('Error creating SPOC employee:', error);
        console.error('Employee data:', { ...employeeData, password: '[REDACTED]' });
        return res.status(500).json({
          message: "Failed to create SPOC login profile",
          error: error.message || String(error),
          details: error.code || error.detail || 'Unknown database error'
        });
      }
    } catch (error: any) {
      console.error('Create client credentials error:', error);
      console.error('Error stack:', error.stack);
      console.error('Request body:', req.body);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: "Invalid credentials data",
          errors: error.errors
        });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique') || error.code === '23505') {
        return res.status(409).json({
          message: "Client with this email already exists",
          error: error.message || String(error)
        });
      }
      res.status(500).json({
        message: "Failed to create client credentials",
        error: error.message || String(error),
        details: error.code || error.detail || 'Unknown error'
      });
    }
  });

  // Create target mapping
  app.post("/api/admin/target-mappings", requireAdminAuth, async (req, res) => {
    try {
      // Validate only the required fields from client
      const { teamLeadId, teamMemberId, quarter, year, minimumTarget } = req.body;

      if (!teamLeadId || !teamMemberId || !quarter || !year || minimumTarget === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate team lead and member are different
      if (teamLeadId === teamMemberId) {
        return res.status(400).json({ message: "Team lead and team member cannot be the same person" });
      }

      // Validate numeric fields parse correctly
      const yearNum = parseInt(year);
      const minimumTargetNum = parseInt(minimumTarget);

      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({ message: "Invalid year value" });
      }

      if (isNaN(minimumTargetNum) || minimumTargetNum < 0) {
        return res.status(400).json({ message: "Invalid minimum target value" });
      }

      // Fetch employee information to verify and get metadata
      const teamLead = await storage.getEmployeeById(teamLeadId);
      const teamMember = await storage.getEmployeeById(teamMemberId);

      if (!teamLead) {
        return res.status(400).json({ message: "Team lead not found" });
      }

      if (!teamMember) {
        return res.status(400).json({ message: "Team member not found" });
      }

      // Validate team lead role
      if (teamLead.role !== "team_leader") {
        return res.status(400).json({ message: "Selected employee is not a team leader" });
      }

      // Validate that team member reports to the selected team leader
      if (teamMember.reportingTo !== teamLead.employeeId) {
        return res.status(400).json({ message: "Selected team member does not report to the selected team leader" });
      }

      // Server-side derived data - createdAt is handled by database default
      const targetMappingData = insertTargetMappingsSchema.parse({
        teamLeadId,
        teamMemberId,
        quarter,
        year: yearNum,
        minimumTarget: minimumTargetNum,
      });

      const targetMapping = await storage.createTargetMapping(targetMappingData);

      res.status(201).json({ message: "Target mapping created successfully", targetMapping });
    } catch (error: any) {
      console.error('Create target mapping error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid target mapping data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create target mapping" });
    }
  });

  // Get all target mappings with joined employee data
  app.get("/api/admin/target-mappings", requireAdminAuth, async (req, res) => {
    try {
      const targetMappings = await storage.getAllTargetMappings();
      const allRevenue = await storage.getAllRevenueMappings();

      // Enrich with employee data and live revenue aggregates
      const enrichedMappings = await Promise.all(
        targetMappings.map(async (mapping) => {
          const teamLead = await storage.getEmployeeById(mapping.teamLeadId);
          const teamMember = await storage.getEmployeeById(mapping.teamMemberId);
          const withRevenue = enrichTargetMappingWithRevenue(mapping, allRevenue);

          return {
            ...withRevenue,
            teamLeadName: teamLead?.name || "Unknown",
            teamMemberName: teamMember?.name || "Unknown",
            teamMemberRole: teamMember?.role || "Unknown",
          };
        })
      );

      res.json(enrichedMappings);
    } catch (error) {
      console.error('Get target mappings error:', error);
      res.status(500).json({ message: "Failed to get target mappings" });
    }
  });

  // Update target mapping
  app.put("/api/admin/target-mappings/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { teamLeadId, teamMemberId, quarter, year, minimumTarget } = req.body;

      if (!teamLeadId || !teamMemberId || !quarter || !year || minimumTarget === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const yearNum = parseInt(year);
      const minimumTargetNum = parseInt(minimumTarget);

      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({ message: "Invalid year value" });
      }

      if (isNaN(minimumTargetNum) || minimumTargetNum < 0) {
        return res.status(400).json({ message: "Invalid minimum target value" });
      }

      const teamLead = await storage.getEmployeeById(teamLeadId);
      const teamMember = await storage.getEmployeeById(teamMemberId);

      if (!teamLead || teamLead.role !== "team_leader") {
        return res.status(400).json({ message: "Invalid team lead" });
      }
      if (!teamMember || (teamMember.role !== "recruiter" && teamMember.role !== "talent_advisor")) {
        return res.status(400).json({ message: "Invalid team member" });
      }
      if (teamMember.reportingTo !== teamLead.employeeId) {
        return res.status(400).json({ message: "Selected team member does not report to the selected team leader" });
      }

      const updatedMapping = await storage.updateTargetMapping(id, {
        teamLeadId,
        teamMemberId,
        quarter,
        year: yearNum,
        minimumTarget: minimumTargetNum,
      });

      if (updatedMapping) {
        res.status(200).json({ message: "Target mapping updated successfully", targetMapping: updatedMapping });
      } else {
        res.status(404).json({ message: "Target mapping not found" });
      }
    } catch (error: any) {
      console.error('Update target mapping error:', error);
      res.status(500).json({ message: "Failed to update target mapping" });
    }
  });

  // Delete target mapping
  app.delete("/api/admin/target-mappings/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTargetMapping(id);

      if (!deleted) {
        return res.status(404).json({ message: "Target mapping not found" });
      }

      res.json({ message: "Target mapping deleted successfully" });
    } catch (error) {
      console.error('Delete target mapping error:', error);
      res.status(500).json({ message: "Failed to delete target mapping" });
    }
  });

  // Revenue Mappings CRUD operations

  // Create revenue mapping
  app.post("/api/admin/revenue-mappings", requireAdminAuth, async (req, res) => {
    try {
      const {
        talentAdvisorId,
        teamLeadId,
        candidateName,
        year,
        quarter,
        position,
        clientId,
        clientType,
        partnerName,
        offeredDate,
        closureDate,
        percentage,
        revenue,
        incentivePlan,
        incentive,
        source,
        invoiceDate,
        invoiceNumber,
        receivedPayment,
        paymentDetails,
        paymentStatus,
        incentivePaidMonth,
      } = req.body;

      // Fetch employee and client information for validation and names
      const talentAdvisor = await storage.getEmployeeById(talentAdvisorId);
      const teamLead = await storage.getEmployeeById(teamLeadId);
      const client = await storage.getClientById(clientId);

      if (!talentAdvisor) {
        return res.status(400).json({ message: "Talent advisor not found" });
      }

      if (!teamLead) {
        return res.status(400).json({ message: "Team lead not found" });
      }

      if (!client) {
        return res.status(400).json({ message: "Client not found" });
      }

      const revenueMappingData = insertRevenueMappingSchema.parse({
        talentAdvisorId,
        talentAdvisorName: talentAdvisor.name,
        teamLeadId,
        teamLeadName: teamLead.name,
        candidateName: candidateName || null,
        year: parseInt(year),
        quarter,
        position,
        clientId,
        clientName: client.brandName,
        clientType,
        partnerName: clientType === "Partner" ? partnerName : null,
        offeredDate,
        closureDate,
        percentage: parseFloat(percentage),
        revenue: parseFloat(revenue),
        incentivePlan,
        incentive: parseFloat(incentive),
        source,
        invoiceDate,
        invoiceNumber,
        receivedPayment: receivedPayment ? parseFloat(receivedPayment) : null,
        paymentDetails,
        paymentStatus,
        incentivePaidMonth,
        createdAt: new Date().toISOString(),
      });

      const revenueMapping = await storage.createRevenueMapping(revenueMappingData);

      await syncAllTargetMappingsFromRevenue(storage);

      logClosureMade(
        storage,
        talentAdvisorId,
        talentAdvisor.name,
        'recruiter',
        candidateName || 'Candidate',
        position,
        client.brandName,
        revenueMapping.id
      );

      res.status(201).json({
        message: "Revenue mapping created successfully",
        revenueMapping,
      });
    } catch (error: any) {
      console.error("Create revenue mapping error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid revenue mapping data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create revenue mapping" });
    }
  });

  // Get all revenue mappings
  app.get("/api/admin/revenue-mappings", requireAdminAuth, async (req, res) => {
    try {
      const revenueMappings = await storage.getAllRevenueMappings();
      res.json(revenueMappings);
    } catch (error) {
      console.error("Get revenue mappings error:", error);
      res.status(500).json({ message: "Failed to get revenue mappings" });
    }
  });

  // Cash Outflow CRUD operations

  // Create cash outflow
  app.post("/api/admin/cash-outflows", requireAdminAuth, async (req, res) => {
    try {
      const { month, year, employeesCount, totalSalary, incentive, toolsCost, rent, otherExpenses } = req.body;

      if (!month || !year || employeesCount === undefined || totalSalary === undefined) {
        return res.status(400).json({ message: "Month, year, employees count, and total salary are required" });
      }

      // Parse and validate numeric values
      const yearNum = parseInt(String(year), 10);
      const employeesCountNum = parseInt(String(employeesCount), 10);
      const totalSalaryNum = parseInt(String(totalSalary), 10);
      const incentiveNum = incentive ? parseInt(String(incentive), 10) : 0;
      const toolsCostNum = toolsCost ? parseInt(String(toolsCost), 10) : 0;
      const rentNum = rent ? parseInt(String(rent), 10) : 0;
      const otherExpensesNum = otherExpenses ? parseInt(String(otherExpenses), 10) : 0;

      // Validate parsed values
      if (isNaN(yearNum) || isNaN(employeesCountNum) || isNaN(totalSalaryNum) ||
        isNaN(incentiveNum) || isNaN(toolsCostNum) || isNaN(rentNum) || isNaN(otherExpensesNum)) {
        return res.status(400).json({ message: "Invalid numeric values in cash outflow data" });
      }

      const cashOutflowData = {
        month: String(month),
        year: yearNum,
        employeesCount: employeesCountNum,
        totalSalary: totalSalaryNum,
        incentive: incentiveNum,
        toolsCost: toolsCostNum,
        rent: rentNum,
        otherExpenses: otherExpensesNum,
        createdAt: new Date().toISOString()
      };

      const cashOutflow = await storage.createCashOutflow(cashOutflowData);
      res.status(201).json({ message: "Cash outflow created successfully", cashOutflow });
    } catch (error: any) {
      console.error("Create cash outflow error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Cash outflow entry already exists for this month and year" });
      }
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return res.status(500).json({
          message: "Database table not found. Please run 'npm run db:push' to create the cash_outflows table.",
          error: error.message
        });
      }
      res.status(500).json({
        message: "Failed to create cash outflow",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Get all cash outflows
  app.get("/api/admin/cash-outflows", requireAdminAuth, async (req, res) => {
    try {
      const cashOutflows = await storage.getAllCashOutflows();
      res.json(cashOutflows);
    } catch (error) {
      console.error("Get cash outflows error:", error);
      res.status(500).json({ message: "Failed to get cash outflows" });
    }
  });

  // Update cash outflow
  app.put("/api/admin/cash-outflows/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { month, year, employeesCount, totalSalary, incentive, toolsCost, rent, otherExpenses } = req.body;

      if (!month || !year || employeesCount === undefined || totalSalary === undefined) {
        return res.status(400).json({ message: "Month, year, employees count, and total salary are required" });
      }

      // Parse and validate numeric values
      const yearNum = parseInt(String(year), 10);
      const employeesCountNum = parseInt(String(employeesCount), 10);
      const totalSalaryNum = parseInt(String(totalSalary), 10);
      const incentiveNum = incentive ? parseInt(String(incentive), 10) : 0;
      const toolsCostNum = toolsCost ? parseInt(String(toolsCost), 10) : 0;
      const rentNum = rent ? parseInt(String(rent), 10) : 0;
      const otherExpensesNum = otherExpenses ? parseInt(String(otherExpenses), 10) : 0;

      // Validate parsed values
      if (isNaN(yearNum) || isNaN(employeesCountNum) || isNaN(totalSalaryNum) ||
        isNaN(incentiveNum) || isNaN(toolsCostNum) || isNaN(rentNum) || isNaN(otherExpensesNum)) {
        return res.status(400).json({ message: "Invalid numeric values in cash outflow data" });
      }

      const updateData = {
        month: String(month),
        year: yearNum,
        employeesCount: employeesCountNum,
        totalSalary: totalSalaryNum,
        incentive: incentiveNum,
        toolsCost: toolsCostNum,
        rent: rentNum,
        otherExpenses: otherExpensesNum
      };

      const updated = await storage.updateCashOutflow(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Cash outflow not found" });
      }

      res.json({ message: "Cash outflow updated successfully", cashOutflow: updated });
    } catch (error: any) {
      console.error("Update cash outflow error:", error);
      res.status(500).json({
        message: "Failed to update cash outflow",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Delete cash outflow
  app.delete("/api/admin/cash-outflows/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCashOutflow(id);

      if (!deleted) {
        return res.status(404).json({ message: "Cash outflow not found" });
      }

      res.json({ message: "Cash outflow deleted successfully" });
    } catch (error) {
      console.error("Delete cash outflow error:", error);
      res.status(500).json({ message: "Failed to delete cash outflow" });
    }
  });

  // Update revenue mapping
  app.put("/api/admin/revenue-mappings/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        talentAdvisorId,
        teamLeadId,
        year,
        quarter,
        position,
        clientId,
        clientType,
        partnerName,
        offeredDate,
        closureDate,
        percentage,
        revenue,
        incentivePlan,
        incentive,
        source,
        invoiceDate,
        invoiceNumber,
        receivedPayment,
        paymentDetails,
        paymentStatus,
        incentivePaidMonth,
      } = req.body;

      // Fetch employee and client information if IDs are being updated
      let talentAdvisorName, teamLeadName, clientName;

      if (talentAdvisorId) {
        const talentAdvisor = await storage.getEmployeeById(talentAdvisorId);
        if (!talentAdvisor) {
          return res.status(400).json({ message: "Talent advisor not found" });
        }
        talentAdvisorName = talentAdvisor.name;
      }

      if (teamLeadId) {
        const teamLead = await storage.getEmployeeById(teamLeadId);
        if (!teamLead) {
          return res.status(400).json({ message: "Team lead not found" });
        }
        teamLeadName = teamLead.name;
      }

      if (clientId) {
        const client = await storage.getClientById(clientId);
        if (!client) {
          return res.status(400).json({ message: "Client not found" });
        }
        clientName = client.brandName;
      }

      const updateData: any = {};
      if (talentAdvisorId) updateData.talentAdvisorId = talentAdvisorId;
      if (talentAdvisorName) updateData.talentAdvisorName = talentAdvisorName;
      if (teamLeadId) updateData.teamLeadId = teamLeadId;
      if (teamLeadName) updateData.teamLeadName = teamLeadName;
      if (year) updateData.year = parseInt(year);
      if (quarter) updateData.quarter = quarter;
      if (position) updateData.position = position;
      if (clientId) updateData.clientId = clientId;
      if (clientName) updateData.clientName = clientName;
      if (clientType) updateData.clientType = clientType;
      if (partnerName !== undefined) updateData.partnerName = clientType === "Partner" ? partnerName : null;
      if (offeredDate) updateData.offeredDate = offeredDate;
      if (closureDate) updateData.closureDate = closureDate;
      if (percentage) updateData.percentage = parseFloat(percentage);
      if (revenue) updateData.revenue = parseFloat(revenue);
      if (incentivePlan) updateData.incentivePlan = incentivePlan;
      if (incentive) updateData.incentive = parseFloat(incentive);
      if (source) updateData.source = source;
      if (invoiceDate) updateData.invoiceDate = invoiceDate;
      if (invoiceNumber) updateData.invoiceNumber = invoiceNumber;
      if (receivedPayment !== undefined) updateData.receivedPayment = receivedPayment ? parseFloat(receivedPayment) : null;
      if (paymentDetails) updateData.paymentDetails = paymentDetails;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (incentivePaidMonth) updateData.incentivePaidMonth = incentivePaidMonth;

      const updatedRevenueMapping = await storage.updateRevenueMapping(id, updateData);

      if (!updatedRevenueMapping) {
        return res.status(404).json({ message: "Revenue mapping not found" });
      }

      await syncAllTargetMappingsFromRevenue(storage);

      res.json({
        message: "Revenue mapping updated successfully",
        revenueMapping: updatedRevenueMapping,
      });
    } catch (error: any) {
      console.error("Update revenue mapping error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid revenue mapping data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update revenue mapping" });
    }
  });

  // Delete revenue mapping
  app.delete("/api/admin/revenue-mappings/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRevenueMapping(id);

      if (!deleted) {
        return res.status(404).json({ message: "Revenue mapping not found" });
      }

      await syncAllTargetMappingsFromRevenue(storage);

      res.json({ message: "Revenue mapping deleted successfully" });
    } catch (error) {
      console.error("Delete revenue mapping error:", error);
      res.status(500).json({ message: "Failed to delete revenue mapping" });
    }
  });

  // ===================== PERFORMANCE PAGE API ENDPOINTS =====================

  // Performance Graph Data - Returns resume delivery counts grouped by time period
  app.get("/api/admin/performance-graph", requireAdminAuth, async (req, res) => {
    try {
      const { teamId, dateFrom, dateTo, period = 'monthly' } = req.query;
      const { employees, deliveries, requirements } = await import("@shared/schema");

      // Get all deliveries
      const allDeliveries = await db.select().from(deliveries);

      // Get all requirements
      const allRequirements = await db.select().from(requirements);

      let filteredDeliveries = allDeliveries;
      let filteredRequirements = allRequirements;

      if (dateFrom || dateTo) {
        filteredDeliveries = allDeliveries.filter(delivery => {
          const deliveryDate = new Date(delivery.deliveredAt);
          if (dateFrom && new Date(dateFrom as string) > deliveryDate) return false;
          if (dateTo && new Date(dateTo as string) < deliveryDate) return false;
          return true;
        });

        filteredRequirements = allRequirements.filter(req => {
          const reqDate = new Date(req.createdAt);
          if (dateFrom && new Date(dateFrom as string) > reqDate) return false;
          if (dateTo && new Date(dateTo as string) < reqDate) return false;
          return true;
        });
      }

      // Filter by team if provided
      if (teamId && teamId !== 'all') {
        const normalizedTeamId = String(teamId).toLowerCase();
        const teamLeader = await db.execute(sql`
          SELECT id, employee_id, name
          FROM employees
          WHERE LOWER(id) = ${normalizedTeamId}
             OR LOWER(employee_id) = ${normalizedTeamId}
             OR LOWER(name) = ${normalizedTeamId}
          LIMIT 1
        `);

        const teamLeaderRow = teamLeader.rows?.[0] as any;
        if (teamLeaderRow) {
          filteredRequirements = filteredRequirements.filter((req: any) => {
            const teamLeadRaw = String(req.teamLead || "").toLowerCase();
            return (
              teamLeadRaw === String(teamLeaderRow.id || "").toLowerCase() ||
              teamLeadRaw === String(teamLeaderRow.employee_id || "").toLowerCase() ||
              teamLeadRaw === String(teamLeaderRow.name || "").toLowerCase()
            );
          });
          const allowedRequirementIds = new Set(filteredRequirements.map((req: any) => req.id));
          filteredDeliveries = filteredDeliveries.filter((delivery: any) => allowedRequirementIds.has(delivery.requirementId));
        } else {
          filteredRequirements = [];
          filteredDeliveries = [];
        }
      }

      // Group data by time period
      const periodData: Record<string, { resumesA: number; resumesB: number }> = {};

      // Helper function to get period key
      const getPeriodKey = (date: Date, periodType: string): string => {
        if (periodType === 'monthly') {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        } else if (periodType === 'quarterly') {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          return `Q${quarter} ${date.getFullYear()}`;
        } else { // yearly
          return date.getFullYear().toString();
        }
      };

      // Process deliveries (Delivered - resumesA)
      filteredDeliveries.forEach(delivery => {
        const deliveryDate = new Date(delivery.deliveredAt);
        const periodKey = getPeriodKey(deliveryDate, period as string);

        if (!periodData[periodKey]) {
          periodData[periodKey] = { resumesA: 0, resumesB: 0 };
        }
        periodData[periodKey].resumesA += 1;
      });

      // Process requirements (Required - resumesB)
      filteredRequirements.forEach(req => {
        const reqDate = new Date(req.createdAt);
        const periodKey = getPeriodKey(reqDate, period as string);

        if (!periodData[periodKey]) {
          periodData[periodKey] = { resumesA: 0, resumesB: 0 };
        }

        // Calculate expected resumes based on criticality
        if (req.criticality === 'HIGH') periodData[periodKey].resumesB += 1;
        else if (req.criticality === 'MEDIUM') periodData[periodKey].resumesB += 3;
        else periodData[periodKey].resumesB += 5;
      });

      // Convert to array and sort by period
      const performanceData = Object.entries(periodData).map(([periodKey, data]) => ({
        period: periodKey,
        resumesA: data.resumesA,
        resumesB: data.resumesB
      }));

      // Sort by period
      performanceData.sort((a, b) => {
        if (period === 'monthly') {
          // Parse "Jan 2024" format
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const [monthA, yearA] = a.period.split(' ');
          const [monthB, yearB] = b.period.split(' ');
          if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
          return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
        } else if (period === 'quarterly') {
          const [qA, yA] = a.period.split(' ');
          const [qB, yB] = b.period.split(' ');
          if (yA !== yB) return parseInt(yA) - parseInt(yB);
          return parseInt(qA.substring(1)) - parseInt(qB.substring(1));
        } else { // yearly
          return parseInt(a.period) - parseInt(b.period);
        }
      });

      // Fill in missing periods to ensure complete display
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const completeData: Array<{ period: string; resumesA: number; resumesB: number }> = [];
      const periodMap = new Map(performanceData.map(item => [item.period, item]));

      if (period === 'monthly') {
        // Show all 12 months of the current year (or year range if data spans multiple years)
        const years = new Set(performanceData.map(item => item.period.split(' ')[1] || now.getFullYear().toString()));
        const yearList = years.size > 0 ? Array.from(years).map(y => parseInt(y)).sort() : [now.getFullYear()];

        // If data spans multiple years, show all months for all years
        if (yearList.length > 1) {
          for (const year of yearList) {
            for (let month = 0; month < 12; month++) {
              const periodKey = `${monthNames[month]} ${year}`;
              const existing = periodMap.get(periodKey);
              completeData.push({
                period: periodKey,
                resumesA: existing?.resumesA ?? 0,
                resumesB: existing?.resumesB ?? 0
              });
            }
          }
        } else {
          // Single year - show last 12 months
          for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const periodKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            const existing = periodMap.get(periodKey);
            completeData.push({
              period: periodKey,
              resumesA: existing?.resumesA ?? 0,
              resumesB: existing?.resumesB ?? 0
            });
          }
        }
      } else if (period === 'quarterly') {
        // Show all 4 quarters for years that have data
        const years = new Set(performanceData.map(item => {
          const parts = item.period.split(' ');
          return parts.length > 1 ? parts[1] : now.getFullYear().toString();
        }));
        const yearList = years.size > 0 ? Array.from(years).map(y => parseInt(y)).sort() : [now.getFullYear()];

        for (const year of yearList) {
          for (let q = 1; q <= 4; q++) {
            const periodKey = `Q${q} ${year}`;
            const existing = periodMap.get(periodKey);
            completeData.push({
              period: periodKey,
              resumesA: existing?.resumesA ?? 0,
              resumesB: existing?.resumesB ?? 0
            });
          }
        }
      } else { // yearly
        // Show all years that have data (no need to fill gaps)
        return res.json(performanceData);
      }

      res.json(completeData);
    } catch (error) {
      console.error("Performance graph error:", error);
      res.status(500).json({ message: "Failed to get performance graph data" });
    }
  });

  // Default Rate (Individual) - Returns completion stats by criticality for a specific member
  app.get("/api/admin/default-rate/:memberId", requireAdminAuth, async (req, res) => {
    try {
      const { memberId } = req.params;
      const { dateFrom, dateTo } = req.query;
      const { employees, requirements } = await import("@shared/schema");

      // Get the member (excluding last_login_at)
      const employeesResult = await db.execute(sql`
        SELECT id, employee_id, name, email, password, role, address, designation, phone, 
               department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
               father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
               increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
               current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
               branch, city, reporting_to, is_active, created_at, profile_picture
        FROM employees
      `);
      const allEmployees = employeesResult.rows as any[];
      const member = allEmployees.find(emp => emp.id === memberId || emp.name === memberId);

      if (!member) {
        return res.json({
          memberName: memberId,
          stats: {}
        });
      }

      // Get requirements assigned to this member
      const allRequirements = await db.select().from(requirements);
      let memberRequirements = allRequirements.filter(req =>
        req.talentAdvisor?.toLowerCase() === member.name.toLowerCase() ||
        req.talentAdvisorId === member.id
      );

      // Filter by date if provided
      if (dateFrom || dateTo) {
        memberRequirements = memberRequirements.filter(req => {
          const reqDate = new Date(req.createdAt);
          if (dateFrom && new Date(dateFrom as string) > reqDate) return false;
          if (dateTo && new Date(dateTo as string) < reqDate) return false;
          return true;
        });
      }

      // Group by criticality and toughness combination
      const criticalityMap: Record<string, { total: number, completed: number }> = {
        'HT': { total: 0, completed: 0 }, // High criticality, Tough
        'HM': { total: 0, completed: 0 }, // High criticality, Medium
        'MM': { total: 0, completed: 0 }, // Medium criticality, Medium
        'ME': { total: 0, completed: 0 }  // Medium/Low criticality, Easy
      };

      memberRequirements.forEach(req => {
        let key = '';
        if (req.criticality === 'HIGH' && req.toughness === 'Tough') key = 'HT';
        else if (req.criticality === 'HIGH') key = 'HM';
        else if (req.criticality === 'MEDIUM' && req.toughness !== 'Easy') key = 'MM';
        else key = 'ME';

        if (criticalityMap[key]) {
          criticalityMap[key].total++;
          if (req.status === 'completed') {
            criticalityMap[key].completed++;
          }
        }
      });

      res.json({
        memberName: member.name,
        stats: criticalityMap
      });
    } catch (error) {
      console.error("Default rate error:", error);
      res.status(500).json({ message: "Failed to get default rate data" });
    }
  });

  // Team Performance Data - Returns team member performance metrics
  app.get("/api/admin/team-performance", requireAdminAuth, async (req, res) => {
    try {
      const { employees, targetMappings, revenueMappings } = await import("@shared/schema");

      // Get all active recruiters/team members (excluding last_login_at)
      const employeesResult = await db.execute(sql`
        SELECT id, employee_id, name, email, password, role, address, designation, phone, 
               department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
               father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
               increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
               current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
               branch, city, reporting_to, is_active, created_at, profile_picture
        FROM employees
      `);
      const allEmployees = employeesResult.rows as any[];
      const teamMembers = allEmployees.filter(emp =>
        (emp.role === 'recruiter' || emp.role === 'team_leader') && emp.is_active === true
      );

      // Get all target mappings
      const allTargetMappings = await db.select().from(targetMappings);

      // Get all revenue mappings for closures
      const allRevenueMappings = await db.select().from(revenueMappings);

      // Build team performance data
      const performanceData = teamMembers.map(member => {
        // Get target mappings for this member
        const memberTargets = allTargetMappings.filter(tm =>
          tm.teamMemberId === member.id
        );

        // Get closures for this member
        const memberClosures = allRevenueMappings.filter(rm =>
          rm.talentAdvisorId === member.id ||
          rm.talentAdvisorName.toLowerCase() === member.name.toLowerCase()
        );

        // Calculate tenure
        let tenure = "N/A";
        if (member.joiningDate) {
          const joinDate = new Date(member.joiningDate);
          const now = new Date();
          const years = Math.floor((now.getTime() - joinDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          const months = Math.floor(((now.getTime() - joinDate.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
          if (years > 0) {
            tenure = `${years} yr${years > 1 ? 's' : ''},${months} month${months !== 1 ? 's' : ''}`;
          } else {
            tenure = `${months} month${months !== 1 ? 's' : ''}`;
          }
        }

        // Get last closure date
        let lastClosure = "N/A";
        if (memberClosures.length > 0) {
          const lastClosureRecord = memberClosures.sort((a, b) => {
            const dateA = a.closureDate ? new Date(a.closureDate).getTime() : 0;
            const dateB = b.closureDate ? new Date(b.closureDate).getTime() : 0;
            return dateB - dateA;
          })[0];
          if (lastClosureRecord.closureDate) {
            lastClosure = lastClosureRecord.closureDate;
          }
        }

        const enrichedMemberTargets = memberTargets.map((tm) =>
          enrichTargetMappingWithRevenue(tm, allRevenueMappings),
        );

        const quartersAchieved = countQuartersTargetMet(enrichedMemberTargets);

        const totalRevenue = memberClosures.reduce(
          (sum, rm) => sum + (Number(rm.revenue) || 0),
          0,
        );

        const totalTarget = enrichedMemberTargets.reduce(
          (sum, tm) => sum + (tm.minimumTarget || 0),
          0,
        );
        const totalAchieved = enrichedMemberTargets.reduce(
          (sum, tm) => sum + (tm.targetAchieved || 0),
          0,
        );
        const targetAchievement =
          totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

        return {
          id: member.id,
          talentAdvisor: member.name,
          joiningDate: member.joiningDate || "N/A",
          tenure,
          closures: memberClosures.length,
          lastClosure,
          qtrsAchieved: quartersAchieved,
          targetAchievement,
          totalRevenue: totalRevenue.toLocaleString('en-IN')
        };
      });

      res.json(performanceData);
    } catch (error) {
      console.error("Team performance error:", error);
      res.status(500).json({ message: "Failed to get team performance data" });
    }
  });

  // Closures List Data - Returns detailed closure information
  app.get("/api/admin/closures-list", requireAdminAuth, async (req, res) => {
    try {
      const { revenueMappings } = await import("@shared/schema");
      await ensureClosureActionsTable();

      let allRevenueMappings: any[] = [];
      try {
        allRevenueMappings = await db.select().from(revenueMappings);
      } catch (error) {
        console.warn("Closures list revenue mappings fallback:", error);
      }
      const closureActionsResult = await db.execute(sql`
        SELECT revenue_mapping_id, action_type, action_date, reason, day_bucket, updated_at
        FROM closure_actions
      `);
      const closureActionRows = closureActionsResult.rows as Array<{
        revenue_mapping_id?: string;
        action_type?: string;
        action_date?: string | null;
        reason?: string | null;
        day_bucket?: string | null;
        updated_at?: string | null;
      }>;
      const closureActionMap = new Map(
        closureActionRows
          .filter((row) => row.revenue_mapping_id)
          .map((row) => [
            row.revenue_mapping_id as string,
            {
              type: row.action_type || null,
              date: row.action_date || null,
              reason: row.reason || null,
              dayBucket: row.day_bucket || null,
              updatedAt: row.updated_at || null,
            }
          ])
      );
      const allApplications = await storage.getAllJobApplications();
      const activeRequirements = await storage.getRequirements();
      const archivedRequirements = await storage.getArchivedRequirements();
      const allKnownRequirements = [...activeRequirements, ...archivedRequirements];

      // Transform to closure list format for "All Closure Reports" modal
      // Keep newest closures on top (based on closureDate / createdAt / offeredDate).
      const closuresList = allRevenueMappings
        .sort((a, b) => getRevenueMappingRecencyTs(b) - getRevenueMappingRecencyTs(a))
        .map(rm => {
        // Calculate Fixed CTC from revenue and percentage
        const fixedCTC = rm.revenue && rm.percentage ? (rm.revenue / (rm.percentage / 100)) : 0;

        // Format dates to DD-MM-YYYY format
        const formatDate = (dateStr: string | null | undefined): string => {
          if (!dateStr) return "N/A";
          try {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          } catch {
            return dateStr; // Return as-is if parsing fails
          }
        };

        // Determine status: if closureDate exists, it's "Joined", otherwise "Pending"
        const status = rm.closureDate ? "Joined" : "Pending";
        const matchedApplication = allApplications.find((app: any) =>
          (app.candidateName || '').trim().toLowerCase() === (rm.candidateName || '').trim().toLowerCase() &&
          (app.jobTitle || '').trim().toLowerCase() === (rm.position || '').trim().toLowerCase() &&
          (app.company || '').trim().toLowerCase() === (rm.clientName || '').trim().toLowerCase()
        );
        const sourceRequirement = matchedApplication?.requirementId
          ? allKnownRequirements.find((req: any) => req.id === matchedApplication.requirementId || req.originalId === matchedApplication.requirementId)
          : null;
        const closureAction = closureActionMap.get(rm.id) || null;

        return {
          id: rm.id,
          candidate: rm.candidateName || "N/A",
          position: rm.position,
          client: rm.clientName,
          talentAdvisor: rm.talentAdvisorName,
          fixedCTC: fixedCTC > 0 ? `₹${fixedCTC.toLocaleString('en-IN')}` : "N/A",
          offeredDate: formatDate(rm.offeredDate),
          joinedDate: formatDate(rm.closureDate),
          offeredDateRaw: rm.offeredDate || null,
          joinedDateRaw: rm.closureDate || null,
          status: status,
          sourceRequirement: sourceRequirement
            ? {
              id: sourceRequirement.id,
              originalId: sourceRequirement.originalId || sourceRequirement.id,
              position: sourceRequirement.position,
              noOfPositions: sourceRequirement.noOfPositions ?? 1,
              splitRequirement: sourceRequirement.splitRequirement ?? false,
              criticality: sourceRequirement.criticality,
              toughness: sourceRequirement.toughness,
              company: sourceRequirement.company,
              spoc: sourceRequirement.spoc,
              talentAdvisor: sourceRequirement.talentAdvisor || rm.talentAdvisorName || null,
              teamLead: sourceRequirement.teamLead || rm.teamLeadName || null,
              jdFile: sourceRequirement.jdFile || null,
              jdText: sourceRequirement.jdText || null,
              sourceType: sourceRequirement.sourceType || null,
              sourceDetails: sourceRequirement.sourceDetails || null,
            }
            : null,
          // Keep these for backward compatibility with other closures endpoints
          quarter: `${rm.quarter}, ${rm.year}`,
          ctc: fixedCTC > 0 ? fixedCTC.toLocaleString('en-IN') : "N/A",
          revenue: rm.revenue ? rm.revenue.toLocaleString('en-IN') : "0",
          closureAction,
        };
      });

      res.json(closuresList);
    } catch (error) {
      console.error("Closures list error:", error);
      res.status(500).json({ message: "Failed to get closures list" });
    }
  });

  app.post("/api/admin/closures-list/:id/action", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { actionType, actionDate, reason } = req.body as {
        actionType?: string;
        actionDate?: string;
        reason?: string;
      };

      if (!actionType || !['offer-drop', 'early-exit'].includes(actionType)) {
        return res.status(400).json({ message: "Invalid closure action type" });
      }

      await ensureClosureActionsTable();
      const allRevenueMappings = await storage.getAllRevenueMappings();
      const revenueMapping = allRevenueMappings.find((mapping: any) => mapping.id === id);
      if (!revenueMapping) {
        return res.status(404).json({ message: "Closure report not found" });
      }

      if (actionType === 'offer-drop') {
        const allApplications = await storage.getAllJobApplications();
        let matchedApplications = allApplications.filter((app: any) =>
          (app.candidateName || '').trim().toLowerCase() === (revenueMapping.candidateName || '').trim().toLowerCase() &&
          (app.jobTitle || '').trim().toLowerCase() === (revenueMapping.position || '').trim().toLowerCase() &&
          (app.company || '').trim().toLowerCase() === (revenueMapping.clientName || '').trim().toLowerCase()
        );

        if (matchedApplications.length === 0) {
          matchedApplications = allApplications.filter((app: any) =>
            (app.candidateName || '').trim().toLowerCase() === (revenueMapping.candidateName || '').trim().toLowerCase() &&
            (app.jobTitle || '').trim().toLowerCase() === (revenueMapping.position || '').trim().toLowerCase()
          );
        }

        await Promise.all(
          matchedApplications.map((app: any) => storage.updateJobApplicationStatus(app.id, 'Offer Drop'))
        );
      }

      const now = new Date().toISOString();
      const normalizedActionDate = actionDate?.trim() || null;
      const normalizedReason = reason?.trim() || null;
      const dayBucket = actionType === 'early-exit'
        ? getEarlyExitDayBucket(revenueMapping.closureDate, normalizedActionDate)
        : null;

      await db.execute(sql`
        INSERT INTO closure_actions (
          revenue_mapping_id,
          action_type,
          action_date,
          reason,
          day_bucket,
          created_at,
          updated_at
        )
        VALUES (
          ${id},
          ${actionType},
          ${normalizedActionDate},
          ${normalizedReason},
          ${dayBucket},
          ${now},
          ${now}
        )
        ON CONFLICT (revenue_mapping_id)
        DO UPDATE SET
          action_type = EXCLUDED.action_type,
          action_date = EXCLUDED.action_date,
          reason = EXCLUDED.reason,
          day_bucket = EXCLUDED.day_bucket,
          updated_at = EXCLUDED.updated_at
      `);

      res.json({ message: "Closure action saved successfully" });
    } catch (error) {
      console.error("Closure action error:", error);
      res.status(500).json({ message: "Failed to save closure action" });
    }
  });

  // Revenue Analysis Data - Returns revenue by team member for chart
  app.get("/api/admin/revenue-analysis", requireAdminAuth, async (req, res) => {
    try {
      const { teamId, dateFrom, dateTo, period = 'monthly' } = req.query;
      const { employees, revenueMappings } = await import("@shared/schema");

      // Get all active employees (excluding last_login_at)
      const employeesResult = await db.execute(sql`
        SELECT id, employee_id, name, email, password, role, address, designation, phone, 
               department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
               father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
               increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
               current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
               branch, city, reporting_to, is_active, created_at, profile_picture
        FROM employees
      `);
      const allEmployees = employeesResult.rows as any[];
      const teamLeaders = allEmployees.filter(emp => emp.role === 'team_leader' && emp.is_active === true);
      const recruiters = allEmployees.filter(emp =>
        (emp.role === 'recruiter' || emp.role === 'team_leader') && emp.is_active === true
      );

      // Get all revenue mappings
      let allRevenueMappings = await db.select().from(revenueMappings);

      // Filter by date range if provided
      if (dateFrom || dateTo) {
        allRevenueMappings = allRevenueMappings.filter(rm => {
          const rmDate = rm.closureDate ? new Date(rm.closureDate) : new Date(rm.createdAt);
          if (dateFrom && new Date(dateFrom as string) > rmDate) return false;
          if (dateTo && new Date(dateTo as string) < rmDate) return false;
          return true;
        });
      }

      let targetMembers: typeof recruiters = [];

      // Filter by team if specified
      if (teamId && teamId !== 'all') {
        // Find the team leader - try matching by id, name, or employeeId (case-insensitive)
        const teamIdLower = (teamId as string).toLowerCase();
        const teamLeader = teamLeaders.find(tl =>
          tl.id.toLowerCase() === teamIdLower ||
          tl.name.toLowerCase() === teamIdLower ||
          (tl.employeeId && tl.employeeId.toLowerCase() === teamIdLower)
        );

        if (teamLeader) {
          // Get only recruiters (TAs) reporting to this team leader (exclude TL)
          targetMembers = allEmployees.filter(rec => {
            const reportingTo = rec.reporting_to || rec.reportingTo;
            const isActive = rec.is_active !== undefined ? rec.is_active : rec.isActive;
            return rec.role === 'recruiter' &&
              isActive === true &&
              (reportingTo === teamLeader.employeeId ||
                reportingTo === teamLeader.name ||
                reportingTo === teamLeader.id ||
                (teamLeader.employeeId && reportingTo?.toLowerCase() === teamLeader.employeeId.toLowerCase()) ||
                (teamLeader.name && reportingTo?.toLowerCase() === teamLeader.name.toLowerCase()));
          });
        } else {
          // If team leader not found, return empty data
          return res.json({
            data: [],
            benchmark: 0
          });
        }
      } else {
        // All teams - show active recruiters so the chart is representative.
        targetMembers = allEmployees.filter((emp: any) =>
          emp.role === 'recruiter' && emp.is_active === true
        );
      }

      // Calculate total revenue per member
      const revenueData = targetMembers.map(member => {
        const memberRevenue = allRevenueMappings
          .filter(rm =>
            (rm.status === 'closed' || rm.status === 'Closed') &&
            (rm.talentAdvisorId === member.id ||
              rm.talentAdvisorName?.toLowerCase() === member.name.toLowerCase())
          )
          .reduce((sum, rm) => sum + (parseFloat(rm.revenue?.toString() || '0') || 0), 0);

        return {
          member: member.name,
          revenue: memberRevenue
        };
      }); // Keep all members, including zero values, to show graph structure

      // Calculate average for benchmark
      const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
      const avgRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

      res.json({
        data: revenueData,
        benchmark: avgRevenue
      });
    } catch (error) {
      console.error("Revenue analysis error:", error);
      res.status(500).json({ message: "Failed to get revenue analysis data" });
    }
  });

  // Performance Metrics - Returns current quarter targets and achievements
  app.get("/api/admin/performance-metrics", requireAdminAuth, async (req, res) => {
    try {
      const { targetMappings, revenueMappings } = await import("@shared/schema");

      // `period` is kept for existing dashboard callers.
      // `summaryScope` powers the right-side performance summary panel.
      const { period, summaryScope, summaryYear, summaryQuarter } = req.query;

      const allTargetMappings = await db.select().from(targetMappings);
      const allRevenueMappings = await db.select().from(revenueMappings);
      const quarterOrder: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
      const quarterMap: Record<string, string> = {
        'JFM': 'Q1', 'AMJ': 'Q2', 'JAS': 'Q3', 'OND': 'Q4',
        'Q1': 'Q1', 'Q2': 'Q2', 'Q3': 'Q3', 'Q4': 'Q4'
      };

      const availablePeriods: Array<{ year: number; quarter: string }> = [];

      allTargetMappings.forEach((target) => {
        if (target.year && target.quarter && quarterOrder[target.quarter]) {
          availablePeriods.push({ year: Number(target.year), quarter: target.quarter });
        }
      });

      allRevenueMappings.forEach((mapping) => {
        const mappedQuarter = quarterMap[mapping.quarter];
        if (mapping.year && mappedQuarter) {
          availablePeriods.push({ year: Number(mapping.year), quarter: mappedQuarter });
        }
      });

      const now = new Date();
      const fallbackQuarter = `Q${Math.floor(now.getMonth() / 3) + 1}`;
      const latestPeriod = availablePeriods.sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return quarterOrder[b.quarter] - quarterOrder[a.quarter];
      })[0] ?? { year: now.getFullYear(), quarter: fallbackQuarter };

      const targetYear = latestPeriod.year;
      const currentQuarter = latestPeriod.quarter;

      let filteredTargets = allTargetMappings.filter((target) =>
        Number(target.year) === targetYear && target.quarter === currentQuarter
      );
      let relevantClosures = allRevenueMappings.filter((mapping) => {
        const mappedQuarter = quarterMap[mapping.quarter];
        return mappedQuarter === currentQuarter && Number(mapping.year) === targetYear;
      });
      let summaryLabel = `${currentQuarter} ${targetYear}`;

      if (typeof summaryScope === 'string') {
        const requestedYear = Number(summaryYear) || targetYear;
        if (summaryScope === 'overall') {
          filteredTargets = allTargetMappings;
          relevantClosures = allRevenueMappings;
          summaryLabel = 'Overall';
        } else if (summaryScope === 'yearly') {
          filteredTargets = allTargetMappings.filter((target) => Number(target.year) === requestedYear);
          relevantClosures = allRevenueMappings.filter((mapping) => Number(mapping.year) === requestedYear);
          summaryLabel = `${requestedYear}`;
        } else if (summaryScope === 'quarterly') {
          const requestedQuarter = typeof summaryQuarter === 'string' && quarterOrder[summaryQuarter]
            ? summaryQuarter
            : currentQuarter;
          filteredTargets = allTargetMappings.filter((target) =>
            Number(target.year) === requestedYear && target.quarter === requestedQuarter
          );
          relevantClosures = allRevenueMappings.filter((mapping) => {
            const mappedQuarter = quarterMap[mapping.quarter];
            return mappedQuarter === requestedQuarter && Number(mapping.year) === requestedYear;
          });
          summaryLabel = `${requestedQuarter} ${requestedYear}`;
        }
      }

      const totalMinTarget = filteredTargets.reduce((sum, target) => sum + (target.minimumTarget || 0), 0);
      const totalAchieved = relevantClosures.reduce(
        (sum, mapping) => sum + (Number(mapping.revenue) || 0),
        0,
      );
      const totalIncentives = relevantClosures.reduce(
        (sum, mapping) => sum + (Number(mapping.incentive) || 0),
        0,
      );

      const totalRevenue = totalAchieved;
      const closuresCount = relevantClosures.length;

      // Calculate performance percentage for gauge (target progress; sensible fallback when targets unset)
      let performancePercentage = 0;
      if (totalMinTarget > 0) {
        performancePercentage = Math.min((totalAchieved / totalMinTarget) * 100, 100);
      } else if (totalAchieved > 0) {
        performancePercentage = 100;
      }

      res.json({
        currentQuarter: summaryLabel,
        minimumTarget: totalMinTarget,
        targetAchieved: totalAchieved,
        incentiveEarned: totalIncentives,
        totalRevenue,
        closuresCount,
        performancePercentage: Math.round(performancePercentage * 10) / 10,
        period: typeof period === 'string' ? period : 'quarterly'
      });
    } catch (error) {
      console.error("Performance metrics error:", error);
      res.status(500).json({ message: "Failed to get performance metrics" });
    }
  });

  // Monthly Performance Chart Data - Returns monthly revenue/closures by team or members
  app.get("/api/admin/monthly-performance", requireAdminAuth, async (req, res) => {
    try {
      const { team } = req.query; // 'all', 'arun', 'anusha', or team lead ID
      const { employees, revenueMappings, targetMappings } = await import("@shared/schema");

      // Get all team leaders and members (excluding last_login_at)
      const employeesResult = await db.execute(sql`
        SELECT id, employee_id, name, email, password, role, address, designation, phone, 
               department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
               father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
               increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
               current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
               branch, city, reporting_to, is_active, created_at, profile_picture
        FROM employees
      `);
      const allEmployees = employeesResult.rows as any[];
      const teamLeaders = allEmployees.filter(emp => emp.role === 'team_leader' && emp.is_active === true);
      const recruiters = allEmployees.filter(emp => emp.role === 'recruiter' && emp.is_active === true);

      // Get revenue mappings for closures/revenue data
      const allRevenueMappings = await db.select().from(revenueMappings);

      // Generate last 6 months
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          name: date.toLocaleString('default', { month: 'short' }),
          monthNum: date.getMonth() + 1,
          year: date.getFullYear()
        });
      }

      // Calculate monthly data
      const monthlyData = months.map(month => {
        const monthRevenueMappings = allRevenueMappings.filter(rm => {
          if (!rm.closureDate) return false;
          const closureDate = new Date(rm.closureDate);
          return closureDate.getMonth() + 1 === month.monthNum && closureDate.getFullYear() === month.year;
        });

        // Group by team leader
        const teamData: Record<string, number> = {};
        const memberData: Record<string, number> = {};

        teamLeaders.forEach(tl => {
          // Get recruiters reporting to this TL
          const teamRecruiters = recruiters.filter(r => {
            const reportingTo = r.reporting_to || r.reportingTo;
            const tlEmployeeId = tl.employee_id || tl.employeeId;
            return reportingTo === tlEmployeeId || reportingTo === tl.name;
          });
          const teamMemberIds = [tl.id, ...teamRecruiters.map(r => r.id)];
          const teamMemberNames = [tl.name.toLowerCase(), ...teamRecruiters.map(r => r.name.toLowerCase())];

          // Calculate team revenue
          const teamRevenue = monthRevenueMappings
            .filter(rm => teamMemberIds.includes(rm.talentAdvisorId) || teamMemberNames.includes(rm.talentAdvisorName.toLowerCase()))
            .reduce((sum, rm) => sum + (rm.revenue || 0), 0);

          const tlName = tl.name;
          teamData[tlName] = teamRevenue;

          // Calculate individual member revenue for team detail view
          teamRecruiters.forEach(recruiter => {
            const memberRevenue = monthRevenueMappings
              .filter(rm => rm.talentAdvisorId === recruiter.id || rm.talentAdvisorName.toLowerCase() === recruiter.name.toLowerCase())
              .reduce((sum, rm) => sum + (rm.revenue || 0), 0);
            memberData[recruiter.name.toLowerCase().replace(/\s+/g, '')] = memberRevenue;
          });
        });

        return {
          month: month.name,
          ...teamData,
          ...memberData
        };
      });

      // Get unique team names from team leaders
      const teamKeys = [...new Set(teamLeaders.map(tl => tl.name))];

      const memberNames = recruiters.map(r => ({
        key: r.name.toLowerCase().replace(/\s+/g, ''),
        name: r.name,
        teamLeader: r.reporting_to || r.reportingTo
      }));

      res.json({
        data: monthlyData,
        teams: teamKeys,
        members: memberNames
      });
    } catch (error) {
      console.error("Monthly performance error:", error);
      res.status(500).json({ message: "Failed to get monthly performance data" });
    }
  });

  // Reset Performance Data - Clears target and revenue mappings
  app.delete("/api/admin/reset-performance-data", requireAdminAuth, async (req, res) => {
    try {
      const { targetMappings, revenueMappings } = await import("@shared/schema");

      // Clear all target mappings
      await db.delete(targetMappings);

      // Clear all revenue mappings  
      await db.delete(revenueMappings);

      res.json({
        message: "Performance data reset successfully. All target and revenue mappings have been cleared.",
        success: true
      });
    } catch (error) {
      console.error("Reset performance data error:", error);
      res.status(500).json({ message: "Failed to reset performance data" });
    }
  });

  // Reset Master Data - Clears resumes/candidates and related data
  app.delete("/api/admin/reset-master-data", requireAdminAuth, async (req, res) => {
    try {
      const { candidates, deliveries } = await import("@shared/schema");

      // Clear all deliveries first (depends on candidates)
      await db.delete(deliveries);

      // Clear all candidates/resumes
      await db.delete(candidates);

      res.json({
        message: "Master data reset successfully. All resumes and candidates have been cleared.",
        success: true
      });
    } catch (error) {
      console.error("Reset master data error:", error);
      res.status(500).json({ message: "Failed to reset master data" });
    }
  });

  // Get all team members list (recruiters and TAs) for dropdown selection
  app.get("/api/admin/team-members-list", requireAdminAuth, async (req, res) => {
    try {
      const { employees } = await import("@shared/schema");

      // Get all employees (excluding last_login_at)
      const employeesResult = await db.execute(sql`
        SELECT id, employee_id, name, email, password, role, address, designation, phone, 
               department, joining_date, employment_status, esic, epfo, esic_no, epfo_no,
               father_name, mother_name, father_number, mother_number, offered_ctc, current_status,
               increment_count, appraised_quarter, appraised_amount, appraised_year, yearly_ctc,
               current_monthly_ctc, name_as_per_bank, account_number, ifsc_code, bank_name,
               branch, city, reporting_to, is_active, created_at, profile_picture
        FROM employees
      `);
      const allEmployees = employeesResult.rows as any[];
      const teamMembers = allEmployees
        .filter(emp => (emp.role === 'recruiter' || emp.role === 'team_leader') && emp.is_active === true)
        .map(emp => ({
          id: emp.id,
          name: emp.name,
          role: emp.role
        }));

      res.json(teamMembers);
    } catch (error) {
      console.error("Team members list error:", error);
      res.status(500).json({ message: "Failed to get team members list" });
    }
  });

  // ===================== RECRUITER JOBS ROUTES =====================

  // Create a new recruiter job posting
  app.post("/api/recruiter/jobs", requireEmployeeAuth, async (req, res) => {
    try {
      const {
        title,
        company,
        companyTagline,
        companyType,
        market,
        location,
        locationType,
        experienceMin,
        experienceMax,
        salaryMin,
        salaryMax,
        description,
        requirements,
        responsibilities,
        primarySkills,
        secondarySkills,
        knowledgeOnly,
        department,
        employmentType,
        openings,
        status,
        companyLogo
      } = req.body;

      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const ownerRole = normalizeSourcingRole(employee.role);
      if (!ownerRole) {
        return res.status(403).json({ message: "Only recruiters and team leaders can post jobs" });
      }

      const recruiterId = employee.id;

      // Format experience as text (e.g., "2-5 years")
      let experienceText = '';
      if (experienceMin !== null && experienceMin !== undefined) {
        if (experienceMax !== null && experienceMax !== undefined) {
          experienceText = `${experienceMin}-${experienceMax} years`;
        } else {
          experienceText = `${experienceMin}+ years`;
        }
      }

      // Format salary as text (e.g., "10-15 LPA")
      let salaryText = '';
      if (salaryMin !== null && salaryMin !== undefined) {
        const minLPA = Math.round(salaryMin / 100000);
        if (salaryMax !== null && salaryMax !== undefined) {
          const maxLPA = Math.round(salaryMax / 100000);
          salaryText = `${minLPA}-${maxLPA} LPA`;
        } else {
          salaryText = `${minLPA}+ LPA`;
        }
      }

      const jobData = {
        recruiterId,
        ownerEmployeeId: employee.id,
        ownerRole,
        companyName: company || 'Company',
        companyTagline: companyTagline || null,
        companyType: companyType || null,
        companyLogo: companyLogo || null,
        market: market || null,
        field: department || null,
        noOfPositions: openings ? parseInt(openings as any) : 1,
        role: title || 'Job Role',
        experience: experienceText || '0-1 years',
        location: location || null,
        workMode: locationType || 'On-site',
        employmentType: employmentType || 'Full-time',
        salaryPackage: salaryText || null,
        aboutCompany: description || null,
        roleDefinitions: requirements || null,
        keyResponsibility: responsibilities || null,
        primarySkills: Array.isArray(primarySkills) ? JSON.stringify(primarySkills) : (req.body.skills ? JSON.stringify(req.body.skills) : '[]'),
        secondarySkills: Array.isArray(secondarySkills) ? JSON.stringify(secondarySkills) : '[]',
        knowledgeOnly: Array.isArray(knowledgeOnly) ? JSON.stringify(knowledgeOnly) : '[]',
        status: status || 'Active',
        applicationCount: 0,
        createdAt: new Date().toISOString()
      };

      const job = await storage.createRecruiterJob(jobData);
      res.status(201).json({ message: "Job posted successfully", job });
    } catch (error: any) {
      console.error("Create recruiter job error:", error);
      res.status(500).json({ message: "Failed to create job posting" });
    }
  });

  // Get recruiter jobs (filtered by logged-in user if authenticated)
  app.get("/api/recruiter/jobs", async (req, res) => {
    try {
      const session = req.session as any;
      let jobs;

      // If user is authenticated, filter jobs by their ID for multi-tenant support
      if (session?.employeeId) {
        const employee = await storage.getEmployeeById(session.employeeId);
        if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
        }

        const ownershipFilter = buildJobOwnershipFilter(employee);
        if (!ownershipFilter) {
          return res.status(403).json({ message: "Only recruiters and team leaders can access jobs" });
        }

        jobs = await db.select().from(recruiterJobs)
          .where(ownershipFilter)
          .orderBy(desc(recruiterJobs.postedDate));
      } else {
        // Fallback to all jobs for unauthenticated requests (job board view)
        jobs = await storage.getAllRecruiterJobs();
      }

      res.json(jobs);
    } catch (error) {
      console.error("Get recruiter jobs error:", error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  // Get job counts for dashboard (scoped by recruiter)
  app.get("/api/recruiter/jobs/counts", requireEmployeeAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const ownershipFilter = buildJobOwnershipFilter(employee);
      if (!ownershipFilter) {
        return res.status(403).json({ message: "Only recruiters and team leaders can access job counts" });
      }

      const jobs = await db.select().from(recruiterJobs)
        .where(ownershipFilter)
        .orderBy(desc(recruiterJobs.postedDate));
      const counts = {
        total: jobs.length,
        active: jobs.filter(j => j.status === "Active").length,
        closed: jobs.filter(j => j.status === "Closed").length,
        draft: jobs.filter(j => j.status === "Draft").length
      };
      res.json(counts);
    } catch (error) {
      console.error("Get job counts error:", error);
      res.status(500).json({ message: "Failed to get job counts" });
    }
  });

  // Recruiter create candidate (upload resume)
  app.post("/api/recruiter/candidates", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const ownerRole = normalizeSourcingRole(employee.role);
      if (!ownerRole) {
        return res.status(403).json({ message: "Only recruiters and team leaders can upload resumes" });
      }

      const recruiterName = employee.name;

      const { fullName, email, phone, designation, experience, skills, location, company, education, highestQualification, linkedinUrl, websiteUrl, portfolioUrl, noticePeriod, pedigreeLevel, companyLevel, companyDomain, resumeFile } = req.body;

      if (!fullName || !email) {
        return res.status(400).json({ message: "Full name and email are required" });
      }

      // Check if candidate already exists
      const existing = await storage.getCandidateByEmail(email.toLowerCase());
      if (existing) {
        return res.status(409).json({ message: "A candidate with this email already exists" });
      }

      const candidateId = await storage.generateNextCandidateId();

      const candidatePayload = {
        candidateId,
        fullName,
        email: email.toLowerCase(),
        phone: phone || null,
        designation: designation || null,
        experience: experience || null,
        skills: skills || null,
        location: location || null,
        company: company || null,
        education: education || null,
        currentRole: designation || null,
        linkedinUrl: linkedinUrl || null,
        websiteUrl: websiteUrl || null,
        portfolioUrl: portfolioUrl || null,
        noticePeriod: noticePeriod || null,
        pedigreeLevel: pedigreeLevel || null,
        companyLevel: companyLevel || null,
        companyDomain: companyDomain || null,
        resumeFile: resumeFile || null,
        ownerEmployeeId: employee.id,
        ownerRole,
        addedBy: recruiterName,
        pipelineStatus: 'New',
        isActive: true,
        isVerified: false,
        createdAt: new Date().toISOString()
      };

      let newCandidate;
      try {
        newCandidate = await storage.createCandidate(candidatePayload);
      } catch (error) {
        if (!isMissingCandidateOwnershipColumnError(error)) {
          throw error;
        }

        const { ownerEmployeeId, ownerRole: ignoredOwnerRole, ...legacyCandidatePayload } = candidatePayload;
        newCandidate = await storage.createCandidate(legacyCandidatePayload);
      }

      // Log activity
      await logCandidateSubmitted(recruiterName, newCandidate.candidateId, newCandidate.fullName);

      res.json({
        success: true,
        message: "Candidate created successfully",
        candidate: newCandidate
      });
    } catch (error: any) {
      console.error('Create candidate error:', error);
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "A candidate with this email already exists" });
      }
      res.status(500).json({ message: "Failed to create candidate", error: error.message || 'Unknown error' });
    }
  });

  // Get candidate counts for dashboard (scoped by recruiter's job applications)
  // Update candidate (recruiter) - Secure endpoint for recruiters to edit candidate profiles
  // Update last viewed timestamp when profile is viewed
  app.post("/api/recruiter/candidates/:id/view", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const candidate = await storage.getCandidateById(id);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const ownerRole = normalizeSourcingRole(employee.role);
      if (ownerRole) {
        const hasAccess =
          (candidate.ownerEmployeeId === employee.id && candidate.ownerRole === ownerRole) ||
          (ownerRole === 'recruiter' && !candidate.ownerEmployeeId && candidate.addedBy === employee.name);

        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied. This candidate does not belong to you." });
        }
      }

      // Update lastViewedAt timestamp
      await storage.updateCandidate(id, {
        lastViewedAt: new Date().toISOString()
      } as any);

      res.json({ message: "View timestamp updated", lastViewedAt: new Date().toISOString() });
    } catch (error: any) {
      console.error('Update view timestamp error:', error);
      res.status(500).json({ message: "Failed to update view timestamp" });
    }
  });

  app.put("/api/recruiter/candidates/:id", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const candidate = await storage.getCandidateById(id);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const ownerRole = normalizeSourcingRole(employee.role);
      if (!ownerRole) {
        return res.status(403).json({ message: "Only recruiters and team leaders can update sourced candidates" });
      }

      const hasAccess =
        (candidate.ownerEmployeeId === employee.id && candidate.ownerRole === ownerRole) ||
        (ownerRole === 'recruiter' && !candidate.ownerEmployeeId && candidate.addedBy === employee.name);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied. This candidate does not belong to you." });
      }

      // Validate update data
      const updateSchema = z.object({
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        position: z.string().optional(),
        designation: z.string().optional(),
        currentRole: z.string().optional(),
        experience: z.string().optional(),
        skills: z.string().optional(),
        location: z.string().optional(),
        preferredLocation: z.string().optional(),
        pipelineStatus: z.string().optional(),
        company: z.string().optional(),
        education: z.string().optional(),
        highestQualification: z.string().optional(),
        collegeName: z.string().optional(),
        resumeFile: z.string().optional(),
        resumeText: z.string().optional(),
        linkedinUrl: z.string().optional(),
        websiteUrl: z.string().optional(),
        portfolioUrl: z.string().optional(),
        noticePeriod: z.string().optional(),
        ctc: z.string().optional(),
        ectc: z.string().optional(),
        pedigreeLevel: z.string().optional(),
        companyLevel: z.string().optional(),
        companyDomain: z.string().optional(),
        lastViewedAt: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);

      // Update candidate in database - this updates the candidates table
      const updatedCandidate = await storage.updateCandidate(id, validatedData);

      if (!updatedCandidate) {
        return res.status(404).json({ message: "Failed to update candidate" });
      }

      // Also update related records if needed (profiles, jobApplications)
      // This ensures data consistency across all tables
      try {
        const { profiles, jobApplications } = await import("@shared/schema");

        // Update profiles table if candidateId exists
        if (candidate.candidateId) {
          const profileRecords = await db.select().from(profiles).where(eq(profiles.userId, candidate.id));
          if (profileRecords.length > 0) {
            const profileUpdates: any = {};
            if (validatedData.fullName) {
              const nameParts = validatedData.fullName.split(' ');
              profileUpdates.firstName = nameParts[0] || '';
              profileUpdates.lastName = nameParts.slice(1).join(' ') || '';
            }
            if (validatedData.email) profileUpdates.email = validatedData.email;
            if (validatedData.phone) profileUpdates.phone = validatedData.phone;
            if (validatedData.location) profileUpdates.location = validatedData.location;
            if (validatedData.skills) profileUpdates.skills = validatedData.skills;
            if (validatedData.resumeFile) profileUpdates.resumeFile = validatedData.resumeFile;

            if (Object.keys(profileUpdates).length > 0) {
              await db.update(profiles)
                .set(profileUpdates)
                .where(eq(profiles.userId, candidate.id));
            }
          }
        }

        // Update jobApplications table if candidateEmail matches
        if (validatedData.email || candidate.email) {
          const emailToUpdate = validatedData.email || candidate.email;
          const jobAppUpdates: any = {};
          if (validatedData.fullName) jobAppUpdates.candidateName = validatedData.fullName;
          if (validatedData.email) jobAppUpdates.candidateEmail = validatedData.email;
          if (validatedData.phone) jobAppUpdates.candidatePhone = validatedData.phone;
          if (validatedData.resumeFile) jobAppUpdates.resumeFile = validatedData.resumeFile;

          if (Object.keys(jobAppUpdates).length > 0) {
            await db.update(jobApplications)
              .set(jobAppUpdates)
              .where(eq(jobApplications.candidateEmail, emailToUpdate));
          }
        }
      } catch (updateError) {
        console.error('Error updating related records:', updateError);
        // Don't fail the request if related updates fail, but log it
      }

      res.json({ message: "Candidate updated successfully", candidate: updatedCandidate });
    } catch (error: any) {
      console.error('Update candidate error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });

  app.get("/api/recruiter/candidates/counts", requireEmployeeAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const ownedCandidates = await getOwnedCandidatesForEmployee(employee);
      if (!ownedCandidates) {
        return res.status(403).json({ message: "Only recruiters and team leaders can access candidate counts" });
      }
      const counts = {
        total: ownedCandidates.length,
        active: ownedCandidates.filter(candidate => candidate.isActive !== false).length,
        inactive: ownedCandidates.filter(candidate => candidate.isActive === false).length,
      };
      res.json(counts);
    } catch (error) {
      console.error("Get candidate counts error:", error);
      res.status(500).json({ message: "Failed to get candidate counts" });
    }
  });

  // Get a specific job by ID (with ownership check)
  app.get("/api/recruiter/jobs/:id", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const ownerRole = normalizeSourcingRole(employee.role);
      const job = await storage.getRecruiterJobById(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      // Verify ownership - job must belong to this recruiter
      const isOwner =
        (ownerRole && job.ownerEmployeeId === session.employeeId && job.ownerRole === ownerRole) ||
        job.recruiterId === session.employeeId;
      if (!isOwner) {
        return res.status(403).json({ message: "Access denied. This job does not belong to you." });
      }
      res.json(job);
    } catch (error) {
      console.error("Get recruiter job error:", error);
      res.status(500).json({ message: "Failed to get job" });
    }
  });

  // Update a recruiter job (with ownership check)
  app.put("/api/recruiter/jobs/:id", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const ownerRole = normalizeSourcingRole(employee.role);
      const reqBody = req.body;

      // Verify ownership first
      const existingJob = await storage.getRecruiterJobById(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      const isOwner =
        (ownerRole && existingJob.ownerEmployeeId === session.employeeId && existingJob.ownerRole === ownerRole) ||
        existingJob.recruiterId === session.employeeId;
      if (!isOwner) {
        return res.status(403).json({ message: "Access denied. This job does not belong to you." });
      }

      // Map frontend POST fields to database columns
      const updateData: any = {};
      if (reqBody.title !== undefined) updateData.role = reqBody.title;
      if (reqBody.company !== undefined) updateData.companyName = reqBody.company;
      if (reqBody.companyTagline !== undefined) updateData.companyTagline = reqBody.companyTagline;
      if (reqBody.companyType !== undefined) updateData.companyType = reqBody.companyType;
      if (reqBody.market !== undefined) updateData.market = reqBody.market;
      if (reqBody.location !== undefined) updateData.location = reqBody.location;
      if (reqBody.locationType !== undefined) updateData.workMode = reqBody.locationType;
      if (reqBody.description !== undefined) updateData.aboutCompany = reqBody.description;
      if (reqBody.requirements !== undefined) updateData.roleDefinitions = reqBody.requirements;
      if (reqBody.responsibilities !== undefined) updateData.keyResponsibility = reqBody.responsibilities;
      if (reqBody.department !== undefined) updateData.field = reqBody.department;
      if (reqBody.employmentType !== undefined) updateData.employmentType = reqBody.employmentType;
      if (reqBody.openings !== undefined) updateData.noOfPositions = parseInt(reqBody.openings) || 1;
      if (reqBody.companyLogo !== undefined) updateData.companyLogo = reqBody.companyLogo;

      if (reqBody.experienceMin !== undefined || reqBody.experienceMax !== undefined) {
        const min = reqBody.experienceMin;
        const max = reqBody.experienceMax;
        updateData.experience = max ? `${min}-${max} years` : `${min}+ years`;
      }

      if (reqBody.salaryMin !== undefined || reqBody.salaryMax !== undefined) {
        const minLPA = reqBody.salaryMin ? Math.round(reqBody.salaryMin / 100000) : 0;
        const maxLPA = reqBody.salaryMax ? Math.round(reqBody.salaryMax / 100000) : null;
        updateData.salaryPackage = maxLPA ? `${minLPA}-${maxLPA} LPA` : `${minLPA}+ LPA`;
      }

      if (reqBody.primarySkills !== undefined) {
        updateData.primarySkills = JSON.stringify(reqBody.primarySkills);
      }
      if (reqBody.secondarySkills !== undefined) {
        updateData.secondarySkills = JSON.stringify(reqBody.secondarySkills);
      }
      if (reqBody.knowledgeOnly !== undefined) {
        updateData.knowledgeOnly = JSON.stringify(reqBody.knowledgeOnly);
      }
      // Backward compatibility for 'skills'
      if (reqBody.skills !== undefined && !reqBody.primarySkills) {
        const skillsArray = Array.isArray(reqBody.skills) ? reqBody.skills : (reqBody.skills ? reqBody.skills.split(',').map((s: string) => s.trim()) : []);
        updateData.primarySkills = JSON.stringify(skillsArray);
      }

      // Handle assignment and status (New fields)
      if (reqBody.assignedTaId !== undefined) updateData.assignedTaId = reqBody.assignedTaId;
      if (reqBody.assignedTaName !== undefined) updateData.assignedTaName = reqBody.assignedTaName;
      if (reqBody.status !== undefined) updateData.status = reqBody.status;

      const job = await storage.updateRecruiterJob(id, updateData);
      res.json({ message: "Job updated successfully", job });
    } catch (error) {
      console.error("Update recruiter job error:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Delete a recruiter job (with ownership check)
  app.delete("/api/recruiter/jobs/:id", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const ownerRole = normalizeSourcingRole(employee.role);

      // Verify ownership first
      const existingJob = await storage.getRecruiterJobById(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      const isOwner =
        (ownerRole && existingJob.ownerEmployeeId === session.employeeId && existingJob.ownerRole === ownerRole) ||
        existingJob.recruiterId === session.employeeId;
      if (!isOwner) {
        return res.status(403).json({ message: "Access denied. This job does not belong to you." });
      }

      const deleted = await storage.deleteRecruiterJob(id);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Delete recruiter job error:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Close a recruiter job (mark as Closed) (with ownership check)
  app.post("/api/recruiter/jobs/:id/close", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const ownerRole = normalizeSourcingRole(employee.role);

      // Verify ownership first
      const existingJob = await storage.getRecruiterJobById(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      const isOwner =
        (ownerRole && existingJob.ownerEmployeeId === session.employeeId && existingJob.ownerRole === ownerRole) ||
        existingJob.recruiterId === session.employeeId;
      if (!isOwner) {
        return res.status(403).json({ message: "Access denied. This job does not belong to you." });
      }

      const job = await storage.updateRecruiterJob(id, {
        status: "Closed",
        closedDate: new Date()
      });
      res.json({ message: "Job closed successfully", job });
    } catch (error) {
      console.error("Close recruiter job error:", error);
      res.status(500).json({ message: "Failed to close job" });
    }
  });

  // Get active jobs for candidates (public endpoint)
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllRecruiterJobs();
      // Filter only active jobs for candidates
      const activeJobs = jobs.filter(job => job.status === "Active");
      res.json(activeJobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  // ===================== JOB APPLICATIONS ROUTES =====================

  // Get job applications (scoped to recruiter's jobs AND tagged requirements)
  app.get("/api/recruiter/applications", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const ownerRole = normalizeSourcingRole(employee.role);
      if (!ownerRole) {
        return res.status(403).json({ message: "Only recruiters and team leaders can access applications" });
      }

      // CRITICAL: Verify we're using the correct employee ID
      console.log('[RECRUITER APPLICATIONS] Employee ID:', employee.id, 'Employee Name:', employee.name, 'Email:', employee.email);

      const { jobId, dateFrom, dateTo, status } = req.query;

      const ownershipFilter = buildJobOwnershipFilter(employee);
      if (!ownershipFilter) {
        return res.status(403).json({ message: "Only recruiters and team leaders can access applications" });
      }

      // Get this actor's jobs
      const jobs = await db.select().from(recruiterJobs)
        .where(ownershipFilter)
        .orderBy(desc(recruiterJobs.postedDate));
      const jobIds = jobs.map(j => j.id);
      console.log('[RECRUITER APPLICATIONS] Found jobs for', employee.name, ':', jobIds.length);

      // Get all applications and filter to those for owned jobs OR manual tags owned by this actor
      const allApplications = await storage.getAllJobApplications();
      let recruiterApplications = allApplications.filter(app =>
        (app.recruiterJobId && jobIds.includes(app.recruiterJobId)) ||
        (app.ownerEmployeeId === employee.id && app.ownerRole === ownerRole)
      );

      // Enrich applications with candidate profile data and StaffOS usage status
      const profileIds = [...new Set(recruiterApplications.map(app => app.profileId).filter(Boolean))] as string[];
      const { profiles, candidates } = await import("@shared/schema");
      
      const candidatesMap = new Map();
      const profilesMap = new Map();
      
      if (profileIds.length > 0) {
        try {
          const chunkSize = 100;
          for (let i = 0; i < profileIds.length; i += chunkSize) {
            const chunk = profileIds.slice(i, i + chunkSize);
            const candidateRows = await db.select().from(candidates).where(inArray(candidates.id, chunk));
            candidateRows.forEach(c => candidatesMap.set(c.id, c));
            
            const profileRows = await db.select().from(profiles).where(inArray(profiles.id, chunk));
            profileRows.forEach(p => profilesMap.set(p.id, p));
          }
        } catch (error) {
          console.error('Error fetching bulk profile data:', error);
        }
      }

      const enrichedApplications = recruiterApplications.map((app) => {
        if (app.profileId) {
          const candidate = candidatesMap.get(app.profileId);
          const profile = profilesMap.get(app.profileId);
          
          if (candidate) {
            (app as any).isUsingStaffOS = candidate.isVerified || (candidate.password && candidate.password !== '');
          } else {
            (app as any).isUsingStaffOS = false;
          }

          if (!app.candidateName || app.candidateName === 'Unknown Candidate') {
            if (profile) {
              app.candidateName = `${profile.firstName} ${profile.lastName}`.trim();
              app.candidateEmail = app.candidateEmail || profile.email || null;
              app.candidatePhone = app.candidatePhone || profile.phone || profile.mobile || null;
              if (!app.resumeFile && profile.resumeFile) app.resumeFile = profile.resumeFile;
            } else if (candidate) {
              app.candidateName = candidate.fullName || app.candidateName;
              app.candidateEmail = app.candidateEmail || candidate.email || null;
              app.candidatePhone = app.candidatePhone || candidate.phone || null;
              if (!app.resumeFile && candidate.resumeFile) app.resumeFile = candidate.resumeFile;
            }
          }
        } else {
          (app as any).isUsingStaffOS = false;
        }
        return app;
      });

      // Apply additional filters
      let filteredApplications = enrichedApplications;

      if (jobId && typeof jobId === 'string') {
        filteredApplications = filteredApplications.filter(app => app.recruiterJobId === jobId);
      }

      if (status && typeof status === 'string') {
        filteredApplications = filteredApplications.filter(app => app.status === status);
      }

      if (dateFrom && typeof dateFrom === 'string') {
        const fromDate = new Date(dateFrom);
        filteredApplications = filteredApplications.filter(app => {
          if (!app.appliedDate) return false;
          return new Date(app.appliedDate) >= fromDate;
        });
      }

      if (dateTo && typeof dateTo === 'string') {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include entire day
        filteredApplications = filteredApplications.filter(app => {
          if (!app.appliedDate) return false;
          return new Date(app.appliedDate) <= toDate;
        });
      }

      res.json(filteredApplications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Failed to get applications" });
    }
  });

  // Get applications for a specific job (with ownership check)
  app.get("/api/recruiter/jobs/:id/applications", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const ownerRole = normalizeSourcingRole(employee.role);

      // Verify job ownership first
      const job = await storage.getRecruiterJobById(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      const isOwner =
        (ownerRole && job.ownerEmployeeId === session.employeeId && job.ownerRole === ownerRole) ||
        job.recruiterId === session.employeeId;
      if (!isOwner) {
        return res.status(403).json({ message: "Access denied. This job does not belong to you." });
      }

      const applications = await storage.getJobApplicationsByRecruiterJobId(id);
      res.json(applications);
    } catch (error) {
      console.error("Get job applications error:", error);
      res.status(500).json({ message: "Failed to get applications" });
    }
  });

  // Create a job application (for recruiter tagging candidates to requirements)
  app.post("/api/recruiter/applications", requireEmployeeAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const ownerRole = normalizeSourcingRole(employee.role);
      if (!ownerRole) {
        return res.status(403).json({ message: "Only recruiters and team leaders can tag candidates" });
      }

      const {
        candidateName,
        candidateEmail,
        candidatePhone,
        jobTitle,
        company,
        requirementId,
        experience,
        skills,
        location
      } = req.body;

      // Validate required fields
      if (!candidateName || !jobTitle || !company) {
        return res.status(400).json({ message: "Candidate name, job title, and company are required" });
      }

      // Validate candidateName is a non-empty string
      if (typeof candidateName !== 'string' || candidateName.trim().length === 0) {
        return res.status(400).json({ message: "Invalid candidate name" });
      }

      // Validate jobTitle is a non-empty string
      if (typeof jobTitle !== 'string' || jobTitle.trim().length === 0) {
        return res.status(400).json({ message: "Invalid job title" });
      }

      // Validate company is a non-empty string
      if (typeof company !== 'string' || company.trim().length === 0) {
        return res.status(400).json({ message: "Invalid company name" });
      }

      const candidateEmailStr = candidateEmail?.trim() || null;
      
      // Check if an existing application exists for this candidate and requirement
      let existingApplication = null;
      if (candidateEmailStr && requirementId) {
        try {
          const result = await db.execute(sql`
            SELECT * FROM job_applications 
            WHERE requirement_id = ${requirementId} 
            AND LOWER(candidate_email) = LOWER(${candidateEmailStr})
            LIMIT 1
          `);
          if (result.rows && result.rows.length > 0) {
            existingApplication = result.rows[0];
          }
        } catch (err) {
          console.error("Error finding existing application:", err);
        }
      }

      let hasPriorRecruiterConsent = false;
      if (candidateEmailStr) {
        try {
          const priorConsentResult = await db.execute(sql`
            SELECT 1
            FROM job_applications
            WHERE LOWER(candidate_email) = LOWER(${candidateEmailStr})
              AND LOWER(source) = 'recruiter_tagged'
              AND is_candidate_confirmed = true
            LIMIT 1
          `);
          hasPriorRecruiterConsent = Boolean(priorConsentResult.rows?.length);
        } catch (err) {
          console.error("Error checking prior recruiter consent:", err);
        }
      }

      let application;
      if (existingApplication) {
        // Reuse existing application: set status to In Process and reset confirmation
        const [updated] = await db.update(jobApplications)
          .set({ 
            status: "In Process",
            isCandidateConfirmed: hasPriorRecruiterConsent,
            // Clear out rejection/withdraw reasons so it doesn't show up as archived anymore
            rejectionReason: null,
            statusNote: null,
            withdrawReason: null,
            appliedDate: new Date() // Reset applied date to now
          })
          .where(eq(jobApplications.id, existingApplication.id as string))
          .returning();
        
        application = updated;
      } else {
        // Create new application
      const applicationData = {
        profileId: `recruiter-tagged-${Date.now()}`,
        requirementId: requirementId || null,
        ownerEmployeeId: employee.id,
        ownerRole,
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        status: "In Process",
        source: "recruiter_tagged",
          // Ask explicit consent only once for recruiter-invited flow.
          isCandidateConfirmed: hasPriorRecruiterConsent,
        candidateName: candidateName.trim(),
          candidateEmail: candidateEmailStr,
        candidatePhone: candidatePhone?.trim() || null,
        experience: experience?.toString() || null,
        skills: Array.isArray(skills) ? JSON.stringify(skills) : (skills || null),
        location: location?.trim() || null,
        appliedDate: new Date(),
      };

        application = await storage.createJobApplication(applicationData);
      }

      logCandidateSubmitted(
        storage,
        req.session.employeeId || 'unknown',
        employee?.name || 'Recruiter',
        'recruiter',
        candidateName.trim(),
        jobTitle.trim(),
        application.id
      );

      res.status(existingApplication ? 200 : 201).json({ 
        message: existingApplication ? "Application reactivated successfully" : "Application created successfully", 
        application 
      });
    } catch (error) {
      console.error("Create recruiter application error:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Send invite email to candidate for a recruiter application
  app.post("/api/recruiter/applications/:id/invite", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const ownerRole = normalizeSourcingRole(employee.role);
      if (!ownerRole) {
        return res.status(403).json({ message: "Only recruiters and team leaders can send invites" });
      }

      const application = await storage.getJobApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Ownership check: actor can invite only for owned records
      let hasAccess =
        application.ownerEmployeeId === employee.id &&
        application.ownerRole === ownerRole;

      if (!hasAccess && application.recruiterJobId) {
        const job = await storage.getRecruiterJobById(application.recruiterJobId);
        if (job) {
          hasAccess =
            (job.ownerEmployeeId === employee.id && job.ownerRole === ownerRole) ||
            job.recruiterId === employee.id;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied. This application does not belong to you." });
      }

      const candidateEmail = application.candidateEmail?.trim().toLowerCase();
      if (!candidateEmail) {
        return res.status(400).json({ message: "Candidate email is missing for this application" });
      }

      const candidate = await storage.getCandidateByEmail(candidateEmail);
      const loginUrl = process.env.FRONTEND_URL
        || (process.env.NODE_ENV === 'production'
          ? 'https://staffosdemo.vercel.app'
          : 'http://localhost:5000');

      const emailSent = await sendCandidateWelcomeEmail({
        fullName: application.candidateName || candidate?.fullName || "Candidate",
        email: candidateEmail,
        candidateId: candidate?.candidateId || "Pending",
        loginUrl,
      });

      if (!emailSent) {
        return res.status(502).json({ message: "Failed to send invite email. Please check email configuration." });
      }

      return res.json({
        success: true,
        message: "Invite email sent successfully",
        candidateEmail,
      });
    } catch (error) {
      console.error("Send invite email error:", error);
      return res.status(500).json({ message: "Failed to send invite email" });
    }
  });

  // Candidate Comments Session — application-scoped details (TA pipeline)
  app.get("/api/recruiter/applications/:id/session", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const application = await storage.getJobApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (!(await employeeCanAccessRecruiterApplication(employee, application))) {
        return res.status(403).json({ message: "Access denied" });
      }

      const details = await resolveApplicationCandidateDetails(application);
      return res.json({ application: details });
    } catch (error) {
      console.error("Get application session error:", error);
      return res.status(500).json({ message: "Failed to load candidate session" });
    }
  });

  app.get("/api/recruiter/applications/:id/comments", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const application = await storage.getJobApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (!(await employeeCanAccessRecruiterApplication(employee, application))) {
        return res.status(403).json({ message: "Access denied" });
      }

      const comments = await storage.getCandidateApplicationComments(id);
      return res.json(comments.map(serializeApplicationComment));
    } catch (error) {
      console.error("Get application comments error:", error);
      return res.status(500).json({ message: "Failed to load comments" });
    }
  });

  app.post("/api/recruiter/applications/:id/comments", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const bodySchema = z.object({
        body: z.string().trim().min(1, "Comment cannot be empty").max(5000),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid comment",
          errors: parsed.error.errors,
        });
      }

      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const application = await storage.getJobApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (!(await employeeCanAccessRecruiterApplication(employee, application))) {
        return res.status(403).json({ message: "Access denied" });
      }

      let comment;
      try {
        comment = await storage.createCandidateApplicationComment({
          applicationId: id,
          authorEmployeeId: employee.id,
          authorName: employee.name,
          authorRole: formatCommentAuthorRole(employee.role),
          body: parsed.data.body,
        });
      } catch (dbError) {
        console.error("createCandidateApplicationComment failed, using direct insert:", dbError);
        const [row] = await db
          .insert(candidateApplicationComments)
          .values({
            applicationId: id,
            authorEmployeeId: employee.id,
            authorName: employee.name,
            authorRole: formatCommentAuthorRole(employee.role),
            body: parsed.data.body,
          })
          .returning();
        if (!row) {
          throw dbError;
        }
        comment = row;
      }

      return res.status(201).json(serializeApplicationComment(comment));
    } catch (error) {
      console.error("Create application comment error:", error);
      return res.status(500).json({ message: "Failed to post comment" });
    }
  });

  // Candidate confirms a recruiter-tagged application
  app.post("/api/candidate/applications/:id/confirm", requireCandidateAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const application = await storage.getJobApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Candidate can only confirm their own application
      if (application.profileId !== candidate.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (String((application as any).source || "").toLowerCase() !== "recruiter_tagged") {
        return res.status(400).json({ message: "Only recruiter-tagged applications can be confirmed here" });
      }

      // If already confirmed, return as success (idempotent)
      if ((application as any).isCandidateConfirmed === true) {
        return res.json({ message: "Application already confirmed", application });
      }

      // Flip confirmation flag in DB
      const [updated] = await db
        .update(jobApplications)
        .set({ isCandidateConfirmed: true })
        .where(eq(jobApplications.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Notify recruiter (ownerEmployeeId) via notifications + activity feed
      const recruiterId = (application as any).ownerEmployeeId;
      if (recruiterId) {
        const candidateName = candidate.fullName || application.candidateName || "Candidate";
        const jobTitleText = application.jobTitle || "the role";
        const companyText = application.company || "";
        const title = "Candidate confirmed application";
        const message = `${candidateName} has confirmed their application for ${jobTitleText}${companyText ? ` at ${companyText}` : ""}.`;

        try {
          await storage.createNotification({
            userId: recruiterId,
            type: "candidate_application_confirmed",
            title,
            message,
            status: "unread",
            relatedJobId: application.recruiterJobId || application.requirementId || null,
            createdAt: new Date().toISOString(),
            readAt: null,
          } as any);
        } catch (notifyError) {
          console.warn("Failed to create recruiter notification:", notifyError);
        }

        try {
          await storage.createUserActivity({
            actorId: candidate.id,
            actorName: candidateName,
            actorRole: "candidate",
            type: "candidate_application_confirmed",
            title,
            description: message,
            targetRole: "recruiter",
            relatedId: application.id,
            relatedType: "job_application",
            createdAt: new Date().toISOString(),
          } as any);
        } catch (activityError) {
          console.warn("Failed to create recruiter activity:", activityError);
        }
      }

      // Persist a consent audit trail for recruiter-tagged consent acceptance.
      try {
        const candidateName = candidate.fullName || application.candidateName || "Candidate";
        const jobTitleText = application.jobTitle || "the role";
        const companyText = application.company || "";
        const consentDescription = `${candidateName} accepted recruiter-tagged consent for ${jobTitleText}${companyText ? ` at ${companyText}` : ""}.`;
        await storage.createUserActivity({
          actorId: candidate.id,
          actorName: candidateName,
          actorRole: "candidate",
          type: "candidate_consent_accepted",
          title: "Candidate consent accepted",
          description: consentDescription,
          targetRole: "system",
          relatedId: application.id,
          relatedType: "job_application",
          createdAt: new Date().toISOString(),
        } as any);
      } catch (consentActivityError) {
        console.warn("Failed to create consent audit activity:", consentActivityError);
      }

      res.json({ message: "Application confirmed", application: updated });
    } catch (error) {
      console.error("Confirm application error:", error);
      res.status(500).json({ message: "Failed to confirm application" });
    }
  });

  // Update application status
  app.patch("/api/recruiter/applications/:id/status", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, statusNote, rejectionReason } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const existingApplication = await storage.getJobApplicationById(id);
      if (!existingApplication) {
        return res.status(404).json({ message: "Application not found" });
      }

      const previousStatus = existingApplication.status;

      // Update the application status in the database
      const application = await storage.updateJobApplicationStatus(id, status, undefined, statusNote, rejectionReason);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      console.log(`Application ${id} status updated from "${previousStatus}" to "${status}"`);

      // Log the pipeline change if status actually changed
      if (previousStatus && previousStatus !== status) {
        const session = req.session as any;
        logCandidatePipelineChanged(
          storage,
          session.employeeId || 'system',
          session.employeeName || 'System',
          session.role || 'system',
          application.candidateName || 'Candidate',
          previousStatus,
          status,
          application.id
        ).catch(err => console.error('Failed to log pipeline change:', err));
      }

      // Invalidate admin pipeline cache so it refreshes
      // This ensures Admin dashboard sees the updated status immediately
      res.json({ message: "Application status updated", application });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Create closure (creates a revenue mapping with basic info, revenue/incentive can be updated by admin later)
  app.post("/api/recruiter/closures", requireEmployeeAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const employee = await storage.getEmployeeById(session.employeeId);
      if (!employee || employee.role !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter role required." });
      }

      const { applicationId, candidateName, client, position, offeredOn, joinedOn, quarter } = req.body;

      if (!applicationId || !candidateName || !client || !position || !offeredOn || !joinedOn || !quarter) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Get the application to find requirement and client info
      // Use getAllJobApplications and filter by ID (safer than getJobApplicationById)
      const allApplications = await storage.getAllJobApplications();
      const application = allApplications.find(app => app.id === applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Get requirement to find team lead (get all requirements and filter by ID)
      let teamLeadId = '';
      let teamLeadName = '';
      if (application.requirementId) {
        const allRequirements = await storage.getRequirements();
        const requirement = allRequirements.find(r => r.id === application.requirementId);
        if (requirement && requirement.teamLeadId) {
          const teamLead = await storage.getEmployeeById(requirement.teamLeadId);
          if (teamLead) {
            teamLeadId = teamLead.id;
            teamLeadName = teamLead.name;
          }
        }
      }

      // If no team lead from requirement, try to find from employee's reportingTo
      if (!teamLeadId && employee.reportingTo) {
        const reportingManager = await storage.getEmployeeByEmployeeId(employee.reportingTo);
        if (reportingManager && reportingManager.role === 'team_leader') {
          teamLeadId = reportingManager.id;
          teamLeadName = reportingManager.name;
        }
      }

      // Fallback: if still no team lead, use employee as team lead
      if (!teamLeadId) {
        teamLeadId = employee.id;
        teamLeadName = employee.name;
      }

      // Get client ID from company name (case-insensitive, flexible matching)
      const allClients = await storage.getAllClients();
      const clientLower = client.toLowerCase().trim();
      const clientRecord = allClients.find(c => {
        const brandName = (c.brandName || '').toLowerCase().trim();
        const companyName = (c.companyName || '').toLowerCase().trim();
        const clientCode = (c.clientCode || '').toLowerCase().trim();
        return brandName === clientLower ||
          companyName === clientLower ||
          clientCode === clientLower ||
          brandName.includes(clientLower) ||
          companyName.includes(clientLower);
      });
      const clientId = clientRecord?.id || '';

      if (!clientId) {
        console.error('Closure: Client not found. Searched for:', client);
        console.error('Available clients:', allClients.filter(c => !c.isLoginOnly).map(c => ({
          id: c.id,
          brandName: c.brandName,
          companyName: c.companyName,
          clientCode: c.clientCode
        })));
        return res.status(400).json({
          message: "Client not found. Please ensure the client exists in the system.",
          searchedFor: client,
          availableClients: allClients.filter(c => !c.isLoginOnly).map(c => ({
            brandName: c.brandName,
            companyName: c.companyName,
            clientCode: c.clientCode
          }))
        });
      }

      // Parse quarter (format: Q1-2024)
      const quarterMatch = quarter.match(/Q(\d)-(\d{4})/);
      if (!quarterMatch) {
        return res.status(400).json({ message: "Invalid quarter format. Expected format: Q1-2024" });
      }
      const quarterNum = parseInt(quarterMatch[1]);
      const year = parseInt(quarterMatch[2]);

      // Map quarter number to quarter text (JFM, AMJ, JAS, OND)
      const quarterMap: Record<number, string> = {
        1: 'JFM',
        2: 'AMJ',
        3: 'JAS',
        4: 'OND'
      };
      const quarterText = quarterMap[quarterNum] || 'JFM';

      // Create revenue mapping with default values (admin can update revenue/incentive later)
      // Use insertRevenueMappingSchema to validate the data (this will strip createdAt)
      const revenueMappingData = insertRevenueMappingSchema.parse({
        talentAdvisorId: employee.id,
        talentAdvisorName: employee.name,
        teamLeadId: teamLeadId,
        teamLeadName: teamLeadName,
        candidateName: candidateName,
        year: year,
        quarter: quarterText,
        position: position,
        clientId: clientId,
        clientName: client,
        clientType: 'Direct', // Default to Direct, admin can update
        partnerName: null,
        offeredDate: offeredOn,
        closureDate: joinedOn,
        percentage: 0, // Default, admin will update
        revenue: 0, // Default, admin will update
        incentivePlan: 'TA', // Default to TA (Talent Advisor)
        incentive: 0, // Default, admin will update
        source: 'Direct', // Default, admin can update
        invoiceDate: null,
        invoiceNumber: null,
        receivedPayment: null,
        paymentDetails: null,
        paymentStatus: null,
        incentivePaidMonth: null,
      });

      // Add createdAt since it's required by the database but omitted from the schema
      // Pass it explicitly to createRevenueMapping
      const revenueMapping = await storage.createRevenueMapping({
        ...revenueMappingData,
        createdAt: new Date().toISOString()
      } as InsertRevenueMapping & { createdAt: string });

      // Update application status to 'Closure'
      await storage.updateJobApplicationStatus(applicationId, 'Closure');

      res.status(201).json({
        message: "Closure created successfully",
        revenueMapping,
        note: "Revenue and incentive values are set to 0. Admin can update these values in Revenue Mapping."
      });
    } catch (error: any) {
      console.error("Create closure error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid closure data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create closure", error: error.message });
    }
  });

  // Get all job applications for Admin pipeline (view all recruiters' pipeline data)
  // Supports filtering by TL (team leader)
  app.get("/api/admin/pipeline", requireAdminAuth, async (req, res) => {
    try {
      const tlFilter = req.query.tl as string | undefined; // Optional TL filter
      const taFilter = req.query.ta as string | undefined; // Optional TA filter

      // Support both applications and submissions
      let applications = await storage.getAllJobApplications();
      const { resumeSubmissions } = await import("@shared/schema");
      let submissions = await db.select().from(resumeSubmissions);

      // Get all employees, requirements, and recruiter jobs for filtering
      const allEmployees = await storage.getAllEmployees();
      const allRequirements = await storage.getRequirements();
      const allRecruiterJobs = await storage.getAllRecruiterJobs();
      const { requirementAssignments } = await import("@shared/schema");
      const allAssignments = await db.select().from(requirementAssignments);

      // If TA filter is specified, filter to that specific TA
      if (taFilter && taFilter !== 'all') {
        const talentAdvisor = allEmployees.find(emp =>
          (emp.id === taFilter || emp.employeeId === taFilter) && emp.role === 'recruiter'
        );

        if (talentAdvisor) {
          const taId = talentAdvisor.id;
          const taEmployeeId = talentAdvisor.employeeId;
          const taRequirementIds = new Set(allRequirements.filter((req: any) => req.talentAdvisorId === taId).map((req: any) => req.id));
          allAssignments
            .filter((assignment: any) => assignment.status === 'active' && assignment.recruiterId === taId)
            .forEach((assignment: any) => taRequirementIds.add(assignment.requirementId));
          const taRecruiterJobIds = new Set(allRecruiterJobs.filter((job: any) => job.recruiterId === taId || job.recruiterId === taEmployeeId).map((job: any) => job.id));

          applications = applications.filter((app: any) => (app.recruiterJobId && taRecruiterJobIds.has(app.recruiterJobId)) || (app.requirementId && taRequirementIds.has(app.requirementId)));
          submissions = submissions.filter((sub: any) => sub.recruiterId === taId);
        } else {
          applications = [];
          submissions = [];
        }
      }
      else if (tlFilter && tlFilter !== 'all') {
        const teamLeader = allEmployees.find(emp => (emp.id === tlFilter || emp.employeeId === tlFilter) && emp.role === 'team_leader');
        if (teamLeader) {
          const teamTAs = allEmployees.filter(emp => emp.role === 'recruiter' && emp.reportingTo === teamLeader.employeeId);
          const teamTAIds = new Set(teamTAs.map(ta => ta.id));
          const teamTAEmployeeIds = new Set(teamTAs.map(ta => ta.employeeId));

          const teamRequirementIds = new Set(allRequirements.filter((req: any) =>
            req.talentAdvisorId && teamTAIds.has(req.talentAdvisorId)
          ).map((req: any) => req.id));
          allRequirements
            .filter((req: any) => req.teamLeadId === teamLeader.id || req.teamLead === teamLeader.name)
            .forEach((req: any) => teamRequirementIds.add(req.id));
          allAssignments
            .filter((assignment: any) => assignment.status === 'active' && teamTAIds.has(assignment.recruiterId))
            .forEach((assignment: any) => teamRequirementIds.add(assignment.requirementId));
          const teamRecruiterJobIds = new Set(allRecruiterJobs.filter((job: any) => teamTAIds.has(job.recruiterId) || teamTAEmployeeIds.has(job.recruiterId)).map((job: any) => job.id));

          applications = applications.filter((app: any) => (app.recruiterJobId && teamRecruiterJobIds.has(app.recruiterJobId)) || (app.requirementId && teamRequirementIds.has(app.requirementId)));
          submissions = submissions.filter((sub: any) => teamTAIds.has(sub.recruiterId));
        } else {
          applications = [];
          submissions = [];
        }
      }

      // Convert submissions to application format
      const submissionApps = submissions.map((sub: any) => ({
        id: `sub-${sub.id}`,
        profileId: sub.candidateId || sub.id,
        recruiterJobId: null,
        requirementId: sub.requirementId,
        status: sub.status || 'Sourced',
        source: 'recruiter_tagged',
        appliedDate: sub.submittedAt ? new Date(sub.submittedAt) : new Date(),
        candidateName: sub.candidateName,
        candidateEmail: sub.candidateEmail,
        candidatePhone: null,
        jobTitle: 'Sourced', // Fallback, will try to improve from requirement below
        company: 'N/A',
        location: null,
        experience: null,
        skills: null
      }));

      // Combine all and de-duplicate overlapping submission/application rows
      const allPipelineApps = [...applications, ...submissionApps];
      const dedupedPipelineMap = new Map<string, any>();
      for (const app of allPipelineApps) {
        const dedupeKey = [
          app.requirementId || app.recruiterJobId || 'no-link',
          (app.candidateEmail || app.candidateName || app.profileId || app.id || '').toString().trim().toLowerCase()
        ].join('::');
        const existing = dedupedPipelineMap.get(dedupeKey);
        const isSubmission = app.id && typeof app.id === 'string' && app.id.startsWith('sub-');
        const existingIsSubmission = existing?.id && typeof existing.id === 'string' && existing.id.startsWith('sub-');

        if (!existing || (existingIsSubmission && !isSubmission)) {
          dedupedPipelineMap.set(dedupeKey, app);
        }
      }
      const dedupedPipelineApps = Array.from(dedupedPipelineMap.values());

      const validPipelineStatuses = new Set([
        'In-Process', 'In Process', 'Sourced', 'Applied',
        'Shortlisted',
        'Intro Call',
        'Assignment',
        'L1', 'Level 1',
        'L2', 'Level 2',
        'L3', 'Level 3',
        'Final Round',
        'HR Round',
        'Offer Stage', 'Selected',
        'Closure', 'Joined',
        'Offer Drop', 'Declined',
        'Interview Scheduled'
      ]);
      const pipelineSourceApps = dedupedPipelineApps.filter((app: any) => validPipelineStatuses.has(String(app.status || '').trim()));

      // Format pipeline data (allEmployees, allRequirements, allRecruiterJobs already fetched above)

      const pipelineData = pipelineSourceApps.map((app: any) => {
        // Find which TA this application belongs to
        let recruiterName = 'Unknown';
        let recruiterId = null;
        let teamLeaderName = null;

        // Special handling for submission-based apps (sub-ID)
        if (app.id && typeof app.id === 'string' && app.id.startsWith('sub-')) {
          const submissionId = app.id.replace('sub-', '');
          const submission = submissions.find((s: any) => String(s.id) === submissionId);
          if (submission) {
            const recruiter = allEmployees.find((e: any) => e.id === submission.recruiterId);
            if (recruiter) {
              recruiterName = recruiter.name;
              recruiterId = recruiter.id;
              if (recruiter.reportingTo) {
                const tl = allEmployees.find((e: any) => e.employeeId === recruiter.reportingTo && e.role === 'team_leader');
                if (tl) teamLeaderName = tl.name;
              }
            }
            // Also get job title and company from requirement if available
            if (submission.requirementId) {
              const req = allRequirements.find((r: any) => r.id === submission.requirementId);
              if (req) {
                app.jobTitle = req.position;
                app.company = req.company;
              }
            }
          }
        } else {
          // Normal application handling
          // Try to find from recruiter job
          if (app.recruiterJobId) {
            const job = allRecruiterJobs.find((j: any) => j.id === app.recruiterJobId);
            if (job) {
              const recruiter = allEmployees.find((e: any) => e.id === job.recruiterId || e.employeeId === job.recruiterId);
              if (recruiter) {
                recruiterName = recruiter.name;
                recruiterId = recruiter.id;
                if (recruiter.reportingTo) {
                  const tl = allEmployees.find((e: any) => e.employeeId === recruiter.reportingTo && e.role === 'team_leader');
                  if (tl) teamLeaderName = tl.name;
                }
              }
            }
          }

          // Try to find from requirement if still unknown
          if (app.requirementId && recruiterName === 'Unknown') {
            const req = allRequirements.find((r: any) => r.id === app.requirementId);
            if (req && req.talentAdvisorId) {
              const recruiter = allEmployees.find((e: any) => e.id === req.talentAdvisorId);
              if (recruiter) {
                recruiterName = recruiter.name;
                recruiterId = recruiter.id;
                if (recruiter.reportingTo) {
                  const tl = allEmployees.find((e: any) => e.employeeId === recruiter.reportingTo && e.role === 'team_leader');
                  if (tl) teamLeaderName = tl.name;
                }
              }
            }
          }
        }

        // Map status to pipeline format
        const statusMap: Record<string, string> = {
          'In Process': 'In-Process',
          'In-Process': 'In-Process',
          'Shortlisted': 'Shortlisted',
          'Rejected': 'Rejected',
          'Screened Out': 'Screened Out',
          'L1': 'L1',
          'L2': 'L2',
          'L3': 'L3',
          'Final Round': 'Final Round',
          'HR Round': 'HR Round',
          'Closure': 'Closure',
          'Selected': 'Selected',
          'Interview Scheduled': 'L1',
          'Applied': 'In-Process',
          'Sourced': 'In-Process'
        };

        return {
          id: app.id,
          candidateName: app.candidateName || 'Unknown Candidate',
          company: app.company || 'N/A',
          jobTitle: app.jobTitle || 'N/A',
          roleApplied: app.jobTitle || 'N/A',
          status: statusMap[app.status] || app.status || 'In-Process',
          currentStatus: statusMap[app.status] || app.status || 'In-Process',
          recruiter: recruiterName,
          recruiterId: recruiterId,
          teamLeader: teamLeaderName,
          email: app.candidateEmail || null,
          phone: app.candidatePhone || null,
          location: app.location || 'N/A',
          experience: app.experience || 'N/A',
          skills: (() => {
            if (!app.skills) return [];
            if (typeof app.skills !== 'string') return app.skills;
            try {
              return JSON.parse(app.skills);
            } catch (e) {
              // Handle legacy plain text strings (comma-separated)
              return app.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
          })(),
          appliedDate: app.appliedDate || null,
          appliedOn: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : 'N/A',
          profileId: app.profileId || null,
          requirementId: app.requirementId || null
        };
      });

      res.json(
        pipelineData.sort((a: any, b: any) => {
          const aTime = new Date(a.appliedDate || a.updatedAt || 0).getTime();
          const bTime = new Date(b.appliedDate || b.updatedAt || 0).getTime();
          return bTime - aTime;
        })
      );
    } catch (error) {
      console.error("Get admin pipeline error:", error);
      res.status(500).json({ message: "Failed to get pipeline data" });
    }
  });

  // Get all employees
  app.get("/api/admin/employees", requireAdminAuth, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ message: "Failed to get employees" });
    }
  });

  // Get all team leads
  app.get("/api/admin/team-leads", requireAdminAuth, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      const teamLeads = employees.filter(emp => emp.role === 'team_leader');
      const formattedTLs = teamLeads.map(tl => ({
        id: tl.id,
        name: tl.name,
        email: tl.email,
        role: tl.role
      }));
      res.json(formattedTLs);
    } catch (error) {
      console.error('Get team leads error:', error);
      res.status(500).json({ message: "Failed to get team leads" });
    }
  });

  // Get all clients
  app.get("/api/admin/clients", requireAdminAuth, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({ message: "Failed to get clients" });
    }
  });

  // Get all candidates (for Master Database)
  app.get("/api/admin/candidates", requireEmployeeAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      let candidatesList;
      const ownedCandidates = await getOwnedCandidatesForEmployee(employee);
      if (ownedCandidates) {
        candidatesList = ownedCandidates;
      } else {
        candidatesList = await storage.getAllCandidates();
      }

      res.json(candidatesList || []);
    } catch (error: any) {
      console.error('Get candidates error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        message: "Failed to get candidates",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // ============================================
  // ENTERPRISE SOURCE RESUME SEARCH API
  // ============================================
  // POST /api/source-resume/search
  // Server-side indexed search with pagination, sorting, and advanced scoring

  app.post("/api/source-resume/search", requireEmployeeAuth, async (req, res) => {
    try {
      const {
        searchQuery = "",
        booleanMode = false,
        filters = {},
        pagination = { page: 1, pageSize: 10 },
        sortOption = "relevance",
        requirementId = null,
      } = req.body;

      // Extract search skills from query or filters
      const searchSkills: string[] = [];
      if (filters.specificSkills && Array.isArray(filters.specificSkills)) {
        searchSkills.push(...normalizeSkills(filters.specificSkills));
      }
      if (filters.keywords && Array.isArray(filters.keywords)) {
        searchSkills.push(...normalizeSkills(filters.keywords));
      }
      if (searchQuery && !booleanMode) {
        // Extract potential skills from search query
        const queryTerms = searchQuery.split(/\s+/).filter(t => t.length > 2);
        searchSkills.push(...normalizeSkills(queryTerms));
      }

      // Build database query conditions
      const queryConditions = buildSearchQuery({
        ...filters,
        searchQuery,
        booleanMode,
      });

      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Build where clause
      // Source Resume should search across the full active candidate database.
      let whereClause;
      if (queryConditions) {
        whereClause = and(eq(candidates.isActive, true), queryConditions);
      } else {
        whereClause = eq(candidates.isActive, true);
      }

      // Debug logging
      console.log('Source Resume Search - Filters:', JSON.stringify(filters, null, 2));
      console.log('Source Resume Search - Query conditions:', queryConditions ? 'Has conditions' : 'No conditions (showing all)');

      // First, check total candidates (regardless of isActive)
      const totalCandidatesQuery = db.select({ count: sql<number>`count(*)` })
        .from(candidates);
      const [totalCandidatesResult] = await totalCandidatesQuery;
      const totalCandidates = Number(totalCandidatesResult?.count || 0);
      console.log('Source Resume Search - Total candidates in DB (all):', totalCandidates);

      // Check total active candidates
      const totalActiveQuery = db.select({ count: sql<number>`count(*)` })
        .from(candidates)
        .where(eq(candidates.isActive, true));
      const [totalActiveResult] = await totalActiveQuery;
      const totalActive = Number(totalActiveResult?.count || 0);
      console.log('Source Resume Search - Total active candidates in DB:', totalActive);

      // Check candidates with isActive = false or null
      const inactiveQuery = db.select({ count: sql<number>`count(*)` })
        .from(candidates)
        .where(sql`${candidates.isActive} = false OR ${candidates.isActive} IS NULL`);
      const [inactiveResult] = await inactiveQuery;
      const inactiveCount = Number(inactiveResult?.count || 0);
      console.log('Source Resume Search - Inactive/null candidates:', inactiveCount);

      let filteredCandidatesQuery = db.select().from(candidates).where(whereClause);

      if (sortOption !== 'relevance' && sortOption !== 'ctc-high' && sortOption !== 'ctc-low' && sortOption !== 'notice-period') {
        filteredCandidatesQuery = filteredCandidatesQuery.orderBy(getSortOrder(sortOption));
      }

      let candidatesList;
      try {
        candidatesList = await filteredCandidatesQuery;
        console.log('Source Resume Search - Query returned', candidatesList.length, 'candidates before scoring');
      } catch (queryError: any) {
        console.error('Source Resume Search - Query execution error:', queryError);
        console.error('Source Resume Search - Error details:', queryError.message, queryError.stack);
        throw queryError;
      }

      const totalCount = candidatesList.length;
      console.log('Source Resume Search - Candidates matching filters:', totalCount);

      const page = Math.max(1, pagination.page || 1);
      const pageSize = Math.min(100, Math.max(1, pagination.pageSize || 10));
      const offset = (page - 1) * pageSize;

      // Get requirement if provided
      let requirement = null;
      if (requirementId) {
        const requirementRows = await db.select().from(requirements).where(eq(requirements.id, requirementId));
        requirement = requirementRows[0] || null;
      }

      // Calculate scores for each candidate
      const scoredCandidates = candidatesList.map(candidate => {
        return calculateRelevanceScore(
          candidate,
          searchQuery,
          searchSkills,
          requirement
        );
      });

      // Sort by relevance if needed (or other in-memory sorts)
      let sortedCandidates = scoredCandidates;
      if (sortOption === 'relevance') {
        sortedCandidates = scoredCandidates.sort((a, b) => {
          // If requirement match exists, prioritize it
          if (requirement) {
            const aMatch = a.matchPercentage || 0;
            const bMatch = b.matchPercentage || 0;
            if (bMatch !== aMatch) return bMatch - aMatch;
          }
          return b.relevanceScore - a.relevanceScore;
        });
      } else if (sortOption === 'ctc-high' || sortOption === 'ctc-low') {
        sortedCandidates = scoredCandidates.sort((a, b) => {
          const aCtc = parseFloat((a.candidate.ctc || a.candidate.ectc || '0').replace(/[^\d.]/g, '')) || 0;
          const bCtc = parseFloat((b.candidate.ctc || b.candidate.ectc || '0').replace(/[^\d.]/g, '')) || 0;
          return sortOption === 'ctc-high' ? bCtc - aCtc : aCtc - bCtc;
        });
      } else if (sortOption === 'notice-period') {
        sortedCandidates = scoredCandidates.sort((a, b) => {
          const aNotice = parseInt((a.candidate.noticePeriod || '999').match(/\d+/)?.[0] || '999');
          const bNotice = parseInt((b.candidate.noticePeriod || '999').match(/\d+/)?.[0] || '999');
          return aNotice - bNotice;
        });
      }

      const paginatedCandidates = sortedCandidates.slice(offset, offset + pageSize);

      // Calculate analytics for the full filtered set, not just one page
      const analytics = calculateAnalytics(sortedCandidates.map(sc => sc.candidate));

      // Return paginated results with metadata
      res.json({
        candidates: paginatedCandidates.map(sc => ({
          ...sc.candidate,
          relevanceScore: sc.relevanceScore,
          matchPercentage: sc.matchPercentage,
          matchedTerms: sc.matchedTerms,
        })),
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
        analytics,
      });
    } catch (error: any) {
      console.error('Source resume search error:', error);
      res.status(500).json({
        message: "Search failed",
        error: error.message || 'Unknown error'
      });
    }
  });

  // Helper function to calculate analytics
  function calculateAnalytics(candidatesList: any[]) {
    if (candidatesList.length === 0) {
      return {
        topSkills: [],
        experienceDistribution: {},
        locationDistribution: {},
        avgCTC: 0,
        totalCandidates: 0,
      };
    }

    // Top skills
    const skillCounts: Record<string, number> = {};
    candidatesList.forEach(candidate => {
      const skills = parseAndNormalizeSkills(candidate.skills || '');
      skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Experience distribution
    const expDistribution: Record<string, number> = {
      '0-2': 0,
      '3-5': 0,
      '6-10': 0,
      '11-15': 0,
      '15+': 0,
    };
    candidatesList.forEach(candidate => {
      const exp = parseFloat(candidate.experience?.replace(/[^\d.]/g, '') || '0');
      if (exp <= 2) expDistribution['0-2']++;
      else if (exp <= 5) expDistribution['3-5']++;
      else if (exp <= 10) expDistribution['6-10']++;
      else if (exp <= 15) expDistribution['11-15']++;
      else expDistribution['15+']++;
    });

    // Location distribution
    const locationCounts: Record<string, number> = {};
    candidatesList.forEach(candidate => {
      const location = candidate.location || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    const locationDistribution = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [loc, count]) => {
        acc[loc] = count;
        return acc;
      }, {} as Record<string, number>);

    // Average CTC
    const ctcValues: number[] = [];
    candidatesList.forEach(candidate => {
      const ctc = parseFloat((candidate.ctc || candidate.ectc || '0').replace(/[^\d.]/g, '')) || 0;
      if (ctc > 0) ctcValues.push(ctc);
    });
    const avgCTC = ctcValues.length > 0
      ? ctcValues.reduce((sum, val) => sum + val, 0) / ctcValues.length
      : 0;

    return {
      topSkills,
      experienceDistribution: expDistribution,
      locationDistribution,
      avgCTC: Math.round(avgCTC * 100) / 100,
      totalCandidates: candidatesList.length,
    };
  }

  // Get candidate by ID (accessible by admin and recruiters)
  app.get("/api/admin/candidates/:id", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      let candidate = await storage.getCandidateById(id);
      if (!candidate) {
        candidate = await storage.getCandidateByCandidateId(id);
      }
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      if (!(await employeeCanViewCandidateRecord(employee, candidate))) {
          return res.status(403).json({ message: "Access denied. This candidate does not belong to you." });
      }

      res.json(candidate);
    } catch (error) {
      console.error('Get candidate by ID error:', error);
      res.status(500).json({ message: "Failed to get candidate" });
    }
  });

  // Delete candidate by ID
  // Update candidate (admin)
  app.put("/api/admin/candidates/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const candidate = await storage.getCandidateById(id);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Validate update data
      const updateSchema = z.object({
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        position: z.string().optional(),
        designation: z.string().optional(),
        currentRole: z.string().optional(),
        experience: z.string().optional(),
        skills: z.string().optional(),
        location: z.string().optional(),
        pipelineStatus: z.string().optional(),
        company: z.string().optional(),
        education: z.string().optional(),
        resumeFile: z.string().optional(),
        resumeText: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);

      // Update candidate
      const updatedCandidate = await storage.updateCandidate(id, validatedData);

      if (!updatedCandidate) {
        return res.status(404).json({ message: "Failed to update candidate" });
      }

      res.json({ message: "Candidate updated successfully", candidate: updatedCandidate });
    } catch (error: any) {
      console.error('Update candidate error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });

  app.delete("/api/admin/candidates/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Verify candidate exists before deletion
      const candidateToDelete = await storage.getCandidateById(id);
      if (!candidateToDelete) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Delete the candidate using storage layer (ensures database persistence)
      const deleted = await storage.deleteCandidate(id);

      if (!deleted) {
        return res.status(404).json({ message: "Failed to delete candidate" });
      }

      console.log(`Candidate ${id} permanently deleted from database`);
      res.json({ message: "Candidate deleted successfully" });
    } catch (error) {
      console.error('Delete candidate error:', error);
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });

  // Parse single resume and extract info
  app.post("/api/admin/parse-resume", requireAdminAuth, resumeUpload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No resume file uploaded" });
      }

      // Validate file type
      const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ success: false, message: "Invalid file type. Only PDF, DOC, and DOCX files are allowed." });
      }

      let parsed;
      try {
        parsed = await parseResumeFile(req.file.path, req.file.mimetype);
      } catch (parseError: any) {
        console.error('Parse resume error:', parseError);
        return res.status(500).json({
          success: false,
          message: parseError.message || "Failed to parse resume file. Please ensure the file is not corrupted and try again."
        });
      }

      // Generate file URL for the uploaded resume
      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      const fileUrl = `${baseUrl}/uploads/resumes/${path.basename(req.file.path)}`;

      res.json({
        success: true,
        data: {
          fullName: parsed.fullName || null,
          email: parsed.email || null,
          phone: parsed.phone || null,
          designation: parsed.designation || null,
          experience: parsed.experience || null,
          skills: parsed.skills || null,
          location: parsed.location || null,
          company: parsed.company || null,
          education: parsed.education || null,
          linkedinUrl: parsed.linkedinUrl || null,
          portfolioUrl: parsed.portfolioUrl || null,
          websiteUrl: parsed.websiteUrl || null,
          currentRole: parsed.currentRole || null,
          filePath: fileUrl,
          fileName: req.file.originalname
        }
      });
    } catch (error: any) {
      console.error('Parse resume error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to parse resume. Please try again."
      });
    }
  });

  // Parse bulk resumes (increased limit to 50 for better productivity)
  app.post("/api/admin/parse-resumes-bulk", requireAdminAuth, resumeUpload.array('resumes', 50), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No resume files uploaded" });
      }

      const fileData = files.map(f => ({
        path: f.path,
        originalname: f.originalname,
        mimetype: f.mimetype
      }));

      const results = await parseBulkResumes(fileData);

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      // Generate base URL for file paths
      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      res.json({
        total: results.length,
        successCount,
        failedCount,
        results: results.map((r, index) => {
          if (r.success && files[index]) {
            const fileUrl = `${baseUrl}/uploads/resumes/${path.basename(files[index].path)}`;
            return {
              fileName: r.fileName,
              success: r.success,
              data: {
                fullName: r.data?.fullName,
                email: r.data?.email,
                phone: r.data?.phone,
                designation: r.data?.designation,
                experience: r.data?.experience,
                skills: r.data?.skills,
                location: r.data?.location,
                company: r.data?.company,
                education: r.data?.education,
                linkedinUrl: r.data?.linkedinUrl,
                portfolioUrl: r.data?.portfolioUrl,
                websiteUrl: r.data?.websiteUrl,
                currentRole: r.data?.currentRole,
                filePath: fileUrl
              },
              error: r.error
            };
          }
          return {
            fileName: r.fileName,
            success: r.success,
            data: null,
            error: r.error
          };
        })
      });
    } catch (error) {
      console.error('Bulk parse resume error:', error);
      res.status(500).json({ message: "Failed to parse resumes" });
    }
  });

  // Import single candidate from resume
  app.post("/api/admin/import-candidate", requireAdminAuth, async (req, res) => {
    try {
      const { fullName, email, phone, designation, experience, skills, location, company, education, linkedinUrl, portfolioUrl, websiteUrl, currentRole, resumeFilePath, addedBy } = req.body;

      if (!fullName || !email) {
        return res.status(400).json({ message: "Full name and email are required" });
      }

      // Check if candidate already exists (case-insensitive)
      const existing = await storage.getCandidateByEmail(email.toLowerCase());
      if (existing) {
        return res.status(409).json({ message: "A candidate with this email already exists" });
      }

      const candidateId = await storage.generateNextCandidateId();

      // Helper function to convert string "null" to actual null
      const cleanValue = (value: any): any => {
        if (!value) return null;
        const str = String(value).trim().toLowerCase();
        if (str === 'null' || str === 'undefined' || str === '' || str === 'not available' || str === 'n/a') {
          return null;
        }
        return value;
      };

      const newCandidate = await storage.createCandidate({
        candidateId,
        fullName,
        email: email.toLowerCase(),
        phone: cleanValue(phone),
        designation: cleanValue(designation),
        experience: cleanValue(experience),
        skills: cleanValue(skills),
        location: cleanValue(location),
        company: cleanValue(company),
        education: cleanValue(education),
        linkedinUrl: cleanValue(linkedinUrl),
        portfolioUrl: cleanValue(portfolioUrl),
        websiteUrl: cleanValue(websiteUrl),
        currentRole: cleanValue(currentRole),
        resumeFile: resumeFilePath || null,
        addedBy: addedBy || 'Admin Import',
        pipelineStatus: 'New',
        isActive: true,
        isVerified: false,
        createdAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: "Candidate imported successfully",
        candidate: newCandidate
      });
    } catch (error: any) {
      console.error('Import candidate error:', error);
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "A candidate with this email already exists" });
      }
      res.status(500).json({ message: "Failed to import candidate" });
    }
  });

  // Bulk import candidates from resumes
  app.post("/api/admin/import-candidates-bulk", requireAdminAuth, async (req, res) => {
    try {
      const { candidates, addedBy } = req.body;

      if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
        return res.status(400).json({ message: "No candidates to import" });
      }

      const results: Array<{ fileName: string; success: boolean; candidateId?: string; error?: string }> = [];

      for (const candidate of candidates) {
        try {
          if (!candidate.fullName || !candidate.email) {
            results.push({
              fileName: candidate.fileName || 'Unknown',
              success: false,
              error: 'Missing name or email'
            });
            continue;
          }

          // Check for existing candidate
          const existing = await storage.getCandidateByEmail(candidate.email.toLowerCase());
          if (existing) {
            results.push({
              fileName: candidate.fileName || 'Unknown',
              success: false,
              error: 'Email already exists'
            });
            continue;
          }

          const candidateId = await storage.generateNextCandidateId();

          // Helper function to convert string "null" to actual null
          const cleanValue = (value: any): any => {
            if (!value) return null;
            const str = String(value).trim().toLowerCase();
            if (str === 'null' || str === 'undefined' || str === '' || str === 'not available' || str === 'n/a') {
              return null;
            }
            return value;
          };

          await storage.createCandidate({
            candidateId,
            fullName: candidate.fullName,
            email: candidate.email.toLowerCase(),
            phone: cleanValue(candidate.phone),
            designation: cleanValue(candidate.designation),
            experience: cleanValue(candidate.experience),
            skills: cleanValue(candidate.skills),
            location: cleanValue(candidate.location),
            company: cleanValue(candidate.company),
            education: cleanValue(candidate.education),
            linkedinUrl: cleanValue(candidate.linkedinUrl),
            portfolioUrl: cleanValue(candidate.portfolioUrl),
            websiteUrl: cleanValue(candidate.websiteUrl),
            currentRole: cleanValue(candidate.currentRole),
            resumeFile: candidate.filePath || null,
            addedBy: addedBy || 'Admin Bulk Import',
            pipelineStatus: 'New',
            isActive: true,
            isVerified: false,
            createdAt: new Date().toISOString()
          });

          results.push({
            fileName: candidate.fileName || 'Unknown',
            success: true,
            candidateId
          });
        } catch (err: any) {
          results.push({
            fileName: candidate.fileName || 'Unknown',
            success: false,
            error: err.message || 'Failed to create candidate'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      res.json({
        total: results.length,
        successCount,
        failedCount,
        results
      });
    } catch (error) {
      console.error('Bulk import candidates error:', error);
      res.status(500).json({ message: "Failed to import candidates" });
    }
  });

  // Update employee
  app.put("/api/admin/employees/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Validate update data with partial schema
      const updateSchema = insertEmployeeSchema.partial();
      const validatedData = updateSchema.parse(req.body);

      // Hash password if it's being updated
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }

      const updatedEmployee = await storage.updateEmployee(id, validatedData);

      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ message: "Employee updated successfully", employee: updatedEmployee });
    } catch (error: any) {
      console.error('Update employee error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Employee with this email or ID already exists" });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Verify admin password before deletion
  app.post("/api/admin/verify-password", requireAdminAuth, async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ success: false, message: "Password is required" });
      }

      // Get the current admin user
      const adminId = req.session.employeeId;
      if (!adminId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const user = await storage.getEmployeeById(adminId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        res.json({ success: true, message: "Password verified" });
      } else {
        res.json({ success: false, message: "Invalid password" });
      }
    } catch (error) {
      console.error('Password verification error:', error);
      res.status(500).json({ success: false, message: "Failed to verify password" });
    }
  });

  // Delete employee
  app.delete("/api/admin/employees/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Verify employee exists before deletion
      const employeeToDelete = await storage.getEmployeeById(id);
      if (!employeeToDelete) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Perform hard delete - completely remove from database
      const deleted = await storage.deleteEmployee(id);

      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete employee from database" });
      }

      // Verify deletion by checking if employee still exists
      const verifyDelete = await storage.getEmployeeById(id);
      if (verifyDelete) {
        console.error('Employee still exists after deletion attempt:', id);
        return res.status(500).json({ message: "Employee deletion failed - record still exists" });
      }

      res.json({
        message: "Employee deleted successfully",
        deleted: true,
        email: employeeToDelete.email // Return email for confirmation
      });
    } catch (error: any) {
      console.error('Delete employee error:', error);
      if (error.message?.includes('foreign key') || error.message?.includes('constraint')) {
        return res.status(409).json({
          message: "Cannot delete employee: record is referenced by other data. Please remove related records first."
        });
      }
      res.status(500).json({ message: "Failed to delete employee", error: error.message });
    }
  });

  // Update client
  app.put("/api/admin/clients/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Validate update data with partial schema
      const updateSchema = z.object({
        clientCode: z.string().min(1).optional(),
        brandName: z.string().min(1).optional(),
        incorporatedName: z.string().optional(),
        gstin: z.string().optional(),
        address: z.string().optional(),
        location: z.string().optional(),
        spoc: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        website: z.string().optional(),
        linkedin: z.string().optional(),
        agreement: z.string().optional(),
        percentage: z.string().optional(),
        category: z.string().optional(),
        paymentTerms: z.string().optional(),
        source: z.string().optional(),
        startDate: z.string().optional(),
        referral: z.string().optional(),
        currentStatus: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);

      const updatedClient = await storage.updateClient(id, validatedData);

      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json({ message: "Client updated successfully", client: updatedClient });
    } catch (error: any) {
      console.error('Update client error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Client with this code already exists" });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Delete client
  app.delete("/api/admin/clients/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteClient(id);

      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Seed database endpoint - call once to populate initial data
  app.post("/api/admin/seed-database", requireAdminAuth, async (req, res) => {
    try {
      // Check if employees already exist
      const existingEmployees = await storage.getAllEmployees();
      if (existingEmployees.length > 0) {
        return res.status(400).json({ message: "Database already seeded. Employees exist." });
      }

      // Sample employee data
      const sampleEmployees = [
        {
          employeeId: "STTL001",
          name: "Priya Sharma",
          email: "priya@gmail.com",
          password: "priya123",
          role: "team_leader",
          age: "32",
          phone: "9876543211",
          department: "Talent Acquisition",
          joiningDate: "2023-06-10",
          reportingTo: "ADMIN"
        },
        {
          employeeId: "STTA001",
          name: "Ram Kumar",
          email: "ram@gmail.com",
          password: "ram123",
          role: "recruiter",
          age: "28",
          phone: "9876543210",
          department: "Talent Acquisition",
          joiningDate: "2024-01-15",
          reportingTo: "STTL001"
        },
        {
          employeeId: "STCL001",
          name: "Arjun Patel",
          email: "arjun@gmail.com",
          password: "arjun123",
          role: "client",
          age: "35",
          phone: "9876543212",
          department: "Client Relations",
          joiningDate: "2023-03-20",
          reportingTo: "Admin"
        },
        {
          employeeId: "ADMIN",
          name: "Admin User",
          email: "admin@gmail.com",
          password: "admin123",
          role: "admin",
          age: "40",
          phone: "9876543213",
          department: "Administration",
          joiningDate: "2022-01-01",
          reportingTo: "CEO"
        }
      ];

      // Hash passwords and create employees
      const saltRounds = 10;
      const createdEmployees = [];
      for (const emp of sampleEmployees) {
        const hashedPassword = await bcrypt.hash(emp.password, saltRounds);
        const employee = await storage.createEmployee({
          employeeId: emp.employeeId,
          name: emp.name,
          email: emp.email,
          password: hashedPassword,
          role: emp.role,
          age: emp.age,
          phone: emp.phone,
          department: emp.department,
          joiningDate: emp.joiningDate,
          reportingTo: emp.reportingTo
        });
        createdEmployees.push(employee);
      }

      res.json({
        success: true,
        message: `Database seeded successfully. Created ${createdEmployees.length} employees.`,
        employees: createdEmployees.map(e => ({ email: e.email, role: e.role }))
      });
    } catch (error) {
      console.error('Seed database error:', error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Impact Metrics routes
  // Create impact metrics
  app.post("/api/admin/impact-metrics", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertImpactMetricsSchema.parse(req.body);
      const metrics = await storage.createImpactMetrics(validatedData);
      res.json({ message: "Impact metrics created successfully", metrics });
    } catch (error: any) {
      console.error('Create impact metrics error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid impact metrics data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create impact metrics" });
    }
  });

  // Get all impact metrics
  app.get("/api/admin/impact-metrics", requireAdminAuth, async (req, res) => {
    try {
      const { clientId } = req.query;

      if (clientId && typeof clientId === 'string') {
        const metrics = await storage.getImpactMetrics(clientId);
        if (!metrics) {
          return res.status(404).json({ message: "Impact metrics not found" });
        }
        return res.json(metrics);
      }

      const allMetrics = await storage.getAllImpactMetrics();
      res.json(allMetrics);
    } catch (error) {
      console.error('Get impact metrics error:', error);
      res.status(500).json({ message: "Failed to get impact metrics" });
    }
  });

  // Update impact metrics
  app.put("/api/admin/impact-metrics/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const updateSchema = z.object({
        clientId: z.string().optional(),
        speedToHire: z.number().optional(),
        revenueImpactOfDelay: z.number().optional(),
        clientNps: z.number().optional(),
        candidateNps: z.number().optional(),
        feedbackTurnAround: z.number().optional(),
        feedbackTurnAroundAvgDays: z.number().optional(),
        firstYearRetentionRate: z.number().optional(),
        fulfillmentRate: z.number().optional(),
        revenueRecovered: z.number().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedMetrics = await storage.updateImpactMetrics(id, validatedData);

      if (!updatedMetrics) {
        return res.status(404).json({ message: "Impact metrics not found" });
      }

      res.json({ message: "Impact metrics updated successfully", metrics: updatedMetrics });
    } catch (error: any) {
      console.error('Update impact metrics error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid impact metrics data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update impact metrics" });
    }
  });

  // Delete impact metrics
  app.delete("/api/admin/impact-metrics/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteImpactMetrics(id);

      if (!deleted) {
        return res.status(404).json({ message: "Impact metrics not found" });
      }

      res.json({ message: "Impact metrics deleted successfully" });
    } catch (error) {
      console.error('Delete impact metrics error:', error);
      res.status(500).json({ message: "Failed to delete impact metrics" });
    }
  });

  // Client Metrics Endpoints
  // Speed metrics current values
  // Algorithms:
  // - Time to 1st Submission: Average days from requirement creation to first candidate submission
  // - Time to Interview: Average days from first submission to first interview scheduled
  // - Time to Offer: Average days from interview to offer extended
  // - Time to Fill: Average days from requirement creation to closure/joining
  app.get("/api/client/speed-metrics", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const authEmp = {
        id: employee.id,
        role: employee.role,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        clientCompanyId: employee.clientCompanyId,
      };
      const { requirements: allRequirements } = await getClientScopedRequirements(authEmp);

      const period = req.query.period as string || 'monthly';
      const dateStr = req.query.date as string;
      const roleId = req.query.role as string;

      let scopedRequirements = allRequirements;
      if (roleId && roleId !== 'all') {
        scopedRequirements = scopedRequirements.filter((req: any) => req.id === roleId);
      }

      // Get all applications for these requirements
      const allApplications = await storage.getAllJobApplications();
      const clientRequirementIds = new Set(scopedRequirements.map((req: any) => req.id));
      const clientApplications = allApplications.filter((app: any) =>
        app.requirementId && clientRequirementIds.has(app.requirementId)
      );

      // Filter by period
      let filteredApplications = clientApplications;
      if (dateStr) {
        const filterDate = new Date(dateStr);
        // Helper to parse date (handles DD-MM-YYYY and ISO formats)
        const parseDate = (dateStr: string): Date | null => {
          if (!dateStr) return null;
          try {
            // Try DD-MM-YYYY format first
            if (dateStr.includes('-') && dateStr.split('-').length === 3) {
              const parts = dateStr.split('-');
              if (parts[0].length <= 2 && parts[1].length <= 2) {
                const [day, month, year] = parts;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              }
            }
            // Try ISO format
            return new Date(dateStr);
          } catch {
            return null;
          }
        };

        if (period === 'daily') {
          filteredApplications = clientApplications.filter((app: any) => {
            if (!app.appliedDate) return false;
            const appDate = parseDate(app.appliedDate);
            if (!appDate) return false;
            return appDate.toDateString() === filterDate.toDateString();
          });
        } else if (period === 'weekly') {
          const weekStart = new Date(filterDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          filteredApplications = clientApplications.filter((app: any) => {
            if (!app.appliedDate) return false;
            const appDate = parseDate(app.appliedDate);
            if (!appDate) return false;
            return appDate >= weekStart && appDate <= weekEnd;
          });
        } else if (period === 'monthly') {
          filteredApplications = clientApplications.filter((app: any) => {
            if (!app.appliedDate) return false;
            const appDate = parseDate(app.appliedDate);
            if (!appDate) return false;
            return appDate.getMonth() === filterDate.getMonth() &&
              appDate.getFullYear() === filterDate.getFullYear();
          });
        }
      }

      // Calculate Time to 1st Submission
      let timeToFirstSubmission = 0;
      const firstSubmissions = scopedRequirements.map((req: any) => {
        const firstApp = filteredApplications
          .filter((app: any) => app.requirementId === req.id)
          .sort((a: any, b: any) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime())[0];
        if (firstApp && req.createdAt) {
          const reqDate = new Date(req.createdAt);
          const appDate = new Date(firstApp.appliedDate);
          return Math.floor((appDate.getTime() - reqDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        return null;
      }).filter((days: any) => days !== null && days >= 0);
      if (firstSubmissions.length > 0) {
        timeToFirstSubmission = Math.round(firstSubmissions.reduce((a: number, b: number) => a + b, 0) / firstSubmissions.length);
      }

      // Calculate Time to Interview (simplified - using status changes)
      let timeToInterview = 0;
      const interviewTimes = filteredApplications
        .filter((app: any) => ['L1', 'L2', 'L3', 'Final Round', 'HR Round'].includes(app.status))
        .map((app: any) => {
          if (app.appliedDate && app.updatedAt) {
            const appDate = new Date(app.appliedDate);
            const interviewDate = new Date(app.updatedAt);
            return Math.floor((interviewDate.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          return null;
        })
        .filter((days: any) => days !== null && days >= 0);
      if (interviewTimes.length > 0) {
        timeToInterview = Math.round(interviewTimes.reduce((a: number, b: number) => a + b, 0) / interviewTimes.length);
      }

      // Calculate Time to Offer
      let timeToOffer = 0;
      const offerTimes = filteredApplications
        .filter((app: any) => ['Offer Stage', 'Selected', 'Closure', 'Joined'].includes(app.status))
        .map((app: any) => {
          if (app.appliedDate && app.updatedAt) {
            const appDate = new Date(app.appliedDate);
            const offerDate = new Date(app.updatedAt);
            return Math.floor((offerDate.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          return null;
        })
        .filter((days: any) => days !== null && days >= 0);
      if (offerTimes.length > 0) {
        timeToOffer = Math.round(offerTimes.reduce((a: number, b: number) => a + b, 0) / offerTimes.length);
      }

      // Calculate Time to Fill
      let timeToFill = 0;
      const fillTimes = allRequirements
        .filter((req: any) => req.status === 'closed' || req.status === 'filled')
        .map((req: any) => {
          if (req.createdAt && req.updatedAt) {
            const reqDate = new Date(req.createdAt);
            const fillDate = new Date(req.updatedAt);
            return Math.floor((fillDate.getTime() - reqDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          return null;
        })
        .filter((days: any) => days !== null && days >= 0);
      if (fillTimes.length > 0) {
        timeToFill = Math.round(fillTimes.reduce((a: number, b: number) => a + b, 0) / fillTimes.length);
      }

      res.json({
        timeToFirstSubmission: timeToFirstSubmission || 0,
        timeToInterview: timeToInterview || 0,
        timeToOffer: timeToOffer || 0,
        timeToFill: timeToFill || 0
      });
    } catch (error: any) {
      console.error('Speed metrics error:', error);
      res.status(500).json({
        timeToFirstSubmission: 0,
        timeToInterview: 0,
        timeToOffer: 0,
        timeToFill: 0
      });
    }
  });

  // Quality metrics current values
  // Algorithms:
  // - Submission to Short List %: (Shortlisted candidates / Total submissions) * 100
  // - Interview to Offer %: (Offers extended / Interviews conducted) * 100
  // - Offer Acceptance %: (Accepted offers / Total offers) * 100
  // - Early Attrition %: (Candidates who left within 90 days / Total hires) * 100
  app.get("/api/client/quality-metrics", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const authEmp = {
        id: employee.id,
        role: employee.role,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        clientCompanyId: employee.clientCompanyId,
      };
      const { requirements: allRequirements } = await getClientScopedRequirements(authEmp);

      const period = req.query.period as string || 'monthly';
      const dateStr = req.query.date as string;
      const roleId = req.query.role as string;

      let scopedRequirements = allRequirements;
      if (roleId && roleId !== 'all') {
        scopedRequirements = scopedRequirements.filter((req: any) => req.id === roleId);
      }

      // Get all applications
      const allApplications = await storage.getAllJobApplications();
      const clientRequirementIds = new Set(scopedRequirements.map((req: any) => req.id));
      let clientApplications = allApplications.filter((app: any) =>
        app.requirementId && clientRequirementIds.has(app.requirementId)
      );

      // Filter by period
      if (dateStr) {
        const filterDate = new Date(dateStr);
        // Helper to parse date (handles DD-MM-YYYY and ISO formats)
        const parseDate = (dateStr: string): Date | null => {
          if (!dateStr) return null;
          try {
            // Try DD-MM-YYYY format first
            if (dateStr.includes('-') && dateStr.split('-').length === 3) {
              const parts = dateStr.split('-');
              if (parts[0].length <= 2 && parts[1].length <= 2) {
                const [day, month, year] = parts;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              }
            }
            // Try ISO format
            return new Date(dateStr);
          } catch {
            return null;
          }
        };

        if (period === 'daily') {
          clientApplications = clientApplications.filter((app: any) => {
            if (!app.appliedDate) return false;
            const appDate = parseDate(app.appliedDate);
            if (!appDate) return false;
            return appDate.toDateString() === filterDate.toDateString();
          });
        } else if (period === 'weekly') {
          const weekStart = new Date(filterDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          clientApplications = clientApplications.filter((app: any) => {
            if (!app.appliedDate) return false;
            const appDate = parseDate(app.appliedDate);
            if (!appDate) return false;
            return appDate >= weekStart && appDate <= weekEnd;
          });
        } else if (period === 'monthly') {
          clientApplications = clientApplications.filter((app: any) => {
            if (!app.appliedDate) return false;
            const appDate = parseDate(app.appliedDate);
            if (!appDate) return false;
            return appDate.getMonth() === filterDate.getMonth() &&
              appDate.getFullYear() === filterDate.getFullYear();
          });
        }
      }

      // Calculate Submission to Short List %
      const totalSubmissions = clientApplications.length;
      const shortlisted = clientApplications.filter((app: any) =>
        ['Shortlisted', 'L1', 'L2', 'L3', 'Final Round', 'HR Round', 'Offer Stage', 'Selected', 'Closure', 'Joined'].includes(app.status)
      ).length;
      const submissionToShortList = totalSubmissions > 0 ? Math.round((shortlisted / totalSubmissions) * 100) : 0;

      // Calculate Interview to Offer %
      const interviewed = clientApplications.filter((app: any) =>
        ['L1', 'L2', 'L3', 'Final Round', 'HR Round', 'Offer Stage', 'Selected', 'Closure', 'Joined'].includes(app.status)
      ).length;
      const offersExtended = clientApplications.filter((app: any) =>
        ['Offer Stage', 'Selected', 'Closure', 'Joined'].includes(app.status)
      ).length;
      const interviewToOffer = interviewed > 0 ? Math.round((offersExtended / interviewed) * 100) : 0;

      // Calculate Offer Acceptance %
      const totalOffers = offersExtended;
      const acceptedOffers = clientApplications.filter((app: any) =>
        ['Closure', 'Joined'].includes(app.status)
      ).length;
      const offerAcceptance = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0;

      // Calculate Early Attrition % (simplified - would need hire date and exit date tracking)
      const earlyAttrition = 0; // TODO: Implement with proper tracking

      res.json({
        submissionToShortList: submissionToShortList || 0,
        interviewToOffer: interviewToOffer || 0,
        offerAcceptance: offerAcceptance || 0,
        earlyAttrition: earlyAttrition || 0
      });
    } catch (error: any) {
      console.error('Quality metrics error:', error);
      res.status(500).json({
        submissionToShortList: 0,
        interviewToOffer: 0,
        offerAcceptance: 0,
        earlyAttrition: 0
      });
    }
  });

  // Speed metrics chart data
  app.get("/api/client/speed-metrics-chart", (req, res) => {
    res.json([
      { month: 'Jan', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Feb', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Mar', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Apr', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'May', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Jun', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 }
    ]);
  });

  // Quality metrics chart data
  app.get("/api/client/quality-metrics-chart", (req, res) => {
    res.json([
      { month: 'Jan', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Feb', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Mar', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Apr', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'May', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Jun', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 }
    ]);
  });

  // Client Impact Metrics Endpoint
  app.get("/api/client/impact-metrics", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      if (!isClientAdminRole(employee.role)) {
        return res.json([
          {
            speedToHire: 0,
            revenueImpactOfDelay: 0,
            clientNps: 0,
            candidateNps: 0,
            feedbackTurnAround: 0,
            firstYearRetentionRate: 0,
            fulfillmentRate: 0,
            revenueRecovered: 0,
          },
        ]);
      }

      // Get impact metrics (can be global or client-specific)
      const allMetrics = await storage.getImpactMetrics();

      // Return first metric or default
      if (allMetrics && allMetrics.length > 0) {
        res.json(allMetrics);
      } else {
        // Return default metrics if none exist
        res.json([{
          speedToHire: 0,
          revenueImpactOfDelay: 0,
          clientNps: 0,
          candidateNps: 0,
          feedbackTurnAround: 0,
          firstYearRetentionRate: 0,
          fulfillmentRate: 0,
          revenueRecovered: 0
        }]);
      }
    } catch (error: any) {
      console.error('Client impact metrics error:', error);
      res.status(500).json([{
        speedToHire: 0,
        revenueImpactOfDelay: 0,
        clientNps: 0,
        candidateNps: 0,
        feedbackTurnAround: 0,
        firstYearRetentionRate: 0,
        fulfillmentRate: 0,
        revenueRecovered: 0
      }]);
    }
  });

  // Client Dashboard Stats - Get authenticated client's dashboard statistics
  app.get("/api/client/dashboard-stats", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Get client company
      const authEmp = {
        id: employee.id,
        role: employee.role,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        clientCompanyId: employee.clientCompanyId,
      };

      if (!isClientAdminRole(employee.role)) {
        const { requirements } = await getClientScopedRequirements(authEmp);
        const allApplications = await storage.getAllJobApplications();
        const reqIds = new Set(requirements.map((r) => r.id));
        const normalizeStatus = (value: string | null | undefined) =>
          (value || "").trim().toLowerCase();
        const totalPositions = requirements.reduce(
          (sum, r) => sum + Math.max(1, Number(r.noOfPositions) || 1),
          0,
        );
        const activeRoles = requirements.filter((r) => {
          const s = normalizeStatus(r.status);
          return s === "open" || s === "in_progress" || s === "active";
        }).length;
        const pausedRoles = requirements.filter(
          (r) => normalizeStatus(r.status) === "paused",
        ).length;
        const withdrawnRoles = requirements.filter(
          (r) => (r.managementStatus || "").trim().toLowerCase() === "closed",
        ).length;
        const scopedApps = allApplications.filter(
          (a) => a.requirementId && reqIds.has(a.requirementId),
        );
        const successfulHires = scopedApps.filter((a) => {
          const s = normalizeStatus(a.status);
          return (
            s.includes("joined") ||
            s.includes("hired") ||
            s.includes("offer accepted") ||
            s.includes("closure")
          );
        }).length;

        return res.json({
          rolesAssigned: requirements.length,
          totalPositions,
          activeRoles,
          pausedRoles,
          withdrawnRoles,
          successfulHires,
        });
      }

      const client = await findCompanyForEmployee(employee);
      const companyName = client?.brandName || employee.name;
      const stats = await storage.getClientDashboardStats(companyName);
      res.json(stats);
    } catch (error) {
      console.error('Get client dashboard stats error:', error);
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  // Client Requirements - Get requirements for client's company (only client-submitted JDs with STR format)
  app.get("/api/client/requirements", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const client = await findCompanyForEmployee(employee);
      const companyName = client?.brandName || employee.name;

      console.log('Fetching requirements for client:', companyName, 'Employee ID:', employee.employeeId);

      const allRequirements = await storage.getRequirementsByCompany(companyName);
      console.log('All requirements for company:', allRequirements.length);

      // Return company requirements (admin: all; member: assigned only)
      let clientJDs = allRequirements.filter((req: any) => !req.isArchived);
      if (!isClientAdminRole(employee.role)) {
        clientJDs = clientJDs.filter(
          (req: any) => req.assignedClientMemberId === employee.id,
        );
      }
      clientJDs = clientJDs.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });

      console.log('Client requirements found:', clientJDs.length);

      // Get all job applications to count profiles shared per requirement
      const allApplications = await storage.getAllJobApplications();

      const allEmployeesForAssign = await storage.getAllEmployees();
      const assigneeNameById = new Map<string, string>();
      for (const e of allEmployeesForAssign) {
        if (
          client?.id &&
          e.clientCompanyId === client.id &&
          (e.role || "").toLowerCase() === "client_member"
        ) {
          assigneeNameById.set(e.id, e.name);
        }
      }

      // Transform requirements for client view
      const rolesData = await Promise.all(clientJDs.map(async (req) => {
        // Count profiles shared for this requirement
        const profilesShared = allApplications.filter(app => app.requirementId === req.id).length;

        // Get last active date (most recent application date for this requirement, or requirement creation date)
        const requirementApplications = allApplications
          .filter(app => app.requirementId === req.id)
          .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

        const lastActiveDate = requirementApplications.length > 0
          ? requirementApplications[0].appliedDate
          : req.createdAt;

        // Determine status
        let status = 'Active';
        if (req.status === 'paused') status = 'Paused';
        else if (req.status === 'withdrawn' || req.status === 'cancelled') status = 'Withdrawn';
        else if (req.status === 'completed' || req.status === 'closed') status = 'Closed';
        else if (req.status === 'open' || req.status === 'in_progress') status = 'Active';

        return {
          id: req.id, // Include id field for filtering
          roleId: req.id, // This is already in STR format (or UUID)
          role: req.position,
          noOfPositions: req.noOfPositions ?? 1,
          position: req.position, // Include position field as well
          team: req.teamLead || 'N/A',
          recruiter: req.talentAdvisor || 'N/A',
          sharedOn: req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          }).replace(/\//g, '-') : 'N/A',
          status,
          profilesShared,
          lastActive: lastActiveDate ? new Date(lastActiveDate).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          }).replace(/\//g, '-') : 'N/A',
          jdFile: req.jdFile || null,
          jdText: req.jdText || null,
          primarySkills: req.primarySkills || null,
          secondarySkills: req.secondarySkills || null,
          knowledgeOnly: req.knowledgeOnly || null,
          specialInstructions: req.specialInstructions || null,
          createdAt: req.createdAt || null,
          sharedOnRaw: req.createdAt || null,
          lastActiveRaw: lastActiveDate || null,
          assignedClientMemberId: req.assignedClientMemberId || null,
          assignedMemberName: req.assignedClientMemberId
            ? assigneeNameById.get(req.assignedClientMemberId) || null
            : null,
        };
      }));

      res.json(rolesData);
    } catch (error) {
      console.error('Get client requirements error:', error);
      res.status(500).json({ message: "Failed to get requirements" });
    }
  });

  // Client Pipeline - Get pipeline data for client's company
  app.get("/api/client/pipeline", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Get filter parameters
      const requirementId = req.query.requirementId as string | undefined;
      const talentAdvisorId = req.query.ta as string | undefined;

      const { clientRequirements, applications: scopedApplications } =
        await getJobApplicationsScopedToClient(employee);

      const clientRequirementIds = new Set(clientRequirements.map((req) => req.id));

      let applications = scopedApplications;

      // Apply additional filters if provided
      if (requirementId && requirementId !== 'all') {
        const selectedRequirement = clientRequirements.find((req: any) => req.id === requirementId);
        const selectedRole = (selectedRequirement?.position || '').trim().toLowerCase();

        applications = applications.filter((app: any) => {
          const reqId = (app.requirementId || '').trim();
          const appRole = (app.jobTitle || app.roleApplied || '').trim().toLowerCase();
          return reqId === requirementId || (!!selectedRole && appRole === selectedRole);
        });
      }

      if (talentAdvisorId && talentAdvisorId !== 'all') {
        // Get requirements assigned to this TA
        const taRequirements = clientRequirements.filter((req: any) =>
          req.talentAdvisorId === talentAdvisorId
        );
        const taRequirementIds = new Set(taRequirements.map((req: any) => req.id));
        applications = applications.filter((app: any) =>
          app.requirementId && taRequirementIds.has(app.requirementId)
        );
      }

      // Get all employees and requirements for enrichment
      const allEmployees = await storage.getAllEmployees();
      const allRequirements = await storage.getRequirements();

      // Transform applications to pipeline data format with TA information
      const pipelineData = applications.map((app: any) => {
        const statusMap: Record<string, string> = {
          'In Process': 'L1',
          'In-Process': 'L1',
          'Resume Review': 'L1',
          'Evaluating': 'L1',
          'Screening': 'L1',
          'Intro Call': 'L1',
          'Assignment': 'L1',
          'Sourced': 'L1',
          'Shortlisted': 'L1',
          'Reviewed': 'L1',
          'Screened Out': 'Rejected',
          'L1': 'L1',
          'L2': 'L2',
          'L3': 'L3',
          'Final Round': 'Final Round',
          'HR Round': 'HR Round',
          'Selected': 'Closure',
          'Joined': 'Closure',
          'Interview Scheduled': 'L1',
          'Applied': 'L1',
          'Offer Stage': 'Offer Stage',
          'Closure': 'Closure',
          'Offer Drop': 'Rejected',
          'Declined': 'Rejected',
          'Rejected': 'Rejected',
          'Hired': 'Closure',
        };

        const raw = (app.status || '').trim();
        const statusLower = raw.toLowerCase();
        const mappedFromMap =
          statusMap[raw] ||
          statusMap[raw.replace(/\s+/g, ' ')] ||
          Object.entries(statusMap).find(([k]) => k.toLowerCase() === statusLower)?.[1];

        const resolvePipelineColumn = (): string => {
          if (statusLower.includes('reject') || statusLower.includes('declin') || statusLower.includes('screened out'))
            return 'Rejected';
          if (statusLower.includes('offer') && !statusLower.includes('drop')) return 'Offer Stage';
          if (mappedFromMap) return mappedFromMap;
          if (statusLower.includes('join') || statusLower.includes('hired') || statusLower.includes('selected'))
            return 'Closure';
          if (statusLower.includes('hr round') || statusLower === 'hr') return 'HR Round';
          if (statusLower.includes('final')) return 'Final Round';
          if (statusLower === 'l2' || statusLower.includes('level 2')) return 'L2';
          if (statusLower === 'l3' || statusLower.includes('level 3')) return 'L3';
          if (statusLower === 'l1' || statusLower.includes('level 1')) return 'L1';
          return 'L1';
        };

        const currentStatus = resolvePipelineColumn();

        // Find requirement and TA information
        let requirementPosition = 'N/A';
        let talentAdvisorName = 'N/A';
        let talentAdvisorId = null;

        if (app.requirementId) {
          const requirement = allRequirements.find((r: any) => r.id === app.requirementId);
          if (requirement) {
            requirementPosition = requirement.position || 'N/A';
            if (requirement.talentAdvisorId) {
              const ta = allEmployees.find((e: any) => e.id === requirement.talentAdvisorId);
              if (ta) {
                talentAdvisorName = ta.name || 'N/A';
                talentAdvisorId = ta.id;
              }
            }
          }
        }

        if (requirementPosition === 'N/A') {
          const appRole = (app.jobTitle || app.roleApplied || '').trim().toLowerCase();
          const appCompany = (app.company || '').trim().toLowerCase();
          const fallbackRequirement = clientRequirements.find((req: any) => {
            const reqRole = (req.position || '').trim().toLowerCase();
            const reqCompany = (req.company || '').trim().toLowerCase();
            return (!!appRole && reqRole === appRole) || (!!appCompany && reqCompany === appCompany);
          });

          if (fallbackRequirement) {
            requirementPosition = fallbackRequirement.position || 'N/A';
            if (fallbackRequirement.talentAdvisorId) {
              const ta = allEmployees.find((e: any) => e.id === fallbackRequirement.talentAdvisorId);
              if (ta) {
                talentAdvisorName = ta.name || 'N/A';
                talentAdvisorId = ta.id;
              }
            }
          }
        }

        return {
          id: app.id,
          candidateName: app.candidateName || 'Unknown',
          roleApplied: app.jobTitle || requirementPosition,
          requirementId: app.requirementId || null,
          requirementPosition: requirementPosition,
          talentAdvisorName: talentAdvisorName,
          talentAdvisorId: talentAdvisorId,
          currentStatus,
          status: app.status,
          email: app.candidateEmail || 'N/A',
          phone: app.candidatePhone || 'N/A',
          appliedDate: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          }).replace(/\//g, '-') : 'N/A',
          updatedAt: app.updatedAt || app.appliedDate
        };
      });

      res.json(pipelineData);
    } catch (error) {
      console.error('Get client pipeline error:', error);
      res.status(500).json({ message: "Failed to get pipeline data" });
    }
  });

  app.get("/api/client/archived-requirements", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const authEmp = {
        id: employee.id,
        role: employee.role,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
      };
      const { companyName, memberRequirementIds } =
        await getClientScopedRequirements(authEmp);
      const normalizedCompany = (companyName || "").trim().toLowerCase();

      const allArchived = await storage.getArchivedRequirements();
      let scoped = allArchived.filter(
        (req: any) =>
          (req.company || "").trim().toLowerCase() === normalizedCompany,
      );

      if (memberRequirementIds !== null) {
        scoped = scoped.filter((req: any) =>
          memberRequirementIds.has((req.originalId || req.id || "").trim()),
        );
      }

      res.json(scoped);
    } catch (error) {
      console.error("Get client archived requirements error:", error);
      res.status(500).json({ message: "Failed to get archived requirements" });
    }
  });

  app.get("/api/client/archived-candidates", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const { applications: scopedApplications } =
        await getJobApplicationsScopedToClient(employee);

      const archivedStatuses = new Set([
        "screened out",
        "rejected",
        "archived",
        "offer drop",
        "declined",
        "withdrawn",
      ]);

      const archivedCandidates = scopedApplications
        .filter((app: any) => {
          const status = (app.status || app.currentStatus || "")
            .trim()
            .toLowerCase();
          return archivedStatuses.has(status) || status.includes("reject");
        })
        .map((app: any) => ({
          id: app.id,
          candidateName: app.candidateName || "Unknown",
          candidateEmail: app.candidateEmail || "N/A",
          jobTitle: app.jobTitle || app.roleApplied || "N/A",
          company: app.company || "N/A",
          status: app.status || app.currentStatus || "Rejected",
          appliedDate: app.appliedDate || app.updatedAt || null,
          requirementId: app.requirementId || null,
        }));

      res.json(archivedCandidates);
    } catch (error) {
      console.error("Get client archived candidates error:", error);
      res.status(500).json({ message: "Failed to get archived candidates" });
    }
  });

  // Client Drop Rates - Get calculated drop rates for client's company
  app.get("/api/client/drop-rates", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const authEmp = {
        id: employee.id,
        role: employee.role,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        clientCompanyId: employee.clientCompanyId,
      };

      if (!isClientAdminRole(employee.role)) {
        const { requirements } = await getClientScopedRequirements(authEmp);
        const reqIds = new Set(requirements.map((r) => r.id));
        const allApplications = await storage.getAllJobApplications();
        const scoped = allApplications.filter(
          (a) => a.requirementId && reqIds.has(a.requirementId),
        );
        const total = scoped.length;
        const offerDrop = scoped.filter((a) =>
          (a.status || "").toLowerCase().includes("offer drop"),
        ).length;
        const rejected = scoped.filter((a) => {
          const s = (a.status || "").toLowerCase();
          return s.includes("reject") || s.includes("declin") || s.includes("screened out");
        }).length;
        return res.json({
          offerDropRate: total ? Math.round((offerDrop / total) * 100) : 0,
          rejectionRate: total ? Math.round((rejected / total) * 100) : 0,
        });
      }

      const client = await findCompanyForEmployee(employee);
      const companyName = client?.brandName || employee.name;
      const dropRates = await storage.getClientDropRates(companyName);
      res.json(dropRates);
    } catch (error) {
      console.error('Get client drop rates error:', error);
      res.status(500).json({ message: "Failed to get drop rates" });
    }
  });

  // Client Candidate Comments Session
  app.get("/api/client/applications/:id/session", requireClientAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const { allowed, application } = await clientCanAccessJobApplication(employee, id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (!allowed) {
        return res.status(403).json({ message: "Access denied" });
      }

      const details = await resolveApplicationCandidateDetails(application);
      return res.json({ application: details });
    } catch (error) {
      console.error("Get client application session error:", error);
      return res.status(500).json({ message: "Failed to load candidate session" });
    }
  });

  app.get("/api/client/applications/:id/comments", requireClientAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const { allowed } = await clientCanAccessJobApplication(employee, id);
      if (!allowed) {
        return res.status(403).json({ message: "Access denied" });
      }

      const comments = await storage.getCandidateApplicationComments(id);
      return res.json(comments.map(serializeApplicationComment));
    } catch (error) {
      console.error("Get client application comments error:", error);
      return res.status(500).json({ message: "Failed to load comments" });
    }
  });

  app.post("/api/client/applications/:id/comments", requireClientAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const bodySchema = z.object({
        body: z.string().trim().min(1, "Comment cannot be empty").max(5000),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid comment",
          errors: parsed.error.errors,
        });
      }

      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const { allowed } = await clientCanAccessJobApplication(employee, id);
      if (!allowed) {
        return res.status(403).json({ message: "Access denied" });
      }

      let comment;
      try {
        comment = await storage.createCandidateApplicationComment({
          applicationId: id,
          authorEmployeeId: employee.id,
          authorName: employee.name,
          authorRole: "Client",
          body: parsed.data.body,
        });
      } catch (dbError) {
        console.error("createCandidateApplicationComment (client) failed:", dbError);
        const [row] = await db
          .insert(candidateApplicationComments)
          .values({
            applicationId: id,
            authorEmployeeId: employee.id,
            authorName: employee.name,
            authorRole: "Client",
            body: parsed.data.body,
          })
          .returning();
        if (!row) {
          throw dbError;
        }
        comment = row;
      }

      return res.status(201).json(serializeApplicationComment(comment));
    } catch (error) {
      console.error("Create client application comment error:", error);
      return res.status(500).json({ message: "Failed to post comment" });
    }
  });

  // Client Update Application Status - Allow client to update status (e.g., reject)
  app.patch("/api/client/applications/:id/status", requireClientAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const { allowed } = await clientCanAccessJobApplication(employee, id);
      if (!allowed) {
        return res.status(403).json({ message: "Access denied" });
      }

      const trimmedReason = typeof reason === "string" ? reason.trim() : "";
      const statusNote =
        status === "Rejected" && trimmedReason
          ? `Rejected by client: ${trimmedReason}`
          : undefined;

      const application = await storage.updateJobApplicationStatus(
        id,
        status,
        trimmedReason || undefined,
        statusNote,
        trimmedReason || undefined,
      );
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Log pipeline change for recruiter visibility
      if (status === 'Rejected') {
        const session = req.session as any;
        logCandidatePipelineChanged(
          storage,
          session.employeeId || 'client',
          session.employeeName || 'Client',
          'client',
          application.candidateName || 'Candidate',
          application.status || 'Previous',
          'Rejected',
          application.id
        ).catch(err => console.error('Failed to log pipeline change:', err));
      }

      res.json({ success: true, application });
    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Client Update Requirement - Client Admin only
  app.patch("/api/client/requirements/:id", requireClientAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const client = await findCompanyForEmployee(employee);
      const companyName = client?.brandName || employee.name;

      // Verify the requirement belongs to this client
      const requirement = await storage.getRequirementById(id);
      if (!requirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      // Check if requirement belongs to client's company
      if (requirement.company.toLowerCase() !== companyName.toLowerCase()) {
        return res.status(403).json({ message: "You can only update your own requirements" });
      }

      // Only allow updating JD-related fields
      const allowedUpdates: any = {};
      if (req.body.jdText !== undefined) allowedUpdates.jdText = req.body.jdText;
      if (req.body.jdFile !== undefined) allowedUpdates.jdFile = req.body.jdFile;
      if (req.body.position !== undefined) allowedUpdates.position = req.body.position;
      if (req.body.noOfPositions !== undefined) {
        allowedUpdates.noOfPositions = Math.max(1, parseInt(String(req.body.noOfPositions), 10) || 1);
      }
      // Note: Skills fields are not in requirements table schema, so we'll store them in jdText as JSON metadata
      // For now, we'll just update jdText and jdFile, and position

      const updatedRequirement = await storage.updateRequirement(id, allowedUpdates);
      if (!updatedRequirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      res.json(updatedRequirement);
    } catch (error) {
      console.error('Update client requirement error:', error);
      res.status(500).json({ message: "Failed to update requirement" });
    }
  });

  // Client Closures - Get closure reports for client's company
  app.get("/api/client/closures", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const client = await findCompanyForEmployee(employee);
      const companyName = client?.brandName || employee.name;

      const authEmp = {
        id: employee.id,
        role: employee.role,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        clientCompanyId: employee.clientCompanyId,
      };
      const { requirements: scopedReqs, memberRequirementIds } =
        await getClientScopedRequirements(authEmp);

      let closuresByClientName = await storage.getRevenueMappingsByClientName(companyName);
      if (memberRequirementIds !== null) {
        const assignedPositions = new Set(
          scopedReqs.map((r) => (r.position || "").trim().toLowerCase()).filter(Boolean),
        );
        closuresByClientName = closuresByClientName.filter((c) =>
          assignedPositions.has((c.position || "").trim().toLowerCase()),
        );
      }

      const { applications: scopedApplications } = await getJobApplicationsScopedToClient(employee);

      const isClosureApplicationStatus = (status: string | undefined | null) => {
        const s = (status || "").trim().toLowerCase();
        if (!s) return false;
        if (s.includes("offer drop")) return false;
        if (s.includes("reject") || s.includes("screened out")) return false;
        if (s.includes("declined") && !s.includes("offer accepted")) return false;
        if (/\b(joined|hired|closure|selected|placed|onboarded|onboarding)\b/.test(s)) return true;
        if (s.includes("offer accepted")) return true;
        if (s.includes("joined") || s.includes("hired")) return true;
        return false;
      };

      const clientClosureApplications = scopedApplications.filter((app: any) =>
        isClosureApplicationStatus(app.status)
      );

      const mergedClosureReports = [
        ...closuresByClientName.map((closure) => ({
          candidate: closure.candidateName || 'N/A',
          position: closure.position || 'N/A',
          advisor: closure.talentAdvisorName || 'N/A',
          offered: closure.offeredDate || 'N/A',
          joined: closure.closureDate || 'N/A',
          _key: `rev-${closure.id}`
        })),
        ...clientClosureApplications.map((app: any) => ({
          candidate: app.candidateName || 'N/A',
          position: app.jobTitle || app.roleApplied || 'N/A',
          advisor: 'N/A',
          offered: 'N/A',
          joined: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A',
          _key: `app-${app.id}`
        }))
      ];

      // Deduplicate by candidate+position+joined
      const seen = new Set<string>();
      const closureReports = mergedClosureReports.filter((row) => {
        const key = `${row.candidate}::${row.position}::${row.joined}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).map(({ _key, ...rest }) => rest);

      res.json(closureReports);
    } catch (error) {
      console.error('Get client closures error:', error);
      res.status(500).json({ message: "Failed to get closures" });
    }
  });

  // Public client invite (no auth)
  app.get("/api/client/invites/validate", async (req, res) => {
    try {
      const token = String(req.query.token || "").trim();
      const preview = await getClientInvitePreview(token);
      if (!preview.valid) {
        return res.status(400).json({ valid: false, message: preview.message });
      }
      res.json({ valid: true, ...preview });
    } catch (error) {
      console.error("Validate client invite error:", error);
      res.status(500).json({ valid: false, message: "Failed to validate invite" });
    }
  });

  app.post("/api/client/invites/accept", async (req, res) => {
    try {
      const bodySchema = z.object({
        token: z.string().min(1),
        password: z.string().min(6),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Token and password (min 6 chars) are required" });
      }
      const result = await acceptClientMemberInvite(
        parsed.data.token,
        parsed.data.password,
      );
      res.json({
        success: true,
        message: "Account created. You can sign in now.",
        email: result.email,
      });
    } catch (error: any) {
      console.error("Accept client invite error:", error);
      res.status(400).json({
        message: error.message || "Failed to accept invitation",
      });
    }
  });

  // Client Team — admin only
  app.get("/api/client/team", requireClientAdminAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }
      const ctx = await getClientTeamContext(employee);
      if (!ctx) {
        return res.status(404).json({ message: "Company not linked" });
      }
      res.json(ctx);
    } catch (error) {
      console.error("Get client team error:", error);
      res.status(500).json({ message: "Failed to load team" });
    }
  });

  app.post("/api/client/team/departments", requireClientAdminAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }
      const bodySchema = z.object({
        name: z.string().trim().min(1),
        description: z.string().optional(),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Department name is required" });
      }
      const dept = await createClientDepartment(employee, parsed.data);
      res.status(201).json(dept);
    } catch (error) {
      console.error("Create client department error:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  app.post("/api/client/team/members", requireClientAdminAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }
      const bodySchema = z.object({
        name: z.string().trim().min(1),
        email: z.string().email(),
        departmentId: z.string().trim().min(1),
        canSeeSalaryDetails: z.boolean(),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message:
            "Name, email, department, and salary visibility preference are required",
        });
      }
      const member = await createClientTeamMember(employee, parsed.data);
      res.status(201).json(member);
    } catch (error: any) {
      console.error("Create client team member error:", error);
      res.status(500).json({
        message: error.message || "Failed to add member",
      });
    }
  });

  app.patch("/api/client/team/members/:id", requireClientAdminAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }
      const bodySchema = z.object({
        name: z.string().trim().min(1),
        email: z.string().email(),
        departmentId: z.string().trim().min(1),
        canSeeSalaryDetails: z.boolean(),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message:
            "Name, email, department, and salary visibility preference are required",
        });
      }
      const member = await updateClientTeamMember(
        employee,
        req.params.id,
        parsed.data,
      );
      res.json(member);
    } catch (error: any) {
      console.error("Update client team member error:", error);
      res.status(500).json({
        message: error.message || "Failed to update member",
      });
    }
  });

  app.delete("/api/client/team/members/:id", requireClientAdminAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }
      await deleteClientTeamMember(employee, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete client team member error:", error);
      res.status(500).json({
        message: error.message || "Failed to delete member",
      });
    }
  });

  app.post("/api/client/team/invites", requireClientAdminAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }
      const bodySchema = z.object({
        name: z.string().trim().min(1),
        email: z.string().email(),
        departmentId: z.string().optional(),
        canSeeSalaryDetails: z.boolean().optional(),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Name and valid email are required" });
      }
      const baseUrl = resolveClientInviteBaseUrl(req);
      const { invite, inviteUrl } = await createClientMemberInvite(
        employee,
        parsed.data,
        baseUrl,
      );

      const company = await findCompanyForEmployee(employee);
      const emailSent = await sendClientMemberInviteEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        companyName: company?.brandName || "your company",
        inviteUrl,
        expiresInDays: 7,
      });

      res.status(201).json({ invite, inviteUrl, emailSent });
    } catch (error: any) {
      console.error("Create client invite error:", error);
      res.status(500).json({
        message: error.message || "Failed to create invite",
      });
    }
  });

  app.patch(
    "/api/client/team/requirements/:id/assign",
    requireClientAdminAuth,
    async (req, res) => {
      try {
        const employee = await storage.getEmployeeById(req.session.employeeId!);
        if (!employee) {
          return res.status(404).json({ message: "Client not found" });
        }
        const bodySchema = z.object({
          memberId: z.string().nullable().optional(),
        });
        const parsed = bodySchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: "Invalid assignment payload" });
        }
        const memberId =
          parsed.data.memberId === undefined || parsed.data.memberId === ""
            ? null
            : parsed.data.memberId;
        const updated = await assignRequirementToClientMember(
          employee,
          req.params.id,
          memberId,
        );
        res.json(updated);
      } catch (error: any) {
        console.error("Assign requirement member error:", error);
        res.status(400).json({
          message: error.message || "Failed to assign member",
        });
      }
    },
  );

  // Client Profile - Get current client's profile with linked client details
  app.get("/api/client/profile", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const client = await findCompanyForEmployee(employee);

      // Check if client profile is linked (admin created a client record in Master Data)
      const profileLinked = !!client;
      const clientAgreementAccepted = await hasLoggedConsent(employee.id, "client_agreement");

      res.json({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        clientRole: employee.role,
        isClientAdmin: isClientAdminRole(employee.role),
        clientCompanyId: employee.clientCompanyId || client?.id || null,
        employeeId: employee.employeeId,
        department: employee.department || null,
        joiningDate: employee.joiningDate || null,
        profileLinked,
        clientAgreementAccepted,
        // Basic company info - get from linked company
        company: client?.brandName || employee.name || 'Company',
        // Extended client details (only if profile is linked)
        clientDetails: profileLinked ? {
          clientCode: client.clientCode,
          brandName: client.brandName,
          incorporatedName: client.incorporatedName,
          gstin: client.gstin,
          address: client.address,
          location: client.location,
          spoc: client.spoc,
          website: client.website,
          linkedin: client.linkedin,
          category: client.category,
          currentStatus: client.currentStatus,
          startDate: client.startDate
        } : null,
        bannerImage: employee.bannerImage || null,
        profilePicture: employee.profilePicture || null
      });
    } catch (error) {
      console.error('Get client profile error:', error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.patch("/api/client/profile", requireClientAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const updates = req.body as Record<string, unknown>;
      const employeeUpdates: Record<string, unknown> = {};
      if (typeof updates.name === "string" && updates.name.trim()) {
        employeeUpdates.name = updates.name.trim();
      }
      if (updates.phone !== undefined) {
        employeeUpdates.phone = typeof updates.phone === "string" ? updates.phone : employee.phone;
      }
      if (updates.department !== undefined) {
        employeeUpdates.department = typeof updates.department === "string" ? updates.department : employee.department;
      }
      if (updates.profilePicture !== undefined) {
        employeeUpdates.profilePicture = updates.profilePicture === null || updates.profilePicture === ""
          ? null
          : String(updates.profilePicture);
      }
      if (updates.bannerImage !== undefined) {
        employeeUpdates.bannerImage = updates.bannerImage === null || updates.bannerImage === ""
          ? null
          : String(updates.bannerImage);
      }

      const updatedEmployee = await storage.updateEmployee(employee.id, employeeUpdates as any);
      if (!updatedEmployee) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      const client = await findCompanyForEmployee(updatedEmployee);
      const profileLinked = !!client;
      const clientAgreementAccepted = await hasLoggedConsent(updatedEmployee.id, "client_agreement");

      res.json({
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        role: updatedEmployee.role,
        employeeId: updatedEmployee.employeeId,
        department: updatedEmployee.department || null,
        joiningDate: updatedEmployee.joiningDate || null,
        profileLinked,
        clientAgreementAccepted,
        company: client?.brandName || updatedEmployee.name || "Company",
        clientDetails: profileLinked ? {
          clientCode: client!.clientCode,
          brandName: client!.brandName,
          incorporatedName: client!.incorporatedName,
          gstin: client!.gstin,
          address: client!.address,
          location: client!.location,
          spoc: client!.spoc,
          website: client!.website,
          linkedin: client!.linkedin,
          category: client!.category,
          currentStatus: client!.currentStatus,
          startDate: client!.startDate
        } : null,
        bannerImage: updatedEmployee.bannerImage || null,
        profilePicture: updatedEmployee.profilePicture || null
      });
    } catch (error) {
      console.error("Update client profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/client/upload/profile", requireClientAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === "production"
        ? (process.env.BACKEND_URL || `https://${req.get("host")}`)
        : `http://${req.get("host")}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.filename });
    } catch (error) {
      console.error("Client profile upload error:", error);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Shared profiles submitted for a requirement (client-visible)
  app.get("/api/client/requirements/:requirementId/shared-profiles", requireClientAuth, async (req, res) => {
    try {
      const { requirementId } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const clientRequirements = (await getJobApplicationsScopedToClient(employee)).clientRequirements;
      const allowed = new Set(clientRequirements.map((r: any) => String(r.id || "").trim()));
      if (!requirementId || !allowed.has(String(requirementId).trim())) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      const requirement = clientRequirements.find((r: any) => String(r.id).trim() === String(requirementId).trim());
      const allApps = await storage.getAllJobApplications();
      const apps = allApps.filter(
        (app: any) => String(app.requirementId || "").trim() === String(requirementId).trim()
      );

      const profileIds = [...new Set(apps.map((a: any) => a.profileId).filter(Boolean))] as string[];
      const candidatesMap = new Map<string, any>();
      const profilesMap = new Map<string, any>();
      const skillsByProfile = new Map<string, any[]>();

      if (profileIds.length > 0) {
        const chunkSize = 100;
        for (let i = 0; i < profileIds.length; i += chunkSize) {
          const chunk = profileIds.slice(i, i + chunkSize);
          const candidateRows = await db.select().from(candidates).where(inArray(candidates.id, chunk));
          candidateRows.forEach((c) => candidatesMap.set(c.id, c));
          const profileRows = await db.select().from(profiles).where(inArray(profiles.id, chunk));
          profileRows.forEach((p) => profilesMap.set(p.id, p));
        }
        for (const pid of profileIds) {
          try {
            const sk = await storage.getSkillsByProfile(pid);
            if (sk?.length) skillsByProfile.set(pid, sk);
          } catch {
            /* optional */
          }
        }
      }

      const rows = apps.map((app: any) => {
        const pid = app.profileId;
        const cand = pid ? candidatesMap.get(pid) : undefined;
        const prof = pid ? profilesMap.get(pid) : undefined;
        const skills = pid ? skillsByProfile.get(pid) : undefined;
        return {
          application: {
            id: app.id,
            status: app.status,
            appliedDate: app.appliedDate,
            jobTitle: app.jobTitle,
            company: app.company,
            jobType: app.jobType,
            source: app.source,
            description: app.description,
            salary: app.salary,
            location: app.location,
            workMode: app.workMode,
            experience: app.experience,
            skills: app.skills,
            candidateName: app.candidateName,
            candidateEmail: app.candidateEmail,
            candidatePhone: app.candidatePhone,
            statusNote: app.statusNote,
            rejectionReason: app.rejectionReason,
            profileId: app.profileId,
          },
          candidate: cand
            ? {
                id: cand.id,
                candidateId: cand.candidateId,
                fullName: cand.fullName,
                email: cand.email,
                phone: cand.phone,
                company: cand.company,
                designation: cand.designation,
                location: cand.location,
                experience: cand.experience,
                skills: cand.skills,
                education: cand.education,
                currentRole: cand.currentRole,
                profilePicture: cand.profilePicture,
                resumeFile: cand.resumeFile,
                linkedinUrl: cand.linkedinUrl,
                portfolioUrl: cand.portfolioUrl,
                websiteUrl: cand.websiteUrl,
              }
            : null,
          profile: prof
            ? {
                id: prof.id,
                firstName: prof.firstName,
                lastName: prof.lastName,
                email: prof.email,
                phone: prof.phone,
                mobile: prof.mobile,
                title: prof.title,
                location: prof.location,
                education: prof.education,
                portfolio: prof.portfolio,
                linkedinUrl: prof.linkedinUrl,
                profilePicture: prof.profilePicture,
                resumeFile: prof.resumeFile,
                skills: prof.skills,
                highestQualification: prof.highestQualification,
                collegeName: prof.collegeName,
                totalExperience: prof.totalExperience,
                currentCompany: prof.currentCompany,
                currentRole: prof.currentRole,
                noticePeriod: prof.noticePeriod,
                salaryRange: prof.salaryRange,
                preferredLocation: prof.preferredLocation,
                currentLocation: prof.currentLocation,
              }
            : null,
          skillsRows: skills || [],
        };
      });

      res.json({
        requirement: {
          id: requirement?.id || requirementId,
          position: requirement?.position || null,
          company: requirement?.company || null,
        },
        profiles: rows,
      });
    } catch (error) {
      console.error("Get client shared profiles error:", error);
      res.status(500).json({ message: "Failed to load shared profiles" });
    }
  });

  // Client Upload JD File — Client Admin only
  app.post("/api/client/upload-jd-file", requireClientAdminAuth, upload.single('jdFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.filename });
    } catch (error) {
      console.error('JD file upload error:', error);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Client Delete Requirement — Client Admin only
  app.delete("/api/client/requirements/:id", requireClientAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Verify the requirement belongs to this client (STR format and matching company)
      const client = await findCompanyForEmployee(employee);
      const companyName = client?.brandName || employee.name;

      // Get all requirements for the company to verify ownership
      const companyRequirements = await storage.getRequirementsByCompany(companyName);
      const requirement = companyRequirements.find((r: any) => r.id === id);

      if (!requirement) {
        return res.status(404).json({ message: "Requirement not found or you don't have permission to delete it" });
      }

      const deleted = await storage.deleteRequirement(id);
      if (!deleted) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      res.json({ success: true, message: "Requirement deleted successfully" });
    } catch (error) {
      console.error('Delete client requirement error:', error);
      res.status(500).json({ message: "Failed to delete requirement" });
    }
  });

  // Client Parse JD - Extract information from JD file or text
  // Client Parse JD - Extract information from JD file or text
  app.post("/api/client/parse-jd", requireClientAdminAuth, (req, res, next) => {
    // Check if it's a file upload or JSON
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      upload.single('jdFile')(req, res, (err: any) => {
        if (err) {
          console.error('Multer error in parse-jd:', err);
          return res.status(400).json({ success: false, message: "File upload error: " + (err.message || 'Unknown error') });
        }
        next();
      });
    } else {
      // For JSON body, parse it
      next();
    }
  }, async (req, res) => {
    try {
      let jdText = '';

      // If file uploaded, extract text
      if (req.file) {
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;

        try {
          // Use resume parser to extract text from JD file
          const parsed = await parseResumeFile(filePath, mimeType);
          jdText = parsed.rawText;

          // Clean up file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error('JD file parsing error:', error);
          // Continue with empty text
        }
      } else if (req.body.jdText) {
        jdText = req.body.jdText;
      }

      if (!jdText || jdText.trim().length < 10) {
        return res.json({
          success: true,
          data: {
            position: null,
            primarySkills: null,
            secondarySkills: null,
            knowledgeOnly: null
          }
        });
      }

      // Extract information using AI
      const aiParsed = await parseJDWithAI(jdText);
      
      if (aiParsed) {
        return res.json({
          success: true,
          data: {
            position: aiParsed.position || null,
            primarySkills: aiParsed.primarySkills || null,
            secondarySkills: aiParsed.secondarySkills || null,
            knowledgeOnly: aiParsed.knowledgeOnly || null,
            experience: aiParsed.experience || null,
            location: aiParsed.location || null
          }
        });
      }

      // Fallback to basic extraction if AI fails
      return res.json({
        success: true,
        data: {
          position: null,
          primarySkills: null,
          secondarySkills: null,
          knowledgeOnly: null
        }
      });
    } catch (error: any) {
      console.error('Parse JD error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to parse JD",
        error: error.message || 'Unknown error'
      });
    }
  });

  // Client Submit JD — Client Admin only
  app.post("/api/client/submit-jd", requireClientAdminAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployeeById(req.session.employeeId!);
      if (!employee) {
        return res.status(404).json({ message: "Client not found" });
      }

      const client = await findCompanyForEmployee(employee);
      const companyName = client?.brandName || employee.name;

      const {
        jdText,
        jdFile,
        primarySkills,
        secondarySkills,
        knowledgeOnly,
        specialInstructions,
        position,
        noOfPositions
      } = req.body;

      const positionsCount = Math.max(1, parseInt(String(noOfPositions ?? 1), 10) || 1);

      // Validate that at least JD text or file is provided
      if (!jdText && !jdFile) {
        return res.status(400).json({ message: "Job description (text or file) is required" });
      }

      // Extract position from JD text if not provided
      let extractedPosition = position;
      if (!extractedPosition && jdText) {
        // Try to extract position from JD text (look for common patterns)
        const positionPatterns = [
          /(?:position|role|job title|title)[\s:]+([A-Za-z\s&]+)/i,
          /(?:looking for|seeking|hiring)[\s:]+([A-Za-z\s&]+)/i,
          /^([A-Za-z\s&]+?)(?:\s+(?:developer|engineer|manager|analyst|specialist|lead|architect))/i
        ];
        for (const pattern of positionPatterns) {
          const match = jdText.match(pattern);
          if (match && match[1]) {
            extractedPosition = match[1].trim();
            break;
          }
        }
      }

      // If still no position, use default
      if (!extractedPosition) {
        extractedPosition = 'Position from JD';
      }

      // Generate Role ID in format STR25001 (STR + year + sequential number)
      const currentYear = new Date().getFullYear().toString().slice(-2); // Last 2 digits of year
      const allRequirements = await storage.getRequirements();
      const yearRequirements = allRequirements.filter((req: any) => {
        // Check if requirement ID matches STR + year + 3 digits pattern
        return req.id && /^STR\d{5}$/.test(req.id) && req.id.startsWith(`STR${currentYear}`);
      });

      // Find the maximum number to avoid duplicates
      let maxNumber = 0;
      yearRequirements.forEach((req: any) => {
        const numStr = req.id.substring(5); // Get the 3-digit number part
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      });

      const nextNumber = String(maxNumber + 1).padStart(3, '0');
      let roleId = `STR${currentYear}${nextNumber}`;

      // Double-check if ID already exists (race condition protection)
      let attempts = 0;
      while (allRequirements.find((r: any) => r.id === roleId) && attempts < 10) {
        maxNumber++;
        const nextNum = String(maxNumber + 1).padStart(3, '0');
        roleId = `STR${currentYear}${nextNum}`;
        attempts++;
      }

      if (attempts >= 10) {
        return res.status(500).json({ message: "Failed to generate unique role ID. Please try again." });
      }

      // Combine all skills
      const allSkills = [
        ...(primarySkills ? primarySkills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        ...(secondarySkills ? secondarySkills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        ...(knowledgeOnly ? knowledgeOnly.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
      ];

      // Store JD details in notes as JSON
      const jdDetails = {
        jdText: jdText || null,
        jdFile: jdFile || null,
        primarySkills: primarySkills || null,
        secondarySkills: secondarySkills || null,
        knowledgeOnly: knowledgeOnly || null,
        allSkills: allSkills,
        specialInstructions: specialInstructions || null,
        submittedBy: employee.email,
        submittedAt: new Date().toISOString()
      };

      // Create requirement from JD with Role ID as the requirement ID
      // Note: This creates a requirement that will be assigned to a team lead/talent advisor later
      console.log('Creating requirement with company:', companyName, 'SPOC:', employee.name, 'Role ID:', roleId);

      try {
        const requirement = await storage.createRequirement({
          id: roleId, // Use Role ID as requirement ID (STR25001 format)
          position: extractedPosition,
          noOfPositions: positionsCount,
          criticality: 'Medium', // Default, can be updated by admin
          toughness: 'Medium', // Default, can be updated by admin
          company: companyName,
          spoc: employee.name,
          talentAdvisor: null, // Will be assigned by team lead
          talentAdvisorId: null,
          teamLead: null, // Will be assigned by admin
          status: 'open',
          isArchived: false,
          createdAt: new Date().toISOString(),
          jdFile: jdFile || null, // Store JD file URL
          jdText: jdText || null, // Store JD text content
        });

        console.log('Requirement created successfully:', requirement.id, requirement.company);

        res.json({
          success: true,
          message: "Job description submitted successfully",
          requirement: {
            id: requirement.id,
            position: requirement.position,
            company: requirement.company
          }
        });
      } catch (createError: any) {
        console.error('Create requirement error:', createError);
        console.error('Error details:', {
          message: createError.message,
          code: createError.code,
          detail: createError.detail,
          constraint: createError.constraint
        });

        // Check if it's a duplicate key error
        if (createError.message && createError.message.includes('duplicate key')) {
          // Try with next available ID
          maxNumber++;
          const nextNum = String(maxNumber + 1).padStart(3, '0');
          const newRoleId = `STR${currentYear}${nextNum}`;

          try {
            const requirement = await storage.createRequirement({
              id: newRoleId,
              position: extractedPosition,
              noOfPositions: positionsCount,
              criticality: 'Medium',
              toughness: 'Medium',
              company: companyName,
              spoc: employee.name,
              talentAdvisor: null,
              talentAdvisorId: null,
              teamLead: null,
              status: 'open',
              isArchived: false,
              createdAt: new Date().toISOString(),
              jdFile: jdFile || null,
              jdText: jdText || null,
            });

            res.json({
              success: true,
              message: "Job description submitted successfully",
              requirement: {
                id: requirement.id,
                position: requirement.position,
                company: requirement.company
              }
            });
          } catch (retryError: any) {
            console.error('Retry create requirement error:', retryError);
            res.status(500).json({
              message: "Failed to submit job description",
              error: retryError.message || String(retryError),
              details: retryError.detail || retryError.code || 'Unknown error'
            });
          }
        } else {
          res.status(500).json({
            message: "Failed to submit job description",
            error: createError.message || String(createError),
            details: createError.detail || createError.code || 'Unknown error'
          });
        }
      }
    } catch (error: any) {
      console.error('Submit JD error:', error);
      res.status(500).json({
        message: "Failed to submit job description",
        error: error.message || String(error),
        details: error.detail || error.code || 'Unknown error'
      });
    }
  });

  app.post("/api/support/send-message", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          error: "Message is required"
        });
      }

      if (!req.session.supportUserId) {
        req.session.supportUserId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      }

      const candidateEmail = req.session.candidateId
        ? (await storage.getCandidateByCandidateId(req.session.candidateId))?.email
        : null;

      const emailToUse = candidateEmail || `${req.session.supportUserId}@guest.staffos.com`;
      const nameToUse = candidateEmail ? 'Candidate' : 'Guest User';

      const now = new Date().toISOString();
      let convId = req.session.conversationId;

      if (!convId) {
        const existingConv = await db.select()
          .from(supportConversations)
          .where(eq(supportConversations.userEmail, emailToUse))
          .orderBy(desc(supportConversations.createdAt))
          .limit(1);

        if (existingConv.length > 0 && existingConv[0].status !== 'closed') {
          convId = existingConv[0].id;
          await db.update(supportConversations)
            .set({ lastMessageAt: now })
            .where(eq(supportConversations.id, convId));
        } else {
          const newConv = await db.insert(supportConversations).values({
            userId: req.session.candidateId || req.session.supportUserId || null,
            userEmail: emailToUse,
            userName: nameToUse,
            subject: message.substring(0, 100),
            status: 'open',
            lastMessageAt: now,
            createdAt: now,
          }).returning();
          convId = newConv[0].id;
        }

        req.session.conversationId = convId;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        await db.update(supportConversations)
          .set({ lastMessageAt: now })
          .where(eq(supportConversations.id, convId));
      }

      await db.insert(supportMessages).values({
        conversationId: convId,
        senderType: 'user',
        senderName: nameToUse,
        message: message,
        createdAt: now,
      });

      res.json({
        success: true,
        conversationId: convId,
        message: "Your message has been sent to our support team. We'll get back to you shortly."
      });
    } catch (error) {
      console.error('Error sending support message:', error);
      res.status(500).json({
        error: "Failed to send message. Please try again later."
      });
    }
  });

  app.get("/api/support/conversations", requireSupportAuth, async (req, res) => {
    try {
      const conversations = await db.select()
        .from(supportConversations)
        .orderBy(desc(supportConversations.lastMessageAt));

      const conversationsWithCount = await Promise.all(
        conversations.map(async (conv) => {
          const messages = await db.select()
            .from(supportMessages)
            .where(eq(supportMessages.conversationId, conv.id));

          const lastMessage = messages[messages.length - 1];

          return {
            ...conv,
            messageCount: messages.length,
            lastMessage: lastMessage?.message || '',
          };
        })
      );

      res.json(conversationsWithCount);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/support/conversations/:id/messages", requireSupportAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const conversation = await db.select()
        .from(supportConversations)
        .where(eq(supportConversations.id, id))
        .limit(1);

      if (conversation.length === 0) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await db.select()
        .from(supportMessages)
        .where(eq(supportMessages.conversationId, id))
        .orderBy(supportMessages.createdAt);

      res.json({
        conversation: conversation[0],
        messages: messages,
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/support/conversations/:id/reply", requireSupportAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { message, senderName } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      const conversation = await db.select()
        .from(supportConversations)
        .where(eq(supportConversations.id, id))
        .limit(1);

      if (conversation.length === 0) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const now = new Date().toISOString();

      await db.insert(supportMessages).values({
        conversationId: id,
        senderType: 'support',
        senderName: senderName || 'Support Team',
        message: message,
        createdAt: now,
      });

      await db.update(supportConversations)
        .set({
          lastMessageAt: now,
          status: 'in_progress'
        })
        .where(eq(supportConversations.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error('Error sending reply:', error);
      res.status(500).json({ error: "Failed to send reply" });
    }
  });

  app.patch("/api/support/conversations/:id/status", requireSupportAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await db.update(supportConversations)
        .set({ status })
        .where(eq(supportConversations.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.get("/api/support/my-conversation", async (req, res) => {
    try {
      if (!req.session.supportUserId && !req.session.candidateId) {
        req.session.supportUserId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      const candidateEmail = req.session.candidateId
        ? (await storage.getCandidateByCandidateId(req.session.candidateId))?.email
        : null;

      const emailToUse = candidateEmail || `${req.session.supportUserId}@guest.staffos.com`;

      const conversation = await db.select()
        .from(supportConversations)
        .where(eq(supportConversations.userEmail, emailToUse))
        .orderBy(desc(supportConversations.createdAt))
        .limit(1);

      if (conversation.length === 0) {
        return res.json({ conversation: null, messages: [] });
      }

      const messages = await db.select()
        .from(supportMessages)
        .where(eq(supportMessages.conversationId, conversation[0].id))
        .orderBy(supportMessages.createdAt);

      res.json({
        conversation: conversation[0],
        messages: messages,
      });
    } catch (error) {
      console.error('Error fetching my conversation:', error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Support query submission to Google Sheets (for StaffOS Support Chat)
  app.post("/api/support/query", async (req, res) => {
    try {
      const { userName, userRole, message } = req.body;

      // Validate required fields
      if (!userName || !userRole || !message || !message.trim()) {
        return res.status(400).json({
          error: "userName, userRole, and message are required"
        });
      }

      // Google Apps Script Web App URL
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzE52-G4H3wriRavetPeAmmHh_unePqnks16XrrQ7UYoK9oycjMQ4KW5A9XmVc7lJc/exec';

      // Map userRole to display format
      const roleDisplayMap: { [key: string]: string } = {
        'admin': 'Admin',
        'recruiter': 'Rec',
        'team_leader': 'TL',
        'client': 'Client',
        'candidate': 'Candidate'
      };
      const displayRole = roleDisplayMap[userRole] || userRole;

      // Prepare payload for Google Apps Script
      const payload = {
        userName: userName,
        userRole: displayRole,
        message: message.trim()
      };

      // POST to Google Apps Script Web App
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        redirect: 'follow' // Follow redirects (Google Apps Script may redirect)
      });

      if (!response.ok) {
        console.error('Google Apps Script response error:', response.status, response.statusText);
        return res.status(500).json({
          error: "Failed to submit query. Please try again later."
        });
      }

      res.json({
        success: true,
        message: "Your query has been noted. Our production team will reach out to you."
      });
    } catch (error) {
      console.error('Error submitting support query:', error);
      res.status(500).json({
        error: "Failed to submit query. Please try again later."
      });
    }
  });

  // Chat API Routes
  app.get("/api/chat/rooms", requireEmployeeAuth, async (req, res) => {
    try {
      const employeeId = req.session.employeeId!;

      const participations = await db.select()
        .from(chatParticipants)
        .where(eq(chatParticipants.participantId, employeeId));

      const roomIds = participations.map(p => p.roomId);

      if (roomIds.length === 0) {
        return res.json({ rooms: [] });
      }

      const rooms = await db.select()
        .from(chatRooms)
        .where(sql`${chatRooms.id} IN (${sql.join(roomIds.map(id => sql`${id}`), sql`, `)})`);

      const roomsWithParticipants = await Promise.all(rooms.map(async (room) => {
        const participants = await db.select()
          .from(chatParticipants)
          .where(eq(chatParticipants.roomId, room.id));

        // Get unread count for this user in this room (only if table exists)
        let unreadCount = 0;
        try {
          const unreadData = await db.select()
            .from(chatUnreadCounts)
            .where(and(
              eq(chatUnreadCounts.roomId, room.id),
              eq(chatUnreadCounts.participantId, employeeId)
            ))
            .limit(1);

          unreadCount = unreadData.length > 0 ? unreadData[0].unreadCount : 0;
        } catch (err: any) {
          // Table might not exist, use default unread count of 0
          if (err?.code !== '42P01') throw err;
        }

        return {
          ...room,
          participants: participants,
          unreadCount: unreadCount
        };
      }));

      res.json({
        rooms: roomsWithParticipants.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const aTime = a.lastMessageAt || a.createdAt;
          const bTime = b.lastMessageAt || b.createdAt;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        })
      });
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  app.get("/api/chat/rooms/:roomId/messages", requireEmployeeAuth, async (req, res) => {
    try {
      const { roomId } = req.params;
      const employeeId = req.session.employeeId!;

      if (!roomId) {
        return res.status(400).json({ error: "Room ID is required" });
      }

      // Use raw SQL to select only columns that exist in the database
      let messagesResult;
      try {
        messagesResult = await db.execute(sql`
          SELECT id, room_id, sender_id, sender_name, message_type, content, created_at
          FROM chat_messages
          WHERE room_id = ${roomId}
          ORDER BY created_at
        `);
      } catch (sqlError: any) {
        console.error('SQL query error:', sqlError);
        // If table doesn't exist, return empty messages array
        if (sqlError?.code === '42P01') {
          return res.json({ messages: [] });
        }
        throw sqlError;
      }

      // Handle different result structures from db.execute
      const rows = messagesResult?.rows || [];

      const messages = rows.map((row: any) => ({
        id: row.id,
        roomId: row.room_id,
        senderId: row.sender_id,
        senderName: row.sender_name,
        messageType: row.message_type,
        content: row.content,
        createdAt: row.created_at,
        deliveredAt: null, // Optional field - set to null if column doesn't exist
        readAt: null // Optional field - set to null if column doesn't exist
      }));

      // Skip delivery/read tracking and unread count updates - these are optional features
      // that require columns/tables that may not exist in the database yet

      const messagesWithAttachments = await Promise.all(messages.map(async (message) => {
        let attachments: any[] = [];
        try {
          attachments = await db.select()
            .from(chatAttachments)
            .where(eq(chatAttachments.messageId, message.id));
        } catch (err: any) {
          // If attachments table doesn't exist or query fails, just use empty array
          console.warn(`Failed to fetch attachments for message ${message.id}:`, err?.message);
        }

        return {
          ...message,
          attachments: attachments || []
        };
      }));

      res.json({ messages: messagesWithAttachments });
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
        roomId: req.params.roomId
      });
      res.status(500).json({
        error: "Failed to fetch messages",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post("/api/chat/rooms/:roomId/messages", requireEmployeeAuth, async (req, res) => {
    try {
      const { roomId } = req.params;
      const { content, messageType = 'text' } = req.body;
      const employeeId = req.session.employeeId!;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }

      if (!roomId) {
        return res.status(400).json({ error: "Room ID is required" });
      }

      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (!employee.name) {
        console.error('Employee missing name:', employee);
        return res.status(400).json({ error: "Employee name is missing" });
      }

      // Verify the room exists and user is a participant
      const room = await db.select()
        .from(chatRooms)
        .where(eq(chatRooms.id, roomId))
        .limit(1);

      if (!room || room.length === 0) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      // Verify user is a participant in this room
      const userParticipation = await db.select()
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.roomId, roomId),
          eq(chatParticipants.participantId, employeeId)
        ))
        .limit(1);

      if (!userParticipation || userParticipation.length === 0) {
        return res.status(403).json({ error: "You are not a participant in this room" });
      }

      // Use raw SQL insert to avoid issues with optional columns that don't exist in DB yet
      const insertResult = await db.execute(sql`
        INSERT INTO chat_messages (room_id, sender_id, sender_name, message_type, content, created_at)
        VALUES (${roomId}, ${employeeId}, ${employee.name}, ${messageType || 'text'}, ${content.trim()}, ${new Date().toISOString()})
        RETURNING id, room_id, sender_id, sender_name, message_type, content, created_at
      `);

      const newMessage = insertResult.rows;

      if (!newMessage || !newMessage.length || !newMessage[0]) {
        console.error('Failed to create message - insert returned empty result');
        return res.status(500).json({ error: "Failed to create message" });
      }

      // Map database result to match expected format
      const messageRow = newMessage[0] as any;
      const formattedMessage = {
        id: messageRow.id,
        roomId: messageRow.room_id,
        senderId: messageRow.sender_id,
        senderName: messageRow.sender_name,
        messageType: messageRow.message_type,
        content: messageRow.content,
        createdAt: messageRow.created_at
      };

      // Update room's last message timestamp
      try {
        await db.update(chatRooms)
          .set({ lastMessageAt: new Date().toISOString() })
          .where(eq(chatRooms.id, roomId));
      } catch (updateError: any) {
        console.warn('Warning: Failed to update room lastMessageAt:', updateError);
        // Continue even if this fails
      }

      // Skip unread count updates - this is an optional feature that requires a table that may not exist
      // The message has been sent successfully, unread counts are not critical

      // Server-side broadcast to all participants in the room
      try {
        if ((app as any).broadcastToRoom) {
          await (app as any).broadcastToRoom(roomId, {
            type: 'new_message',
            roomId,
            message: formattedMessage
          }, employeeId);
        }
      } catch (broadcastError: any) {
        console.warn('Warning: Failed to broadcast message:', broadcastError);
        // Continue even if broadcast fails
      }

      res.json({ message: formattedMessage });
    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint
      });
      res.status(500).json({
        error: "Failed to send message",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post("/api/chat/upload", requireEmployeeAuth, chatUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/chat/${req.file.filename}`;

      let fileType = 'file';
      if (req.file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (req.file.mimetype === 'application/pdf') {
        fileType = 'pdf';
      } else if (req.file.mimetype.includes('word')) {
        fileType = 'doc';
      }

      res.json({
        fileUrl,
        fileName: req.file.originalname,
        fileType,
        fileSize: req.file.size
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.post("/api/chat/rooms/:roomId/messages/attachment", requireEmployeeAuth, async (req, res) => {
    try {
      const { roomId } = req.params;
      const { fileUrl, fileName, fileType, fileSize } = req.body;
      const employeeId = req.session.employeeId!;

      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Use raw SQL insert to avoid issues with optional columns that don't exist in DB yet
      const insertResult = await db.execute(sql`
        INSERT INTO chat_messages (room_id, sender_id, sender_name, message_type, content, created_at)
        VALUES (${roomId}, ${employeeId}, ${employee.name}, ${fileType}, ${fileName}, ${new Date().toISOString()})
        RETURNING id, room_id, sender_id, sender_name, message_type, content, created_at
      `);

      const newMessage = insertResult.rows;

      if (!newMessage || !newMessage.length || !newMessage[0]) {
        return res.status(500).json({ error: "Failed to create message" });
      }

      const messageRow = newMessage[0] as any;
      const newAttachment = await db.insert(chatAttachments)
        .values({
          messageId: messageRow.id,
          fileName,
          fileUrl,
          fileType,
          fileSize,
          uploadedAt: new Date().toISOString()
        })
        .returning();

      await db.update(chatRooms)
        .set({ lastMessageAt: new Date().toISOString() })
        .where(eq(chatRooms.id, roomId));

      // Format message response
      const formattedMessage = {
        id: messageRow.id,
        roomId: messageRow.room_id,
        senderId: messageRow.sender_id,
        senderName: messageRow.sender_name,
        messageType: messageRow.message_type,
        content: messageRow.content,
        createdAt: messageRow.created_at,
        attachments: [newAttachment[0]]
      };

      // Server-side broadcast to all participants in the room
      if ((app as any).broadcastToRoom) {
        await (app as any).broadcastToRoom(roomId, {
          type: 'new_message',
          roomId,
          message: formattedMessage
        }, employeeId);
      }

      res.json({ message: formattedMessage });
    } catch (error) {
      console.error('Error sending attachment:', error);
      res.status(500).json({ error: "Failed to send attachment" });
    }
  });

  app.get("/api/chat/employees", requireEmployeeAuth, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      const activeEmployees = employees.filter(emp => emp.isActive);

      const employeeList = activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        employeeId: emp.employeeId
      }));

      res.json({ employees: employeeList });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/chat/rooms", requireEmployeeAuth, async (req, res) => {
    try {
      const { name, type, participantIds } = req.body;
      const employeeId = req.session.employeeId!;
      const employee = await storage.getEmployeeById(employeeId);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const newRoom = await db.insert(chatRooms)
        .values({
          name,
          type,
          isPinned: type === 'group' && name === 'Team Chat',
          createdBy: employeeId,
          createdAt: new Date().toISOString()
        })
        .returning();

      const allParticipantIds = [employeeId, ...participantIds];
      for (const participantId of allParticipantIds) {
        const participant = await storage.getEmployeeById(participantId);
        if (participant) {
          await db.insert(chatParticipants)
            .values({
              roomId: newRoom[0].id,
              participantId,
              participantName: participant.name,
              participantRole: participant.role,
              joinedAt: new Date().toISOString()
            });
        }
      }

      res.json({ room: newRoom[0] });
    } catch (error) {
      console.error('Error creating chat room:', error);
      res.status(500).json({ error: "Failed to create chat room" });
    }
  });

  // Get or create a direct chat room between two participants (for Admin-TL/TA messaging)
  app.post("/api/chat/rooms/direct", requireEmployeeAuth, async (req, res) => {
    try {
      const { participantId: otherParticipantId } = req.body;
      const employeeId = req.session.employeeId!;
      const employee = await storage.getEmployeeById(employeeId);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (!otherParticipantId) {
        return res.status(400).json({ error: "Participant ID is required" });
      }

      const otherParticipant = await storage.getEmployeeById(otherParticipantId);
      if (!otherParticipant) {
        return res.status(404).json({ error: "Recipient not found" });
      }

      // Check if a direct room already exists between these two participants
      const existingParticipations = await db.select()
        .from(chatParticipants)
        .where(eq(chatParticipants.participantId, employeeId));

      for (const participation of existingParticipations) {
        const room = await db.select()
          .from(chatRooms)
          .where(and(
            eq(chatRooms.id, participation.roomId),
            eq(chatRooms.type, 'direct')
          ))
          .limit(1);

        if (room.length > 0) {
          const otherParticipants = await db.select()
            .from(chatParticipants)
            .where(eq(chatParticipants.roomId, room[0].id));

          // Check if the other participant is in this room
          if (otherParticipants.some(p => p.participantId === otherParticipantId)) {
            // Room already exists, return it
            const participants = await db.select()
              .from(chatParticipants)
              .where(eq(chatParticipants.roomId, room[0].id));

            return res.json({
              room: {
                ...room[0],
                participants: participants
              }
            });
          }
        }
      }

      // No existing room found, create a new one
      const roomName = `${employee.name} & ${otherParticipant.name}`;
      const newRoom = await db.insert(chatRooms)
        .values({
          name: roomName,
          type: 'direct',
          isPinned: false,
          createdBy: employeeId,
          createdAt: new Date().toISOString()
        })
        .returning();

      // Add both participants
      const allParticipants = [
        { id: employeeId, name: employee.name, role: employee.role },
        { id: otherParticipantId, name: otherParticipant.name, role: otherParticipant.role }
      ];

      for (const participant of allParticipants) {
        await db.insert(chatParticipants)
          .values({
            roomId: newRoom[0].id,
            participantId: participant.id,
            participantName: participant.name,
            participantRole: participant.role,
            joinedAt: new Date().toISOString()
          });
      }

      const participants = await db.select()
        .from(chatParticipants)
        .where(eq(chatParticipants.roomId, newRoom[0].id));

      res.json({
        room: {
          ...newRoom[0],
          participants: participants
        }
      });
    } catch (error) {
      console.error('Error getting/creating direct chat room:', error);
      res.status(500).json({ error: "Failed to get/create direct chat room" });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server for real-time chat  
  const wss = new WebSocketServer({ noServer: true });

  interface ChatWebSocket extends WebSocket {
    employeeId?: string;
    employeeName?: string;
  }

  // Session parser for WebSocket upgrade
  const sessionParser = session({
    secret: process.env.SESSION_SECRET || 'staffos-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false
  });

  // Handle WebSocket upgrade using session authentication
  // IMPORTANT: This handler must only process /ws/chat connections
  // Vite HMR WebSocket connections will be handled by Vite's middleware
  httpServer.on('upgrade', (request: any, socket, head) => {
    const url = request.url || '';

    // Only handle chat WebSocket connections
    // Vite HMR connections typically have paths like '/' or '/?token=...'
    // We must NOT handle these - let Vite middleware handle them
    const isChatConnection = url === '/ws/chat' || url.startsWith('/ws/chat');

    // Skip all non-chat connections - Vite will handle its own HMR WebSocket upgrades
    if (!isChatConnection) {
      // Don't interfere - let other upgrade handlers (Vite HMR) process this
      // Returning without handling allows other listeners to process the upgrade
      return;
    }

    // Parse session using express-session middleware
    sessionParser(request, {} as any, async () => {
      try {
        // Validate session and get employee ID
        if (!request.session || !request.session.employeeId) {
          socket.write('HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\n\r\nNo valid employee session\r\n');
          socket.destroy();
          return;
        }

        // Get employee details from database using session employee ID
        const employee = await storage.getEmployeeById(request.session.employeeId);
        if (!employee || !employee.isActive) {
          socket.write('HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\n\r\nEmployee not found or inactive\r\n');
          socket.destroy();
          return;
        }

        // Upgrade the connection and attach verified employee identity
        wss.handleUpgrade(request, socket, head, (ws: ChatWebSocket) => {
          ws.employeeId = employee.id;
          ws.employeeName = employee.name;
          wss.emit('connection', ws, request);
        });
      } catch (error) {
        console.error('WebSocket upgrade error:', error);
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        socket.destroy();
      }
    });
  });

  // Broadcast function to send messages to all clients in a room
  const broadcastToRoom = async (roomId: string, message: any, excludeEmployeeId?: string) => {
    // Get all participants in the room
    const participants = await db.select()
      .from(chatParticipants)
      .where(eq(chatParticipants.roomId, roomId));

    const participantIds = participants.map(p => p.participantId);

    wss.clients.forEach((client) => {
      const chatClient = client as ChatWebSocket;
      if (client.readyState === WebSocket.OPEN &&
        chatClient.employeeId &&
        participantIds.includes(chatClient.employeeId) &&
        chatClient.employeeId !== excludeEmployeeId) {
        client.send(JSON.stringify(message));
      }
    });
  };

  wss.on('connection', (ws: ChatWebSocket, req: any) => {
    // Employee identity is now set during upgrade - verified via session
    console.log(`WebSocket connection established for ${ws.employeeName} (${ws.employeeId})`);

    // Send confirmation with server-verified identity
    ws.send(JSON.stringify({
      type: 'authenticated',
      success: true,
      employeeId: ws.employeeId,
      employeeName: ws.employeeName
    }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Only accept typing indicators - identity is already verified
        if (data.type === 'typing' && ws.employeeId) {
          await broadcastToRoom(data.roomId, {
            type: 'typing',
            roomId: data.roomId,
            employeeeName: ws.employeeName,
            employeeId: ws.employeeId
          }, ws.employeeId);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket connection closed for ${ws.employeeName}`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Export broadcast function for use in message endpoints
  (app as any).broadcastToRoom = broadcastToRoom;

  return httpServer;
}
