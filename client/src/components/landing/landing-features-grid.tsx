import type { ReactNode } from "react";
import {
  BarChart3,
  Briefcase,
  Clock,
  FileText,
  MessageSquare,
  RefreshCw,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaperPlaneNudgeIcon } from "@/components/landing/paper-plane-nudge-icon";

function FlowArrow() {
  return (
    <span className="mx-0.5 shrink-0 text-[10px] text-gray-300 sm:text-xs" aria-hidden>
      →
    </span>
  );
}

type FlowStep = { label: string; icon: ReactNode };

function MiniFlow({
  steps,
  circleClass,
  labelClassName,
}: {
  steps: FlowStep[];
  circleClass: string;
  labelClassName: string;
}) {
  return (
    <div className="mt-auto flex flex-nowrap items-start justify-center gap-y-1 overflow-x-auto pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {steps.map((step, i) => (
        <div key={step.label} className="flex shrink-0 items-start">
          {i > 0 && <FlowArrow />}
          <div className="flex w-[3.25rem] flex-col items-center text-center sm:w-[3.5rem]">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-white",
                circleClass,
              )}
            >
              {step.icon}
            </div>
            <span
              className={cn(
                "mt-1 text-[9px] font-semibold leading-tight sm:text-[10px]",
                labelClassName,
              )}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LandingFeaturesGrid() {
  return (
    <section className="border-t border-gray-100 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
          Everything you need. All in one place.
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {/* Nudge & Escalation — blue */}
          <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
              <Zap className="h-5 w-5 text-[#2563EB]" aria-hidden />
            </div>
            <h3 className="mt-3 text-base font-bold text-[#2563EB] sm:text-lg">Nudge & Escalation</h3>
            <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
              Send Nudge, get updates, and escalate if needed
            </p>
            <MiniFlow
              circleClass="bg-[#2563EB]"
              labelClassName="text-[#2563EB]"
              steps={[
                {
                  label: "Nudge",
                  icon: (
                    <PaperPlaneNudgeIcon className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />
                  ),
                },
                {
                  label: "Wait",
                  icon: <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />,
                },
                {
                  label: "Escalate",
                  icon: <UserCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />,
                },
              ]}
            />
          </article>

          {/* 3-Step Registration — green */}
          <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <UserCheck className="h-5 w-5 text-emerald-600" aria-hidden />
            </div>
            <h3 className="mt-3 text-base font-bold text-emerald-600 sm:text-lg">3-Step Registration</h3>
            <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
              create your profile and get started in minutes.
            </p>
            <MiniFlow
              circleClass="bg-emerald-600"
              labelClassName="text-emerald-600"
              steps={[
                {
                  label: "Upload",
                  icon: <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />,
                },
                {
                  label: "Parsed",
                  icon: (
                    <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
                  ),
                },
                {
                  label: "Submit",
                  icon: <UserCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />,
                },
              ]}
            />
          </article>

          {/* Job Pipeline — orange */}
          <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Briefcase className="h-5 w-5 text-amber-600" aria-hidden />
            </div>
            <h3 className="mt-3 text-base font-bold text-amber-600 sm:text-lg">Job Pipeline</h3>
            <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
              Track every step of your application journey
            </p>
            <MiniFlow
              circleClass="bg-amber-600"
              labelClassName="text-amber-600"
              steps={[
                {
                  label: "Apply",
                  icon: <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />,
                },
                {
                  label: "Screening",
                  icon: <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />,
                },
                {
                  label: "Interview",
                  icon: <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />,
                },
                {
                  label: "Offered",
                  icon: <UserCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />,
                },
              ]}
            />
          </article>

          {/* Metrics — purple */}
          <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
              <BarChart3 className="h-5 w-5 text-violet-600" aria-hidden />
            </div>
            <h3 className="mt-3 text-base font-bold text-violet-600 sm:text-lg">Metrics to Track</h3>
            <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">
              Know where you stand with powerful insights.
            </p>
            <div className="mt-auto flex w-full justify-center gap-1.5 pt-4 sm:gap-2">
              {[
                { n: "12", l: "Applications" },
                { n: "5", l: "In-process" },
                { n: "3", l: "Interviews" },
              ].map((m) => (
                <div
                  key={m.l}
                  className="flex min-h-[3.25rem] min-w-0 flex-1 max-w-[5.5rem] flex-col items-center justify-center rounded-[4px] border border-violet-200 bg-white px-1 py-2 sm:min-h-[3.5rem] sm:max-w-none sm:px-2"
                >
                  <p className="text-base font-bold tabular-nums leading-none text-violet-600 sm:text-lg">
                    {m.n}
                  </p>
                  <p className="mt-1 text-center text-[9px] font-medium leading-tight text-gray-500 sm:text-[10px]">
                    {m.l}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
