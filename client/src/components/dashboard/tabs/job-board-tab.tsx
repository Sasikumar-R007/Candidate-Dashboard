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
import { useProfile } from "@/hooks/use-profile";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

function parseSkills(skillsString: string | null): string[] {
  if (!skillsString) return [];
  try {
    const parsed = JSON.parse(skillsString);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return skillsString.split(',').map(s => s.trim()).filter(Boolean);
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
    skills: [...primary, ...secondary].slice(0, 5),
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
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState<JobListing | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  
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
  const { toast } = useToast();

  const { percentage } = calculateProfileCompletion(profile);

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

  const handleApply = async (job: JobListing) => {
    try {
      await applyJobMutation.mutateAsync({
        jobTitle: job.title, company: job.company, jobType: job.type,
        description: job.description, salary: job.salary,
        location: job.location, workMode: job.workType,
        experience: job.experience, skills: JSON.stringify(job.skills),
        logo: job.logo, recruiterJobId: job.recruiterJobId || job.id,
      });
      toast({ title: "Applied successfully", description: `You have applied to ${job.company}` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to apply", variant: "destructive" });
    }
  };

  return (
    <>
    <div className="flex bg-white dark:bg-gray-900 h-screen overflow-hidden font-inter">
      {/* Left Session: Sidebar with Filters */}
      <div 
        className={`relative flex flex-col border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-500 ease-in-out scrollbar-hide shrink-0 z-50 ${isSidebarCollapsed ? 'w-[72px]' : 'w-[320px]'}`}
      >
        {/* Toggle Button - Redesigned for visibility */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute -right-4 top-10 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center z-[60] shadow-xl hover:scale-110 transition-all active:scale-95 group text-white border-2 border-white dark:border-gray-900 ${isSidebarCollapsed ? 'rotate-0' : 'rotate-0'}`}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className={`flex flex-col h-full px-6 py-10 overflow-y-auto scrollbar-hide transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
          {!isSidebarCollapsed && (
            <>
              <div className="mb-0">
                <ProfileStrength profile={profile!} onEdit={onNavigateToProfile} editIconOnly={true} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-10">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 transition-all hover:bg-blue-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.15em]">Applied</p>
                  </div>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-300 tabular-nums">{jobApplicationsData.length}</p>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-900/20 transition-all hover:bg-purple-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.15em]">Saved</p>
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
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quick Finder</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Role</Label>
                        <Input 
                          placeholder="e.g. Frontend Developer" 
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="h-9 rounded-xl text-xs bg-gray-50/50 border-gray-100 focus:bg-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Skills</Label>
                        <Input 
                          placeholder="e.g. React, Node.js" 
                          value={skillsFilter}
                          onChange={(e) => setSkillsFilter(e.target.value)}
                          className="h-9 rounded-xl text-xs bg-gray-50/50 border-gray-100 focus:bg-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Location</Label>
                        <Input 
                          placeholder="e.g. Bangalore, Remote" 
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="h-9 rounded-xl text-xs bg-gray-50/50 border-gray-100 focus:bg-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="company" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Company Info</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Company Name</Label>
                        <Input 
                          placeholder="e.g. Google, StaffOS" 
                          value={companyFilter}
                          onChange={(e) => setCompanyFilter(e.target.value)}
                          className="h-9 rounded-xl text-xs bg-gray-50/50 border-gray-100 focus:bg-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Product / Service</Label>
                        <Input 
                          placeholder="e.g. SaaS, Fintech" 
                          value={productFilter}
                          onChange={(e) => setProductFilter(e.target.value)}
                          className="h-9 rounded-xl text-xs bg-gray-50/50 border-gray-100 focus:bg-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="work-mode" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Work Mode</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                        {['Remote', 'Hybrid', 'On-site'].map(mode => (
                          <div key={mode} className="flex items-center space-x-3 group cursor-pointer" onClick={() => setSelectedWorkModes(prev => 
                              prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
                          )}>
                            <Checkbox checked={selectedWorkModes.includes(mode)} className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                            <Label className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors cursor-pointer">{mode}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="type" className="border-none">
                     <AccordionTrigger className="hover:no-underline py-0 mb-4">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Job Type</span>
                     </AccordionTrigger>
                     <AccordionContent>
                       <div className="grid gap-3">
                         {['Full Time', 'Part Time', 'Internship', 'Contract'].map(type => (
                           <div key={type} className="flex items-center space-x-3 group cursor-pointer" onClick={() => setSelectedEmploymentTypes(prev => 
                               prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                           )}>
                             <Checkbox checked={selectedEmploymentTypes.includes(type)} className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                             <Label className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors cursor-pointer">{type}</Label>
                           </div>
                         ))}
                       </div>
                     </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="exp" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Experience</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                        {['0-2 Years', '3-5 Years', '6-10 Years', '10+ Years'].map(exp => (
                          <div key={exp} className="flex items-center space-x-3 group cursor-pointer" onClick={() => setSelectedExperience(prev => 
                              prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
                          )}>
                            <Checkbox checked={selectedExperience.includes(exp)} className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                            <Label className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors cursor-pointer">{exp}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="salary" className="border-none">
                     <AccordionTrigger className="hover:no-underline py-0 mb-4">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Package (LPA)</span>
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
          <div className="flex flex-col items-center py-10 gap-6">
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
      <div className="flex-1 flex flex-col h-full bg-gray-50/30 dark:bg-gray-900/10">
        {/* Top Header Bar */}
        <div className="h-20 shrink-0 border-b border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md flex items-center px-10 relative z-40">
           <div className="max-w-[500px] w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search jobs, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-transparent focus:border-blue-100 focus:bg-white transition-all h-12 rounded-2xl pl-12 pr-6 text-sm font-medium outline-none shadow-sm"
              />
           </div>
           
            <div className="ml-auto flex items-center gap-6">
               <div className="flex items-center bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl gap-1">
                  <button 
                    onClick={() => setJobFilter('all')}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 relative ${jobFilter === 'all' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
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
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 relative ${jobFilter === 'hot' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
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
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 relative ${jobFilter === 'saved' ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
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
               
               <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 mx-2"></div>
               
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredJobs.length} Jobs Found</span>
                </div>

                <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 mx-2"></div>
                
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setShowArchiveModal(true)}
                   className="bg-red-50 hover:bg-red-100 text-red-600 border-red-100 rounded-xl h-10 px-4 flex items-center gap-2 font-semibold text-[11px] tracking-wide"
                 >
                   <Archive size={16} className="text-red-500" />
                   Archive
                 </Button>
            </div>
        </div>

        {/* Split Content View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Job List (42%) */}
          <div className="w-[42%] flex flex-col border-r border-gray-100 dark:border-gray-700 bg-gray-50/10 overflow-y-auto px-6 py-8 gap-6 scrollbar-hide">
            {isLoadingJobs ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                        ) : filteredJobs.map((job) => {
              const isApplied = jobApplicationsData.some(app => app.recruiterJobId === job.id || (app.jobTitle === job.title && app.company === job.company));
              
              return (
              <div 
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`relative cursor-pointer transition-all duration-300 rounded-[1.5rem] border ${selectedJob?.id === job.id ? 'bg-white border-blue-200 shadow-xl shadow-blue-50/30' : 'bg-white border-gray-100 hover:border-blue-100/50 hover:shadow-md'}`}
              >
                <div className="p-5">
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
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{job.company}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSaveJob(job); }}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center w-9 h-9 ${savedJobs.has(`${job.title}-${job.company}`) ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:bg-gray-100 hover:rounded-lg'}`}
                    >
                      <Bookmark className={savedJobs.has(`${job.title}-${job.company}`) ? 'fill-current' : ''} size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-gray-50 text-gray-500 border-none rounded-md font-bold text-[9px] px-2 py-0.5 uppercase tracking-wider">{skill}</Badge>
                    ))}
                    {isApplied && (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-md font-bold text-[9px] px-2 py-0.5 uppercase tracking-wider">Applied</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="bg-gray-50/50 rounded-lg p-2 flex flex-col items-center">
                      <Briefcase size={10} className="text-gray-300 mb-1" />
                      <span className="text-[10px] font-black text-gray-500 uppercase">{job.experience}</span>
                    </div>
                    <div className="bg-gray-50/50 rounded-lg p-2 flex flex-col items-center">
                      <DollarSign size={10} className="text-gray-300 mb-1" />
                      <span className="text-[10px] font-black text-gray-500 uppercase truncate w-full text-center">{job.salary}</span>
                    </div>
                    <div className="bg-gray-50/50 rounded-lg p-2 flex flex-col items-center">
                      <MapPin size={10} className="text-gray-300 mb-1" />
                      <span className="text-[10px] font-black text-gray-500 uppercase truncate w-full text-center">{job.location}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full rounded-xl h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-none"
                    onClick={() => setSelectedJob(job)}
                  >
                    View more
                  </Button>
                </div>
              </div>
            );})}
          </div>


          {/* Job Detail Preview (58%) - 'View Model' Parity */}
          <div className="flex-1 bg-gray-50/30 dark:bg-gray-800 overflow-hidden flex flex-col border-l border-gray-100">
            {selectedJob ? (
              <>
                <div className="flex-1 overflow-y-auto px-10 py-10 scrollbar-hide">
                  <div className="max-w-[700px] mx-auto transition-none">
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
                               <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{selectedJob.title}</h2>
                               {selectedJob.isHot && <Badge className="bg-orange-500 text-white border-none rounded-lg px-2 h-5 text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1"><Flame size={10} /> Hot</Badge>}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400">
                               <div className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors">
                                  <Building2 size={12} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{selectedJob.company}</span>
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
                         {selectedJob.recruiterJobId && (
                           <div className="ml-auto text-[9px] font-bold text-blue-500/50 uppercase tracking-[0.2em] self-center">
                             ID: {selectedJob.recruiterJobId.slice(0, 8)}
                           </div>
                         )}
                      </div>

                      {/* Content Sections */}
                      <div className="space-y-12 pb-10">
                         {selectedJob.description && (
                           <section>
                              <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
                                About Company
                                <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                              </h4>
                              <p className="text-[13px] font-medium leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                 {selectedJob.description}
                              </p>
                           </section>
                         )}

                         {selectedJob.roleDefinitions && (
                           <section>
                              <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
                                Role Definition
                                <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                              </h4>
                              <div className="text-[13px] font-medium leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                 {selectedJob.roleDefinitions}
                              </div>
                           </section>
                         )}

                         {selectedJob.keyResponsibility && (
                           <section>
                              <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
                                Key Responsibilities
                                <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                              </h4>
                              <div className="text-[13px] font-medium leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                 {selectedJob.keyResponsibility}
                              </div>
                           </section>
                         )}

                         <section>
                             <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                                Skills & Expertise
                                <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                             </h4>
                             <div className="space-y-6">
                               {selectedJob.primarySkills?.length > 0 && (
                                 <div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                      Primary Skills
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {selectedJob.primarySkills.map(skill => (
                                          <Badge key={skill} className="bg-blue-600 text-white border-none px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-transform hover:scale-105 cursor-default">{skill}</Badge>
                                       ))}
                                    </div>
                                 </div>
                               )}
                               {selectedJob.secondarySkills?.length > 0 && (
                                 <div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                      Secondary Skills
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {selectedJob.secondarySkills.map(skill => (
                                          <Badge key={skill} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-transform hover:scale-105 cursor-default">{skill}</Badge>
                                       ))}
                                    </div>
                                 </div>
                               )}
                               {selectedJob.knowledgeOnly?.length > 0 && (
                                 <div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                      Knowledge Only
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {selectedJob.knowledgeOnly.map(skill => (
                                          <Badge key={skill} variant="outline" className="text-gray-500 border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-transform hover:scale-105 cursor-default">{skill}</Badge>
                                       ))}
                                    </div>
                                 </div>
                               )}
                             </div>
                         </section>
                      </div>
                  </div>
                </div>

                {/* Sticky Action Bar */}
                <div className="h-20 px-10 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                        <Users size={12} /> {selectedJob.applicationCount || 0} candidates applied
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} /> {selectedJob.postedDays}
                      </div>
                   </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost"
                        onClick={() => toggleSaveJob(selectedJob)}
                        className={`rounded-xl h-10 px-4 font-bold text-[11px] flex items-center gap-2 transition-none ${savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                      >
                         <Bookmark size={14} className={savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'fill-current' : ''} />
                         {savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Saved' : 'Save'}
                      </Button>
                      {(() => {
                        const isApplied = jobApplicationsData.some(app => app.recruiterJobId === selectedJob.id || (app.jobTitle === selectedJob.title && app.company === selectedJob.company));
                        return (
                          <Button 
                            onClick={() => {
                              if (isApplied) return;
                              setJobToApply(selectedJob);
                              setIsApplyDialogOpen(true);
                            }}
                            disabled={applyJobMutation.isPending || isApplied}
                            className={`rounded-xl px-8 h-10 font-bold text-[12px] transition-none flex items-center gap-2 shadow-sm ${isApplied ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                          >
                             {applyJobMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : (isApplied ? <CheckCircle2 size={14} /> : <MousePointer2 size={14} />)}
                             {isApplied ? 'Applied' : 'Apply now'}
                          </Button>
                        );
                      })()}
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
      <AlertDialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-md font-poppins">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
              <MousePointer2 size={32} />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900 text-center tracking-tight mb-2">Confirm Application</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-gray-500 text-center leading-relaxed mb-6">
              You are about to apply for the <span className="text-blue-600 font-bold">{jobToApply?.title}</span> position at <span className="text-blue-600 font-bold">{jobToApply?.company}</span>. 
              Are you sure you want to proceed with this application?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-3">
            <AlertDialogAction 
              onClick={() => jobToApply && handleApply(jobToApply)}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-6 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              Confirm and apply
            </AlertDialogAction>
            <AlertDialogCancel className="w-full rounded-2xl border-none bg-gray-50 text-gray-400 text-xs font-bold py-6 hover:bg-gray-100 transition-all">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    
    {/* Archive Modal */}
    <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
      <DialogContent className="max-w-[1000px] w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-2xl border-none shadow-2xl">
        <DialogHeader className="p-6 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <Archive size={20} />
              </div>
              Application Archive
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-tight text-[11px]">Role</th>
                  <th className="px-6 py-4 font-semibold tracking-tight text-[11px]">Company</th>
                  <th className="px-6 py-4 font-semibold tracking-tight text-[11px]">Applied on</th>
                  <th className="px-6 py-4 font-semibold tracking-tight text-[11px]">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-tight text-[11px]">Last update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => {
                  const mapStatusToStage = (status: string | null): string => {
                    if (!status) return 'Applied';
                    const s = status.toLowerCase();
                    if (s.includes('applied') || s.includes('new') || s.includes('process')) return 'Applied';
                    if (s === 'l1' || s === 'l2' || s.includes('review')) return 'In-Review';
                    if (s.includes('interview') || s === 'l3' || s.includes('scheduled') || s.includes('final')) return 'Interview Stage';
                    if (s.includes('hr')) return 'HR Round';
                    if (s.includes('offer')) return 'Offer';
                    if (s.includes('reject') || s.includes('screened') || s.includes('out')) return 'Screened Out';
                    return 'Applied';
                  };

                  const archivedApplications = jobApplicationsData.filter(
                    (app) => app.status === 'Withdrawn' || mapStatusToStage(app.status) === 'Screened Out' || app.status === 'Archived'
                  );

                  if (archivedApplications.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                              <Archive size={32} />
                            </div>
                            <p className="font-semibold text-gray-400 tracking-tight text-xs">No archived applications found</p>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return archivedApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50/50 flex items-center justify-center text-red-500 border border-red-100/50">
                            <Briefcase size={14} />
                          </div>
                          <span className="font-semibold text-gray-900">{app.jobTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <Building2 size={14} className="text-gray-300" />
                          {app.company}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-400 font-medium text-[12px] tracking-tight">
                          <LucideCalendar size={12} />
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={`${app.status === 'Withdrawn' ? 'bg-amber-50 text-amber-600 border-amber-100' : app.status === 'Archived' ? 'bg-gray-50 text-gray-600 border-gray-100' : 'bg-red-50 text-red-600 border-red-100'} border-none rounded-lg px-3 py-1 text-[10px] font-semibold tracking-tight`}>
                          {app.status === 'Withdrawn' ? 'Withdrawn' : app.status === 'Archived' ? 'Archived' : 'Rejected'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-400 font-medium text-[12px] tracking-tight">
                          <Clock size={12} />
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-6 border-t bg-white flex justify-end">
          <Button 
            onClick={() => setShowArchiveModal(false)}
            className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8"
          >
            Close Archive
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
