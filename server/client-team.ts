import { randomBytes } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import {
  clientDepartments,
  clientInvites,
} from "@shared/schema";
import {
  CLIENT_MEMBER_ROLE,
  isClientAdminRole,
  isClientMemberRole,
} from "@shared/client-roles";
import { resolveClientCompanyForEmployee } from "./client-org";
import {
  formatClientMemberEmployeeId,
  maxClientMemberSequence,
} from "@shared/client-ids";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function getCompanyById(companyId: string) {
  const clients = await storage.getAllClients();
  return clients.find((c) => c.id === companyId && !c.isLoginOnly);
}

type ClientMemberRow = {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  is_active: boolean;
  client_department_id: string | null;
  can_see_salary_details: boolean | null;
};

/** All client_member rows for a company (active + awaiting invite). */
async function getClientMembersForCompany(companyId: string): Promise<ClientMemberRow[]> {
  try {
    const result = await db.execute(sql`
      SELECT
        id,
        name,
        email,
        employee_id,
        is_active,
        client_department_id,
        can_see_salary_details
      FROM employees
      WHERE client_company_id = ${companyId}
        AND LOWER(role) = ${CLIENT_MEMBER_ROLE}
      ORDER BY created_at DESC
    `);
    return result.rows as ClientMemberRow[];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("can_see_salary_details")) {
      throw err;
    }
    const result = await db.execute(sql`
      SELECT
        id,
        name,
        email,
        employee_id,
        is_active,
        client_department_id
      FROM employees
      WHERE client_company_id = ${companyId}
        AND LOWER(role) = ${CLIENT_MEMBER_ROLE}
      ORDER BY created_at DESC
    `);
    return (result.rows as Omit<ClientMemberRow, "can_see_salary_details">[]).map(
      (row) => ({ ...row, can_see_salary_details: false }),
    );
  }
}

export async function getClientTeamContext(adminEmployee: {
  id: string;
  role: string;
  email: string;
  name: string;
  employeeId?: string | null;
  clientCompanyId?: string | null;
}) {
  if (!isClientAdminRole(adminEmployee.role)) {
    throw new Error("Client Admin required");
  }

  const company = await resolveClientCompanyForEmployee(adminEmployee);
  if (!company) {
    return null;
  }

  const companyId = company.id;

  const memberRows = await getClientMembersForCompany(companyId);
  const members = memberRows.map((e) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    employeeId: e.employee_id,
    isActive: Boolean(e.is_active),
    clientDepartmentId: e.client_department_id,
    canSeeSalaryDetails: Boolean(e.can_see_salary_details),
  }));

  const departments = await db
    .select()
    .from(clientDepartments)
    .where(eq(clientDepartments.clientCompanyId, companyId));

  const deptNameById = new Map(departments.map((d) => [d.id, d.name]));

  let inviteRows: Array<{
    id: string;
    email: string;
    name: string;
    status: string;
    invite_role: string;
    expires_at: string;
    created_at: string;
    client_department_id?: string | null;
    can_see_salary_details?: boolean | null;
  }> = [];

  try {
    const inviteResult = await db.execute(sql`
      SELECT
        id,
        email,
        name,
        status,
        invite_role,
        expires_at,
        created_at,
        client_department_id,
        can_see_salary_details
      FROM client_invites
      WHERE client_company_id = ${companyId}
    `);
    inviteRows = inviteResult.rows as typeof inviteRows;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      !message.includes("client_department_id") &&
      !message.includes("can_see_salary_details")
    ) {
      throw err;
    }
    const inviteResult = await db.execute(sql`
      SELECT id, email, name, status, invite_role, expires_at, created_at
      FROM client_invites
      WHERE client_company_id = ${companyId}
    `);
    inviteRows = inviteResult.rows as typeof inviteRows;
  }

  const membersWithDept = members.map((m) => ({
    ...m,
    departmentName: m.clientDepartmentId
      ? deptNameById.get(m.clientDepartmentId) || null
      : null,
  }));

  const departmentMemberCounts = new Map<string, number>();
  for (const m of membersWithDept) {
    if (m.clientDepartmentId) {
      departmentMemberCounts.set(
        m.clientDepartmentId,
        (departmentMemberCounts.get(m.clientDepartmentId) || 0) + 1,
      );
    }
  }

  return {
    company: {
      id: company.id,
      brandName: company.brandName,
      clientCode: company.clientCode,
    },
    members: membersWithDept,
    departments: departments.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      isActive: d.isActive,
      memberCount: departmentMemberCounts.get(d.id) || 0,
    })),
    invites: inviteRows.map((inv) => ({
      id: inv.id,
      email: inv.email,
      name: inv.name,
      status: inv.status,
      inviteRole: inv.invite_role,
      expiresAt: inv.expires_at,
      createdAt: inv.created_at,
      clientDepartmentId: inv.client_department_id ?? null,
      canSeeSalaryDetails: Boolean(inv.can_see_salary_details),
    })),
  };
}

