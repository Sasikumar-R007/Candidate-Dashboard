import { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Search, UserPlus, Building2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const modalFieldClass = "bg-gray-50 border-gray-200";

type TeamPayload = {
  company: { id: string; brandName: string; clientCode: string };
  members: Array<{
    id: string;
    name: string;
    email: string;
    employeeId: string | null;
    isActive: boolean;
    clientDepartmentId: string | null;
    departmentName: string | null;
    canSeeSalaryDetails?: boolean;
  }>;
  departments: Array<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    memberCount: number;
  }>;
  invites: Array<{
    id: string;
    email: string;
    name: string;
    status: string;
    expiresAt: string;
    clientDepartmentId?: string | null;
    canSeeSalaryDetails?: boolean;
  }>;
};

type TeamSubTab = "members" | "departments";

type MemberRow = {
  key: string;
  memberId?: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  departmentId: string | null;
  canSeeSalaryDetails: boolean;
  status: string;
  statusVariant: "default" | "secondary" | "outline";
  kind: "member" | "invite";
  inviteName?: string;
  showInviteAction: boolean;
};

const DEPARTMENT_FILTER_ALL = "__all__";
const DEPARTMENT_FILTER_UNASSIGNED = "__unassigned__";

export function ClientTeamTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<TeamSubTab>("members");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(DEPARTMENT_FILTER_ALL);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberDepartmentId, setMemberDepartmentId] = useState("");
  const [memberSalaryAccess, setMemberSalaryAccess] = useState<string>("");
  const [deptName, setDeptName] = useState("");

  const [inviteTarget, setInviteTarget] = useState<{
    name: string;
    email: string;
    departmentId?: string;
    canSeeSalaryDetails?: boolean;
  } | null>(null);
  const [confirmEmail, setConfirmEmail] = useState("");

  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const { data, isLoading } = useQuery<TeamPayload>({
    queryKey: ["/api/client/team"],
  });

  const activeDepartments = useMemo(
    () => (data?.departments || []).filter((d) => d.isActive),
    [data?.departments],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/client/team"] });
  };

  const resetMemberForm = () => {
    setMemberName("");
    setMemberEmail("");
    setMemberDepartmentId("");
    setMemberSalaryAccess("");
  };

  const createDeptMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/client/team/departments", { name });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create department");
      }
      return res.json();
    },
    onSuccess: () => {
      setDeptName("");
      setAddDeptOpen(false);
      invalidate();
      toast({ title: "Department added" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      departmentId: string;
      canSeeSalaryDetails: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/client/team/members", payload);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add member");
      }
      return res.json();
    },
    onSuccess: async () => {
      setAddMemberOpen(false);
      resetMemberForm();
      await queryClient.refetchQueries({ queryKey: ["/api/client/team"] });
      toast({
        title: "Member added",
        description:
          "This person has been saved to your team. To give them access to StaffOS, use the invite action in the team table below to send them an invitation email.",
      });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      name: string;
      email: string;
      departmentId: string;
      canSeeSalaryDetails: boolean;
    }) => {
      const { id, ...body } = payload;
      const res = await apiRequest("PATCH", `/api/client/team/members/${id}`, body);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update member");
      }
      return res.json();
    },
    onSuccess: async () => {
      setEditMemberOpen(false);
      setEditMemberId(null);
      resetMemberForm();
      await queryClient.refetchQueries({ queryKey: ["/api/client/team"] });
      toast({ title: "Member updated" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/client/team/members/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete member");
      }
      return res.json();
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      await queryClient.refetchQueries({ queryKey: ["/api/client/team"] });
      toast({
        title: "Member removed",
        description:
          "This member has been permanently deleted. You can add them again as a new team member and send a fresh invitation.",
      });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      departmentId?: string;
      canSeeSalaryDetails?: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/client/team/invites", payload);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send invite");
      }
      return res.json() as Promise<{ emailSent?: boolean; inviteUrl?: string }>;
    },
    onSuccess: (result) => {
      setInviteTarget(null);
      setConfirmEmail("");
      invalidate();
      const isLocalInvite =
        result.inviteUrl?.includes("localhost") || result.inviteUrl?.includes("127.0.0.1");
      toast({
        title: result.emailSent ? "Invitation sent" : "Invite created",
        description: result.emailSent
          ? isLocalInvite
            ? "Email sent. For local testing, open the invite link in a new browser tab (do not use the email preview pane). Copy the link from the server response or paste the URL from the email into the address bar."
            : "The member will receive an email with the invite link."
          : result.inviteUrl
            ? `Email could not be sent. For testing, open this link in a new tab: ${result.inviteUrl}`
            : "Email could not be sent. Try again or contact support.",
        variant: result.emailSent ? "default" : "destructive",
        duration: isLocalInvite ? 12000 : 5000,
      });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const pendingInviteEmails = useMemo(() => {
    const set = new Set<string>();
    for (const inv of data?.invites || []) {
      if (inv.status === "pending") {
        set.add(inv.email.toLowerCase());
      }
    }
    return set;
  }, [data?.invites]);

  const allMemberRows = useMemo((): MemberRow[] => {
    const rows: MemberRow[] = [];

    for (const m of data?.members || []) {
      const hasPendingInvite = pendingInviteEmails.has(m.email.toLowerCase());
      let status = "Active";
      let statusVariant: MemberRow["statusVariant"] = "default";
      if (!m.isActive) {
        if (hasPendingInvite) {
          status = "Invite pending";
          statusVariant = "secondary";
        } else {
          status = "Awaiting invitation";
          statusVariant = "outline";
        }
      }

      rows.push({
        key: `member-${m.id}`,
        memberId: m.id,
        employeeId: m.employeeId || "—",
        name: m.name,
        email: m.email,
        department: m.departmentName || "—",
        departmentId: m.clientDepartmentId,
        canSeeSalaryDetails: Boolean(m.canSeeSalaryDetails),
        status,
        statusVariant,
        kind: "member",
        showInviteAction: !m.isActive && !hasPendingInvite,
      });
    }

    for (const inv of (data?.invites || []).filter((i) => i.status === "pending")) {
      const alreadyMember = rows.some(
        (r) => r.email.toLowerCase() === inv.email.toLowerCase(),
      );
      if (alreadyMember) continue;
      rows.push({
        key: `invite-${inv.id}`,
        employeeId: "—",
        name: inv.name,
        email: inv.email,
        department: "—",
        departmentId: inv.clientDepartmentId || null,
        canSeeSalaryDetails: Boolean(inv.canSeeSalaryDetails),
        status: "Invite pending",
        statusVariant: "secondary",
        kind: "invite",
        inviteName: inv.name,
        showInviteAction: false,
      });
    }

    return rows;
  }, [data, pendingInviteEmails]);

  const memberRows = useMemo(() => {
    let rows = allMemberRows;

    if (departmentFilter === DEPARTMENT_FILTER_UNASSIGNED) {
      rows = rows.filter((r) => !r.departmentId && r.department === "—");
    } else if (departmentFilter !== DEPARTMENT_FILTER_ALL) {
      rows = rows.filter((r) => r.departmentId === departmentFilter);
    }

    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q),
    );
  }, [allMemberRows, search, departmentFilter]);

  const groupedMemberRows = useMemo(() => {
    if (departmentFilter !== DEPARTMENT_FILTER_ALL) {
      return [{ label: null as string | null, rows: memberRows }];
    }

    const groups = new Map<string, MemberRow[]>();
    for (const row of memberRows) {
      const label = row.department === "—" ? "Unassigned" : row.department;
      const list = groups.get(label) || [];
      list.push(row);
      groups.set(label, list);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, rows]) => ({ label, rows }));
  }, [memberRows, departmentFilter]);

  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = data?.departments || [];
    if (!q) return list;
    return list.filter((d) => d.name.toLowerCase().includes(q));
  }, [data, search]);

  const openInviteConfirm = (row: MemberRow) => {
    setInviteTarget({
      name: row.inviteName || row.name,
      email: row.email,
      departmentId: row.departmentId || undefined,
      canSeeSalaryDetails: row.canSeeSalaryDetails,
    });
    setConfirmEmail(row.email);
  };

  const openEditMember = (row: MemberRow) => {
    if (!row.memberId) return;
    setEditMemberId(row.memberId);
    setMemberName(row.name);
    setMemberEmail(row.email);
    setMemberDepartmentId(row.departmentId || "");
    setMemberSalaryAccess(row.canSeeSalaryDetails ? "true" : "false");
    setEditMemberOpen(true);
  };

  const memberFormValid =
    memberName.trim() &&
    memberEmail.trim() &&
    memberDepartmentId &&
    memberSalaryAccess !== "";

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-gray-500">
        Loading team…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        Could not load team data. Ensure your account is linked to a company.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50">
      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Members and departments for {data.company.brandName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              resetMemberForm();
              setAddMemberOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDeptName("");
              setAddDeptOpen(true);
            }}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setSubTab("members")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                subTab === "members"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Members
            </button>
            <button
              type="button"
              onClick={() => setSubTab("departments")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                subTab === "departments"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Departments
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {subTab === "members" && (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[220px] bg-white">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEPARTMENT_FILTER_ALL}>All departments</SelectItem>
                  <SelectItem value={DEPARTMENT_FILTER_UNASSIGNED}>Unassigned</SelectItem>
                  {activeDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10 bg-white"
                placeholder={subTab === "members" ? "Search members…" : "Search departments…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {subTab === "members" ? (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="p-3 text-left font-medium text-gray-700">ID</th>
                      <th className="p-3 text-left font-medium text-gray-700">Name</th>
                      <th className="p-3 text-left font-medium text-gray-700">Email</th>
                      <th className="p-3 text-left font-medium text-gray-700">Department</th>
                      <th className="p-3 text-left font-medium text-gray-700">Status</th>
                      <th className="p-3 text-left font-medium text-gray-700">Invite</th>
                      <th className="p-3 text-left font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No members found. Use Add Member to add someone to your team.
                        </td>
                      </tr>
                    ) : (
                      groupedMemberRows.map((group) => (
                        <Fragment key={group.label ?? "ungrouped"}>
                          {group.label && departmentFilter === DEPARTMENT_FILTER_ALL && (
                            <tr key={`group-${group.label}`} className="bg-gray-100/80">
                              <td
                                colSpan={7}
                                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600"
                              >
                                {group.label}
                              </td>
                            </tr>
                          )}
                          {group.rows.map((row) => (
                            <tr
                              key={row.key}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="p-3 text-gray-900">{row.employeeId}</td>
                              <td className="p-3 text-gray-900">{row.name}</td>
                              <td className="p-3 text-gray-600">{row.email}</td>
                              <td className="p-3 text-gray-600">{row.department}</td>
                              <td className="p-3">
                                <Badge variant={row.statusVariant}>{row.status}</Badge>
                              </td>
                              <td className="p-3">
                                {row.showInviteAction ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 px-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                                    title="Send StaffOS invite email"
                                    onClick={() => openInviteConfirm(row)}
                                  >
                                    <Mail className="h-4 w-4" />
                                    <span className="text-xs font-medium">Invite</span>
                                  </Button>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                              <td className="p-3">
                                {row.memberId ? (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        title="Member actions"
                                      >
                                        <MoreVertical className="h-4 w-4 text-gray-600" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEditMember(row)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit member
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() =>
                                          setDeleteTarget({
                                            id: row.memberId!,
                                            name: row.name,
                                            email: row.email,
                                          })
                                        }
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete member
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="p-3 text-left font-medium text-gray-700">Department</th>
                      <th className="p-3 text-left font-medium text-gray-700">Members</th>
                      <th className="p-3 text-left font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-500">
                          No departments yet. Use Add Department to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredDepartments.map((d) => (
                        <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">{d.name}</td>
                          <td className="p-3 text-gray-600">{d.memberCount}</td>
                          <td className="p-3">
                            <Badge variant={d.isActive ? "default" : "outline"}>
                              {d.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Save member details to your team. You can send a StaffOS invitation from the team
              table after they are added.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="new-member-dept">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={memberDepartmentId}
                onValueChange={setMemberDepartmentId}
              >
                <SelectTrigger id="new-member-dept" className={`mt-1.5 ${modalFieldClass}`}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {activeDepartments.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      Add a department first
                    </SelectItem>
                  ) : (
                    activeDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-member-name">
                Full name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-member-name"
                className={`mt-1.5 ${modalFieldClass}`}
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="new-member-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-member-email"
                type="email"
                className={`mt-1.5 ${modalFieldClass}`}
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="email@company.com"
              />
            </div>
            <div>
              <Label htmlFor="new-member-salary">
                Salary details access <span className="text-red-500">*</span>
              </Label>
              <Select value={memberSalaryAccess} onValueChange={setMemberSalaryAccess}>
                <SelectTrigger id="new-member-salary" className={`mt-1.5 ${modalFieldClass}`}>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Can See Salary Details</SelectItem>
                  <SelectItem value="false">Can&apos;t See Salary Details</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!memberFormValid || createMemberMutation.isPending}
              onClick={() =>
                createMemberMutation.mutate({
                  name: memberName.trim(),
                  email: memberEmail.trim().toLowerCase(),
                  departmentId: memberDepartmentId,
                  canSeeSalaryDetails: memberSalaryAccess === "true",
                })
              }
            >
              {createMemberMutation.isPending ? "Adding…" : "Add member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addDeptOpen} onOpenChange={setAddDeptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add department</DialogTitle>
            <DialogDescription>
              Optional grouping for your team (does not affect requirement assignment rules).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="dept-name">Department name</Label>
            <Input
              id="dept-name"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="e.g. Engineering"
              className={`mt-2 ${modalFieldClass}`}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddDeptOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!deptName.trim() || createDeptMutation.isPending}
              onClick={() => createDeptMutation.mutate(deptName.trim())}
            >
              {createDeptMutation.isPending ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!inviteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setInviteTarget(null);
            setConfirmEmail("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send invitation email?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm the email address for {inviteTarget?.name}. An invite link will be sent to
              this address so they can sign in to StaffOS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="confirm-invite-email">Email</Label>
            <Input
              id="confirm-invite-email"
              type="email"
              className={`mt-2 ${modalFieldClass}`}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!confirmEmail.trim() || inviteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (!inviteTarget) return;
                inviteMutation.mutate({
                  name: inviteTarget.name,
                  email: confirmEmail.trim().toLowerCase(),
                  departmentId: inviteTarget.departmentId,
                  canSeeSalaryDetails: inviteTarget.canSeeSalaryDetails,
                });
              }}
            >
              {inviteMutation.isPending ? "Sending…" : "Send invite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={editMemberOpen}
        onOpenChange={(open) => {
          setEditMemberOpen(open);
          if (!open) {
            setEditMemberId(null);
            resetMemberForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit member</DialogTitle>
            <DialogDescription>Update team member details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-member-dept">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select value={memberDepartmentId} onValueChange={setMemberDepartmentId}>
                <SelectTrigger id="edit-member-dept" className={`mt-1.5 ${modalFieldClass}`}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {activeDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-member-name">
                Full name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-member-name"
                className={`mt-1.5 ${modalFieldClass}`}
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-member-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-member-email"
                type="email"
                className={`mt-1.5 ${modalFieldClass}`}
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-member-salary">
                Salary details access <span className="text-red-500">*</span>
              </Label>
              <Select value={memberSalaryAccess} onValueChange={setMemberSalaryAccess}>
                <SelectTrigger id="edit-member-salary" className={`mt-1.5 ${modalFieldClass}`}>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Can See Salary Details</SelectItem>
                  <SelectItem value="false">Can&apos;t See Salary Details</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !memberFormValid || !editMemberId || updateMemberMutation.isPending
              }
              onClick={() => {
                if (!editMemberId) return;
                updateMemberMutation.mutate({
                  id: editMemberId,
                  name: memberName.trim(),
                  email: memberEmail.trim().toLowerCase(),
                  departmentId: memberDepartmentId,
                  canSeeSalaryDetails: memberSalaryAccess === "true",
                });
              }}
            >
              {updateMemberMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-gray-900">{deleteTarget?.name}</span> (
              {deleteTarget?.email}) from your team, including their login record and any pending
              invitations. Requirement assignments for this member will be cleared. This cannot be
              undone. You may add them again later as a completely new member and send a fresh
              invite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMemberMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (!deleteTarget) return;
                deleteMemberMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMemberMutation.isPending ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
