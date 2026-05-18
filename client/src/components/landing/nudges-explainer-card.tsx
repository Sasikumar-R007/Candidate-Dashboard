import { Check, Info, ShieldCheck } from "lucide-react";
import sendMessageAnimation from "@/assets/animations/send-message.json";
import { LottiePlayer } from "@/components/common/LottiePlayer";
import { cn } from "@/lib/utils";
import { PaperPlaneNudgeIcon } from "@/components/landing/paper-plane-nudge-icon";

const steps = [
  {
    status: "done" as const,
    title: "Nudge Recruiter",
    description:
      "Your nudge has been sent to the recruiter. Auto-escalates if no response is received within 3 hours.",
  },
  {
    status: "active" as const,
    title: "Auto-Escalates to TL",
    description:
      "If no response is received within 3 hours. Auto-Escalates to Team Manager.",
  },
  {
    status: "pending" as const,
    title: "Auto-Escalates to Hiring Manager",
    description:
      "You'll most likely receive an update at this stage if earlier levels missed it",
  },
];

function TimelineIcon({ status }: { status: "done" | "active" | "pending" }) {
  if (status === "done") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
        <Check className="h-3 w-3 stroke-[3]" aria-hidden />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
      </div>
    );
  }
  return (
    <div className="h-5 w-5 shrink-0 rounded-full bg-gray-200" aria-hidden />
  );
}

export function NudgesExplainerCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[20rem] pb-0.2 pr-0.5 sm:max-w-[21.5rem] lg:max-w-[22.5rem]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-2 rounded-[1.65rem] bg-slate-900/15 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 translate-x-1 translate-y-1.5 rounded-[1.35rem] bg-[#2563EB]/75 blur-[1px]"
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/95 shadow-[0_26px_60px_-26px_rgba(15,23,42,0.7)] backdrop-blur-xl",
        )}
      >
        <div
          className="pointer-events-none absolute -right-2 top-0 z-30 h-32 w-36 opacity-95 sm:-right-1 sm:top-0 sm:h-36 sm:w-40"
          aria-hidden
        >
          <LottiePlayer
            animationData={sendMessageAnimation}
            className="nudge-send-message-animation h-full w-full"
          />
        </div>

        <div className="relative z-10 flex gap-4 border-b border-slate-200/80 px-4 py-4 sm:px-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-md shadow-blue-200/80">
            <PaperPlaneNudgeIcon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-base font-bold leading-tight text-gray-950 sm:text-lg">
              How Nudges work?
            </h3>
            <p className="mt-1 max-w-[13rem] text-xs leading-snug text-gray-700 sm:max-w-[14rem]">
              Smart escalation dynamics designed to keep you updated
            </p>
          </div>
        </div>

        <ol className="relative z-10 px-5 py-4 sm:px-6">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="relative flex w-5 shrink-0 flex-col items-center pt-0.5">
                {index < steps.length - 1 && (
                  <span
                    className="absolute bottom-0 left-1/2 top-6 w-px -translate-x-1/2 bg-gray-200"
                    aria-hidden
                  />
                )}
                <div className="relative z-[1]">
                  <TimelineIcon status={step.status} />
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 sm:text-[13px]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="relative z-10 mx-3 mb-3 rounded-xl bg-[#C9DCFF] px-4 py-3 sm:mx-4 sm:mb-4">
          <div className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden />
            <p className="text-xs font-semibold text-[#1d4ed8] sm:text-sm">
              We ensure timely updates and complete transparency.
            </p>
          </div>
          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-gray-500 sm:text-xs">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
            <span>You can send a new nudge only after the cool down period</span>
          </div>
        </div>
      </div>
    </div>
  );
}
