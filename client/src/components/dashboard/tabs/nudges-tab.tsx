import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const PAGE_SIZE = 10;

interface Nudge {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  currentStatus: string;
  isRead: boolean;
  isResponded: boolean;
  createdAt: string;
  escalationLevel: string;
  message?: string;
  respondedAt?: string;
}

function matchesNudgeSearch(nudge: Nudge, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    nudge.candidateName?.toLowerCase().includes(q) ||
    nudge.jobTitle?.toLowerCase().includes(q) ||
    nudge.company?.toLowerCase().includes(q) ||
    nudge.currentStatus?.toLowerCase().includes(q) ||
    nudge.escalationLevel?.toLowerCase().includes(q) ||
    (nudge.message || "").toLowerCase().includes(q)
  );
}

export default function NudgeLogsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: nudges = [], isLoading } = useQuery<Nudge[]>({
    queryKey: ['/api/nudges/logs'],
  });

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  const filteredNudges = useMemo(
    () => nudges.filter((n) => matchesNudgeSearch(n, searchQuery)),
    [nudges, searchQuery],
  );

  const displayedNudges = useMemo(
    () => filteredNudges.slice(0, visibleCount),
    [filteredNudges, visibleCount],
  );

  const hasMore = visibleCount < filteredNudges.length;
  const isShowingAll = !hasMore && filteredNudges.length > PAGE_SIZE;

  const resultLabel = useMemo(() => {
    const total = nudges.length;
    const shown = Math.min(visibleCount, filteredNudges.length);
    if (!searchQuery.trim()) {
      return `Showing ${shown} of ${total} record${total === 1 ? "" : "s"}`;
    }
    return `Showing ${shown} of ${filteredNudges.length} match${filteredNudges.length === 1 ? "" : "es"} (${total} total)`;
  }, [nudges.length, filteredNudges.length, visibleCount, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="shrink-0">
              <CardTitle className="text-xl font-bold text-gray-900">Candidate Nudge Logs</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Full history of all candidate nudges</p>
            </div>
            <div className="flex w-full flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full min-w-0 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search by candidate, role, company, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-[4px] border-slate-300 bg-slate-100 pl-9 text-slate-900 shadow-sm placeholder:text-slate-500 focus-visible:ring-slate-400"
                  style={{ borderRadius: 4 }}
                  data-testid="input-nudge-logs-search"
                />
              </div>
              {filteredNudges.length > PAGE_SIZE && (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 rounded-[4px] border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    if (isShowingAll) {
                      setVisibleCount(PAGE_SIZE);
                    } else {
                      setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredNudges.length));
                    }
                  }}
                  data-testid="button-nudge-logs-view-more"
                >
                  {isShowingAll ? "Show less" : "View more"}
                </Button>
              )}
            </div>
          </div>
          <p className="mt-2 text-left text-xs text-gray-500 sm:text-right" data-testid="text-nudge-logs-search-count">
            {resultLabel}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-4 md:hidden">
            {filteredNudges.length === 0 ? (
              <p className="py-6 text-center text-sm italic text-gray-500">
                {searchQuery.trim() ? "No logs match your search." : "No nudge history found."}
              </p>
            ) : (
              displayedNudges.map((nudge) => (
                <div
                  key={nudge.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  data-testid={`card-nudge-log-${nudge.id}`}
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900">{nudge.candidateName}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(nudge.createdAt), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-700">
                    <p>
                      <span className="font-medium text-gray-500">Role: </span>
                      {nudge.jobTitle}
                    </p>
                    <p>
                      <span className="font-medium text-gray-500">Company: </span>
                      {nudge.company}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-50 text-xs">
                      {nudge.currentStatus}
                    </Badge>
                    <Badge
                      className="text-xs capitalize"
                      variant={nudge.escalationLevel === "recruiter" ? "secondary" : "destructive"}
                    >
                      {nudge.escalationLevel.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Response:{" "}
                    {nudge.respondedAt
                      ? format(new Date(nudge.respondedAt), "MMM d, hh:mm a")
                      : "—"}
                  </p>
                  {nudge.message ? (
                    <p className="mt-2 break-words rounded-[4px] bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700">
                      {nudge.message}
                    </p>
                  ) : nudge.isResponded ? (
                    <p className="mt-2 text-xs font-medium text-green-700">Responded</p>
                  ) : (
                    <p className="mt-2 text-xs font-medium text-orange-600">Pending</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse font-poppins">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-6 text-sm font-bold text-gray-800">Date & time</th>
                  <th className="text-left py-3 px-6 text-sm font-bold text-gray-800">Candidate</th>
                  <th className="text-left py-3 px-6 text-sm font-bold text-gray-800">Role</th>
                  <th className="text-left py-3 px-6 text-sm font-bold text-gray-800">Company</th>
                  <th className="text-left py-3 px-6 text-sm font-bold text-gray-800">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-bold text-gray-800">Escalation level</th>
                  <th className="text-left py-3 px-6 text-sm font-bold text-gray-800">Response on</th>
                  <th className="text-left py-3 px-6 text-sm font-bold text-gray-800">Updates</th>
                </tr>
              </thead>
              <tbody>
                {filteredNudges.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 text-sm italic">
                      {searchQuery.trim() ? "No logs match your search." : "No nudge history found."}
                    </td>
                  </tr>
                ) : (
                  displayedNudges.map((nudge) => (
                    <tr key={nudge.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="py-3 px-6">
                        <span className="text-sm font-medium text-gray-700">
                          {format(new Date(nudge.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="font-semibold text-gray-900 text-sm">{nudge.candidateName}</span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-700">{nudge.jobTitle}</span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-600">{nudge.company}</span>
                      </td>
                      <td className="py-3 px-6">
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          {nudge.currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <Badge className="text-xs capitalize" variant={nudge.escalationLevel === 'recruiter' ? 'secondary' : 'destructive'}>
                          {nudge.escalationLevel.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-500 italic">
                          {nudge.respondedAt ? format(new Date(nudge.respondedAt), 'MMM d, hh:mm a') : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        {nudge.message ? (
                          <span className="block max-w-md whitespace-normal break-words rounded-[4px] bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            {nudge.message}
                          </span>
                        ) : nudge.isResponded ? (
                          <span className="text-xs text-green-700 font-medium" title={nudge.message || "Responded"}>Responded</span>
                        ) : (
                          <span className="text-xs text-orange-600 font-medium">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
