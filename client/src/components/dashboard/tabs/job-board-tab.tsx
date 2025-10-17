import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, MapPin, Filter, X, Heart, Clock, Bookmark, ChevronDown } from "lucide-react";
import { useSavedJobs, useSaveJob, useRemoveSavedJob } from "@/hooks/use-saved-jobs";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";

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

export default function JobBoardTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobFilter, setJobFilter] = useState<'all' | 'hot' | 'saved'>('all');
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showApplyConfirmation, setShowApplyConfirmation] = useState(false);
  const [pendingApplyJob, setPendingApplyJob] = useState<JobListing | null>(null);
  const [, navigate] = useLocation();
  
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSalaries, setSelectedSalaries] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
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
    'Others'
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save/remove job. Please try again.",
        variant: "destructive",
      });
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
      {/* Top Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search Jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              data-testid="input-search-jobs"
            />
          </div>

          {/* Saved Jobs Button */}
          <button
            onClick={() => setJobFilter('saved')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
              jobFilter === 'saved'
                ? 'bg-green-500 text-white border-green-500'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            data-testid="button-saved-jobs"
          >
            <Bookmark className={`w-4 h-4 inline mr-2 ${jobFilter === 'saved' ? 'fill-white' : ''}`} />
            Saved ({savedJobs.size})
          </button>

          {/* Job Type Toggle */}
          <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setJobFilter('hot')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                jobFilter === 'hot'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              data-testid="button-hot-jobs"
            >
              Hot Jobs
            </button>
            <button
              onClick={() => setJobFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                jobFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              data-testid="button-all-jobs"
            >
              All Jobs
            </button>
          </div>

          {/* Settings Icon */}
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* User Icon */}
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
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
                onClick={() => navigate('/candidate')}
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
            <div>
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
          </div>
        </div>

        {/* Right Content - Job Cards */}
        <div className="flex-1 p-6 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="space-y-4">
            {currentJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="flex">
                  {/* Company Logo Section */}
                  <div className="w-44 flex items-center justify-center p-4">
                    <div className={`${job.background} rounded-xl p-4 w-full h-32 flex flex-col items-center justify-center`}>
                      <img
                        src={job.logo}
                        alt={`${job.company} logo`}
                        className="w-12 h-12 rounded object-cover mb-2"
                      />
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300 text-center">
                        {job.company.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 p-4 relative">
                    {/* Bookmark Button */}
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                        savedJobs.has(`${job.title}-${job.company}`) 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : 'bg-orange-400 hover:bg-orange-500'
                      }`}
                      data-testid={`button-save-${job.id}`}
                    >
                      <Bookmark className={`w-4 h-4 text-white ${savedJobs.has(`${job.title}-${job.company}`) ? 'fill-white' : ''}`} />
                    </button>

                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {job.company}
                    </h3>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      {job.title}
                      {job.isHot && (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{job.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        {job.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">₹</span>
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.workType}
                      </span>
                      <span className="font-medium">{job.type === 'Permanent' ? 'Permanent' : job.type}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-2 py-1 rounded-full text-xs">
                        Open Positions ~ 2
                      </span>
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
                        Product
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                        B2B
                      </span>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        Full Time
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex items-center gap-2 mb-3">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Posten: {job.postedDays} days ago
                      </span>
                      <Button 
                        onClick={() => handleViewMore(job)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded text-sm" 
                        size="sm" 
                        data-testid={`button-view-more-${job.id}`}
                      >
                        View More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedJob?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`${selectedJob.background} rounded-xl p-4 w-20 h-20 flex items-center justify-center`}>
                  <img
                    src={selectedJob.logo}
                    alt={`${selectedJob.company} logo`}
                    className="w-12 h-12 rounded object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedJob.company}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedJob.location}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Experience:</span>
                  <span>{selectedJob.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Salary:</span>
                  <span>₹ {selectedJob.salary}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Type:</span>
                  <span>{selectedJob.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Work Type:</span>
                  <span>{selectedJob.workType}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedJob.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, index) => (
                    <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
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
                  {appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Applied' : 'Apply Now'}
                </Button>
                <Button
                  onClick={() => toggleSaveJob(selectedJob)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-save-job-modal"
                >
                  {savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Unsave Job' : 'Save Job'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