async function nextClientMemberHumanId(companyId: string, clientCode: string) {
  const members = await getClientMembersForCompany(companyId);
  const nextIndex =
    maxClientMemberSequence(
      members.map((m) => m.employee_id),
      clientCode,
    ) + 1;
  return formatClientMemberEmployeeId(clientCode, nextIndex);
}

export async function createClientTeamMember(
  adminEmployee: {
    id: string;
    role: string;
    email: string;
    name: string;
    employeeId?: string | null;
    clientCompanyId?: string | null;
  },
  input: {
    name: string;
    email: string;
    departmentId: string;
    canSeeSalaryDetails: boolean;
  },
) {
  const company = await resolveClientCompanyForEmployee(adminEmployee);
  if (!company) {
    throw new Error("Company not found");
  }
  if (!company.clientCode) {
    throw new Error("Company configuration is incomplete");
  }

  const email = normalizeEmail(input.email);

  const departments = await db
    .select()
    .from(clientDepartments)
    .where(eq(clientDepartments.clientCompanyId, company.id));

  const department = departments.find(
    (d) => d.id === input.departmentId && d.isActive,
  );
  if (!department) {
    throw new Error("Please select a valid department");
  }

  const existing = await storage.getEmployeeByEmail(email);
  const existingCompanyId =
    existing?.clientCompanyId ||
    (existing as { client_company_id?: string } | undefined)?.client_company_id;
  if (existing && existingCompanyId === company.id && isClientMemberRole(existing.role)) {
    throw new Error("A member with this email is already on your team");
  }
  if (
    existing?.isActive &&
    existingCompanyId &&
    existingCompanyId !== company.id &&
    isClientMemberRole(existing.role)
  ) {
    throw new Error("This email is already used by another account");
  }

  const pendingInvites = await db
    .select()
    .from(clientInvites)
    .where(
      and(
        eq(clientInvites.clientCompanyId, company.id),
        eq(clientInvites.email, email),
        eq(clientInvites.status, "pending"),
      ),
    );
  if (pendingInvites.length > 0) {
    throw new Error("A pending invite already exists for this email");
  }

  const humanEmployeeId = await nextClientMemberHumanId(company.id, company.clientCode);

  const created = await storage.createEmployee({
    employeeId: humanEmployeeId,
    name: input.name.trim(),
    email,
    password: null,
    role: CLIENT_MEMBER_ROLE,
    clientCompanyId: company.id,
    clientDepartmentId: department.id,
    canSeeSalaryDetails: input.canSeeSalaryDetails,
    phone: "",
    department: department.name,
    joiningDate: new Date().toISOString().slice(0, 10),
    reportingTo: "Client Admin",
    isActive: false,
    createdAt: new Date().toISOString(),
  } as any);

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    employeeId: created.employeeId,
    departmentName: department.name,
    canSeeSalaryDetails: input.canSeeSalaryDetails,
  };
}

