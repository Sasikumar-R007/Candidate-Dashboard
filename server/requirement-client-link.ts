import type { Request } from "express";
import { isClientAdminRole } from "@shared/client-roles";
import { buildLogoServeUrl } from "./profile-media";
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

type ClientLogoSource = {
  id: string;
  brandName?: string | null;
  logo?: string | null;
};

export function resolveRequirementCompanyLogoFromClients(
  requirement: { clientCompanyId?: string | null; company?: string | null },
  clients: ClientLogoSource[],
  httpReq?: Request,
): string | null {
  let rawLogo: string | null | undefined = null;

  const clientCompanyId = String(requirement.clientCompanyId || "").trim();
  if (clientCompanyId) {
    rawLogo = clients.find((client) => client.id === clientCompanyId)?.logo;
  }

  if (!rawLogo?.trim() && requirement.company?.trim()) {
    const company = requirement.company.trim();
    rawLogo = clients.find((client) => client.brandName === company)?.logo;
  }

  if (!rawLogo?.trim()) return null;
  return buildLogoServeUrl(rawLogo, httpReq) ?? rawLogo.trim();
}
