import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Upload, Users } from "lucide-react";

type DataEntryMember = {
  id: string;
  name?: string | null;
  employeeId?: string | null;
  email?: string | null;
};

type UploadStats = {
  totalUploaded: number;
  todayUploaded: number;
};

const searchInputClassName =
  "h-10 rounded-lg border border-slate-300 bg-slate-100 pl-9 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400";

interface DataEntryMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: DataEntryMember[];
  uploadStats: Record<string, UploadStats>;
  activeEmployeeIds: Set<string>;
}

function DataEntryMetricCard({
  emp,
  uploadStats,
  isOnline,
}: {
  emp: DataEntryMember;
  uploadStats: UploadStats;
  isOnline: boolean;
}) {
  return (
    <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {emp.name || "Unnamed"}
            </p>
            <p className="text-xs text-gray-500">{emp.employeeId || "—"}</p>
            {emp.email ? (
              <p className="mt-0.5 truncate text-xs text-gray-400">{emp.email}</p>
            ) : null}
          </div>
          <span
            className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium ${
              isOnline
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-slate-50 px-2 py-3 dark:bg-slate-800">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {uploadStats.totalUploaded}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Total uploads
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 px-2 py-3 dark:bg-emerald-900/20">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {uploadStats.todayUploaded}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Today
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DataEntryMetricsModal({
  isOpen,
  onClose,
  members,
  uploadStats,
  activeEmployeeIds,
}: DataEntryMetricsModalProps) {
  const [search, setSearch] = useState("");

  const summary = useMemo(() => {
    let totalUploaded = 0;
    let todayUploaded = 0;
    let onlineCount = 0;
    for (const emp of members) {
      const stats = uploadStats[emp.id] ?? { totalUploaded: 0, todayUploaded: 0 };
      totalUploaded += stats.totalUploaded;
      todayUploaded += stats.todayUploaded;
      if (activeEmployeeIds.has(emp.id)) onlineCount += 1;
    }
    return { totalUploaded, todayUploaded, onlineCount };
  }, [members, uploadStats, activeEmployeeIds]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...members].sort((a, b) => {
      const aTotal = uploadStats[a.id]?.totalUploaded ?? 0;
      const bTotal = uploadStats[b.id]?.totalUploaded ?? 0;
      return bTotal - aTotal;
    });
    if (!q) return list;
    return list.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q),
    );
  }, [members, uploadStats, search]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSearch("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-emerald-600" />
            Data Entry upload metrics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-6 py-4 admin-scrollbar" style={{ maxHeight: "calc(90vh - 5rem)" }}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-slate-50 p-3 text-center dark:border-gray-700 dark:bg-slate-900">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <Users className="h-3.5 w-3.5" />
                Users
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{members.length}</div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20">
              <div className="text-xs text-gray-600 dark:text-gray-400">Online now</div>
              <div className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
                {summary.onlineCount}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center dark:border-gray-700 dark:bg-gray-900">
              <div className="text-xs text-gray-500">Team total uploads</div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalUploaded}
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
              <div className="text-xs text-emerald-700 dark:text-emerald-300">Uploaded today</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.todayUploaded}
              </div>
            </div>
          </div>

          {members.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or email…"
                className={searchInputClassName}
              />
            </div>
          )}

          {members.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
              No Data Entry users yet. Use &quot;Add Data Entry&quot; to create one.
            </p>
          ) : filteredMembers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No users match your search.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((emp) => (
                <DataEntryMetricCard
                  key={emp.id}
                  emp={emp}
                  uploadStats={uploadStats[emp.id] ?? { totalUploaded: 0, todayUploaded: 0 }}
                  isOnline={activeEmployeeIds.has(emp.id)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
