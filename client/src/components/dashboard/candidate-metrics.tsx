import {
  Info,
  Briefcase,
  CalendarCheck,
  XCircle,
  LogOut,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useJobApplications } from "@/hooks/use-job-applications";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  computeCandidateNudgeTat,
  CANDIDATE_TAT_METRIC_TOOLTIP,
  mapCandidateApplicationStage,
  isCandidateRejectedStatus,
} from "@/lib/candidate-pipeline-utils";
import type { CandidateNudgeRow } from "@/lib/candidate-notifications";

type MetricCard = {
  label: string;
  sublabel?: string;
  sublabelBelow?: boolean;
  value: string | number;
  bgColor: string;
  textColor: string;
  showInfo?: boolean;
  infoText?: string;
};

type MobileStat = {
  label: string;
  sublabel: string;
  value: string | number;
  icon: typeof Briefcase;
  iconBg: string;
  iconColor: string;
  valueColor: string;
};

function TatInfoButton({ infoText }: { infoText: string }) {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="lg:hidden shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm border border-gray-200/80 active:scale-95"
            aria-label="What is TAT?"
          >
            <Info className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="z-[300] w-[min(calc(100vw-2rem),300px)] p-3 text-xs leading-relaxed text-gray-700"
        >
          {infoText}
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="hidden lg:flex shrink-0 h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors"
            aria-label="What is TAT?"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="max-w-[240px] text-xs leading-relaxed z-[100]"
        >
          {infoText}
        </TooltipContent>
      </Tooltip>
    </>
  );
}

export default function CandidateMetrics() {
  const { data: jobApplications = [] } = useJobApplications();
  const { data: candidateNudges = [] } = useQuery<CandidateNudgeRow[]>({
    queryKey: ["/api/candidate/nudges"],
  });

  const appliedCount = jobApplications.length;

  const rejectedCount = jobApplications.filter((app) =>
    isCandidateRejectedStatus(app.status),
  ).length;

  const withdrawnCount = jobApplications.filter((app) => {
    const s = (app.status || "").toLowerCase();
    return s.includes("withdrawn");
  }).length;

  const interviewCount = jobApplications.filter(
    (app) =>
      mapCandidateApplicationStage(app.status) === "Interview Stage" &&
      (app as { isCandidateConfirmed?: boolean }).isCandidateConfirmed !== false,
  ).length;

  const feedbackReceived = jobApplications.filter(
    (app) => (app.status || "").toLowerCase() === "feedback received",
  ).length;

  const pendingFeedback = jobApplications.filter(
    (app) => (app.status || "").toLowerCase() === "pending feedback",
  ).length;

  const tat = computeCandidateNudgeTat(candidateNudges);

  const tatMetric: MetricCard = {
    label: "TAT",
    sublabel: "Recruiter reply time",
    sublabelBelow: true,
    value: tat.display,
    bgColor: "bg-gradient-to-br from-slate-50 to-slate-100",
    textColor: "text-[#344054]",
    showInfo: true,
    infoText: CANDIDATE_TAT_METRIC_TOOLTIP,
  };

  const mobileStats: MobileStat[] = [
    {
      label: "Jobs",
      sublabel: "Applied",
      value: appliedCount,
      icon: Briefcase,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-blue-700",
    },
    {
      label: "Interviews",
      sublabel: "Active",
      value: interviewCount,
      icon: CalendarCheck,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      valueColor: "text-violet-700",
    },
    {
      label: "Rejected",
      sublabel: "Total",
      value: rejectedCount,
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      valueColor: "text-red-700",
    },
    {
      label: "Withdrawn",
      sublabel: "By you",
      value: withdrawnCount,
      icon: LogOut,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
    },
    {
      label: "Feedback",
      sublabel: "Received",
      value: feedbackReceived,
      icon: MessageSquare,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      valueColor: "text-slate-800",
    },
    {
      label: "Pending",
      sublabel: "Feedback",
      value: pendingFeedback,
      icon: Clock,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      valueColor: "text-cyan-700",
    },
  ];

  const desktopMetrics: MetricCard[] = [
    tatMetric,
    {
      label: "JOBS",
      sublabel: "Applied Totally",
      value: appliedCount,
      bgColor: "bg-[#EFF8FF]",
      textColor: "text-[#175CD3]",
    },
    {
      label: "INTERVIEWS",
      sublabel: "In Process",
      value: interviewCount,
      bgColor: "bg-[#EFF8FF]",
      textColor: "text-[#175CD3]",
    },
    {
      label: "REJECTED",
      sublabel: "On Applications",
      value: rejectedCount,
      bgColor: "bg-[#F2F4F7]",
      textColor: "text-[#D92D20]",
    },
    {
      label: "WITHDRAWN",
      sublabel: "By You",
      value: withdrawnCount,
      bgColor: "bg-[#F2F4F7]",
      textColor: "text-[#B54708]",
    },
    {
      label: "FEEDBACK",
      sublabel: "Received",
      value: feedbackReceived,
      bgColor: "bg-[#F2F4F7]",
      textColor: "text-[#344054]",
    },
    {
      label: "PENDING",
      sublabel: "Feedback",
      value: pendingFeedback,
      bgColor: "bg-[#EFF8FF]",
      textColor: "text-[#175CD3]",
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full">
        <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-6 font-poppins">
          Candidate Metrics
        </h2>

        {/* Mobile: SaaS-style dashboard panel */}
        <div className="lg:hidden">
          <div className="rounded-[12px] bg-gradient-to-b from-slate-50 to-slate-100/80 p-3 ring-1 ring-slate-200/80 shadow-sm space-y-2">
            {/* Featured TAT */}
            <div className="rounded-[10px] bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Avg. recruiter TAT
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">Reply time on nudges</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <p className="text-xl font-bold tabular-nums tracking-tight text-slate-900">
                    {tatMetric.value}
                  </p>
                  {tatMetric.infoText && <TatInfoButton infoText={tatMetric.infoText} />}
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-2">
              {mobileStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-[8px] bg-white p-2.5 shadow-sm ring-1 ring-slate-200/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] ${stat.iconBg}`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-slate-500 truncate leading-tight">
                            {stat.label}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate leading-tight">{stat.sublabel}</p>
                        </div>
                      </div>
                      <p className={`text-lg font-bold tabular-nums leading-none shrink-0 ${stat.valueColor}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop: unchanged vertical list */}
        <div className="hidden lg:block space-y-3">
          {desktopMetrics.map((metric) => (
            <div
              key={metric.label}
              className={`${metric.bgColor} p-4 rounded-xl border border-transparent shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-lg font-bold text-gray-800">{metric.label}</span>
                    {metric.showInfo && metric.infoText && (
                      <TatInfoButton infoText={metric.infoText} />
                    )}
                    {!metric.sublabelBelow && metric.sublabel && (
                      <span className="text-xs text-gray-500 font-medium">{metric.sublabel}</span>
                    )}
                  </div>
                  {metric.sublabelBelow && metric.sublabel && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{metric.sublabel}</p>
                  )}
                </div>
                <div className={`text-2xl font-bold shrink-0 ${metric.textColor}`}>
                  {metric.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
