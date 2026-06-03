import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RequirementRoleCell } from "@/components/dashboard/requirement-role-cell";
import { resolveClientRoleDisplayId } from "@/lib/client-role-display";
import { Edit3, Eye, MoreVertical, Trash2, UserCheck, Users } from "lucide-react";

export type ClientRequirementRoleRow = {
  roleId?: string;
  id?: string;
  role?: string;
  position?: string;
  noOfPositions?: number;
  team?: string;
  recruiter?: string;
  sharedOn?: string;
  status?: string;
  profilesShared?: number | string;
  lastActive?: string;
  assignedMemberName?: string | null;
  assignedClientMemberId?: string | null;
  sourceDetails?: string | null;
  displayRoleId?: string | null;
  jdText?: string;
  primarySkills?: string;
  secondarySkills?: string;
  knowledgeOnly?: string;
  specialInstructions?: string;
};

type ClientRequirementsRoleMobileCardsProps = {
  roles: ClientRequirementRoleRow[];
  isLoading: boolean;
  isClientAdmin: boolean;
  onView: (role: ClientRequirementRoleRow) => void;
  onSharedProfiles: (role: ClientRequirementRoleRow) => void;
  onEdit: (role: ClientRequirementRoleRow) => void;
  onDelete: (roleId: string) => void;
  onAssign: (role: ClientRequirementRoleRow) => void;
  /** Use inside dialogs — cards stay visible at all breakpoints */
  layout?: "page" | "stack";
};

function getStatusDotColor(status: string) {
  if (status === "Active") return "bg-blue-500";
  if (status === "Paused") return "bg-red-500";
  return "bg-gray-500";
}

export function ClientRequirementsRoleMobileCards({
  roles,
  isLoading,
  isClientAdmin,
  onView,
  onSharedProfiles,
  onEdit,
  onDelete,
  onAssign,
  layout = "page",
}: ClientRequirementsRoleMobileCardsProps) {
  if (isLoading) {
    return <p className="px-4 py-8 text-center text-sm text-gray-500">Loading roles...</p>;
  }

  if (roles.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500">
        No roles found. Upload a JD to get started.
      </p>
    );
  }

  return (
    <div
      className={
        layout === "stack"
          ? "space-y-3 px-1 py-1"
          : "space-y-3 p-4 md:hidden"
      }
    >
      {roles.map((role, index) => (
        <div
          key={role.roleId || index}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          data-testid={`card-requirement-role-${role.roleId || index}`}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-gray-500" title={role.id || role.roleId}>
                {resolveClientRoleDisplayId(role)}
              </p>
              <RequirementRoleCell
                title={role.role || role.position || ""}
                noOfPositions={role.noOfPositions}
                titleClassName="text-sm font-semibold text-gray-900"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(role)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSharedProfiles(role)}>
                  <Users className="mr-2 h-4 w-4" />
                  Shared Profiles
                </DropdownMenuItem>
                {isClientAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(role)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => role.roleId && onDelete(role.roleId)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600">
            <p>
              <span className="font-medium text-gray-500">Team: </span>
              {role.team || "—"}
            </p>
            <p>
              <span className="font-medium text-gray-500">Recruiter: </span>
              {role.recruiter || "—"}
            </p>
            <p>
              <span className="font-medium text-gray-500">Shared: </span>
              {role.sharedOn || "—"}
            </p>
            <p>
              <span className="font-medium text-gray-500">Profiles: </span>
              {role.profilesShared ?? "—"}
            </p>
            <p className="col-span-2">
              <span className="font-medium text-gray-500">Last active: </span>
              {role.lastActive || "—"}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-800">
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(role.status || "")}`} />
              {role.status}
            </span>
            {isClientAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2"
                onClick={() => onAssign(role)}
              >
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span className="max-w-[100px] truncate text-xs text-gray-600">
                  {role.assignedMemberName || "Assign"}
                </span>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
