import { Users, MapPin, Briefcase, Banknote, Clock, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { RecruiterJob } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface JobCardProps {
  job: RecruiterJob;
}

export function JobCard({ job }: JobCardProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  const primarySkills = typeof job.primarySkills === 'string' 
    ? JSON.parse(job.primarySkills) 
    : (Array.isArray(job.primarySkills) ? job.primarySkills : []);

  const timeDisplay = job.postedDate 
    ? formatDistanceToNow(new Date(job.postedDate), { addSuffix: true }).replace('about ', '')
    : "recently";

  const initials = job.companyName
    ? job.companyName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : "??";

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
        className="bg-white rounded-[24px] p-6 shadow-[0_12px_40px_rgba(31,38,135,0.06)] border border-gray-100/60 flex flex-col h-full relative group transition-all duration-300 hover:bg-[#F9FAFB]/80 border-none"
      >
        {/* Header Section */}
        <div className="flex gap-4 items-start mb-5">
          {/* Logo with Orange Glow */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-0.5 bg-[#F89252] rounded-[18px] blur-[1px] opacity-20" />
            <div className="relative w-14 h-14 bg-[#1A1A1A] rounded-[16px] flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xl uppercase tracking-tighter">{initials}</span>
              )}
            </div>
          </div>
          
          <div className="pt-0.5">
            <h3 className="text-lg font-bold text-[#2D3748] leading-tight mb-0.5 tracking-tight">{job.role}</h3>
            <p className="text-[#9F7AEA] font-semibold text-sm">
              {job.companyName}
            </p>
          </div>
        </div>

        {/* Info Pills Row */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F0FF] text-[#7C3AED] text-[11px] font-medium">
            <MapPin className="w-3 h-3" />
            {job.location || "Remote"}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F0FF] text-[#7C3AED] text-[11px] font-medium">
            <Briefcase className="w-3 h-3" />
            {job.workMode || "On-site"}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F0FF] text-[#7C3AED] text-[11px] font-medium">
            <Clock className="w-3 h-3" />
            {job.experience ? `${job.experience} yrs` : "0+ yrs"}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F0FF] text-[#7C3AED] text-[11px] font-medium">
            <Banknote className="w-3 h-3" />
            {job.salaryPackage || "₹ 5.5 LPA"}
          </div>
        </div>

        {/* Separator & Description */}
        <div className="w-full h-[1px] bg-gray-50 mb-4" />

        <div className="mb-5 flex-grow">
          <p className="text-[#718096] text-[13px] line-clamp-2 leading-relaxed font-normal">
            {job.roleDefinitions || job.aboutCompany || `Building next-gen solutions combining design, development, and innovation.`}
          </p>
        </div>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {primarySkills.slice(0, 4).map((skill: string, index: number) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="bg-[#F3F0FF] text-[#7C3AED] border-none px-3 py-1 rounded-lg font-bold text-[10px]"
            >
              {skill}
            </Badge>
          ))}
          {primarySkills.length > 4 && (
             <Badge variant="secondary" className="bg-[#F3F0FF] text-[#7C3AED] border-none px-2 py-1 rounded-lg font-bold text-[10px]">
               +{primarySkills.length - 4}
             </Badge>
          )}
        </div>

        {/* Footer info & compact button */}
        <div className="space-y-4 mt-auto">
          <div className="flex items-center justify-between text-[#A0AEC0] font-medium text-[12px]">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 opacity-60" />
              <span>{job.applicationCount || 0} applied</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-60" />
              <span>{timeDisplay}</span>
            </div>
          </div>
          
          <Button 
            onClick={handleApplyClick}
            disabled={isLaunching}
            className="bg-[#9F7AEA] hover:bg-[#805AD5] text-white rounded-[10px] w-full py-5 font-bold text-base shadow-md shadow-purple-100/50 transition-all active:scale-95 border-none"
          >
            {isLaunching ? "Launching..." : "Apply Now"}
          </Button>
        </div>
      </motion.div>

      {/* Rocket Launch Overlay */}
      <AnimatePresence>
        {isLaunching && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
             <motion.div
               initial={{ y: 80, opacity: 0, scale: 0.8 }}
               animate={{ y: -600, opacity: 1, scale: 1 }}
               transition={{ duration: 1, ease: "easeIn" }}
               className="relative z-10"
             >
                <Rocket className="w-16 h-16 text-[#9F7AEA] fill-[#9F7AEA] shadow-[0_0_30px_rgba(159,122,234,0.4)]" />
                <motion.div 
                  animate={{ height: [10, 30, 10], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.1 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-3 bg-gradient-to-b from-[#9F7AEA] to-transparent rounded-full"
                />
             </motion.div>

             {[...Array(6)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ scale: 0.2, opacity: 0, y: 30, x: (i - 3) * 10 }}
                 animate={{ scale: 2 + i, opacity: [0, 0.4, 0], y: 80, x: (i - 3) * 20 }}
                 transition={{ duration: 0.8, delay: i * 0.05 }}
                 className="absolute bottom-1/4 w-10 h-10 bg-purple-100/30 rounded-full blur-2xl"
               />
             ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
