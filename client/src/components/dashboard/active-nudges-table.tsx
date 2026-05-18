import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Mail, Zap, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useEmployeeAuth } from "@/contexts/auth-context";

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

const ROLE_HIERARCHY: Record<string, number> = {
  'recruiter': 0,
  'team_leader': 1,
  'admin': 2,
  'client': 3
};

const getElapsedWorkingHours = (createdAt: string) => {
  const start = new Date(createdAt);
  const end = new Date();
  if (start >= end) return 0;
  
  let totalMinutes = 0;
  const current = new Date(start);
  
  while (current < end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      const hour = current.getHours();
      if (hour >= 9 && hour < 18) {
        const hourStart = new Date(current);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(current);
        hourEnd.setMinutes(59, 59, 999);
        
        const effectiveStart = current > hourStart ? current : hourStart;
        const effectiveEnd = end < hourEnd ? end : hourEnd;
        
        const diffMs = effectiveEnd.getTime() - effectiveStart.getTime();
        if (diffMs > 0) {
          totalMinutes += diffMs / (1000 * 60);
        }
      }
    }
    current.setHours(current.getHours() + 1);
    current.setMinutes(0, 0, 0);
  }
  return totalMinutes / 60;
};

const formatRemainingWorkingTime = (elapsedHours: number, totalHours: number) => {
  const remaining = totalHours - elapsedHours;
  if (remaining <= 0) return "Escalating...";
  const totalMins = Math.round(remaining * 60);
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  return `${hours} hrs ${minutes} mins`;
};


