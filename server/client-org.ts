import { pool } from "./db";
import { storage } from "./storage";
import {
  CLIENT_ADMIN_ROLE,
  CLIENT_MEMBER_ROLE,
  LEGACY_CLIENT_ROLE,
  isClientAdminRole,
  isClientPortalRole,
} from "@shared/client-roles";
import {
  formatClientAdminEmployeeId,
  formatClientMemberEmployeeId,
} from "@shared/client-ids";

const DAMNEX_COMPANY_HINT = "damnex";
const DAMNEX_ADMIN_NAME_HINT = "dharshith";

function normalizeText(value: string | null | undefined): string {
  return (value || "").trim().toLowerCase();
}

function companyMatchesDamnex(company: {
  brandName?: string | null;
  incorporatedName?: string | null;
  clientCode?: string | null;
}): boolean {
  const haystack = [
    company.brandName,
    company.incorporatedName,
    company.clientCode,
  ]
    .map(normalizeText)
    .join(" ");
  return haystack.includes(DAMNEX_COMPANY_HINT);
}

function employeeMatchesDamnexAdmin(employee: { name?: string | null }): boolean {
  return normalizeText(employee.name).includes(DAMNEX_ADMIN_NAME_HINT);
}

/** Link employee to company using legacy heuristics (SPOC id, email, name). */
export async function resolveClientCompanyForEmployee(employee: {
  id: string;
  employeeId?: string | null;
  email?: string | null;
  name?: string | null;
  clientCompanyId?: string | null;
}) {
  if (employee.clientCompanyId) {
    const allClients = await storage.getAllClients();
    const linked = allClients.find(
      (c) => c.id === employee.clientCompanyId && !c.isLoginOnly,
    );
    if (linked) return linked;
  }

  const clients = await storage.getAllClients();
  const emEmail = normalizeText(employee.email);
  const emHumanId = (employee.employeeId || "").trim();
  const emName = normalizeText(employee.name);

  if (emHumanId && (emHumanId.includes("SPOC") || emHumanId.includes("POC"))) {
    const companyCodeMatch = emHumanId.match(/^(.+?)(?:SPOC|POC)/i);
    if (companyCodeMatch) {
      const company = clients.find(
        (c) => c.clientCode === companyCodeMatch[1] && !c.isLoginOnly,
      );
      if (company) return company;
    }
  }

  const linkedClient = clients.find(
    (c: any) =>
      !c.isLoginOnly &&
      ((c.employeeId && String(c.employeeId).trim() === emHumanId) ||
        (c.email && emEmail && normalizeText(c.email) === emEmail)),
  );
  if (linkedClient) return linkedClient;

  const byName = clients.find(
    (c: any) =>
      !c.isLoginOnly &&
      emName &&
      (normalizeText(c.brandName) === emName ||
        normalizeText(c.incorporatedName) === emName),
  );
  if (byName) return byName;

  return undefined;
}

export async function ensureClientOrgSchema() {
  await pool.query(`
    ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS client_company_id varchar(255),
    ADD COLUMN IF NOT EXISTS client_department_id varchar(255),
    ADD COLUMN IF NOT EXISTS can_see_salary_details boolean DEFAULT false
  `);

  await pool.query(`
    ALTER TABLE client_invites
    ADD COLUMN IF NOT EXISTS client_department_id varchar(255),
    ADD COLUMN IF NOT EXISTS can_see_salary_details boolean DEFAULT false
  `);

  await pool.query(`
    ALTER TABLE requirements
    ADD COLUMN IF NOT EXISTS assigned_client_member_id varchar(255)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_departments (
      id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      client_company_id varchar(255) NOT NULL,
      name text NOT NULL,
      description text,
      is_active boolean NOT NULL DEFAULT true,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_invites (
      id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      client_company_id varchar(255) NOT NULL,
      email text NOT NULL,
      name text NOT NULL,
      invite_role text NOT NULL,
      token text NOT NULL UNIQUE,
      status text NOT NULL DEFAULT 'pending',
      invited_by_employee_id varchar(255) NOT NULL,
      expires_at text NOT NULL,
      accepted_at text,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_employees_client_company_id
    ON employees (client_company_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_requirements_assigned_client_member_id
    ON requirements (assigned_client_member_id)
  `);
}

/**
 * One-time-safe migration: legacy role "client" (SPOC) → client_admin / deactivated.
 * DAMNEX: Dharshith B → client_admin; other logins for that company deactivated.
 */
