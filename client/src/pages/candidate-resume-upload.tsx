import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, apiFileUpload } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Upload, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  LogOut, 
  Loader2, 
  User, 
  MapPin, 
  Rocket,
  Edit2
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { useProfile } from "@/hooks/use-profile";
import { motion, AnimatePresence } from "framer-motion";
import staffosLogo2 from "@/assets/staffos logo 2.png";
import { Input } from "@/components/ui/input";

type OnboardingStep = "UPLOAD" | "SCANNING" | "PREVIEW" | "ROCKET";

export default function CandidateResumeUpload() {
  const [step, setStep] = useState<OnboardingStep>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [editableName, setEditableName] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  // Poll every 2s until AI onboarding finishes (stage becomes `completed`)
  const { data: profile } = useProfile({ pollUntilOnboardingComplete: true });

  const advanceStepFromProfile = useCallback(
    (p: typeof profile | undefined) => {
      if (!p) return;
      const stage = p.registrationStage;
      if (stage !== "resume_uploaded" && stage !== "completed") return;

      const displayName =
        (p.fullName && String(p.fullName).trim()) ||
        [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
      if (displayName) {
        setEditableName((prev) => prev || displayName);
      }

      if (step !== "PREVIEW" && step !== "ROCKET") {
        setStep("PREVIEW");
      }
    },
    [step],
  );

  useEffect(() => {
    advanceStepFromProfile(profile);
  }, [
    profile?.registrationStage,
    profile?.fullName,
    profile?.firstName,
    profile?.lastName,
    profile?.resumeFile,
    advanceStepFromProfile,
  ]);

  const handleLogoutClick = () => {
    setShowSignOutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowSignOutDialog(false);
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        variant: "destructive",
      });
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (resumeFile: File) => {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const res = await apiFileUpload("/api/upload/resume", formData);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to upload resume");
      }
      return await res.json();
    },
    onSuccess: async (payload: { url?: string; registrationStage?: string }) => {
      setStep("SCANNING");
      toast({
        title: "Resume Received!",
        description: "Our AI is scanning your documents now...",
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      try {
        const freshProfile = await queryClient.fetchQuery({
          queryKey: ["/api/profile"],
          queryFn: api.getProfile,
        });
        advanceStepFromProfile(freshProfile);
        if (freshProfile?.registrationStage === "resume_uploaded" || freshProfile?.registrationStage === "completed") {
          toast({
            title: "Resume analyzed",
            description: "Review your details and continue to the dashboard.",
          });
        }
      } catch (err) {
        console.error("[Resume upload] Profile refetch after upload failed:", err);
      }

      if (payload?.registrationStage === "resume_uploaded") {
        queryClient.setQueryData(["/api/profile"], (prev: typeof profile) =>
          prev
            ? {
                ...prev,
                registrationStage: "resume_uploaded",
                resumeFile: payload.url ?? prev.resumeFile,
              }
            : prev,
        );
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload resume.",
        variant: "destructive",
      });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async (fullName: string) => {
      const res = await apiRequest("POST", "/api/onboarding/finalize", { fullName });
      return await res.json();
    },
    onSuccess: () => {
      setStep("ROCKET");
      // Pre-clear cache so Dashboard loads fresh
      queryClient.clear();
      
      setTimeout(() => {
        window.location.href = "/candidate";
      }, 2500);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-poppins relative overflow-hidden">
      {/* Background Rocket Element (Invisible until active) */}
      <AnimatePresence>
        {step === "ROCKET" && (
          <motion.div 
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: "-100vh", opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="relative">
              <Rocket className="w-32 h-32 text-purple-600 fill-purple-100 rotate-0" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-8 h-24 bg-gradient-to-t from-transparent via-orange-400 to-yellow-300 blur-md rounded-full animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl w-full"
        >
          {/* Logo & Header (Hidden during scanning/rocket for focus) */}
          {step !== "ROCKET" && (
            <div className="flex flex-col items-center space-y-4 mb-8 text-center">
              <img src={staffosLogo2} alt="StaffOS" className="h-16 w-16 rounded-2xl shadow-sm" />
              <h1 className="text-3xl font-bold text-slate-900 font-poppins">
                {step === "UPLOAD" && "Final Step: Your Resume"}
                {step === "SCANNING" && "Processing Your Resume"}
                {step === "PREVIEW" && "Verify Your Profile"}
              </h1>
              <p className="text-slate-500 max-w-md mx-auto font-poppins text-sm px-4">
                {step === "UPLOAD" && "Upload your resume and let our smart AI match you with the best opportunities instantly."}
                {step === "SCANNING" && "We are extracting your skills, experience, and key details to build your professional profile."}
                {step === "PREVIEW" && "Is this you? Verify the details our AI found in your resume."}
              </p>
            </div>
          )}

          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${
              step === "SCANNING" ? "bg-purple-100" : "bg-gradient-to-r from-purple-500 to-blue-500"
            }`}>
              {step === "SCANNING" && (
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-1/2 h-full bg-purple-600"
                />
              )}
            </div>

            {/* STEP 1: UPLOAD */}
            {step === "UPLOAD" && (
              <div className="space-y-8 mt-4">
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer flex flex-col items-center space-y-4 ${
                    file ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-purple-400"
                  }`}
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    file ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{file ? file.name : "Click to browse or drag & drop"}</p>
                    <p className="text-sm text-slate-400">PDF, DOCX accepted (Max 5MB)</p>
                  </div>

                  <input 
                    id="resume-upload" 
                    type="file" 
                    accept=".pdf,.docx" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>

                <div className="flex flex-col space-y-4 pt-4">
                  <Button 
                    disabled={!file || uploadMutation.isPending}
                    onClick={onUpload}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-3"
                  >
                    {uploadMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    {uploadMutation.isPending ? "Analyze My Resume" : "Analyze My Resume"}
                  </Button>

                  <div className="flex justify-center">
                    <button 
                      onClick={handleLogoutClick}
                      className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out and try another account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SCANNING */}
            {step === "SCANNING" && (
              <div className="py-12 flex flex-col items-center space-y-8 animate-pulse text-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
                  <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-slate-900">AI Intelligent Scanning...</p>
                  <p className="text-slate-500">Mapping your career path and skills.</p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.5, 1] }} 
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-2 h-2 rounded-full bg-purple-400"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: PREVIEW */}
            {step === "PREVIEW" && (
              <div className="space-y-8">
                <div className="bg-purple-50/50 border border-purple-100 p-6 rounded-2xl space-y-6 text-left">
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <Input 
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        className="pl-12 h-14 text-lg font-semibold rounded-xl border-slate-200 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Detected Email</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{profile?.email}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Detected Role</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{profile?.currentRole || "Professional"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Location</p>
                      <p className="text-sm font-medium text-slate-900">{profile?.location || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                  <div className="bg-amber-100 p-1.5 rounded text-amber-600 mt-0.5">
                    <Edit2 className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                    We've pre-filled these details from your resume. You can edit every part of your profile manually inside the dashboard anytime.
                  </p>
                </div>

                <Button 
                  disabled={finalizeMutation.isPending}
                  onClick={() => finalizeMutation.mutate(editableName)}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white rounded-2xl text-lg font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-3"
                >
                  {finalizeMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  {finalizeMutation.isPending ? "Confirming..." : "Confirm & Enter Dashboard"}
                </Button>
              </div>
            )}

            {/* STEP 4: ROCKET (Success Full Screen) */}
            {step === "ROCKET" && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-green-100 p-6 rounded-full"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">YOU ARE ALL SET!</h2>
                  <p className="text-slate-500 text-lg">Launching your dashboard experience...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Decorative Blur Orbs */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        userName={profile?.email}
      />
    </div>
  );
}
