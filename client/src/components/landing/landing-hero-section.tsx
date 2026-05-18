import { Button } from "@/components/ui/button";
import { NudgesExplainerCard } from "@/components/landing/nudges-explainer-card";

type LandingHeroSectionProps = {
  onSignUp: () => void;
};

export function LandingHeroSection({ onSignUp }: LandingHeroSectionProps) {
  return (
    <section className="pl-3 pr-5 pb-12 pt-6 sm:pl-4 sm:pr-8 sm:pb-16 sm:pt-8 md:pl-5 md:pr-10 md:pb-20 lg:pl-6 lg:pr-14">
      <div className="mx-auto grid max-w-[90rem] items-center gap-10 lg:grid-cols-2 lg:gap-6 xl:gap-10">
        <div className="max-w-xl pl-4 sm:pl-6 lg:max-w-none lg:pl-10 xl:pl-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Candidate-First Hiring Platform
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-[1.15] tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl">
            Stop{" "}
            <span className="text-[#2563EB]">chasing</span> recruiters for updates
          </h1>

          <p className="mt-4 text-lg font-semibold text-[#2563EB] sm:text-xl">
            Powered by Nudges — structured updates with smart escalation.
          </p>

          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            No more silence or ghosting after applying. Nudges bring timely updates, structured
            follow-ups, and smart escalations into hiring.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-[8px] bg-[#2563EB] px-8 text-base font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 sm:h-12"
              onClick={onSignUp}
            >
              Sign up for free
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 rounded-[8px] border-gray-300 bg-white px-8 text-base font-semibold text-gray-700 hover:bg-gray-50 sm:h-12"
              asChild
            >
              <a href="#jobs">Search Jobs</a>
            </Button>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-center">
          {/* Soft radial halo behind Nudges card */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,400px)] w-[min(100%,400px)] -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          >
            <div
              className="absolute inset-0 rounded-full opacity-90 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(37, 99, 235, 0.22) 0%, rgba(147, 197, 253, 0.35) 42%, rgba(224, 242, 254, 0.55) 58%, transparent 72%)",
              }}
            />
            <div
              className="absolute inset-[18%] rounded-full border border-sky-200/50 opacity-70 blur-md"
              style={{
                background:
                  "conic-gradient(from 210deg at 50% 50%, rgba(59, 130, 246, 0.12), rgba(191, 219, 254, 0.35), rgba(59, 130, 246, 0.08), rgba(191, 219, 254, 0.25))",
              }}
            />
          </div>
          <div className="relative w-full max-w-[22.5rem]">
            <NudgesExplainerCard />
          </div>
        </div>
      </div>
    </section>
  );
}
