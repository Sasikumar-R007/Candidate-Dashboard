import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_MODAL_SEARCH_INPUT_CLASS } from "@/lib/revenue-mapping-utils";

interface ClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditMapping?: (mappingId: string) => void;
  onDeleteMapping?: (mappingId: string, description: string) => void;
}

export interface ClosureDetailRow {
  id: string;
  candidate?: string;
  candidateName?: string;
  position?: string;
  client?: string;
  clientName?: string;
  clientType?: string;
  partnerName?: string;
  talentAdvisor?: string;
  teamLead?: string;
  teamLeadName?: string;
  year?: string | number;
  quarter?: string;
  quarterYear?: string;
  percentage?: string;
  ctc?: string;
  fixedCTC?: string;
  revenue?: string;
  incentivePlan?: string;
  incentive?: string;
  source?: string;
  offeredDate?: string;
  joinedDate?: string;
  closureDate?: string;
  status?: string;
  invoiceDate?: string;
  invoiceNumber?: string;
  paymentStatus?: string;
  paymentDetails?: string;
  incentivePaidMonth?: string;
  createdAt?: string;
}

const CLOSURE_COLUMNS: Array<{ key: keyof ClosureDetailRow; label: string; minWidth?: string }> = [
  { key: "candidateName", label: "Candidate", minWidth: "120px" },
  { key: "position", label: "Position", minWidth: "100px" },
  { key: "clientName", label: "Client", minWidth: "100px" },
  { key: "clientType", label: "Client Type", minWidth: "90px" },
  { key: "partnerName", label: "Partner", minWidth: "90px" },
  { key: "talentAdvisor", label: "Talent Advisor", minWidth: "110px" },
  { key: "teamLeadName", label: "Team Lead", minWidth: "100px" },
  { key: "quarterYear", label: "Quarter / Year", minWidth: "100px" },
  { key: "offeredDate", label: "Offered", minWidth: "95px" },
  { key: "closureDate", label: "Closure", minWidth: "95px" },
  { key: "status", label: "Status", minWidth: "80px" },
  { key: "percentage", label: "Fee %", minWidth: "70px" },
  { key: "fixedCTC", label: "Fixed CTC", minWidth: "95px" },
  { key: "revenue", label: "Revenue", minWidth: "95px" },
  { key: "incentivePlan", label: "Incentive Plan", minWidth: "100px" },
  { key: "incentive", label: "Incentive", minWidth: "90px" },
  { key: "source", label: "Source", minWidth: "85px" },
  { key: "invoiceDate", label: "Invoice Date", minWidth: "95px" },
  { key: "invoiceNumber", label: "Invoice #", minWidth: "90px" },
  { key: "paymentStatus", label: "Payment", minWidth: "95px" },
  { key: "paymentDetails", label: "Pay Details", minWidth: "100px" },
  { key: "incentivePaidMonth", label: "Incentive Paid", minWidth: "100px" },
  { key: "createdAt", label: "Recorded", minWidth: "95px" },
];

function getCellValue(row: ClosureDetailRow, key: keyof ClosureDetailRow): string {
  if (key === "candidateName") {
    return row.candidateName || row.candidate || "N/A";
  }
  if (key === "clientName") {
    return row.clientName || row.client || "N/A";
  }
  if (key === "teamLeadName") {
    return row.teamLeadName || row.teamLead || "N/A";
  }
  if (key === "quarterYear") {
    return row.quarterYear || (row.quarter && row.year ? `${row.quarter}, ${row.year}` : row.quarter || "N/A");
  }
  if (key === "closureDate") {
    return row.closureDate || row.joinedDate || "N/A";
  }
  if (key === "fixedCTC") {
    return row.fixedCTC || (row.ctc ? `₹${row.ctc}` : "N/A");
  }
  const value = row[key];
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
}

function getRowDescription(row: ClosureDetailRow): string {
  const name = row.candidateName || row.candidate || "N/A";
  const position = row.position || "N/A";
  return `${name} - ${position}`;
}

export default function ClosureModal({
  isOpen,
  onClose,
  onEditMapping,
  onDeleteMapping,
}: ClosureModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: closureData = [], isLoading } = useQuery<ClosureDetailRow[]>({
    queryKey: ["/api/admin/closures-list"],
    enabled: isOpen,
  });

  const filteredData = useMemo(() => {
    if (!searchTerm) return closureData;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return closureData.filter((closure) =>
      CLOSURE_COLUMNS.some((col) =>
        getCellValue(closure, col.key).toLowerCase().includes(lowerSearchTerm),
      ),
    );
  }, [searchTerm, closureData]);

  const columnCount = CLOSURE_COLUMNS.length + (onEditMapping || onDeleteMapping ? 1 : 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[calc(100vw-2rem)] max-h-[88vh] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                List of Closures - Detailed View
              </DialogTitle>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {filteredData.length} of {closureData.length} records
              </p>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search closures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={ADMIN_MODAL_SEARCH_INPUT_CLASS}
                data-testid="input-search-closures"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-4 py-3">
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-max w-full border-collapse text-sm bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-slate-100 dark:bg-gray-700/90">
                  {CLOSURE_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.minWidth }}
                      className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 whitespace-nowrap border-b border-slate-200 dark:border-slate-600"
                    >
                      {col.label}
                    </th>
                  ))}
                  {(onEditMapping || onDeleteMapping) && (
                    <th
                      className="sticky right-0 z-10 bg-slate-100 dark:bg-gray-700/90 text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 whitespace-nowrap border-b border-l border-slate-200 dark:border-slate-600"
                      style={{ minWidth: "100px" }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columnCount} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      Loading closures data...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((closure, index) => (
                    <tr
                      key={closure.id || index}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      {CLOSURE_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{ minWidth: col.minWidth }}
                          className={`py-2.5 px-3 text-xs whitespace-nowrap ${
                            col.key === "candidateName"
                              ? "font-medium text-slate-900 dark:text-white"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {getCellValue(closure, col.key)}
                        </td>
                      ))}
                      {(onEditMapping || onDeleteMapping) && (
                        <td className="sticky right-0 z-10 bg-white dark:bg-gray-900 py-2 px-3 border-l border-slate-100 dark:border-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {onEditMapping && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-blue-600"
                                onClick={() => onEditMapping(closure.id)}
                                data-testid={`button-edit-closure-${closure.id}`}
                                title="Edit revenue mapping"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {onDeleteMapping && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-red-600"
                                onClick={() => onDeleteMapping(closure.id, getRowDescription(closure))}
                                data-testid={`button-delete-closure-${closure.id}`}
                                title="Delete revenue mapping"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : closureData.length === 0 ? (
                  <tr>
                    <td colSpan={columnCount} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No closures data available
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={columnCount} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No results found for "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
