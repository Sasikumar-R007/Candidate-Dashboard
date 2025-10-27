import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, MapPin, Filter, X, Heart, Clock, Bookmark, ChevronDown, Bell, Settings, User, Briefcase, DollarSign } from "lucide-react";
import { useSavedJobs, useSaveJob, useRemoveSavedJob } from "@/hooks/use-saved-jobs";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";

interface JobBoardTabProps {
  onNavigateToJobPreferences?: () => void;
  onNavigateToProfile?: () => void;
}

interface JobListing {
  id: string;
  company: string;
  title: string;
  description: string;
  experience: string;
  salary: string;
  location: string;
  type: string;
  workType: string;
  skills: string[];
  logo: string;
  isRemote: boolean;
  postedDays: number;
  background: string;
  isHot: boolean;
}

const jobListings: JobListing[] = [
  {
    id: '1',
    company: 'Google Technologies Inc.',
    title: 'Cloud Engineer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bengaluru',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['CI/CD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 3,
    background: 'bg-gradient-to-br from-green-100 to-green-200',
    isHot: true
  },
  {
    id: '2', 
    company: 'Google Technologies Inc.',
    title: 'Cloud Engineer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bengaluru',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['CI/CD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 3,
    background: 'bg-gradient-to-br from-pink-100 to-pink-200',
    isHot: false
  },
  {
    id: '3',
    company: 'Google Technologies Inc.',
    title: 'Frontend Developer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bengaluru',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['CI/CD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 2,
    background: 'bg-gradient-to-br from-orange-100 to-orange-200',
    isHot: true
  },
  {
    id: '4',
    company: 'Microsoft Corp.',
    title: 'Software Engineer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '5 Years',
    salary: '18 LPA',
    location: 'Bengaluru',
    type: 'Full Time',
    workType: 'Permanent',
    skills: ['React', 'Node.js', 'MongoDB'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 1,
    background: 'bg-gradient-to-br from-blue-100 to-blue-200',
    isHot: false
  },
  {
    id: '5',
    company: 'Amazon Web Services',
    title: 'Backend Developer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '6 Years',
    salary: '8 LPA',
    location: 'Mumbai',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['Java', 'Spring', 'PostgreSQL'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 5,
    background: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    isHot: false
  },
  {
    id: '6',
    company: 'Netflix Inc.',
    title: 'Data Analyst',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '7 Years',
    salary: '35 LPA',
    location: 'Bengaluru',
    type: 'Full Time',
    workType: 'Hybrid',
    skills: ['Python', 'SQL', 'Tableau'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 4,
    background: 'bg-gradient-to-br from-purple-100 to-purple-200',
    isHot: true
  }
];

export default function JobBoardTab({ onNavigateToJobPreferences, onNavigateToProfile }: JobBoardTabProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobFilter, setJobFilter] = useState<'all' | 'hot' | 'saved'>('all');
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showApplyConfirmation, setShowApplyConfirmation] = useState(false);
  const [pendingApplyJob, setPendingApplyJob] = useState<JobListing | null>(null);
  const [location, navigate] = useLocation();
  
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSalaries, setSelectedSalaries] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showMoreDepartments, setShowMoreDepartments] = useState(false);
  const [showMoreSalaries, setShowMoreSalaries] = useState(false);
  const [showMoreRoles, setShowMoreRoles] = useState(false);

  const itemsPerPage = 5;

  const { data: savedJobsData = [] } = useSavedJobs();
  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();
  const { toast } = useToast();
  const { data: profile } = useProfile();

  const savedJobs = new Set(savedJobsData.map(job => `${job.jobTitle}-${job.company}`));

  const departments = [
    'Software Development',
    'Cloud Engineering',
    'Frontend Development',
    'Backend Development',
    'Data Analytics',
    'Others'
  ];

  const salaryRanges = [
    '0-10 Lakhs',
    '10-20 Lakhs',
    '20-30 Lakhs',
    '30+ Lakhs'
  ];

  const roleCategories = [
    'Software Engineer',
    'Cloud Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst',
    'Others'
  ];

  const workModes = [
    'Work from office',
    'Hybrid',
    'Remote'
  ];

  const employmentTypes = [
    'Full Time',
    'Part Time',
    'Contract',
    'Permanent'
  ];

  const experienceLevels = [
    '0-2 Years',
    '3-5 Years',
    '6-8 Years',
    '9+ Years'
  ];

  const companyTypes = [
    'Product',
    'Service',
    'B2B',
    'B2C'
  ];

  const locations = [
    'Bengaluru',
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Pune',
    'Chennai'
  ];

  const handleViewMore = (job: JobListing) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const toggleSaveJob = async (job: JobListing) => {
    const jobKey = `${job.title}-${job.company}`;
    const isCurrentlySaved = savedJobs.has(jobKey);

    try {
      if (isCurrentlySaved) {
        await removeSavedJobMutation.mutateAsync({
          jobTitle: job.title,
          company: job.company
        });
        toast({
          title: "Job removed",
          description: `${job.title} at ${job.company} removed from saved jobs.`,
        });
      } else {
        await saveJobMutation.mutateAsync({
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          jobType: job.type,
        });
        toast({
          title: "Job saved",
          description: `${job.title} at ${job.company} saved successfully.`,
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to save/remove job";
      
      if (errorMessage.includes("Authentication required")) {
        toast({
          title: "Login Required",
          description: "Please log in to save jobs. You can access the login page from the main menu.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleApplyJob = (job: JobListing) => {
    setPendingApplyJob(job);
    setShowApplyConfirmation(true);
  };

  const confirmApplyJob = () => {
    if (pendingApplyJob) {
      const jobKey = `${pendingApplyJob.title}-${pendingApplyJob.company}`;
      setAppliedJobs(prev => new Set(Array.from(prev).concat(jobKey)));
      toast({
        title: "Application submitted",
        description: "Recruiters will be contacting you shortly regarding your application.",
      });
      setShowApplyConfirmation(false);
      setPendingApplyJob(null);
      if (selectedJob) setShowJobModal(false);
    }
  };

  const filteredJobs = jobListings.filter(job => {
    if (jobFilter === 'hot' && !job.isHot) return false;
    if (jobFilter === 'saved' && !savedJobs.has(`${job.title}-${job.company}`)) return false;
    
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Department filter (map job titles to departments)
    let matchesDepartment = selectedDepartments.length === 0;
    if (selectedDepartments.length > 0) {
      const jobDepartment = job.title.toLowerCase().includes('cloud') ? 'Cloud Engineering' :
                           job.title.toLowerCase().includes('frontend') || job.title.toLowerCase().includes('front-end') ? 'Frontend Development' :
                           job.title.toLowerCase().includes('software') || job.title.toLowerCase().includes('developer') ? 'Software Development' :
                           'Others';
      matchesDepartment = selectedDepartments.includes(jobDepartment);
    }
    
    // Salary filter (parse salary and match to ranges)
    let matchesSalary = selectedSalaries.length === 0;
    if (selectedSalaries.length > 0) {
      const salaryValue = parseInt(job.salary.replace(/[^0-9]/g, ''));
      matchesSalary = selectedSalaries.some(range => {
        if (range === '0-10 Lakhs') return salaryValue >= 0 && salaryValue <= 10;
        if (range === '10-20 Lakhs') return salaryValue > 10 && salaryValue <= 20;
        if (range === '20-30 Lakhs') return salaryValue > 20 && salaryValue <= 30;
        if (range === '30+ Lakhs') return salaryValue > 30;
        return false;
      });
    }
    
    // Role category filter (map job titles to roles)
    let matchesRole = selectedRoles.length === 0;
    if (selectedRoles.length > 0) {
      const jobRole = job.title.toLowerCase().includes('cloud') ? 'Cloud Engineer' :
                     job.title.toLowerCase().includes('frontend') || job.title.toLowerCase().includes('front-end') ? 'Frontend Developer' :
                     job.title.toLowerCase().includes('software') ? 'Software Engineer' :
                     'Others';
      matchesRole = selectedRoles.includes(jobRole);
    }
    
    return matchesSearch && matchesDepartment && matchesSalary && matchesRole;
  });

  const savedJobCards = savedJobsData.map(savedJob => {
    const matchingJob = jobListings.find(job => 
      job.title === savedJob.jobTitle && job.company === savedJob.company
    );
    
    if (matchingJob) {
      return matchingJob;
    } else {
      return {
        id: `saved-${savedJob.jobTitle}-${savedJob.company}`,
        company: savedJob.company,
        title: savedJob.jobTitle,
        description: `Saved job from ${savedJob.company}`,
        experience: 'N/A',
        salary: savedJob.salary || 'Not specified',
        location: savedJob.location || 'Not specified',
        type: savedJob.jobType || 'Full Time',
        workType: 'Not specified',
        skills: [],
        logo: '/api/placeholder/60/60',
        isRemote: false,
        postedDays: 0,
        background: 'bg-gradient-to-br from-gray-100 to-gray-200',
        isHot: false
      };
    }
  });

  const jobsToDisplay = jobFilter === 'saved' ? savedJobCards : filteredJobs;
  const totalJobs = jobsToDisplay.length;
  const totalPages = Math.ceil(totalJobs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = jobsToDisplay.slice(startIndex, startIndex + itemsPerPage);

  const profileCompletion = profile ? 25 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Search Bar - Redesigned to match image */}
      <div className="bg-teal-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search Jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-full h-10"
              data-testid="input-search-jobs"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-teal-100 dark:bg-teal-900 rounded-full hover:bg-teal-200 dark:hover:bg-teal-800">
              <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell Icon with Badge */}
            <button className="relative p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-gray-700 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Hot Jobs / All Jobs Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-700 rounded-full overflow-hidden shadow-sm">
              <button
                onClick={() => setJobFilter('hot')}
                className={`px-5 py-1.5 text-sm font-medium transition-colors ${
                  jobFilter === 'hot'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                data-testid="button-hot-jobs"
              >
                Hot Jobs
              </button>
              <button
                onClick={() => setJobFilter('all')}
                className={`px-5 py-1.5 text-sm font-medium transition-colors ${
                  jobFilter === 'all'
                    ? 'bg-teal-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                data-testid="button-all-jobs"
              >
                All Jobs
              </button>
            </div>

            {/* Settings Icon - Opens Job Preferences */}
            <button 
              onClick={() => onNavigateToJobPreferences?.()}
              className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-gray-700 rounded-full"
              data-testid="button-job-preferences-icon"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Icon - Opens Profile Page */}
            <button 
              onClick={() => onNavigateToProfile?.()}
              className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-gray-700 rounded-full"
              data-testid="button-profile-icon"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex">
        {/* Left Sidebar - Profile and Filters */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto h-[calc(100vh-120px)]">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={profile?.profilePicture || '/api/placeholder/128/128'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {profileCompletion}%
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center">
                {profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : 'S. Brunce Mars'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                {profile?.collegeName || 'National Institute of Technology'}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">
                {profile?.title || profile?.currentRole || 'Cloud Engineer'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                Last Updated: Yesterday
              </p>
              <Button
                onClick={onNavigateToProfile}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-full"
                data-testid="button-edit-profile"
              >
                Edit profile
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Filters</h3>
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Applied (0)</p>

            {/* Department Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Department</h4>
              <div className="space-y-2">
                {departments.slice(0, showMoreDepartments ? departments.length : 3).map((dept) => (
                  <div key={dept} className="flex items-center">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={selectedDepartments.includes(dept)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDepartments([...selectedDepartments, dept]);
                        } else {
                          setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                        }
                      }}
                      className="mr-2"
                      data-testid={`checkbox-dept-${dept}`}
                    />
                    <label
                      htmlFor={`dept-${dept}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {dept}
                    </label>
                  </div>
                ))}
              </div>
              {departments.length > 3 && (
                <button
                  onClick={() => setShowMoreDepartments(!showMoreDepartments)}
                  className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1 hover:underline"
                  data-testid="button-view-more-departments"
                >
                  {showMoreDepartments ? 'View Less' : 'View More'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showMoreDepartments ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Salary Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Salary</h4>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">(Per Year)</p>
              <div className="space-y-2">
                {salaryRanges.slice(0, showMoreSalaries ? salaryRanges.length : 3).map((range) => (
                  <div key={range} className="flex items-center">
                    <Checkbox
                      id={`salary-${range}`}
                      checked={selectedSalaries.includes(range)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSalaries([...selectedSalaries, range]);
                        } else {
                          setSelectedSalaries(selectedSalaries.filter(s => s !== range));
                        }
                      }}
                      className="mr-2"
                      data-testid={`checkbox-salary-${range}`}
                    />
                    <label
                      htmlFor={`salary-${range}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {range}
                    </label>
                  </div>
                ))}
              </div>
              {salaryRanges.length > 3 && (
                <button
                  onClick={() => setShowMoreSalaries(!showMoreSalaries)}
                  className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1 hover:underline"
                  data-testid="button-view-more-salaries"
                >
                  {showMoreSalaries ? 'View Less' : 'View More'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showMoreSalaries ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Role Category Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Role category</h4>
              <div className="space-y-2">
                {roleCategories.slice(0, showMoreRoles ? roleCategories.length : 2).map((role) => (
                  <div key={role} className="flex items-center">
                    <Checkbox
                      id={`role-${role}`}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRoles([...selectedRoles, role]);
                        } else {
                          setSelectedRoles(selectedRoles.filter(r => r !== role));
                        }
                      }}
                      className="mr-2"
                      data-testid={`checkbox-role-${role}`}
                    />
                    <label
                      htmlFor={`role-${role}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {role}
                    </label>
                  </div>
                ))}
              </div>
              {roleCategories.length > 2 && (
                <button
                  onClick={() => setShowMoreRoles(!showMoreRoles)}
                  className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1 hover:underline"
                  data-testid="button-view-more-roles"
                >
                  {showMoreRoles ? 'View Less' : 'View More'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showMoreRoles ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Work Mode Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Work Mode</h4>
              <div className="space-y-2">
                {workModes.map((mode) => (
                  <div key={mode} className="flex items-center">
                    <Checkbox
                      id={`workmode-${mode}`}
                      checked={selectedWorkModes.includes(mode)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedWorkModes([...selectedWorkModes, mode]);
                        } else {
                          setSelectedWorkModes(selectedWorkModes.filter(m => m !== mode));
                        }
                      }}
                      className="mr-2"
                      data-testid={`checkbox-workmode-${mode}`}
                    />
                    <label
                      htmlFor={`workmode-${mode}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {mode}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment Type Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Employment Type</h4>
              <div className="space-y-2">
                {employmentTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <Checkbox
                      id={`employment-${type}`}
                      checked={selectedEmploymentTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEmploymentTypes([...selectedEmploymentTypes, type]);
                        } else {
                          setSelectedEmploymentTypes(selectedEmploymentTypes.filter(t => t !== type));
                        }
                      }}
                      className="mr-2"
                      data-testid={`checkbox-employment-${type}`}
                    />
                    <label
                      htmlFor={`employment-${type}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Experience Level</h4>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <div key={level} className="flex items-center">
                    <Checkbox
                      id={`experience-${level}`}
                      checked={selectedExperience.includes(level)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedExperience([...selectedExperience, level]);
                        } else {
                          setSelectedExperience(selectedExperience.filter(l => l !== level));
                        }
                      }}
                      className="mr-2"
                      data-testid={`checkbox-experience-${level}`}
                    />
                    <label
                      htmlFor={`experience-${level}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {level}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Type Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Company Type</h4>
              <div className="space-y-2">
                {companyTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <Checkbox
                      id={`company-${type}`}
                      checked={selectedCompanyTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCompanyTypes([...selectedCompanyTypes, type]);
                        } else {
                          setSelectedCompanyTypes(selectedCompanyTypes.filter(t => t !== type));
                        }
                      }}
                      className="mr-2"
                      data-testid={`checkbox-company-${type}`}
                    />
                    <label
                      htmlFor={`company-${type}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Location</h4>
              <div className="space-y-2">
                {locations.map((location) => (
                  <div key={location} className="flex items-center">
                    <Checkbox
                      id={`location-${location}`}
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLocations([...selectedLocations, location]);
                        } else {
                          setSelectedLocations(selectedLocations.filter(l => l !== location));
                        }
                      }}
                      className="mr-2"
                      data-testid={`checkbox-location-${location}`}
                    />
                    <label
                      htmlFor={`location-${location}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Job Cards - Redesigned to match image */}
        <div className="flex-1 p-6 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="space-y-4">
            {currentJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden p-4">
                <div className="flex gap-4">
                  {/* Company Logo Section - Redesigned */}
                  <div className="flex-shrink-0">
                    <div className={`${job.background} rounded-3xl p-6 w-40 h-36 flex flex-col items-center justify-center shadow-sm`}>
                      <img
                        src={job.logo}
                        alt={`${job.company} logo`}
                        className="w-16 h-16 rounded object-cover mb-3"
                      />
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 text-center">
                        {job.company.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Job Details - Redesigned */}
                  <div className="flex-1 relative">
                    {/* Bookmark Button */}
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className={`absolute top-0 right-0 p-2 rounded-lg transition-all duration-200 ${
                        savedJobs.has(`${job.title}-${job.company}`) 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800'
                      }`}
                      data-testid={`button-save-${job.id}`}
                    >
                      <Bookmark className={`w-4 h-4 ${savedJobs.has(`${job.title}-${job.company}`) ? 'text-white fill-white' : 'text-orange-600 dark:text-orange-400'}`} />
                    </button>

                    <div className="pr-12">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {job.company}
                      </h3>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        {job.title}
                        {job.isHot && (
                          <span className="text-red-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{job.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300 mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          {job.workType}
                        </span>
                        <span>{job.type}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 px-3 py-1 rounded-md text-xs font-medium border border-red-200 dark:border-red-700">
                          Open Positions ~ 2
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600">
                          Product
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600">
                          B2B
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600">
                          Full Time
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex items-center gap-2 mb-3">
                        {job.skills.map((skill, index) => (
                          <span key={index} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-3 py-1 rounded-md text-xs font-medium border border-green-200 dark:border-green-700">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Posted: {job.postedDays} days ago
                        </span>
                        <Button 
                          onClick={() => handleViewMore(job)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium" 
                          size="sm" 
                          data-testid={`button-view-more-${job.id}`}
                        >
                          View More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Details Modal - Matching My Jobs Tab Design */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl shadow-2xl max-w-2xl w-full mx-8 max-h-[85vh] flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
              {/* Job Card Header */}
              <div className="bg-white dark:bg-gray-800 p-4 mb-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex">
                  {/* Company Logo Section */}
                  <div className="w-32 flex items-center justify-center">
                    <div className={`${selectedJob.background} rounded-xl p-3 flex flex-col items-center justify-center w-full h-full min-h-[100px]`}>
                      <img
                        src={selectedJob.logo}
                        alt={`${selectedJob.company} logo`}
                        className="w-12 h-12 rounded object-cover mb-1"
                      />
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{selectedJob.company.split(' ')[0]}</div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedJob.company}</h3>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          {selectedJob.title}
                          {selectedJob.isHot && <i className="fas fa-fire text-red-500 text-sm"></i>}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{selectedJob.description}</p>
                      </div>
                      <button
                        onClick={() => setShowJobModal(false)}
                        className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center ml-2 transition-colors"
                        data-testid="button-close-modal"
                      >
                        <i className="fas fa-times text-white text-xs"></i>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-briefcase"></i>
                        {selectedJob.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">₹</span>
                        {selectedJob.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-map-marker-alt"></i>
                        {selectedJob.location}
                      </span>
                      <span className="font-medium">{selectedJob.workType}</span>
                      <span className="font-medium">{selectedJob.type}</span>
                    </div>

                    {/* Job Tags */}
                    <div className="flex items-center gap-1 mb-2">
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        Open Positions ~ 2
                      </span>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        Product
                      </span>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        B2B
                      </span>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        Full Time
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex items-center gap-1">
                      {selectedJob.skills.map((skill, index) => (
                        <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* View Less Button */}
                    <div className="flex justify-end mt-2">
                      <Button 
                        onClick={() => setShowJobModal(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-xs" 
                        size="sm"
                        data-testid="button-view-less"
                      >
                        View Less
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections - Separate Boxes */}
              <div className="pb-4 space-y-4">
                {/* About Company Box */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">About Company</h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {selectedJob.company}, now a subsidiary of Alphabet Inc., is a multinational technology company known for 
                    its Internet search engine, online advertising technologies, cloud computing, and other 
                    software services. The core mission is to organize the world's information and 
                    make it universally accessible and useful.
                  </p>
                </div>

                {/* Role Definition Box */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Role Definition</h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    We are looking for a skilled {selectedJob.title} to join our team and help build 
                    scalable cloud infrastructure. The ideal candidate will have strong experience with cloud platforms.
                  </p>
                  <div className="space-y-2">
                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Key Responsibilities:</h6>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-2">
                      <li>Design and implement cloud-based solutions</li>
                      <li>Automate infrastructure deployment</li>
                      <li>Monitor and optimize cloud resources</li>
                      <li>Collaborate with development teams</li>
                    </ul>
                  </div>
                </div>

                {/* Apply and Save Buttons */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex gap-3">
                  <Button
                    onClick={() => toggleSaveJob(selectedJob)}
                    variant="outline"
                    className="flex items-center gap-2 px-6 border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                    data-testid="button-save-job-modal"
                  >
                    <Bookmark className={`w-4 h-4 ${savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'fill-orange-600' : ''}`} />
                    {savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    onClick={() => handleApplyJob(selectedJob)}
                    disabled={appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`)}
                    className={`flex-1 ${
                      appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`)
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                    data-testid="button-apply-job-modal"
                  >
                    {appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Applied' : 'Apply'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Confirmation Dialog */}
      <Dialog open={showApplyConfirmation} onOpenChange={setShowApplyConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Application</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to apply for {pendingApplyJob?.title} at {pendingApplyJob?.company}?
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={confirmApplyJob}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-confirm-apply"
            >
              Yes, Apply
            </Button>
            <Button
              onClick={() => setShowApplyConfirmation(false)}
              variant="outline"
              className="flex-1"
              data-testid="button-cancel-apply"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