export async function migrateLegacyClientLogins() {
  const allEmployees = await storage.getAllEmployees();
  const legacyClientEmployees = allEmployees.filter(
    (e) => normalizeText(e.role) === LEGACY_CLIENT_ROLE,
  );

  if (legacyClientEmployees.length === 0) {
    return { migrated: 0 };
  }

  const clients = await storage.getAllClients();
  const byCompany = new Map<string, typeof legacyClientEmployees>();

  for (const emp of legacyClientEmployees) {
    const company = await resolveClientCompanyForEmployee(emp);
    if (!company) {
      console.warn(
        `[client-org] Could not resolve company for legacy client login: ${emp.email} (${emp.employeeId})`,
      );
      continue;
    }
    const list = byCompany.get(company.id) || [];
    list.push(emp);
    byCompany.set(company.id, list);
  }

  let migrated = 0;

  for (const [companyId, emps] of byCompany) {
    const company = clients.find((c) => c.id === companyId);
    if (!company) continue;

    const sorted = [...emps].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return ta - tb;
    });

    let adminEmp = sorted[0];

    if (companyMatchesDamnex(company)) {
      const preferred = sorted.find((e) => employeeMatchesDamnexAdmin(e));
      if (preferred) {
        adminEmp = preferred;
      }
    }

    for (const emp of sorted) {
      const isAdmin = emp.id === adminEmp.id;
      await pool.query(
        `
        UPDATE employees
        SET
          role = $1,
          client_company_id = $2,
          is_active = $3,
          department = COALESCE(department, 'Client')
        WHERE id = $4
        `,
        [
          isAdmin ? CLIENT_ADMIN_ROLE : CLIENT_MEMBER_ROLE,
          companyId,
          isAdmin,
          emp.id,
        ],
      );
      migrated += 1;

      if (!isAdmin) {
        console.log(
          `[client-org] Deactivated extra legacy client login for ${company.brandName}: ${emp.email}`,
        );
      } else {
        console.log(
          `[client-org] Promoted to client_admin for ${company.brandName}: ${emp.name} <${emp.email}>`,
        );
      }
    }
  }

  return { migrated };
}

/**
 * Normalize client portal employee_id values:
 * - Client Admin → {clientCode}A (e.g. STCL001A)
 * - Client Members → {clientCode}M1, M2, …
 */