export async function createClientDepartment(
  adminEmployee: { id: string; role: string; clientCompanyId?: string | null; email: string; name: string; employeeId?: string | null },
  input: { name: string; description?: string },
) {
  const company = await resolveClientCompanyForEmployee(adminEmployee);
  if (!company) {
    throw new Error("Company not found");
  }

  const [row] = await db
    .insert(clientDepartments)
    .values({
      clientCompanyId: company.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return row;
}

export async function updateClientTeamMember(
  adminEmployee: {
    id: string;
    role: string;
    email: string;
    name: string;
    employeeId?: string | null;
    clientCompanyId?: string | null;
  },
  memberId: string,
  input: {
    name: string;
    email: string;
    departmentId: string;
    canSeeSalaryDetails: boolean;
  },
) {
  const company = await resolveClientCompanyForEmployee(adminEmployee);
  if (!company) {
    throw new Error("Company not found");
  }

  const members = await getClientMembersForCompany(company.id);
  const member = members.find((m) => m.id === memberId);
  if (!member) {
    throw new Error("Team member not found");
  }

  const departments = await db
    .select()
    .from(clientDepartments)
    .where(eq(clientDepartments.clientCompanyId, company.id));

  const department = departments.find(
    (d) => d.id === input.departmentId && d.isActive,
  );
  if (!department) {
    throw new Error("Please select a valid department");
  }

  const email = normalizeEmail(input.email);
  if (email !== normalizeEmail(member.email)) {
    const existing = await storage.getEmployeeByEmail(email);
    if (existing && existing.id !== memberId) {
      throw new Error("Another account already uses this email");
    }
  }

  const updated = await storage.updateEmployee(memberId, {
    name: input.name.trim(),
    email,
    clientDepartmentId: department.id,
    canSeeSalaryDetails: input.canSeeSalaryDetails,
    department: department.name,
  } as any);

  if (!updated) {
    throw new Error("Failed to update member");
  }

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    employeeId: updated.employeeId,
    departmentName: department.name,
    canSeeSalaryDetails: input.canSeeSalaryDetails,
  };
}

export async function deleteClientTeamMember(
  adminEmployee: {
    id: string;
    role: string;
    email: string;
    name: string;
    employeeId?: string | null;
    clientCompanyId?: string | null;
  },
  memberId: string,
) {
  const company = await resolveClientCompanyForEmployee(adminEmployee);
  if (!company) {
    throw new Error("Company not found");
  }

  const members = await getClientMembersForCompany(company.id);
  const member = members.find((m) => m.id === memberId);
  if (!member) {
    throw new Error("Team member not found");
  }

  const email = normalizeEmail(member.email);

  await db.execute(sql`
    UPDATE requirements
    SET assigned_client_member_id = NULL
    WHERE assigned_client_member_id = ${memberId}
  `);

  await db.execute(sql`
    DELETE FROM client_invites
    WHERE client_company_id = ${company.id}
      AND LOWER(email) = LOWER(${email})
  `);

  const deleted = await storage.deleteEmployee(memberId);
  if (!deleted) {
    throw new Error("Failed to remove member");
  }

  return { success: true };
}

export async function createClientMemberInvite(
  adminEmployee: { id: string; role: string; email: string; name: string; employeeId?: string | null; clientCompanyId?: string | null },
  input: {
    email: string;
    name: string;
    departmentId?: string;
    canSeeSalaryDetails?: boolean;
  },
  baseUrl: string,
) {
  const company = await resolveClientCompanyForEmployee(adminEmployee);
  if (!company) {
    throw new Error("Company not found");
  }

  const email = normalizeEmail(input.email);

  const existing = await storage.getEmployeeByEmail(email);
  if (
    existing &&
    existing.isActive &&
    existing.clientCompanyId === company.id &&
    (isClientMemberRole(existing.role) || isClientAdminRole(existing.role))
  ) {
    throw new Error("A user with this email already exists for your company");
  }

  const pendingInvites = await db
    .select()
    .from(clientInvites)
    .where(
      and(
        eq(clientInvites.clientCompanyId, company.id),
        eq(clientInvites.email, email),
        eq(clientInvites.status, "pending"),
      ),
    );
  if (pendingInvites.length > 0) {
    throw new Error("A pending invite already exists for this email");
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  let departmentId: string | null = input.departmentId || null;
  let canSeeSalaryDetails = Boolean(input.canSeeSalaryDetails);

  const companyMembers = await getClientMembersForCompany(company.id);
  const inactiveMember = companyMembers.find(
    (e) => normalizeEmail(e.email) === email && !e.is_active,
  );

  if (inactiveMember) {
    departmentId = inactiveMember.client_department_id || departmentId;
    canSeeSalaryDetails = Boolean(
      inactiveMember.can_see_salary_details ?? canSeeSalaryDetails,
    );
    await storage.updateEmployee(inactiveMember.id, {
      name: input.name.trim(),
      ...(departmentId ? { clientDepartmentId: departmentId } : {}),
      canSeeSalaryDetails,
    } as any);
  }

  const [invite] = await db
    .insert(clientInvites)
    .values({
      clientCompanyId: company.id,
      email,
      name: input.name.trim(),
      inviteRole: CLIENT_MEMBER_ROLE,
      token,
      status: "pending",
      invitedByEmployeeId: adminEmployee.id,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      clientDepartmentId: departmentId,
      canSeeSalaryDetails,
    })
    .returning();

  const invitePath = `/client-invite?token=${encodeURIComponent(token)}`;
  const inviteUrl = `${baseUrl.replace(/\/$/, "")}${invitePath}`;

  return { invite, inviteUrl, invitePath };
}

export async function assignRequirementToClientMember(
  adminEmployee: { id: string; role: string; email: string; name: string; employeeId?: string | null; clientCompanyId?: string | null },
  requirementId: string,
  memberId: string | null,
) {
  const company = await resolveClientCompanyForEmployee(adminEmployee);
  if (!company) {
    throw new Error("Company not found");
  }

  const requirement = await storage.getRequirementById(requirementId);
  if (!requirement) {
    throw new Error("Requirement not found");
  }

  const companyName = company.brandName || adminEmployee.name;
  if (requirement.company.toLowerCase() !== companyName.toLowerCase()) {
    throw new Error("Requirement does not belong to your company");
  }

  if (memberId) {
    const companyMembers = await getClientMembersForCompany(company.id);
    const member = companyMembers.find((e) => e.id === memberId);
    if (!member) {
      throw new Error("Invalid team member");
    }
  }

  const updated = await storage.updateRequirement(requirementId, {
    assignedClientMemberId: memberId,
  });

  return updated;
}

export type ClientInvitePreview =
  | {
      valid: true;
      name: string;
      email: string;
      companyName: string;
      expiresAt: string;
    }
  | { valid: false; message: string };

export async function getClientInvitePreview(
  token: string,
): Promise<ClientInvitePreview> {
  const trimmed = (token || "").trim();
  if (!trimmed) {
    return { valid: false, message: "Invite link is invalid" };
  }

  const [invite] = await db
    .select()
    .from(clientInvites)
    .where(eq(clientInvites.token, trimmed))
    .limit(1);

  if (!invite) {
    return { valid: false, message: "Invite link is invalid or has expired" };
  }

  if (invite.status !== "pending") {
    return { valid: false, message: "This invitation has already been used" };
  }

  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: "This invitation has expired" };
  }

  const company = await getCompanyById(invite.clientCompanyId);
  if (!company) {
    return { valid: false, message: "Company for this invite was not found" };
  }

  return {
    valid: true,
    name: invite.name,
    email: invite.email,
    companyName: company.brandName || company.incorporatedName || "Your company",
    expiresAt: invite.expiresAt,
  };
}

