import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useJobApplications } from "@/hooks/use-job-applications";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const metrics: MetricCard[] = [
    {
      label: "TAT",
      sublabel: "Recruiter reply time",
      sublabelBelow: true,
      value: tat.display,
      bgColor: "bg-[#F2F4F7]",
      textColor: "text-[#344054]",
      showInfo: true,
      infoText: CANDIDATE_TAT_METRIC_TOOLTIP,
    },
    {
      label: "JOBS",
      sublabel: "applied totally",
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
        <h2 className="text-lg font-bold text-gray-900 mb-6 font-poppins">
          Candidate Metrics
        </h2>
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`${metric.bgColor} p-4 rounded-xl border border-transparent shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-gray-800">{metric.label}</span>
                    {metric.showInfo && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors"
                            aria-label="What is TAT?"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="max-w-[240px] text-xs leading-relaxed z-[100]"
                        >
                          {metric.infoText}
                        </TooltipContent>
                      </Tooltip>
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
