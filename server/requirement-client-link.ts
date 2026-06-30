import { isClientAdminRole } from "@shared/client-roles";
import type { IStorage } from "./storage";

export type AdminRequirementClientInput = {
  clientCompanyId?: string | null;
  clientAdminEmployeeId?: string | null;
  company?: string | null;
  spoc?: string | null;
};

export type ResolvedRequirementClientFields = {
  clientCompanyId: string | null;
  company: string;
  spoc: string;
};

export async function resolveAdminRequirementClientFields(
  storage: IStorage,
  input: AdminRequirementClientInput,
  options?: { requireClientCompanyId?: boolean },
): Promise<ResolvedRequirementClientFields> {
  const requireClientCompanyId = options?.requireClientCompanyId ?? false;
  const clientCompanyId = String(input.clientCompanyId || "").trim();

  if (!clientCompanyId) {
    if (requireClientCompanyId) {
      throw new Error("Client company is required");
    }
    const company = String(input.company || "").trim();
    if (!company) {
      throw new Error("Company is required");
    }
    const spoc = String(input.spoc || "").trim();
    if (!spoc) {
      throw new Error("SPOC name is required");
    }
    return { clientCompanyId: null, company, spoc };
  }

  const client = await storage.getClientById(clientCompanyId);
  if (!client || client.isLoginOnly) {
    throw new Error("Selected client company was not found in Master Data");
  }

  let spoc = String(input.spoc || "").trim();
  const clientAdminEmployeeId = String(input.clientAdminEmployeeId || "").trim();

  if (clientAdminEmployeeId) {
    const adminEmployee = await storage.getEmployeeById(clientAdminEmployeeId);
    if (
      !adminEmployee ||
      !isClientAdminRole(adminEmployee.role) ||
      adminEmployee.clientCompanyId !== client.id
    ) {
      throw new Error("Selected Client Admin does not belong to the chosen company");
    }
    spoc = adminEmployee.name;
  }

  if (!spoc) {
    throw new Error("SPOC name is required when Client Admin is not selected");
  }

  return {
    clientCompanyId: client.id,
    company: client.brandName,
    spoc,
  };
}
