import { resolveDisplayRoleId } from "@shared/requirement-jd-extras";

/** Client requirement row — resolves STR-style display id from id + sourceDetails. */
export function resolveClientRoleDisplayId(
  role:
    | {
        id?: string | null;
        roleId?: string | null;
        displayRoleId?: string | null;
        sourceDetails?: string | null;
      }
    | null
    | undefined,
): string {
  if (!role) return "N/A";
  const preset = role.displayRoleId?.trim();
  if (preset && preset !== "N/A") return preset;
  return resolveDisplayRoleId({
    id: role.id ?? role.roleId,
    sourceDetails: role.sourceDetails ?? null,
  });
}

export const CLIENT_MOBILE_DIALOG_CLASS =
  "flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden sm:max-w-lg sm:w-full md:max-w-4xl";

export const CLIENT_MOBILE_DIALOG_WIDE_CLASS =
  "flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden sm:max-w-2xl sm:w-full md:max-w-6xl";
