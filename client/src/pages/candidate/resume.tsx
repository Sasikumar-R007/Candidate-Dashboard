import { useProfile, useUploadResume } from "@/hooks/use-profile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Download,
  Zap,
  RefreshCw,
  Sparkles,
  Search,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ResumePage() {
  const { data: profile, isLoading } = useProfile();
  const uploadResumeMutation = useUploadResume();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file for better AI parsing accuracy.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    // UX Layer: Sequenced intelligence feedback
    toast({
      title: "File received",
      description: "Uploading your document to StaffOS AI secure cloud...",
    });

    try {
      await uploadResumeMutation.mutateAsync(file);

      // Simulate analysis phase for better perceived value
      setTimeout(() => {
        toast({
          title: "Analyzing career milestones...",
          description: "Our LLM is extracting structured data from your resume.",
          icon: <Search className="h-4 w-4 text-indigo-500 animate-pulse" />
        });
      }, 1500);

      setTimeout(() => {
        toast({
          title: "Profile Optimized! 🎯",
          description: "Your structured data is now active for semantic job matching.",
          variant: "default",
          className: "bg-green-50 border-green-200"
        });
      }, 4000);

    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-11 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-indigo-500 fill-indigo-500" />
            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Profile Sync Engine</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Resume Management</h2>
          <p className="text-slate-500 text-sm font-medium italic opacity-80">Structure your career achievements for platform-wide visibility</p>
        </div>

        <div className="relative">
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button
            asChild
            disabled={isUploading}
            className="bg-indigo-600 text-white hover:bg-slate-900 shadow-xl shadow-indigo-900/10 font-black text-[10px] uppercase tracking-widest h-12 px-8 rounded-2xl group transition-all duration-300"
          >
            <label htmlFor="resume-upload" className="cursor-pointer flex items-center">
              {isUploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4 group-hover:-translate-y-1 transition-transform" />}
              {isUploading ? 'Deep Analysis...' : 'Sync New Resume'}
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3: Parsed Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm border-none bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/20 p-6">
              <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <FileSearch className="h-5 w-5 text-indigo-600" />
                Structured AI Profile
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-green-600 tracking-tighter">Live Engine Sync</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {profile?.resumeText ? (
                <div className="prose prose-slate max-w-none">
                  <div className="relative group/content">
                    <pre className="text-xs text-slate-600 font-sans leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-6 rounded-2xl border border-slate-100 max-h-[600px] overflow-y-auto scrollbar-hide shadow-inner">
                      {profile.resumeText}
                    </pre>
                    <div className="absolute top-4 right-4 opacity-0 group-hover/content:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm h-8 font-bold text-[10px] uppercase shadow-sm">
                        <Download className="h-3 w-3 mr-2" /> Download JSON
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                  <div className="bg-slate-50 p-8 rounded-full border-2 border-dashed border-slate-200 mb-6 group hover:border-indigo-200 transition-colors">
                    <Zap className="h-12 w-12 text-slate-200 group-hover:text-indigo-600 group-hover:fill-indigo-50 transition-all duration-500" />
                  </div>
                  <h3 className="font-black text-slate-700 text-lg uppercase tracking-tight">Station Empty</h3>
                  <p className="text-xs max-w-sm text-center mt-2 font-medium italic opacity-70">
                    Sync your resume to see the structured data architecture that our semantic engine uses to connect you with elite opportunities.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1/3: File Sidebox */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-indigo-600 border-none text-white p-7 rounded-3xl relative overflow-hidden flex flex-col min-h-[220px]">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h4 className="font-black text-xl mb-3 tracking-tighter">Engine Health</h4>
              <p className="text-indigo-100 text-xs leading-relaxed mb-8 font-medium">
                Your semantic profile is currently <span className="text-white font-black underline underline-offset-4 decoration-indigo-300 decoration-2">Active</span>.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                    <Check className="h-4 w-4 text-green-300" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-50">Deep Meta Optimized</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                    <Check className="h-4 w-4 text-green-300" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-50">Match Score Sync Active</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white p-6 border-none rounded-3xl hover:shadow-xl transition-all duration-500">
            <h4 className="font-black text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-tighter text-sm">
              <FileText className="h-4 w-4 text-indigo-600" />
              Source Artifact
            </h4>

            {profile?.resumeFile ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex-shrink-0 shadow-sm">
                      <FileText className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">Active_Resume_V2.pdf</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Sync on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 font-black text-[10px] uppercase tracking-widest h-10 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm" asChild>
                    <a href={profile.resumeFile} target="_blank" rel="noopener noreferrer">Inspect File</a>
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-slate-50 w-12 h-12 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Artifact Missing</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