export async function acceptClientMemberInvite(
  token: string,
  password: string,
): Promise<{ employeeId: string; email: string }> {
  const preview = await getClientInvitePreview(token);
  if (!preview.valid) {
    throw new Error(preview.message);
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const [invite] = await db
    .select()
    .from(clientInvites)
    .where(eq(clientInvites.token, token.trim()))
    .limit(1);

  if (!invite || invite.status !== "pending") {
    throw new Error("Invitation is no longer valid");
  }

  const company = await getCompanyById(invite.clientCompanyId);
  if (!company?.clientCode) {
    throw new Error("Company configuration is incomplete");
  }

  const email = normalizeEmail(invite.email);
  const existing = await storage.getEmployeeByEmail(email);
  if (existing?.isActive && existing.clientCompanyId === company.id) {
    throw new Error("An account with this email already exists");
  }

  const companyMembers = await getClientMembersForCompany(company.id);
  const existingInactive = companyMembers.find(
    (e) => normalizeEmail(e.email) === email && !e.is_active,
  );

  const deptName =
    invite.clientDepartmentId &&
    (
      await db
        .select()
        .from(clientDepartments)
        .where(eq(clientDepartments.id, invite.clientDepartmentId))
        .limit(1)
    )[0]?.name;

  if (existingInactive) {
    await storage.updateEmployee(existingInactive.id, {
      name: invite.name,
      password,
      isActive: true,
      clientDepartmentId:
        invite.clientDepartmentId || existingInactive.client_department_id,
      canSeeSalaryDetails: Boolean(invite.canSeeSalaryDetails),
      ...(deptName ? { department: deptName } : {}),
    } as any);

    await db
      .update(clientInvites)
      .set({
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      })
      .where(eq(clientInvites.id, invite.id));

    return { employeeId: existingInactive.id, email };
  }

  const humanEmployeeId = await nextClientMemberHumanId(company.id, company.clientCode);

  const created = await storage.createEmployee({
    employeeId: humanEmployeeId,
    name: invite.name,
    email,
    password,
    role: CLIENT_MEMBER_ROLE,
    clientCompanyId: company.id,
    clientDepartmentId: invite.clientDepartmentId,
    canSeeSalaryDetails: Boolean(invite.canSeeSalaryDetails),
    phone: "",
    department: deptName || "Client",
    joiningDate: new Date().toISOString().slice(0, 10),
    reportingTo: "Client Admin",
    isActive: true,
    createdAt: new Date().toISOString(),
  } as any);

  await db
    .update(clientInvites)
    .set({
      status: "accepted",
      acceptedAt: new Date().toISOString(),
    })
    .where(eq(clientInvites.id, invite.id));

  return { employeeId: created.id, email: created.email };
}
