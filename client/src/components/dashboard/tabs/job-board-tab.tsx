import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, MapPin, Filter, X, Heart, Clock, Bookmark, 
  ChevronDown, Bell, Settings, User, Briefcase, DollarSign, 
  MessageCircle, Loader2, Star, CheckCircle2, Building2, 
  Calendar, AlertTriangle, Lightbulb, Share2, MoreHorizontal,
  ArrowRight, MousePointer2, ChevronLeft, ChevronRight, LayoutGrid,
  Zap, Flame, Target, Globe, Box, Users, RefreshCw, Archive, Building, Calendar as LucideCalendar
} from "lucide-react";

import { useSavedJobs, useSaveJob, useRemoveSavedJob } from "@/hooks/use-saved-jobs";
import { useApplyJob, useJobApplications } from "@/hooks/use-job-applications";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useJobPreferences } from "@/hooks/use-profile";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import ProfileStrength from '@/components/dashboard/profile-strength';
import { useQuery } from '@tanstack/react-query';
import type { RecruiterJob } from "@shared/schema";
import { calculateProfileCompletion } from '@/lib/profile-utils';
import {
  getArchiveStatusLabel,
  getArchiveTerminalMeta,
  mapCandidateApplicationStage,
} from '@/lib/candidate-pipeline-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CandidateApplicationConsentModal from "@/components/candidate-dashboard/candidate-application-consent-modal";
import { logConsent } from "@/lib/consent-log";
import { useIsBelowLg } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  CANDIDATE_DESKTOP_DIALOG_CLASSES,
  CANDIDATE_MOBILE_DIALOG_CLASSES,
} from '@/lib/candidate-ui-preferences';

interface JobBoardTabProps {
  onNavigateToSettings?: () => void;
  onNavigateToProfile?: () => void;
}

interface JobListing {
  id: string;
  recruiterJobId?: string;
  company: string;
  companyTagline?: string;
  companyType?: string;
  market?: string;
  field?: string;
  noOfPositions?: number;
  title: string;
  description: string;
  roleDefinitions?: string;
  keyResponsibility?: string;
  experience: string;
  salary: string;
  location: string;
  type: string;
  workType: string;
  skills: string[];
  primarySkills: string[];
  secondarySkills: string[];
  knowledgeOnly: string[];
  logo: string;
  isRemote: boolean;
  postedDays: string;
  background: string;
  isHot: boolean;
  applicationCount: number;
  productService?: string;
}

const backgroundColors = [
  'bg-blue-50', 'bg-emerald-50', 'bg-amber-50', 'bg-rose-50', 'bg-indigo-50', 'bg-teal-50'
];

/** Slight curve for job board cards/inputs (8px). */
const JB_RADIUS = "rounded-[8px]";

function formatArchiveDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function sanitizeSkillList(items: unknown[]): string[] {
  const out: string[] = [];
  for (const item of items) {
    if (item == null) continue;
    const s = String(item).trim().replace(/^["']|["']$/g, "");
    if (!s || s === '""' || s === "''" || s.toLowerCase() === "null") continue;
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

function parseSkills(skillsString: string | null): string[] {
  if (!skillsString) return [];
  const trimmed = skillsString.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return sanitizeSkillList(parsed);
    if (parsed && typeof parsed === "object") {
      return sanitizeSkillList(Object.values(parsed as Record<string, unknown>));
    }
    return sanitizeSkillList([parsed]);
  } catch {
    return sanitizeSkillList(trimmed.split(/[,;|]/));
  }
}

function transformRecruiterJobToJobListing(job: RecruiterJob, index: number): JobListing {
  const postedDate = job.postedDate ? new Date(job.postedDate) : new Date();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - postedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const primary = parseSkills(job.primarySkills);
  const secondary = parseSkills(job.secondarySkills);
  const knowledge = parseSkills(job.knowledgeOnly);

  return {
    id: job.id,
    recruiterJobId: job.id,
    company: job.companyName || 'Unknown Company',
    companyTagline: job.companyTagline || undefined,
    companyType: job.companyType || undefined,
    market: job.market || undefined,
    field: job.field || undefined,
    noOfPositions: job.noOfPositions || undefined,
    title: job.role || 'Unknown Position',
    description: job.aboutCompany || 'Join our team and make an impact!',
    roleDefinitions: job.roleDefinitions || undefined,
    keyResponsibility: job.keyResponsibility || undefined,
    experience: job.experience || 'Not specified',
    salary: job.salaryPackage || 'Competitive',
    location: job.location || 'Not specified',
    type: 'Full Time',
    workType: job.workMode || 'On-site',
    skills: sanitizeSkillList([...primary, ...secondary]).slice(0, 5),
    primarySkills: primary,
    secondarySkills: secondary,
    knowledgeOnly: knowledge,
    logo: job.companyLogo || '/api/placeholder/60/60',
    isRemote: job.workMode?.toLowerCase() === 'remote',
    postedDays: diffDays === 0 ? 'Today' : `${diffDays} days ago`,
    background: backgroundColors[index % backgroundColors.length],
    isHot: (job.applicationCount || 0) > 10 || diffDays <= 2,
    applicationCount: job.applicationCount || 0,
    productService: job.market || 'Services',
  };
}


export default function JobBoardTab({ onNavigateToSettings, onNavigateToProfile }: JobBoardTabProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [jobFilter, setJobFilter] = useState<'all' | 'hot' | 'saved'>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showApplicationConsent, setShowApplicationConsent] = useState(false);
  const [jobToApply, setJobToApply] = useState<JobListing | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [loadingJobDetailId, setLoadingJobDetailId] = useState<string | null>(null);
  const [detailsPanelPulse, setDetailsPanelPulse] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileShowJobDetail, setMobileShowJobDetail] = useState(false);
  const isBelowLg = useIsBelowLg();

  const openJobDetails = (job: JobListing) => {
    setLoadingJobDetailId(job.id);
    setSelectedJob(null);
    if (isBelowLg) setMobileShowJobDetail(true);
    window.setTimeout(() => {
      setSelectedJob(job);
      setLoadingJobDetailId(null);
      setDetailsPanelPulse(true);
      window.setTimeout(() => setDetailsPanelPulse(false), 700);
    }, 400);
  };

  useEffect(() => {
    if (!isBelowLg) return;
    setMobileShowJobDetail(false);
    setMobileFiltersOpen(false);
  }, [isBelowLg]);
  
  // Filter States
  const [roleFilter, setRoleFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<number[]>([0, 50]);
  
  const { data: recruiterJobs = [], isLoading: isLoadingJobs } = useQuery<RecruiterJob[]>({
    queryKey: ['/api/jobs'],
  });


  const jobListings = useMemo(() => {
    return recruiterJobs.map((job, index) => transformRecruiterJobToJobListing(job, index));
  }, [recruiterJobs]);

  const { data: savedJobsData = [] } = useSavedJobs();
  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();
  const applyJobMutation = useApplyJob();
  const { data: jobApplicationsData = [] } = useJobApplications();
  const { data: profile } = useProfile();
  const { data: jobPreferences } = useJobPreferences();
  const { toast } = useToast();

  const { percentage } = calculateProfileCompletion(profile, jobPreferences);

  const savedJobs = new Set(savedJobsData.map(job => `${job.jobTitle}-${job.company}`));
  
  const filteredJobs = useMemo(() => {
    return jobListings.filter(job => {
      if (jobFilter === 'hot' && !job.isHot) return false;
      if (jobFilter === 'saved' && !savedJobs.has(`${job.title}-${job.company}`)) return false;
      
      const titleMatch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        job.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (searchQuery && !titleMatch) return false;

      // Sidebar Filters
      if (roleFilter && !job.title.toLowerCase().includes(roleFilter.toLowerCase())) return false;
      if (skillsFilter && !job.skills.some(s => s.toLowerCase().includes(skillsFilter.toLowerCase()))) return false;
      if (companyFilter && !job.company.toLowerCase().includes(companyFilter.toLowerCase())) return false;
      if (productFilter && !job.productService?.toLowerCase().includes(productFilter.toLowerCase())) return false;
      if (locationFilter && !job.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;

      if (selectedWorkModes.length > 0 && !selectedWorkModes.includes(job.workType)) return false;
      if (selectedEmploymentTypes.length > 0 && !selectedEmploymentTypes.includes(job.type)) return false;

      if (selectedExperience.length > 0) {
        const matchesExp = selectedExperience.some(exp => job.experience.toLowerCase().includes(exp.split(' ')[0].toLowerCase()));
        if (!matchesExp) return false;
      }

      if (salaryRange[0] > 0) {
        const salaryNum = parseInt(job.salary.replace(/[^0-9]/g, '')) || 0;
        if (salaryNum < salaryRange[0]) return false;
      }

      return true;
    });
  }, [jobListings, jobFilter, savedJobs, searchQuery, roleFilter, skillsFilter, companyFilter, productFilter, locationFilter, selectedWorkModes, selectedExperience, selectedEmploymentTypes, salaryRange]);

  const archivedApplications = useMemo(
    () =>
      jobApplicationsData.filter(
        (app) =>
          app.status === "Withdrawn" ||
          app.status === "Archived" ||
          mapCandidateApplicationStage(app.status) === "Screened Out" ||
          (app.statusNote || "").includes("[[TERMINAL:WITHDRAW]]"),
      ),
    [jobApplicationsData],
  );

  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJob) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  const toggleSaveJob = async (job: JobListing) => {
    const jobKey = `${job.title}-${job.company}`;
    const isCurrentlySaved = savedJobs.has(jobKey);
    try {
      if (isCurrentlySaved) {
        await removeSavedJobMutation.mutateAsync({ jobTitle: job.title, company: job.company });
        toast({ title: "Removed", description: "Job removed from saved items" });
      } else {
        await saveJobMutation.mutateAsync({
          jobTitle: job.title, company: job.company,
          location: job.location, salary: job.salary, jobType: job.type,
        });
        toast({ title: "Saved", description: "Job saved successfully" });
      }
    } catch (e) {
       toast({ title: "Error", description: "Action failed", variant: "destructive" });
    }
  };

  const handleApply = async (job: JobListing): Promise<boolean> => {
    try {
      await applyJobMutation.mutateAsync({
        jobTitle: job.title, company: job.company, jobType: job.type,
        description: job.description, salary: job.salary,
        location: job.location, workMode: job.workType,
        experience: job.experience, skills: JSON.stringify(job.skills),
        logo: job.logo, recruiterJobId: job.recruiterJobId || job.id,
      });
      toast({ title: "Applied successfully", description: `You have applied to ${job.company}` });
      return true;
    } catch (e) {
      toast({ title: "Error", description: "Failed to apply", variant: "destructive" });
      return false;
    }
  };

  const handleApplicationConsentConfirm = async () => {
    if (!profile?.id || !jobToApply) {
      toast({
        title: "Missing profile",
        description: "Please try again after your profile loads.",
        variant: "destructive",
      });
      return;
    }
    const ok = await logConsent({
      user_id: profile.id,
      role: "candidate",
      consent_type: "job_consent",
      policy_version: "2026-05-10",
    });
    if (!ok) {
      toast({
        title: "Could not record consent",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
      return;
    }
    const applied = await handleApply(jobToApply);
    if (applied) {
      setShowApplicationConsent(false);
      setJobToApply(null);
    }
  };

  return (
    <>
    <div className="flex bg-gray-50 dark:bg-gray-900 h-full min-h-0 overflow-hidden font-inter text-gray-900">
      {mobileFiltersOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="lg:hidden fixed inset-0 z-[55] bg-black/40"
          onClick={() => setMobileFiltersOpen(false)}
        />
      )}
      {/* Left Session: Sidebar with Filters */}
      <div 
        className={cn(
          "relative flex flex-col border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-500 ease-in-out scrollbar-hide shrink-0 z-20",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-[60] max-lg:w-[min(100vw-2rem,320px)] max-lg:shadow-2xl max-lg:transition-transform",
          mobileFiltersOpen ? "max-lg:translate-x-0 max-lg:flex" : "max-lg:-translate-x-full max-lg:hidden",
          "lg:flex",
          isSidebarCollapsed ? "lg:w-[72px]" : "lg:w-[320px]"
        )}
      >
        {/* Toggle Button - desktop only */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full items-center justify-center z-30 shadow-xl hover:scale-110 transition-all active:scale-95 group text-white border-2 border-white dark:border-gray-900`}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className={cn(
          "flex flex-col h-full px-4 py-6 sm:px-6 sm:py-10 overflow-y-auto scrollbar-hide transition-all duration-300 max-lg:opacity-100 max-lg:visible",
          isSidebarCollapsed ? "lg:opacity-0 lg:invisible" : "lg:opacity-100 lg:visible"
        )}>
          <div className="lg:hidden flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Filters</h3>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>
          {!isSidebarCollapsed && (
            <>
              <div className="mb-0">
                <ProfileStrength profile={profile!} jobPreferences={jobPreferences} onEdit={onNavigateToProfile} editIconOnly={true} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-10">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 transition-all hover:bg-blue-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Applied</p>
                  </div>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-300 tabular-nums">{jobApplicationsData.length}</p>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-900/20 transition-all hover:bg-purple-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">Saved</p>
                  </div>
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-300 tabular-nums">{savedJobsData.length}</p>
                </div>
              </div>

              <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[11px] flex items-center gap-2">
                     <Filter size={14} className="text-blue-600" /> Advanced Filters
                  </h4>
                   <button 
                    onClick={() => {
                      setRoleFilter('');
                      setSkillsFilter('');
                      setCompanyFilter('');
                      setProductFilter('');
                      setLocationFilter('');
                      setSelectedWorkModes([]);
                      setSelectedExperience([]);
                      setSelectedEmploymentTypes([]);
                      setSalaryRange([0, 50]);
                      setSearchQuery('');
                    }}
                    className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                    title="Reset Filters"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <Accordion type="multiple" className="w-full space-y-4" defaultValue={['personalization']}>
                  <AccordionItem value="personalization" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Quick finder</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 px-0.5 overflow-visible">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Role</Label>
                        <Input 
                          placeholder="e.g. Frontend Developer" 
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className={`h-10 w-full box-border ${JB_RADIUS} text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Skills</Label>
                        <Input 
                          placeholder="e.g. React, Node.js" 
                          value={skillsFilter}
                          onChange={(e) => setSkillsFilter(e.target.value)}
                          className={`h-10 w-full box-border ${JB_RADIUS} text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Location</Label>
                        <Input 
                          placeholder="e.g. Bangalore, Remote" 
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className={`h-10 w-full box-border ${JB_RADIUS} text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none`}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="company" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Company info</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Company name</Label>
                        <Input 
                          placeholder="e.g. Google, StaffOS" 
                          value={companyFilter}
                          onChange={(e) => setCompanyFilter(e.target.value)}
                          className={`h-10 w-full box-border ${JB_RADIUS} text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Product / service</Label>
                        <Input 
                          placeholder="e.g. SaaS, Fintech" 
                          value={productFilter}
                          onChange={(e) => setProductFilter(e.target.value)}
                          className={`h-10 w-full box-border ${JB_RADIUS} text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none`}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="work-mode" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Work mode</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                        {['Remote', 'Hybrid', 'On-site'].map(mode => (
                          <div key={mode} className="flex items-center space-x-3 group cursor-pointer" onClick={() => setSelectedWorkModes(prev => 
                              prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
                          )}>
                            <Checkbox checked={selectedWorkModes.includes(mode)} className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                            <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors cursor-pointer">{mode}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="type" className="border-none">
                     <AccordionTrigger className="hover:no-underline py-0 mb-4">
                       <span className="text-sm font-semibold text-gray-700">Job type</span>
                     </AccordionTrigger>
                     <AccordionContent>
                       <div className="grid gap-3">
                         {['Full Time', 'Part Time', 'Internship', 'Contract'].map(type => (
                           <div key={type} className="flex items-center space-x-3 group cursor-pointer" onClick={() => setSelectedEmploymentTypes(prev => 
                               prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                           )}>
                             <Checkbox checked={selectedEmploymentTypes.includes(type)} className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                             <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors cursor-pointer">{type}</Label>
                           </div>
                         ))}
                       </div>
                     </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="exp" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Experience</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                        {['0-2 Years', '3-5 Years', '6-10 Years', '10+ Years'].map(exp => (
                          <div key={exp} className="flex items-center space-x-3 group cursor-pointer" onClick={() => setSelectedExperience(prev => 
                              prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
                          )}>
                            <Checkbox checked={selectedExperience.includes(exp)} className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                            <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors cursor-pointer">{exp}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="salary" className="border-none">
                     <AccordionTrigger className="hover:no-underline py-0 mb-4">
                       <span className="text-sm font-semibold text-gray-700">Package (LPA)</span>
                     </AccordionTrigger>
                     <AccordionContent>
                       <div className="px-2 pt-2">
                         <Slider 
                            defaultValue={[0]} 
                            max={50} 
                            step={1} 
                            value={[salaryRange[0]]}
                            onValueChange={(val) => setSalaryRange([val[0], 50])}
                            className="mb-4"
                         />
                         <div className="flex justify-between text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                            <span>0 LPA</span>
                            <span>{salaryRange[0]} LPA+</span>
                         </div>
                       </div>
                     </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </>
          )}
        </div>
        
        {isSidebarCollapsed && (
          <div className="hidden lg:flex flex-col items-center py-10 gap-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.profilePicture || ""} />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-[10px]">{profile?.firstName?.[0]}{profile?.lastName?.[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <div onClick={() => setIsSidebarCollapsed(false)} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors cursor-pointer group relative">
                 <Filter size={20} />
                 <div className="absolute left-12 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Filters</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors cursor-pointer group relative">
                 <LayoutGrid size={20} />
                 <div className="absolute left-12 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">View Mode</div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 min-w-0">
        {/* Top Header Bar */}
        <div className="min-h-[4.5rem] shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 relative z-40">
           <Button
             type="button"
             variant="outline"
             size="sm"
             onClick={() => setMobileFiltersOpen(true)}
             className="lg:hidden shrink-0 h-11 rounded-xl border-gray-200 px-3 font-semibold text-sm gap-2"
           >
             <Filter size={16} />
             Filters
           </Button>
           <div className="flex-1 min-w-0 max-lg:min-w-[140px] lg:min-w-[200px] max-w-xl relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search jobs, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full box-border bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all h-11 sm:h-12 rounded-xl pl-11 pr-4 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-500 outline-none"
              />
           </div>
           
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 ml-auto">
               <div className="flex items-center bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl gap-1">
                  <button 
                    onClick={() => setJobFilter('all')}
                    className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 relative text-sm font-semibold ${jobFilter === 'all' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <LayoutGrid size={16} />
                    <AnimatePresence mode="wait">
                      {jobFilter === 'all' && (
                        <motion.span 
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="text-[11px] font-bold whitespace-nowrap overflow-hidden"
                        >
                          All Jobs
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  <button 
                    onClick={() => setJobFilter('hot')}
                    className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 relative text-sm font-semibold ${jobFilter === 'hot' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <Flame size={16} />
                    <AnimatePresence mode="wait">
                      {jobFilter === 'hot' && (
                        <motion.span 
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="text-[11px] font-bold whitespace-nowrap overflow-hidden"
                        >
                          Hot Roles
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  <button 
                    onClick={() => setJobFilter('saved')}
                    className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 relative text-sm font-semibold ${jobFilter === 'saved' ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <Bookmark size={16} />
                    <AnimatePresence mode="wait">
                      {jobFilter === 'saved' && (
                        <motion.span 
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="text-[11px] font-bold whitespace-nowrap overflow-hidden"
                        >
                          Saved
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
               </div>
               
               <div className="hidden sm:block h-8 w-[1px] bg-gray-100 dark:bg-gray-700 mx-2"></div>

               <div className="flex flex-col items-end max-lg:order-last w-full sm:w-auto sm:max-lg:w-auto">
                 <span className="text-xs sm:text-sm font-semibold text-gray-700">{filteredJobs.length} jobs found</span>
               </div>

               <div className="hidden sm:block h-8 w-[1px] bg-gray-100 dark:bg-gray-700 mx-2"></div>

               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={() => setShowArchiveModal(true)}
                 className="bg-red-50 hover:bg-red-100 text-red-600 border-red-100 rounded-xl h-10 sm:h-11 px-3 sm:px-5 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm tracking-wide max-lg:flex-1 max-lg:min-w-[5.5rem] max-lg:max-w-full sm:flex-none sm:max-w-none"
               >
                 <Archive size={18} className="text-red-500 shrink-0" />
                 Archive
               </Button>
            </div>
        </div>

        {/* Split Content View */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Job List (42% desktop; full width mobile) */}
          <div className={cn(
            "flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 overflow-y-auto px-2 sm:px-3 py-2 sm:py-3 gap-2.5 scrollbar-hide min-h-0",
            "w-full lg:w-[42%] lg:min-w-[280px]",
            mobileShowJobDetail && "max-lg:hidden"
          )}>
            {isLoadingJobs ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                        ) : filteredJobs.map((job) => {
              const isApplied = jobApplicationsData.some(app => app.recruiterJobId === job.id || (app.jobTitle === job.title && app.company === job.company));
              
              return (
              <div 
                key={job.id}
                onClick={() => openJobDetails(job)}
                className={`relative cursor-pointer transition-all duration-300 ${JB_RADIUS} border ${selectedJob?.id === job.id ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-100' : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'}`}
              >
                <div className="p-3.5">
                  <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm shrink-0 overflow-hidden">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={job.logo} className="object-contain" />
                        <AvatarFallback className="bg-gray-100 text-gray-400 font-black text-[10px]">
                           {job.company.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h4 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight mb-0.5">{job.title}</h4>
                      <p className="text-xs font-semibold text-gray-600">{job.company}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSaveJob(job); }}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center w-9 h-9 ${savedJobs.has(`${job.title}-${job.company}`) ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:bg-gray-100 hover:rounded-lg'}`}
                    >
                      <Bookmark className={savedJobs.has(`${job.title}-${job.company}`) ? 'fill-current' : ''} size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {sanitizeSkillList(job.skills).slice(0, 3).map((skill, i) => (
                      <Badge key={`${skill}-${i}`} variant="secondary" className={`bg-gray-100 text-gray-700 border-none ${JB_RADIUS} font-medium text-[10px] px-2 py-0.5`}>{skill}</Badge>
                    ))}
                    {isApplied && (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-md font-bold text-[9px] px-2 py-0.5 uppercase tracking-wider">Applied</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <div className={`bg-gray-100 ${JB_RADIUS} p-1.5 flex flex-col items-center`}>
                      <Briefcase size={12} className="text-gray-700 mb-0.5" />
                      <span className="text-[10px] font-semibold text-gray-800 text-center leading-tight">{job.experience}</span>
                    </div>
                    <div className={`bg-gray-100 ${JB_RADIUS} p-1.5 flex flex-col items-center`}>
                      <DollarSign size={12} className="text-gray-700 mb-0.5" />
                      <span className="text-[10px] font-semibold text-gray-800 truncate w-full text-center">{job.salary}</span>
                    </div>
                    <div className={`bg-gray-100 ${JB_RADIUS} p-1.5 flex flex-col items-center`}>
                      <MapPin size={12} className="text-gray-700 mb-0.5" />
                      <span className="text-[10px] font-semibold text-gray-800 truncate w-full text-center">{job.location}</span>
                    </div>
                  </div>

                  <Button 
                    className={`w-full ${JB_RADIUS} h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openJobDetails(job);
                    }}
                  >
                    View more
                  </Button>
                </div>
              </div>
            );})}
          </div>


          {/* Job Detail Preview (58% desktop; full screen mobile when open) */}
          <div className={cn(
            "flex-1 min-w-0 bg-white dark:bg-gray-800 overflow-hidden flex flex-col border-l border-gray-200 dark:border-gray-700 transition-shadow duration-500",
            detailsPanelPulse ? "ring-2 ring-inset ring-blue-200 shadow-inner" : "",
            mobileShowJobDetail ? "max-lg:flex" : "max-lg:hidden",
            "lg:flex"
          )}>
            {mobileShowJobDetail && (
              <div className="lg:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 rounded-lg font-semibold text-sm gap-1"
                  onClick={() => setMobileShowJobDetail(false)}
                >
                  <ChevronLeft size={18} />
                  Back
                </Button>
              </div>
            )}
            {loadingJobDetailId ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">Opening job details</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Loading role information…</p>
                </div>
              </div>
            ) : selectedJob ? (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 max-lg:pb-28 lg:pb-8 scrollbar-hide">
                  <div className="max-w-[700px] mx-auto">
                      {/* Header */}
                      <div className="flex gap-6 mb-8">
                         <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-600 shadow-sm shrink-0 overflow-hidden">
                            <Avatar className="w-10 h-10">
                               <AvatarImage src={selectedJob.logo} className="object-contain" />
                               <AvatarFallback className="bg-gray-100 text-gray-400 font-black text-lg">
                                 {selectedJob.company.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                               </AvatarFallback>
                            </Avatar>
                         </div>
                         <div className="flex-1 pt-0.5">
                            <div className="flex items-center gap-3 mb-1.5">
                               <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{selectedJob.title}</h2>
                               {selectedJob.isHot && <Badge className="bg-orange-500 text-white border-none rounded-lg px-2 h-5 text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1"><Flame size={10} /> Hot</Badge>}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400">
                               <div className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors">
                                  <Building2 size={12} />
                                  <span className="text-sm font-semibold text-gray-700">{selectedJob.company}</span>
                                  {selectedJob.companyTagline && (
                                    <span className="text-[9px] font-medium lowercase italic ml-1">({selectedJob.companyTagline})</span>
                                  )}
                               </div>
                            </div>
                         </div>
                         <button 
                            onClick={(e) => { e.stopPropagation(); toggleSaveJob(selectedJob); }}
                            className={`p-2 rounded-xl transition-colors flex items-center justify-center w-10 h-10 border ${savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-gray-300 border-gray-100 hover:bg-gray-50'}`}
                          >
                            <Bookmark className={savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'fill-current' : ''} size={18} />
                          </button>
                      </div>

                      {/* Meta Information Bar */}
                      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mb-8 py-4 border-y border-gray-100 dark:border-gray-800">
                         <div className="flex items-center gap-2">
                            <Target size={14} className="text-blue-500" />
                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{selectedJob.workType}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Briefcase size={14} className="text-purple-500" />
                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{selectedJob.experience}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-emerald-500" />
                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{selectedJob.location}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-amber-500" />
                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{selectedJob.salary}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Clock size={14} className="text-blue-400" />
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Posted {selectedJob.postedDays}</span>
                         </div>
                      </div>

                      {/* Secondary Badges Bar */}
                      <div className="flex flex-wrap gap-2 mb-10">
                         {selectedJob.market && <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none rounded-lg px-3 py-1 text-[9px] font-bold uppercase tracking-widest">{selectedJob.market}</Badge>}
                         {selectedJob.field && <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-3 py-1 text-[9px] font-bold uppercase tracking-widest">{selectedJob.field}</Badge>}
                         {selectedJob.companyType && <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none rounded-lg px-3 py-1 text-[9px] font-bold uppercase tracking-widest">{selectedJob.companyType}</Badge>}
                         {selectedJob.noOfPositions && <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-none rounded-lg px-3 py-1 text-[9px] font-bold uppercase tracking-widest">Open Positions: {selectedJob.noOfPositions}</Badge>}
                      </div>

                      {/* Content Sections */}
                      <div className="space-y-12 pb-10">
                         {selectedJob.description && (
                           <section>
                              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-4">
                                About company
                                <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                              </h4>
                              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                                 {selectedJob.description}
                              </p>
                           </section>
                         )}

                         {selectedJob.roleDefinitions && (
                           <section>
                              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-4">
                                Role definition
                                <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                              </h4>
                              <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                                 {selectedJob.roleDefinitions}
                              </div>
                           </section>
                         )}

                         {selectedJob.keyResponsibility && (
                           <section>
                              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-4">
                                Key responsibilities
                                <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                              </h4>
                              <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                                 {selectedJob.keyResponsibility}
                              </div>
                           </section>
                         )}

                         <section>
                             <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-4">
                                Skills & expertise
                                <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                             </h4>
                             <div className="space-y-6">
                               {(() => {
                                 const primary = sanitizeSkillList(selectedJob.primarySkills ?? []);
                                 const secondary = sanitizeSkillList(selectedJob.secondarySkills ?? []);
                                 const knowledge = sanitizeSkillList(selectedJob.knowledgeOnly ?? []);
                                 return (
                                   <>
                               {primary.length > 0 && (
                                 <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                      Primary skills
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {primary.map((skill, i) => (
                                          <Badge key={`${skill}-${i}`} className={`bg-blue-600 text-white border-none px-3 py-1.5 ${JB_RADIUS} text-xs font-medium`}>{skill}</Badge>
                                       ))}
                                    </div>
                                 </div>
                               )}
                               {secondary.length > 0 && (
                                 <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                      Secondary skills
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {secondary.map((skill, i) => (
                                          <Badge key={`${skill}-${i}`} className={`bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-3 py-1.5 ${JB_RADIUS} text-xs font-medium`}>{skill}</Badge>
                                       ))}
                                    </div>
                                 </div>
                               )}
                               {knowledge.length > 0 && (
                                 <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                      Knowledge only
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {knowledge.map((skill, i) => (
                                          <Badge key={`${skill}-${i}`} variant="outline" className={`text-gray-700 border-gray-300 dark:border-gray-600 px-3 py-1.5 ${JB_RADIUS} text-xs font-medium`}>{skill}</Badge>
                                       ))}
                                    </div>
                                 </div>
                               )}
                               {primary.length === 0 && secondary.length === 0 && knowledge.length === 0 && (
                                 <p className="text-sm text-gray-500">No skills listed for this role.</p>
                               )}
                                   </>
                                 );
                               })()}
                             </div>
                         </section>
                      </div>
                  </div>
                </div>

                {/* Fixed action bar — details scroll above; bar stays full width */}
                <div className="shrink-0 z-20 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
                  <div className="px-4 sm:px-8 py-4 flex flex-col gap-3">
                    <div className="flex flex-row flex-wrap items-center justify-between gap-2 min-h-[2rem] w-full">
                      <div className={`flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 ${JB_RADIUS} border border-blue-100 text-sm font-medium whitespace-nowrap`}>
                        <Users size={16} className="text-blue-700 shrink-0" />
                        <span>{selectedJob.applicationCount || 0} applied</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 whitespace-nowrap">
                        <Clock size={16} className="text-gray-500 shrink-0" />
                        <span>Posted {selectedJob.postedDays}</span>
                      </div>
                    </div>
                    <div className="flex items-stretch gap-3 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => toggleSaveJob(selectedJob)}
                        className={`${JB_RADIUS} h-11 flex-1 font-semibold text-sm flex items-center justify-center gap-2 border-gray-200 ${
                          savedJobs.has(`${selectedJob.title}-${selectedJob.company}`)
                            ? 'text-blue-700 border-blue-200 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-700 hover:border-blue-200'
                        }`}
                      >
                        <Bookmark
                          size={16}
                          className={savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'fill-current' : ''}
                        />
                        {savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Saved' : 'Save'}
                      </Button>
                      {(() => {
                        const isApplied = jobApplicationsData.some(
                          (app) =>
                            app.recruiterJobId === selectedJob.id ||
                            (app.jobTitle === selectedJob.title && app.company === selectedJob.company),
                        );
                        return (
                          <Button
                            type="button"
                            onClick={() => {
                              if (isApplied) return;
                              setJobToApply(selectedJob);
                              setShowApplicationConsent(true);
                            }}
                            disabled={applyJobMutation.isPending || isApplied}
                            className={`${JB_RADIUS} h-11 flex-1 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm ${
                              isApplied
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {applyJobMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : isApplied ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <MousePointer2 size={16} />
                            )}
                            {isApplied ? 'Applied' : 'Apply now'}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                 <div className="w-24 h-24 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-600 mb-8 animate-pulse">
                    <Briefcase size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Select an Opportunity</h3>
                 <p className="text-gray-400 font-medium text-sm max-w-[300px] leading-relaxed uppercase tracking-widest text-[10px]">Choose a role from the left to view detailed requirements and take the next step.</p>
              </div>
            ) }
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <CandidateApplicationConsentModal
        open={showApplicationConsent && !!jobToApply}
        jobTitle={jobToApply?.title}
        company={jobToApply?.company}
        onCancel={() => {
          setShowApplicationConsent(false);
          setJobToApply(null);
        }}
        onConfirm={handleApplicationConsentConfirm}
      />
    </div>
    
    {/* Archive Modal — matches My Jobs tab */}
    <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
      <DialogContent
        className={cn(
          "flex flex-col overflow-hidden p-0 rounded-2xl border-none shadow-2xl",
          CANDIDATE_MOBILE_DIALOG_CLASSES,
          CANDIDATE_DESKTOP_DIALOG_CLASSES,
          "max-lg:w-[calc(100vw-1rem)]",
          "lg:max-w-[1200px] lg:w-[95vw] lg:max-h-[85vh]",
        )}
      >
        <DialogHeader className="shrink-0 border-b bg-white/50 p-6 backdrop-blur-sm max-lg:p-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-3 max-lg:text-lg">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Archive size={20} />
            </div>
            Application Archive
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-50/30 p-4 sm:p-6">
          <div className="lg:hidden space-y-3 pb-2">
            {archivedApplications.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-4 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <Archive size={32} />
                </div>
                <p className="font-semibold text-gray-400 tracking-tight text-xs text-center px-4">
                  No archived applications found
                </p>
              </div>
            ) : (
              archivedApplications.map((app) => {
                const statusDisplay = getArchiveStatusLabel(app.status, app.statusNote);
                const terminalMeta = getArchiveTerminalMeta(app.status, app.statusNote);
                return (
                  <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="font-semibold text-gray-900 text-sm">{app.jobTitle}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{app.company}</p>
                    <p className="text-[11px] text-gray-500 mt-2">
                      Applied {formatArchiveDate(app.appliedDate)}
                    </p>
                    <p
                      className={`mt-2 text-sm font-semibold ${statusDisplay.isRed ? "text-red-600" : "text-gray-600"}`}
                    >
                      {statusDisplay.label}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-medium text-gray-600 block">Rejected / Withdrawn on</span>
                        <span className="text-gray-700">{terminalMeta.date}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 block">At stage</span>
                        <span className="text-gray-700">{terminalMeta.stage}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Role</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Company</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Applied on</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Rejected / Withdrawn on</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Rejected / Withdrawn at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {archivedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                          <Archive size={32} />
                        </div>
                        <p className="font-semibold text-gray-400 tracking-tight text-xs">
                          No archived applications found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  archivedApplications.map((app) => {
                    const statusDisplay = getArchiveStatusLabel(app.status, app.statusNote);
                    const terminalMeta = getArchiveTerminalMeta(app.status, app.statusNote);
                    return (
                      <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-900">{app.jobTitle}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-700 font-medium">{app.company}</td>
                        <td className="px-5 py-4 text-gray-500">
                          {formatArchiveDate(app.appliedDate)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`font-semibold ${statusDisplay.isRed ? "text-red-600" : "text-gray-600"}`}
                          >
                            {statusDisplay.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-700">{terminalMeta.date}</td>
                        <td className="px-5 py-4 text-gray-700">{terminalMeta.stage}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t bg-white p-6 max-lg:p-4 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            onClick={() => setShowArchiveModal(false)}
            className="rounded-xl bg-gray-900 px-8 font-semibold text-white hover:bg-gray-800 max-lg:w-full"
          >
            Close Archive
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
