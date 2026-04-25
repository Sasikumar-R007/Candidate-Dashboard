import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { 
  ClipboardCheck, 
  Search, 
  Users, 
  Trophy, 
  XCircle,
  MoreVertical,
  Calendar,
  Rocket,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import type { JobApplication } from "@shared/schema";

interface PipelineKanbanProps {
  applications: JobApplication[];
  isLoading?: boolean;
}

const STAGES = [
  { id: 'applied', label: 'Applied', icon: ClipboardCheck, color: 'bg-blue-600', bgColor: 'bg-blue-50/50', textColor: 'text-blue-700', shadow: 'shadow-blue-100' },
  { id: 'screening', label: 'Screening', icon: Search, color: 'bg-purple-600', bgColor: 'bg-purple-50/50', textColor: 'text-purple-700', shadow: 'shadow-purple-100' },
  { id: 'interview', label: 'Interview', icon: Users, color: 'bg-violet-600', bgColor: 'bg-violet-50/50', textColor: 'text-violet-700', shadow: 'shadow-violet-100' },
  { id: 'offer', label: 'Offer', icon: Trophy, color: 'bg-emerald-600', bgColor: 'bg-emerald-50/50', textColor: 'text-emerald-700', shadow: 'shadow-emerald-100' },
  { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'bg-rose-600', bgColor: 'bg-rose-50/50', textColor: 'text-rose-700', shadow: 'shadow-rose-100' },
];

export default function PipelineKanban({ applications = [], isLoading }: PipelineKanbanProps) {
  
  const getStageForStatus = (status: string) => {
    if (!status) return 'applied';
    const s = status.toLowerCase();
    if (s.includes('rejected')) return 'rejected';
    if (s.includes('offer') || s.includes('joined')) return 'offer';
    if (s.includes('interview')) return 'interview';
    if (s.includes('process') || s.includes('screening') || s.includes('shortlisted')) return 'screening';
    return 'applied';
  };

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage.id] = (applications || []).filter(app => getStageForStatus(app.status || '') === stage.id);
    return acc;
  }, {} as Record<string, JobApplication[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-[550px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col space-y-4">
              <Skeleton className="h-14 w-full rounded-xl" />
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Smart Empty State
  if (!applications || applications.length === 0) {
    return (
      <Card className="border-none bg-white shadow-sm rounded-[32px] overflow-hidden group">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-purple-50 rounded-full scale-150 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:scale-110 transition-transform duration-500">
              <Rocket className="h-14 w-14 text-purple-600 animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <TrendingUp className="h-3 w-3 text-white font-bold" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Launch Your Journey</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-10 font-medium leading-relaxed">
            Your application pipeline is currently empty. Start applying to top-tier roles to see them tracked in real-time here. 🚀
          </p>
          <Link href="/candidate/matches">
            <Button className="bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-600/20 font-bold px-10 h-14 rounded-xl group transition-all">
              Browse Matches
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 font-poppins">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Application Pipeline</h2>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <Badge variant="outline" className="bg-white text-slate-400 border-slate-100 font-bold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
          Live Tracker
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto pb-6 h-[580px] scrollbar-hide px-1">
        {STAGES.map((stage) => {
          const apps = grouped[stage.id] || [];
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex flex-col min-w-[280px] group/col">
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between p-4 rounded-2xl border border-slate-100/50 mb-4 transition-all duration-300 group-hover/col:shadow-md group-hover/col:border-purple-100",
                stage.bgColor
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl text-white shadow-lg flex items-center justify-center transition-transform group-hover/col:scale-110 duration-500", stage.color, stage.shadow)}>
                    <Icon className="h-5 w-5 fill-white/10" strokeWidth={2.5} />
                  </div>
                  <span className={cn("text-[13px] font-bold uppercase tracking-tight", stage.textColor)}>{stage.label}</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm self-center font-bold text-slate-900 text-[11px] w-7 h-7 flex items-center justify-center rounded-lg shadow-sm border border-slate-100">
                  {apps.length}
                </div>
              </div>

              {/* Column Body */}
              <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide pr-1 pb-4">
                {apps.map((app) => (
                  <Card key={app.id} className="group border border-slate-50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-500 cursor-pointer bg-white rounded-2xl overflow-hidden relative">
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-full my-4", stage.color)} />
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start leading-none gap-2">
                        <div className="flex-1">
                          <h4 className="text-[14px] font-bold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
                            {app.jobTitle}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">{app.company}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full">
                          <Calendar className="h-3 w-3" />
                          {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                        <div className={cn("w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px] shadow-sm uppercase transition-transform group-hover:rotate-12", stage.color, "text-white")}>
                          {app.company?.[0]}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {apps.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-[32px] opacity-40 group-hover/col:opacity-100 transition-all duration-500 hover:bg-white hover:border-slate-100">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-2">
                       <ClipboardCheck className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">All Systems Clear</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function CheckSquare({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