export default function ActiveNudgesTable() {
  const { toast } = useToast();
  const employee = useEmployeeAuth();
  const queryClient = useQueryClient();
  const [updateModalNudge, setUpdateModalNudge] = useState<Nudge | null>(null);
  const [updateDropdown1, setUpdateDropdown1] = useState("");
  const [updateDropdown2, setUpdateDropdown2] = useState("");
  const [localUpdatedNudges, setLocalUpdatedNudges] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(new Date());

  // Update relative time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: nudges = [], isLoading: isLoadingNudges } = useQuery<Nudge[]>({
    queryKey: ['/api/nudges'],
    staleTime: 0,
    refetchInterval: 15_000,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const res = await apiRequest("POST", `/api/nudges/${id}/respond`, { message });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/nudges'] });
      queryClient.invalidateQueries({ queryKey: ["/api/employee/notifications-feed"] });
      setLocalUpdatedNudges(prev => new Set(prev).add(variables.id));
      toast({
        title: "Success",
        description: "Candidate update sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send update.",
        variant: "destructive",
      });
    }
  });

  const handleUpdateNudgeConfirm = async () => {
    if (!updateModalNudge) return;
    const combinedMessage = `${updateDropdown1} ${updateDropdown2}`;
    
    await respondMutation.mutateAsync({ 
      id: updateModalNudge.id, 
      message: combinedMessage 
    });
    
    setUpdateModalNudge(null);
    setUpdateDropdown1("");
    setUpdateDropdown2("");
  };

  if (isLoadingNudges) return null;

  const currentRole = employee?.role?.toLowerCase() || 'recruiter';
  const currentUserLevel = ROLE_HIERARCHY[currentRole] ?? 0;

  // Process nudges
  const processedNudges = nudges.map(nudge => {
    const isResponded = !!(nudge.isResponded || localUpdatedNudges.has(nudge.id));
    const elapsedHours = getElapsedWorkingHours(nudge.createdAt);
    
    let totalTarget = 6;
    if (nudge.escalationLevel === 'team_leader') totalTarget = 12;
    if (nudge.escalationLevel === 'admin') totalTarget = 18;
    if (nudge.escalationLevel === 'client') totalTarget = 24;

    const isEscalated = !isResponded && elapsedHours >= totalTarget;
    
    // Disable update if escalated beyond current user's level
    const nudgeLevel = ROLE_HIERARCHY[nudge.escalationLevel.toLowerCase()] ?? 0;
    const isUpdateDisabled = isResponded || (nudgeLevel > currentUserLevel);

    return { ...nudge, isResponded, elapsedHours, isEscalated, totalTarget, isUpdateDisabled };
  });

  // Sort: Urgency first (least remaining time), then responded
  processedNudges.sort((a, b) => {
    // If one is responded and other isn't, non-responded comes first
    if (a.isResponded && !b.isResponded) return 1;
    if (!a.isResponded && b.isResponded) return -1;
    
    // If neither is responded, sort by remaining time (least first)
    if (!a.isResponded && !b.isResponded) {
      const aRemaining = a.totalTarget - a.elapsedHours;
      const bRemaining = b.totalTarget - b.elapsedHours;
      return aRemaining - bRemaining;
    }
    
    // If both are responded, sort by respondedAt (most recent first)
    return new Date(b.respondedAt || 0).getTime() - new Date(a.respondedAt || 0).getTime();
  });


  const pendingCount = processedNudges.filter(n => !n.isResponded).length;

  return (
    <Card className="bg-white border border-gray-200 mb-6 shadow-sm overflow-hidden font-outfit">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
          <CardTitle className="text-lg font-semibold text-gray-900">Active Nudges</CardTitle>
          <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
            {pendingCount}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="text-left py-2.5 px-6 font-medium text-gray-700 text-[13px]">Candidate</th>
                <th className="text-left py-2.5 px-6 font-medium text-gray-700 text-[13px]">Role</th>
                <th className="text-left py-2.5 px-6 font-medium text-gray-700 text-[13px]">Company</th>
                <th className="text-left py-2.5 px-6 font-medium text-gray-700 text-[13px]">Status</th>
                <th className="text-left py-2.5 px-6 font-medium text-gray-700 text-[13px]">Nudged</th>
                <th className="text-left py-2.5 px-6 font-medium text-gray-700 text-[13px]">Escalates In</th>
                <th className="text-left py-2.5 px-6 font-medium text-gray-700 text-[13px]">Update</th>

              </tr>
            </thead>
            <tbody>
              {processedNudges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-sm italic bg-gray-50/30">
                    No active nudges requiring attention.
                  </td>
                </tr>
              ) : (
                processedNudges.slice(0, 5).map((nudge) => (
                  <tr key={nudge.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-all group">
                    <td className="py-3 px-6">
                      <span className="font-bold text-gray-900 text-sm">{nudge.candidateName}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm font-medium text-gray-700">{nudge.jobTitle}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-gray-600">{nudge.company}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                        {nudge.currentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-[11px] text-gray-500 font-medium">
                        {formatDistanceToNow(new Date(nudge.createdAt), { addSuffix: true })}
                      </span>
                    </td>

                    <td className="py-3 px-6">
                      {nudge.isResponded ? (
                        <Badge className="bg-green-100 text-green-700 border-0 shadow-none pointer-events-none font-bold text-[10px]" title={nudge.message || "Responded to candidate"}>
                          Responded
                        </Badge>
                      ) : nudge.isEscalated ? (
                        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-fit border border-red-100">
                          Escalated
                          <div className="flex items-center">
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[12px] font-bold text-orange-600">
                          {formatRemainingWorkingTime(nudge.elapsedHours, nudge.totalTarget)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <Button 
                        onClick={() => setUpdateModalNudge(nudge)}
                        disabled={nudge.isUpdateDisabled}
                        size="sm"
                        className={`text-white h-9 text-[11px] px-4 rounded-[6px] flex items-center gap-1.5 transition-all active:scale-95 font-bold ${nudge.isUpdateDisabled ? 'bg-gray-300' : 'bg-slate-900 hover:bg-slate-800 shadow-sm'}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Update
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={!!updateModalNudge} onOpenChange={(open) => !open && setUpdateModalNudge(null)}>
        <DialogContent className="sm:max-w-md overflow-visible rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-6 text-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
              Update Candidate
            </DialogTitle>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Send a status update to <span className="text-white font-semibold">{updateModalNudge?.candidateName}</span> regarding their application for <span className="text-white font-semibold">{updateModalNudge?.jobTitle}</span>.
            </p>
          </div>
          
          <div className="p-6 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Message Template</Label>
                <Select value={updateDropdown1} onValueChange={setUpdateDropdown1}>
                  <SelectTrigger className="w-full border-gray-200 focus:ring-2 focus:ring-blue-500/20 rounded-xl h-12 text-sm bg-gray-50/50 cursor-pointer transition-all hover:bg-gray-50 border shadow-sm">
                    <SelectValue placeholder="Select a message..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-gray-100 p-1">
                    <SelectItem value="Awaiting feedback. I'll update you within" className="rounded-lg py-3 cursor-pointer">Awaiting feedback. I'll update you within</SelectItem>
                    <SelectItem value="Hello! Internal review is in progress. I'll update you within" className="rounded-lg py-3 cursor-pointer">Hello! Internal review is in progress. I'll update you within</SelectItem>
                    <SelectItem value="Hi There! Scheduling is in progress. I'll update you within" className="rounded-lg py-3 cursor-pointer">Hi There! Scheduling is in progress. I'll update you within</SelectItem>
                    <SelectItem value="Sorry. Unexpected internal delay. Expect an update within" className="rounded-lg py-3 cursor-pointer">Sorry. Unexpected internal delay. Expect an update within</SelectItem>
                    <SelectItem value="I have news. I'll connect with you within" className="rounded-lg py-3 cursor-pointer">I have news. I'll connect with you within</SelectItem>
                    <SelectItem value="Sorry. Position Seems to be Paused for now. Expect an update within" className="rounded-lg py-3 cursor-pointer">Sorry. Position Seems to be Paused for now. Expect an update within</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Timeframe</Label>
                <Select value={updateDropdown2} onValueChange={setUpdateDropdown2}>
                  <SelectTrigger className="w-full border-gray-200 focus:ring-2 focus:ring-blue-500/20 rounded-xl h-12 text-sm bg-gray-50/50 cursor-pointer transition-all hover:bg-gray-50 border shadow-sm">
                    <SelectValue placeholder="Select a timeframe..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-gray-100 p-1">
                    <SelectItem value="2 Hours" className="rounded-lg py-3 cursor-pointer">2 Hours</SelectItem>
                    <SelectItem value="6 Hours" className="rounded-lg py-3 cursor-pointer">6 Hours</SelectItem>
                    <SelectItem value="12 Hours" className="rounded-lg py-3 cursor-pointer">12 Hours</SelectItem>
                    <SelectItem value="24 Hours" className="rounded-lg py-3 cursor-pointer">24 Hours</SelectItem>
                    <SelectItem value="2 Days" className="rounded-lg py-3 cursor-pointer">2 Days</SelectItem>
                    <SelectItem value="1 Week" className="rounded-lg py-3 cursor-pointer">1 Week</SelectItem>
                    <SelectItem value="2 Weeks" className="rounded-lg py-3 cursor-pointer">2 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {updateDropdown1 && updateDropdown2 && (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  Message Preview
                </p>
                <p className="text-sm text-gray-900 font-bold leading-relaxed italic">"{updateDropdown1} {updateDropdown2}"</p>
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setUpdateModalNudge(null)}
                className="flex-1 rounded-xl h-12 font-bold border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateNudgeConfirm}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                disabled={!updateDropdown1 || !updateDropdown2 || respondMutation.isPending}
              >
                {respondMutation.isPending ? "Sending..." : "Send Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