export async function migrateClientEmployeeIdFormats() {
  const clients = (await storage.getAllClients()).filter(
    (c) => !c.isLoginOnly && c.clientCode,
  );

  let updated = 0;

  for (const client of clients) {
    const code = client.clientCode!;
    const result = await pool.query<{
      id: string;
      employee_id: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>(
      `
      SELECT id, employee_id, role, is_active, created_at
      FROM employees
      WHERE client_company_id = $1
        AND LOWER(role) IN ('client_admin', 'client', 'client_member')
      ORDER BY created_at ASC
      `,
      [client.id],
    );

    const rows = result.rows;
    const admins = rows.filter((r) =>
      ["client_admin", "client"].includes((r.role || "").toLowerCase()),
    );
    const activeAdmin =
      admins.find((a) => a.is_active) || admins.sort((a, b) => a.created_at.localeCompare(b.created_at))[0];

    if (activeAdmin) {
      const targetAdminId = formatClientAdminEmployeeId(code);
      if (activeAdmin.employee_id !== targetAdminId) {
        const conflict = await storage.getEmployeeByEmployeeId(targetAdminId);
        if (!conflict || conflict.id === activeAdmin.id) {
          await storage.updateEmployee(activeAdmin.id, {
            employeeId: targetAdminId,
          });
          updated += 1;
        }
      }
    }

    const members = rows
      .filter((r) => (r.role || "").toLowerCase() === CLIENT_MEMBER_ROLE)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    for (let i = 0; i < members.length; i++) {
      const targetMemberId = formatClientMemberEmployeeId(code, i + 1);
      const member = members[i];
      if (member.employee_id !== targetMemberId) {
        const conflict = await storage.getEmployeeByEmployeeId(targetMemberId);
        if (!conflict || conflict.id === member.id) {
          await storage.updateEmployee(member.id, {
            employeeId: targetMemberId,
          });
          updated += 1;
        }
      }
    }
  }

  return { updated };
}

export type ClientAuthEmployee = {
  id: string;
  role: string;
  name: string;
  email: string;
  employeeId?: string | null;
  clientCompanyId?: string | null;
  clientDepartmentId?: string | null;
};

export function assertClientPortalRole(role: string) {
  if (!isClientPortalRole(role)) {
    throw new Error("Not a client portal user");
  }
}

export async function getClientScopedRequirementIds(
  employee: ClientAuthEmployee,
): Promise<Set<string> | null> {
  if (isClientAdminRole(employee.role)) {
    return null;
  }

  const company = await resolveClientCompanyForEmployee(employee);
  if (!company) {
    return new Set();
  }

  const requirements = await storage.getRequirementsByCompany(
    company.brandName || employee.name,
  );
  return new Set(
    requirements
      .filter((r) => r.assignedClientMemberId === employee.id)
      .map((r) => r.id),
  );
}

export async function getClientScopedRequirements(employee: ClientAuthEmployee) {
  const company = await resolveClientCompanyForEmployee(employee);
  const companyName = company?.brandName || employee.name;
  const memberRequirementIds = await getClientScopedRequirementIds(employee);

  let requirements = company
    ? await storage.getRequirementsByCompany(companyName)
    : [];
  requirements = requirements.filter((r) => !r.isArchived);
  if (memberRequirementIds !== null) {
    requirements = requirements.filter((r) => memberRequirementIds.has(r.id));
  }

  return { company, companyName, requirements, memberRequirementIds };
}

/** Client nudges: company match; members only for apps on assigned requirements. */
export function clientNudgeInScope(
  nudge: { company?: string | null; applicationId?: string | null },
  companyName: string,
  memberRequirementIds: Set<string> | null,
  applicationById: Map<string, { requirementId?: string | null }>,
): boolean {
  const normalizedCompany = (companyName || "").trim().toLowerCase();
  if ((nudge.company || "").trim().toLowerCase() !== normalizedCompany) {
    return false;
  }
  if (memberRequirementIds === null) {
    return true;
  }
  const app = applicationById.get((nudge.applicationId || "").trim());
  const reqId = (app?.requirementId || "").trim();
  return !!reqId && memberRequirementIds.has(reqId);
}

export async function getJobApplicationsScopedToClientEmployee(employee: ClientAuthEmployee) {
  const company = await resolveClientCompanyForEmployee(employee);
  const companyName = company?.brandName || employee.name;

  const clientRequirements = await storage.getRequirementsByCompany(companyName);
  const clientRequirementIds = new Set(clientRequirements.map((req) => req.id));
  const clientRequirementPositions = new Set(
    clientRequirements
      .map((req) => (req.position || "").trim().toLowerCase())
      .filter(Boolean),
  );

  const clientCompanyNames = new Set<string>();
  const addCompany = (n?: string | null) => {
    const v = (n || "").trim().toLowerCase();
    if (v) clientCompanyNames.add(v);
  };
  addCompany(companyName);
  addCompany(company?.brandName);
  addCompany((company as any)?.incorporatedName);
  for (const r of clientRequirements) addCompany((r as any).company);

  const memberRequirementIds = await getClientScopedRequirementIds(employee);
  const visibleClientRequirements =
    memberRequirementIds === null
      ? clientRequirements
      : clientRequirements.filter((r) => memberRequirementIds.has(r.id));

  let allRecruiterJobs: any[] = [];
  try {
    allRecruiterJobs = await storage.getAllRecruiterJobs();
  } catch {
    allRecruiterJobs = [];
  }
  const recruiterJobById = new Map(allRecruiterJobs.map((j: any) => [j.id, j]));

  const allApplications = await storage.getAllJobApplications();

  const inScope = (app: any) => {
    const reqId = (app.requirementId || "").trim();
    if (reqId && clientRequirementIds.has(reqId)) {
      if (memberRequirementIds !== null && !memberRequirementIds.has(reqId)) {
        return false;
      }
      return true;
    }

    const appCompany = (app.company || "").trim().toLowerCase();
    if (appCompany && clientCompanyNames.has(appCompany)) {
      if (memberRequirementIds !== null) {
        const reqIdFromApp = (app.requirementId || "").trim();
        return reqIdFromApp ? memberRequirementIds.has(reqIdFromApp) : false;
      }
      return true;
    }

    const appRole = (app.jobTitle || app.roleApplied || "").trim().toLowerCase();
    if (appRole && clientRequirementPositions.has(appRole)) {
      if (memberRequirementIds !== null) {
        const reqIdFromApp = (app.requirementId || "").trim();
        return reqIdFromApp ? memberRequirementIds.has(reqIdFromApp) : false;
      }
      return true;
    }

    const jobId = (app.recruiterJobId || "").trim();
    if (jobId) {
      const job = recruiterJobById.get(jobId) as any;
      if (job) {
        const jc = (job.companyName || "").trim().toLowerCase();
        const jr = (job.role || "").trim().toLowerCase();
        if (jc && clientCompanyNames.has(jc) && jr && clientRequirementPositions.has(jr)) {
          if (memberRequirementIds !== null) {
            const reqIdFromApp = (app.requirementId || "").trim();
            return reqIdFromApp ? memberRequirementIds.has(reqIdFromApp) : false;
          }
          return true;
        }
      }
    }
    return false;
  };

  return {
    client: company,
    companyName,
    clientRequirements: visibleClientRequirements,
    memberRequirementIds,
    applications: allApplications.filter(inScope),
  };
}

export async function clientEmployeeCanAccessApplication(
  employee: ClientAuthEmployee,
  application: { requirementId?: string | null; company?: string | null },
): Promise<boolean> {
  const { applications } = await getJobApplicationsScopedToClientEmployee(employee);
  return applications.some((a: any) => a.id === (application as any).id);
}
