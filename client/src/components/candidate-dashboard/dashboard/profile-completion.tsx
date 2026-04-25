import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, ChevronRight, AlertCircle, PlusCircle, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Candidate } from "@shared/schema";
import { useMemo } from "react";

interface ProfileCompletionProps {
  candidate?: Candidate | null;
  isLoading?: boolean;
}

export default function ProfileCompletion({ candidate, isLoading }: ProfileCompletionProps) {
  const CORE_FIELDS = [
    { key: 'phone', label: 'Phone Number' },
    { key: 'designation', label: 'Current Role' },
    { key: 'location', label: 'Location' },
    { key: 'experience', label: 'Work History' },
    { key: 'skills', label: 'Skills' },
    { key: 'profilePicture', label: 'Profile Picture' },
    { key: 'resumeFile', label: 'Resume File' },
    { key: 'education', label: 'Education' },
    { key: 'linkedinUrl', label: 'LinkedIn' },
    { key: 'portfolioUrl', label: 'Portfolio' },
    { key: 'websiteUrl', label: 'Personal Website' }
  ];

  const profileStats = useMemo(() => {
    if (!candidate) return { completion: 0, missing: [] };
    
    const missing = CORE_FIELDS.filter(f => {
      const val = (candidate as any)[f.key];
      return val === null || val === undefined || val === '';
    });
    
    const completion = Math.round(((CORE_FIELDS.length - missing.length) / CORE_FIELDS.length) * 100);
    return { completion, missing };
  }, [candidate]);

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm bg-white p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden relative group bg-indigo-600 border-none hover:shadow-2xl hover:shadow-indigo-900/40 transition-all duration-500">
      {/* Decorative background flare */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-400 rounded-full blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-700" />
      
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-white flex items-center gap-2 text-base font-black uppercase tracking-tight">
          <UserCheck className="h-5 w-5 text-indigo-300" />
          Profile Sync Engine
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5 relative z-10">
        <div className="flex items-end justify-between">
          <div className="text-5xl font-black text-white tracking-tighter">
            {profileStats.completion}%
          </div>
          <div className="text-right">
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.1em] mb-1">
              {profileStats.completion === 100 ? 'Optimal Visibility' : 'Action Required'}
            </p>
            {profileStats.completion === 100 && <CheckCircle2 className="h-5 w-5 text-green-400 ml-auto" />}
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-2.5 w-full bg-indigo-900/30 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${profileStats.completion}%` }}
            />
          </div>
          
          {profileStats.missing.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Critical Improvements:
              </p>
              <div className="space-y-2">
                {profileStats.missing.slice(0, 2).map((item) => (
                  <div key={item.key} className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer group/item border border-white/5">
                    <span className="text-[11px] font-bold text-white">{item.label}</span>
                    <PlusCircle className="h-3.5 w-3.5 text-indigo-200 group-hover/item:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link href="/candidate/profile">
          <Button 
            className="w-full mt-2 bg-white text-indigo-600 hover:bg-indigo-50 border-none font-black text-[10px] uppercase tracking-widest h-10 shadow-xl shadow-indigo-900/20 group/btn rounded-xl"
          >
            Boost Profile Visibility
            <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
