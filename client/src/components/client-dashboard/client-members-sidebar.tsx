import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type TeamPayload = {
  members: Array<{
    id: string;
    name: string;
    email: string;
    employeeId: string | null;
    isActive: boolean;
    clientDepartmentId: string | null;
    departmentName: string | null;
  }>;
};

type ClientRequirement = {
  assignedClientMemberId?: string | null;
  status?: string;
};

type ClientMemberItem = {
  key: string;
  name: string;
  department: string;
  requirementCount: number;
};

export function ClientMembersSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading: teamLoading } = useQuery<TeamPayload>({
    queryKey: ["/api/client/team"],
  });

  const { data: requirements = [] } = useQuery<ClientRequirement[]>({
    queryKey: ["/api/client/requirements"],
    placeholderData: [],
  });

  const requirementCountByMemberId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const req of requirements) {
      const memberId = req.assignedClientMemberId;
      if (!memberId) continue;
      const status = (req.status || "").trim();
      if (status !== "Active") continue;
      counts.set(memberId, (counts.get(memberId) || 0) + 1);
    }
    return counts;
  }, [requirements]);

  const members = useMemo((): ClientMemberItem[] => {
    return (data?.members || [])
      .filter((m) => m.isActive)
      .map((m) => ({
        key: `member-${m.id}`,
        name: m.name,
        department: m.departmentName || "Unassigned",
        requirementCount: requirementCountByMemberId.get(m.id) || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data?.members, requirementCountByMemberId]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q),
    );
  }, [members, searchQuery]);

  const isLoading = teamLoading;

  return (
    <div
      className="flex h-full w-80 shrink-0 flex-col border-l border-gray-200 bg-white"
      data-testid="client-members-sidebar"
    >
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/80 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by name or department"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-gray-200 bg-white pl-9 shadow-sm placeholder:text-gray-500 focus-visible:bg-white"
            data-testid="input-client-members-search"
          />
        </div>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-4 py-2">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            {searchQuery.trim()
              ? "No members match your search"
              : "No active members yet"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMembers.map((member) => (
              <div
                key={member.key}
                className="flex items-center gap-3 border-b border-blue-100 py-3 last:border-b-0"
                data-testid={`client-member-row-${member.key}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-yellow-100">
                  <span className="text-lg font-bold text-gray-700">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {member.department}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-bold text-gray-900">
                  {String(member.requirementCount).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
