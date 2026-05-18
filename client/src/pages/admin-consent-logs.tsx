import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";

type ConsentLogRow = {
  id: string;
  userId: string;
  role: string;
  consentType: string;
  policyVersion: string;
  acceptedAt: string | Date;
  ipAddress: string | null;
  userAgent: string | null;
};

export default function AdminConsentLogsPage() {
  const { data: rows = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["/api/admin/consent-logs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/consent-logs?limit=500");
      return res.json() as Promise<ConsentLogRow[]>;
    },
  });

  const formatDate = (v: string | Date) => {
    try {
      return new Date(v).toLocaleString();
    } catch {
      return String(v);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1200px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" className="rounded-none" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to admin
            </Link>
          </Button>
          <Button variant="secondary" size="sm" className="rounded-none" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Consent & agreement logs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Read-only audit trail (latest 500). Admin access only.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Could not load logs. Try refresh or sign in as admin.</p>
        ) : (
          <div className="overflow-x-auto rounded-none border border-gray-200 bg-white shadow-none">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-700">Accepted</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-700">User ID</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-700">Role</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-700">Type</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-700">Policy</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-700">IP</th>
                  <th className="min-w-[200px] px-3 py-2 font-medium text-gray-700">User agent</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                      No consent logs yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-3 py-2 text-gray-800">{formatDate(r.acceptedAt)}</td>
                      <td className="max-w-[140px] truncate px-3 py-2 font-mono text-xs text-gray-700" title={r.userId}>
                        {r.userId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">{r.role}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">{r.consentType}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">{r.policyVersion}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{r.ipAddress || "—"}</td>
                      <td className="max-w-md truncate px-3 py-2 text-xs text-gray-600" title={r.userAgent || ""}>
                        {r.userAgent || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
