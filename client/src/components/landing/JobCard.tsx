import { Users, Briefcase, Clock, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { RecruiterJob } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface JobCardProps {
  job: RecruiterJob;
}

const accent = {
  badgeBg: "bg-sky-50",
  badgeText: "text-sky-800",
  btn: "bg-[#1E6BFF] hover:bg-blue-700",
  initialsBg: "bg-sky-100",
  initialsText: "text-[#1E40AF]",
};

export function JobCard({ job }: JobCardProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  const primarySkills =
    typeof job.primarySkills === "string"
      ? JSON.parse(job.primarySkills)
      : Array.isArray(job.primarySkills)
        ? job.primarySkills
        : [];

  const timeDisplay = job.postedDate
    ? formatDistanceToNow(new Date(job.postedDate), { addSuffix: true }).replace("about ", "")
    : "recently";

  const initials = job.companyName
    ? job.companyName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "??";

  const industry = job.jobCategory?.trim() || "IT Services";

  const handleApplyClick = () => {
    setIsLaunching(true);
    setTimeout(() => {
      window.location.href = "/candidate-login";
    }, 1200);
  };

  return (
    <div className="relative h-full w-full">
      <motion.div
        animate={isLaunching ? { opacity: 0.4, scale: 0.98, filter: "blur(4px)" } : {}}
        className="group relative flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <div
              className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-sky-100 ${accent.initialsBg}`}
            >
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-cover" />
              ) : (
                <span className={`text-sm font-bold uppercase tracking-tight ${accent.initialsText}`}>
                  {initials}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0 pt-0.5">
            <h3 className="text-sm font-bold leading-tight text-gray-900">{job.companyName}</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {job.location || "Remote"} · {industry}
            </p>
          </div>
        </div>

        <h4 className="mb-3 text-base font-bold leading-snug text-gray-900">{job.role}</h4>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600`}
          >
            Full-time
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600`}
          >
            <Clock className="h-3 w-3 opacity-70" />
            {job.experience ? `${job.experience} yrs` : "0+ yrs"}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600`}
          >
            <Briefcase className="h-3 w-3 opacity-70" />
            {job.workMode || "On-site"}
          </span>
        </div>

        <div className="mb-3 h-px w-full bg-gray-100" />

        <div className="mb-3 min-h-[2.5rem] flex-grow">
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
            {job.roleDefinitions ||
              job.aboutCompany ||
              `Building next-gen solutions combining design, development, and innovation.`}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {primarySkills.slice(0, 4).map((skill: string, index: number) => (
            <Badge
              key={index}
              variant="secondary"
              className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${accent.badgeBg} ${accent.badgeText}`}
            >
              {skill}
            </Badge>
          ))}
          {primarySkills.length > 4 && (
            <Badge
              variant="secondary"
              className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${accent.badgeBg} ${accent.badgeText}`}
            >
              +{primarySkills.length - 4}
            </Badge>
          )}
        </div>

        <div className="mt-auto border-t border-gray-100 pt-3">
          <div className="mb-2 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {job.applicationCount || 0} applied
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeDisplay}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-gray-900">{job.salaryPackage || "₹ 5.5 LPA"}</p>
            <Button
              onClick={handleApplyClick}
              disabled={isLaunching}
              className={`h-9 shrink-0 rounded-[6px] border-0 px-4 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] sm:text-sm ${accent.btn}`}
            >
              {isLaunching ? "…" : "Apply Now"}
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isLaunching && (
          <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.8 }}
              animate={{ y: -600, opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeIn" }}
              className="relative z-10"
            >
              <Rocket className="h-14 w-14 fill-[#1E6BFF] text-[#1E6BFF] shadow-[0_0_24px_rgba(30,107,255,0.35)]" />
              <motion.div
                animate={{ height: [10, 28, 10], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.1 }}
                className="absolute left-1/2 top-full w-2.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#1E6BFF] to-transparent"
              />
            </motion.div>

            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.2, opacity: 0, y: 30, x: (i - 3) * 10 }}
                animate={{ scale: 2 + i, opacity: [0, 0.35, 0], y: 80, x: (i - 3) * 20 }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className="absolute bottom-1/4 h-10 w-10 rounded-full bg-sky-100/40 blur-2xl"
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
