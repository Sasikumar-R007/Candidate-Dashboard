import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ClosureReportRow = {
  id?: string;
  candidate: string;
  position: string;
  client?: string;
  talentAdvisor?: string;
  advisor?: string;
  quarter?: string;
  offeredDate?: string;
  offered?: string;
  joinedDate?: string;
  joined?: string;
};

function parseClosureSortDate(dateStr?: string): number {
  if (!dateStr || dateStr === "N/A") return 0;
  const ddMmYyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(dateStr.trim());
  if (ddMmYyyy) {
    const [, day, month, year] = ddMmYyyy;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  const parsed = Date.parse(dateStr);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortClosureReportsByRecent(reports: ClosureReportRow[]): ClosureReportRow[] {
  return [...reports].sort((a, b) => {
    const aJoined = parseClosureSortDate(a.joinedDate || a.joined);
    const bJoined = parseClosureSortDate(b.joinedDate || b.joined);
    if (bJoined !== aJoined) return bJoined - aJoined;
    const aOffered = parseClosureSortDate(a.offeredDate || a.offered);
    const bOffered = parseClosureSortDate(b.offeredDate || b.offered);
    return bOffered - aOffered;
  });
}

function normalizeRow(row: ClosureReportRow) {
  return {
    id: row.id,
    candidate: row.candidate || "N/A",
    position: row.position || "N/A",
    client: row.client || "N/A",
    talentAdvisor: row.talentAdvisor || row.advisor || "N/A",
    quarter: row.quarter || "N/A",
    offeredDate: row.offeredDate || row.offered || "N/A",
    joinedDate: row.joinedDate || row.joined || "N/A",
  };
}

type ClosureReportsCardListProps = {
  reports: ClosureReportRow[];
  isLoading?: boolean;
  emptyMessage?: string;
  maxRows?: number;
  showActions?: boolean;
  renderActions?: (report: ClosureReportRow) => ReactNode;
  getRowClassName?: (report: ClosureReportRow) => string | undefined;
};

/** Card-list closure table (beige header + separated white row cards). */
export function ClosureReportsCardList({
  reports,
  isLoading = false,
  emptyMessage = "No closure reports yet",
  maxRows,
  showActions = false,
  renderActions,
  getRowClassName,
}: ClosureReportsCardListProps) {
  const sortedReports = sortClosureReportsByRecent(reports);
  const visibleReports =
    typeof maxRows === "number" ? sortedReports.slice(0, maxRows) : sortedReports;
  const colSpan = showActions ? 8 : 7;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-[#f7f4f0]">
            <th className="rounded-l-2xl p-3 text-left text-sm font-semibold text-gray-900">
              Candidate
            </th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">Positions</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">Client</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">Talent Advisor</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">QTR</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">Offered Date</th>
            <th
              className={`p-3 text-left text-sm font-semibold text-gray-900 ${
                showActions ? "" : "rounded-r-2xl"
              }`}
            >
              Joined Date
            </th>
            {showActions ? (
              <th className="rounded-r-2xl p-3 text-center text-sm font-semibold text-gray-900">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={colSpan} className="p-8 text-center text-gray-500">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
              </td>
            </tr>
          ) : visibleReports.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="p-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            visibleReports.map((report, index) => {
              const row = normalizeRow(report);
              const rowKey = report.id || `${row.candidate}-${row.position}-${index}`;
              const extraClass = getRowClassName?.(report);
              return (
                <tr
                  key={rowKey}
                  className={`bg-white shadow-[0_0_0_1px_rgba(226,232,240,0.9)] ${extraClass || ""}`}
                >
                  <td className="rounded-l-2xl p-4 text-sm font-medium text-gray-900">
                    {row.candidate}
                  </td>
                  <td className="p-4 text-sm text-gray-700">{row.position}</td>
                  <td className="p-4 text-sm text-gray-700">{row.client}</td>
                  <td className="p-4 text-sm text-gray-700">{row.talentAdvisor}</td>
                  <td className="p-4 text-sm text-gray-700">{row.quarter}</td>
                  <td className="p-4 text-sm text-gray-700">{row.offeredDate}</td>
                  <td
                    className={`p-4 text-sm text-gray-700 ${showActions ? "" : "rounded-r-2xl"}`}
                  >
                    {row.joinedDate}
                  </td>
                  {showActions ? (
                    <td className="rounded-r-2xl p-4 text-center">
                      {renderActions ? renderActions(report) : null}
                    </td>
                  ) : null}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
