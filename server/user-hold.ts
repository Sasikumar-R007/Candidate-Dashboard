import type { Employee } from "@shared/schema";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { employees } from "@shared/schema";
import { eq } from "drizzle-orm";

export const HOLD_LOGOUT_GRACE_MS = 30_000;

export type HoldDurationType = "minutes" | "hours" | "days" | "resume_date" | "indefinite";

export function computeHoldUntil(
  durationType: HoldDurationType,
  durationValue?: number,
  resumeDate?: string,
): string | null {
  const now = Date.now();
  if (durationType === "indefinite") return null;
  if (durationType === "minutes" && durationValue && durationValue > 0) {
    return new Date(now + durationValue * 60_000).toISOString();
  }
  if (durationType === "hours" && durationValue && durationValue > 0) {
    return new Date(now + durationValue * 3_600_000).toISOString();
  }
  if (durationType === "days" && durationValue && durationValue > 0) {
    return new Date(now + durationValue * 86_400_000).toISOString();
  }
  if (durationType === "resume_date" && resumeDate) {
    const parsed = new Date(resumeDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return null;
}

export function formatHoldUntilLabel(holdUntil: string | null | undefined): string {
  if (!holdUntil) return "Until resumed by Admin";
  try {
    return new Date(holdUntil).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return holdUntil;
  }
}

export type HoldEvaluation = {
  isHeld: boolean;
  shouldAutoResume?: boolean;
  inGracePeriod?: boolean;
  logoutInSeconds?: number;
  holdMessage?: string | null;
  holdUntil?: string | null;
  holdUntilLabel?: string;
};

export function evaluateEmployeeHold(employee: Employee): HoldEvaluation {
  const status = (employee.accountStatus || "active").toLowerCase();
  if (status !== "hold") {
    return { isHeld: false };
  }

  const now = Date.now();
  if (employee.holdUntil) {
    const untilMs = new Date(employee.holdUntil).getTime();
    if (!Number.isNaN(untilMs) && untilMs <= now) {
      return { isHeld: false, shouldAutoResume: true };
    }
  }

  const logoutAt = employee.logoutScheduledAt
    ? new Date(employee.logoutScheduledAt).getTime()
    : 0;
  const logoutInSeconds =
    logoutAt > now ? Math.max(1, Math.ceil((logoutAt - now) / 1000)) : 0;
  const inGracePeriod = logoutInSeconds > 0;

  return {
    isHeld: true,
    inGracePeriod,
    logoutInSeconds,
    holdMessage: employee.holdMessage,
    holdUntil: employee.holdUntil,
    holdUntilLabel: formatHoldUntilLabel(employee.holdUntil),
  };
}

export async function revokeEmployeeSessions(employeeId: string): Promise<void> {
  try {
    await db.execute(sql`
      DELETE FROM session
      WHERE (sess::jsonb->>'employeeId') = ${employeeId}
    `);
  } catch (error) {
    console.error("[user-hold] Failed to revoke sessions for", employeeId, error);
  }
}

export async function autoResumeEmployeeIfExpired(employee: Employee): Promise<Employee> {
  const evaluation = evaluateEmployeeHold(employee);
  if (!evaluation.shouldAutoResume) {
    return employee;
  }

  const [updated] = await db
    .update(employees)
    .set({
      accountStatus: "active",
      holdMessage: null,
      holdUntil: null,
      heldAt: null,
      heldByEmployeeId: null,
      logoutScheduledAt: null,
    })
    .where(eq(employees.id, employee.id))
    .returning();

  return updated || { ...employee, accountStatus: "active" };
}

export function buildHoldPayload(evaluation: HoldEvaluation) {
  return {
    accountHeld: true,
    holdMessage: evaluation.holdMessage || "Your account has been placed on hold by an administrator.",
    holdUntil: evaluation.holdUntil,
    holdUntilLabel: evaluation.holdUntilLabel,
    logoutInSeconds: evaluation.logoutInSeconds ?? 0,
    inGracePeriod: Boolean(evaluation.inGracePeriod),
  };
}
