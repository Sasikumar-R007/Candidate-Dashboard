/** Client company code in master data (e.g. STCL001). */
export function normalizeClientCode(clientCode: string): string {
  return clientCode.trim().toUpperCase();
}

/** Client Admin login ID: STCL001A */
export function formatClientAdminEmployeeId(clientCode: string): string {
  return `${normalizeClientCode(clientCode)}A`;
}

/** Client Member login ID: STCL001M1, STCL001M2, … */
export function formatClientMemberEmployeeId(
  clientCode: string,
  memberIndex: number,
): string {
  const code = normalizeClientCode(clientCode);
  if (!Number.isInteger(memberIndex) || memberIndex < 1) {
    throw new Error("Member index must be a positive integer");
  }
  return `${code}M${memberIndex}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Member sequence from employee_id (supports STCL001M3 and legacy STCL001MEM03).
 */
export function parseClientMemberSequence(
  employeeId: string,
  clientCode: string,
): number | null {
  const code = normalizeClientCode(clientCode);
  const id = employeeId.trim().toUpperCase();

  const modern = new RegExp(`^${escapeRegExp(code)}M(\\d+)$`, "i").exec(id);
  if (modern) {
    const n = parseInt(modern[1], 10);
    return Number.isFinite(n) ? n : null;
  }

  const legacy = new RegExp(`^${escapeRegExp(code)}MEM(\\d+)$`, "i").exec(id);
  if (legacy) {
    const n = parseInt(legacy[1], 10);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

export function isClientAdminEmployeeId(
  employeeId: string,
  clientCode: string,
): boolean {
  return (
    employeeId.trim().toUpperCase() === formatClientAdminEmployeeId(clientCode)
  );
}

/** Highest M{n} used for this company (legacy MEM{n} included). */
export function maxClientMemberSequence(
  employeeIds: string[],
  clientCode: string,
): number {
  let max = 0;
  for (const id of employeeIds) {
    const seq = parseClientMemberSequence(id, clientCode);
    if (seq != null && seq > max) {
      max = seq;
    }
  }
  return max;
}
