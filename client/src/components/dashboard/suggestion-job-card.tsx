import { Users, MapPin, Briefcase, Clock, Bookmark, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SuggestionJobCardProps {
  job: {
    id: string;
    company: string;
    logo: string;
    title: string;
    salary: string;
    location: string;
    workMode: string;
    skills: string[];
    description: string;
    experience: string;
    type: string;
    background: string;
    isHot?: boolean;
    applicationCount?: number;
    postedDate?: string;
  };
  onApply: (job: any) => void;
  onSave: (job: any) => void;
  isApplied: boolean;
  isSaved: boolean;
}

export default function SuggestionJobCard({ 
  job, 
  onApply, 
  onSave, 
  isApplied, 
  isSaved 
}: SuggestionJobCardProps) {
  const initials = job.company
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-w-[320px] max-w-[320px] bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 flex flex-col h-[420px] hover:shadow-xl transition-all group shrink-0 relative overflow-hidden">
      {/* Wave pattern background (subtle) */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Users className="w-16 h-16 rotate-12" />
      </div>

      {/* Header Section */}
      <div className="flex gap-3 items-center mb-5">
        {/* Logo Section */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden border border-gray-100 shadow-md">
            {job.logo && job.logo !== "/api/placeholder/60/60" ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="text-white font-bold text-xl">{initials}</span>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#0f172a] leading-tight truncate">{job.title}</h3>
          <p className="text-[#a855f7] font-bold text-sm truncate">
            {job.company}
          </p>
        </div>
      </div>

      {/* Meta Pills Section */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Badge className="bg-[#f5f3ff] text-[#7c3aed] border-none px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wide">
          <MapPin className="w-3 h-3" />
          {job.location || "Remote"}
        </Badge>
        <Badge className="bg-[#f5f3ff] text-[#7c3aed] border-none px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wide">
          <Briefcase className="w-3 h-3" />
          {job.workMode || "Hybrid"}
        </Badge>
        <Badge className="bg-[#f5f3ff] text-[#7c3aed] border-none px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wide">
          <Clock className="w-3 h-3" />
          {job.experience || "4+ yrs"}
        </Badge>
      </div>

      {/* Description */}
      <div className="mb-5 flex-grow ">
        <p className="text-gray-500 text-[13px] line-clamp-2 leading-relaxed font-medium">
          {job.description || "Implementing innovative solutions and driving excellence within our engineering team."}
        </p>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {job.skills.slice(0, 3).map((skill, index) => (
          <Badge 
            key={index} 
            className="bg-[#f5f3ff] text-[#7c3aed] border-none px-2.5 py-1 rounded-full font-bold text-[10px]"
          >
            {skill.replace(/"/g, '')}
          </Badge>
        ))}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mb-5 text-[12px] font-bold text-gray-400">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          <span>{job.applicationCount || 0} applied</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{job.postedDate || "1 hour ago"}</span>
        </div>
      </div>

      {/* Button */}
      <Button 
        onClick={() => onApply(job)}
        disabled={isApplied}
        className={`w-full py-5 rounded-xl font-bold text-base transition-all shadow-md ${
          isApplied 
            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
            : 'bg-[#a855f7] hover:bg-[#9333ea] text-white'
        }`}
      >
        {isApplied ? "Applied" : "Apply Now"}
      </Button>
    </div>
  );
}
