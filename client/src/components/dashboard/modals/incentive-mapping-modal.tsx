import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { invalidateIncentiveMappingQueries } from "@/lib/admin-performance-queries";

type RevenueCandidateOption = {
  id: string;
  candidateName: string;
  position: string;
  quarter: string;
  year: number;
  alreadyMapped: boolean;
  label: string;
};

type IncentiveContext = {
  revenueMappingId: string;
  candidateName: string | null;
  teamLeadName: string;
  talentAdvisorName: string;
  quarter: string;
  year: number;
  tlTargetAmount: number;
  taTargetAmount: number;
  tlRevenueAmount: number;
  taRevenueAmount: number;
  tlAchievedAmount: number;
  taAchievedAmount: number;
  tlRemainingTarget: number;
  taRemainingTarget: number;
};

interface IncentiveMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIncentiveMapping?: any;
}

function formatInr(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatQuarterLabel(quarter: string) {
  const q = (quarter || "").toUpperCase();
  const map: Record<string, string> = {
    JFM: "Q1 (JFM)",
    AMJ: "Q2 (AMJ)",
    JAS: "Q3 (JAS)",
    OND: "Q4 (OND)",
    Q1: "Q1 (JFM)",
    Q2: "Q2 (AMJ)",
    Q3: "Q3 (JAS)",
    Q4: "Q4 (OND)",
  };
  return map[q] || quarter;
}

export default function IncentiveMappingModal({
  isOpen,
  onClose,
  editingIncentiveMapping,
}: IncentiveMappingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [revenueMappingId, setRevenueMappingId] = useState("");
  const [tlIncentive, setTlIncentive] = useState("");
  const [taIncentive, setTaIncentive] = useState("");
  const [bdIncentive, setBdIncentive] = useState("");
  const [context, setContext] = useState<IncentiveContext | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const { data: candidateOptions = [] } = useQuery<RevenueCandidateOption[]>({
    queryKey: ["/api/admin/incentive-mapping-candidates"],
    enabled: isOpen,
  });

  const selectableCandidates = useMemo(() => {
    if (editingIncentiveMapping) {
      return candidateOptions.filter(
        (c) => !c.alreadyMapped || c.id === editingIncentiveMapping.revenueMappingId,
      );
    }
    return candidateOptions.filter((c) => !c.alreadyMapped);
  }, [candidateOptions, editingIncentiveMapping]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingIncentiveMapping) {
      setRevenueMappingId(editingIncentiveMapping.revenueMappingId || "");
      setTlIncentive(String(editingIncentiveMapping.tlIncentiveAmount ?? ""));
      setTaIncentive(String(editingIncentiveMapping.taIncentiveAmount ?? ""));
      setBdIncentive(String(editingIncentiveMapping.bdIncentiveAmount ?? ""));
      if (editingIncentiveMapping.revenueMappingId) {
        void loadContext(editingIncentiveMapping.revenueMappingId);
      }
    } else {
      setRevenueMappingId("");
      setTlIncentive("0");
      setTaIncentive("0");
      setBdIncentive("");
      setContext(null);
    }
  }, [editingIncentiveMapping, isOpen]);

  const loadContext = async (mappingId: string) => {
    if (!mappingId) {
      setContext(null);
      return;
    }
    setIsLoadingContext(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/admin/incentive-mappings/context/${mappingId}`,
      );
      const data = await response.json();
      setContext(data);
    } catch {
      setContext(null);
      toast({
        title: "Could not load mapping details",
        description: "Please try another revenue mapped candidate.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handleRevenueCandidateChange = (value: string) => {
    setRevenueMappingId(value);
    if (!editingIncentiveMapping) {
      setTlIncentive("0");
      setTaIncentive("0");
    }
    void loadContext(value);
  };

  const isFormValid = useMemo(() => {
    const bd = parseFloat(bdIncentive);
    return (
      Boolean(revenueMappingId && context) &&
      bdIncentive.trim() !== "" &&
      Number.isFinite(bd) &&
      bd >= 0
    );
  }, [revenueMappingId, context, bdIncentive]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        revenueMappingId,
        tlIncentiveAmount: tlIncentive || "0",
        taIncentiveAmount: taIncentive || "0",
        bdIncentiveAmount: bdIncentive,
      };
      if (editingIncentiveMapping?.id) {
        return apiRequest("PUT", `/api/admin/incentive-mappings/${editingIncentiveMapping.id}`, payload);
      }
      return apiRequest("POST", "/api/admin/incentive-mappings", payload);
    },
    onSuccess: () => {
      invalidateIncentiveMappingQueries(queryClient);
      toast({
        title: "Success",
        description: editingIncentiveMapping
          ? "Incentive mapping updated successfully"
          : "Incentive mapping saved successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save incentive mapping",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold">Incentive Mapping</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5 rounded-md border border-slate-200 bg-slate-50/80 p-3">
            <Label className="text-sm font-medium text-gray-700">
              Revenue mapped Candidate <span className="text-red-500">*</span>
            </Label>
            <Select
              value={revenueMappingId}
              onValueChange={handleRevenueCandidateChange}
              disabled={Boolean(editingIncentiveMapping)}
            >
              <SelectTrigger className="bg-white border-slate-300 h-10 rounded-[4px] shadow-sm">
                <SelectValue placeholder="Select revenue mapped candidate" />
              </SelectTrigger>
              <SelectContent>
                {selectableCandidates.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No revenue mapped candidates available
                  </SelectItem>
                ) : (
                  selectableCandidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {context && (
            <div className="grid grid-cols-2 gap-4 rounded-md border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm">
              <div className="rounded-[4px] bg-white/70 border border-indigo-100 px-3 py-2">
                <span className="text-xs text-gray-500">Quarter</span>
                <p className="font-semibold text-gray-900">{formatQuarterLabel(context.quarter)}</p>
              </div>
              <div className="rounded-[4px] bg-white/70 border border-indigo-100 px-3 py-2">
                <span className="text-xs text-gray-500">Year</span>
                <p className="font-semibold text-gray-900">{context.year}</p>
              </div>
              <div className="rounded-[4px] bg-white/70 border border-indigo-100 px-3 py-2">
                <span className="text-xs text-gray-500">Team Lead</span>
                <p className="font-semibold text-gray-900">{context.teamLeadName}</p>
              </div>
              <div className="rounded-[4px] bg-white/70 border border-indigo-100 px-3 py-2">
                <span className="text-xs text-gray-500">Talent Advisor</span>
                <p className="font-semibold text-gray-900">{context.talentAdvisorName}</p>
              </div>
            </div>
          )}

          <div className="rounded-md border border-slate-300 overflow-hidden shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-200/80 border-b border-slate-300">
                  <th className="text-left py-2.5 px-3 font-medium text-gray-600 w-36 border-r border-slate-300" />
                  <th className="text-center py-2.5 px-3 font-semibold text-blue-900 bg-blue-100/70 border-r border-slate-300">
                    TL
                  </th>
                  <th className="text-center py-2.5 px-3 font-semibold text-violet-900 bg-violet-100/70 border-r border-slate-300">
                    TA
                  </th>
                  <th className="text-center py-2.5 px-3 font-semibold text-emerald-900 bg-emerald-100/70">
                    BD
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="py-2.5 px-3 font-medium text-gray-700 bg-slate-50 border-r border-slate-300">
                    Target
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-900 bg-blue-50/50 border-r border-slate-300">
                    {isLoadingContext ? "…" : context ? formatInr(context.tlTargetAmount) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-900 bg-violet-50/50 border-r border-slate-300">
                    {isLoadingContext ? "…" : context ? formatInr(context.taTargetAmount) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-400 bg-emerald-50/30">—</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="py-2.5 px-3 font-medium text-gray-700 bg-slate-50 border-r border-slate-300">
                    Revenue
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-900 bg-blue-50/50 border-r border-slate-300">
                    {isLoadingContext ? "…" : context ? formatInr(context.tlRevenueAmount) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-900 bg-violet-50/50 border-r border-slate-300">
                    {isLoadingContext ? "…" : context ? formatInr(context.taRevenueAmount) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-400 bg-emerald-50/30">—</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="py-2.5 px-3 font-medium text-gray-700 bg-amber-50/80 border-r border-slate-300">
                    Remaining target
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-amber-900 bg-blue-50/40 border-r border-slate-300">
                    {isLoadingContext ? "…" : context ? formatInr(context.tlRemainingTarget) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-amber-900 bg-violet-50/40 border-r border-slate-300">
                    {isLoadingContext ? "…" : context ? formatInr(context.taRemainingTarget) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-400 bg-emerald-50/30">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-gray-700 bg-slate-50 border-r border-slate-300">
                    Incentive <span className="text-red-500">*</span>
                  </td>
                  <td className="py-3 px-3 bg-blue-50/40 border-r border-slate-300">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tlIncentive}
                        disabled
                        readOnly
                        className="pl-6 h-9 text-sm bg-slate-100 border-slate-200 text-gray-500 rounded-[4px] cursor-not-allowed"
                        placeholder="Auto (soon)"
                        title="TL incentive will be calculated automatically"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-center text-gray-400">Auto-calculated</p>
                  </td>
                  <td className="py-3 px-3 bg-violet-50/40 border-r border-slate-300">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={taIncentive}
                        disabled
                        readOnly
                        className="pl-6 h-9 text-sm bg-slate-100 border-slate-200 text-gray-500 rounded-[4px] cursor-not-allowed"
                        placeholder="Auto (soon)"
                        title="TA incentive will be calculated automatically"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-center text-gray-400">Auto-calculated</p>
                  </td>
                  <td className="py-3 px-3 bg-emerald-50/50">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">₹</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={bdIncentive}
                        onChange={(e) => setBdIncentive(e.target.value)}
                        className="pl-6 h-9 text-sm bg-white border-emerald-200 rounded-[4px] focus-visible:ring-emerald-400"
                        placeholder="Enter amount"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500">
            Target and revenue values are fetched from Target Mapping and Revenue Data. TL and TA incentives will be
            auto-calculated from formulas in a future update; enter BD incentive for now.
          </p>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-[4px]">
              Close
            </Button>
            <Button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={!isFormValid || saveMutation.isPending}
              className="rounded-[4px] bg-blue-600 text-white hover:bg-blue-700"
            >
              {saveMutation.isPending ? "Saving…" : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
