import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Edit, Bookmark } from "lucide-react";
import { useSavedJobs, useSaveJob, useRemoveSavedJob } from "@/hooks/use-saved-jobs";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";

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
    location: 'Bangalore',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['CICD', 'Docker', 'Azure'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png',
    isRemote: false,
    postedDays: 3,
    background: 'bg-green-100',
    isHot: true
  },
  {
    id: '2',
    company: 'Unity Technologies',
    title: 'Cloud Engineer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['CICD', 'Docker', 'Azure'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Unity_Technologies_logo.svg/480px-Unity_Technologies_logo.svg.png',
    isRemote: false,
    postedDays: 3,
    background: 'bg-purple-100',
    isHot: false
  },
  {
    id: '3',
    company: 'Google Technologies Inc.',
    title: 'Frontend Developer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['CICD', 'Docker', 'Azure'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png',
    isRemote: false,
    postedDays: 3,
    background: 'bg-red-100',
    isHot: true
  }
];

export default function JobBoardTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobFilter, setJobFilter] = useState<'all' | 'hot' | 'saved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showApplyConfirmation, setShowApplyConfirmation] = useState(false);
  const [pendingApplyJob, setPendingApplyJob] = useState<JobListing | null>(null);
  const itemsPerPage = 3;
  const { data: profile } = useProfile();
  const { data: savedJobsData } = useSavedJobs();
  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();
  const { toast } = useToast();

  // Create a Set of saved job keys for fast lookup
  const savedJobs = new Set(
    savedJobsData?.map(job => `${job.jobTitle}-${job.company}`) || []
  );

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

  const handleViewMore = (job: JobListing) => {
    setSelectedJob(job);
    setShowJobModal(true);
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
    // Filter by job type
    if (jobFilter === 'hot' && !job.isHot) return false;
    if (jobFilter === 'saved' && !savedJobs.has(`${job.title}-${job.company}`)) return false;
    
    // Filter by search query
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar - Profile and Filters */}
      <div className="w-80 p-6 space-y-6">
        {/* Profile Card */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <img
                  src={profile?.profilePicture || '/api/placeholder/80/80'}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">25%</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {profile?.name || 'S. Bruce Mars'}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                National Institute of Technology
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Cloud Engineer
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Last login: just now
              </p>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters Card */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Applied 12</span>
            </div>
            
            <div className="space-y-4">
              {/* Department */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Department
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-cyan-500" defaultChecked />
                    <span className="text-sm text-gray-600">Software Testing</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-cyan-500" defaultChecked />
                    <span className="text-sm text-gray-600">Web Designing</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Others</span>
                  </label>
                  <Button variant="link" className="text-xs text-gray-500 p-0">
                    View More ▼
                  </Button>
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Salary <span className="text-xs text-gray-500">(Per Year)</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">0-2 Lakhs</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-cyan-500" defaultChecked />
                    <span className="text-sm text-gray-600">3-6 Lakhs</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">6-12 lakhs</span>
                  </label>
                  <Button variant="link" className="text-xs text-gray-500 p-0">
                    View More ▼
                  </Button>
                </div>
              </div>

              {/* Role category */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Role category
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Software Developer</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">UX Developer</span>
                  </label>
                  <Button variant="link" className="text-xs text-gray-500 p-0">
                    View More ▼
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Content - Search and Jobs */}
      <div className="flex-1 p-6">
        {/* Header with Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant={jobFilter === 'hot' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setJobFilter(jobFilter === 'hot' ? 'all' : 'hot')}
                className={`rounded-full px-4 ${
                  jobFilter === 'hot'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'border-red-300 text-red-500 hover:bg-red-50'
                }`}
              >
                Hot Jobs
              </Button>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">All Jobs</span>
                <div className="relative">
                  <div className={`w-12 h-6 rounded-full transition-colors ${jobFilter === 'all' ? 'bg-cyan-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${jobFilter === 'all' ? 'translate-x-6' : 'translate-x-1'}`}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">👤</span>
              <span className="text-sm text-gray-500">📧</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search Jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              data-testid="input-job-search"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {currentJobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="flex">
                {/* Company Logo Section - Left Side Full Height */}
                <div className="w-52 flex flex-col items-center justify-center relative">
                  <div className={`${job.background} rounded-xl p-6 flex flex-col items-center justify-center mx-2 my-4 h-full min-h-[200px]`} style={{width: '80%'}}>
                    <img
                      src={job.logo}
                      alt={`${job.company} logo`}
                      className="w-16 h-16 rounded object-cover mb-2"
                    />
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{job.company.split(' ')[0]}</div>
                    </div>
                  </div>
                </div>

                {/* Job Details - Right Side */}
                <div className="flex-1 p-6 relative">
                  {/* Save Job Button - Top Right */}
                  <button
                    onClick={() => toggleSaveJob(job)}
                    className={`absolute top-6 right-6 p-3 rounded-full transition-all duration-200 ${
                      savedJobs.has(`${job.title}-${job.company}`) 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                    data-testid={`button-save-${job.id}`}
                  >
                    <i className={`${savedJobs.has(`${job.title}-${job.company}`) ? 'fas fa-bookmark' : 'far fa-bookmark'} text-white`}></i>
                  </button>

                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">{job.company}</h3>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    {job.title}
                    {job.isHot && <i className="fas fa-fire text-red-500 text-lg"></i>}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{job.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <i className="fas fa-briefcase"></i>
                      {job.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">₹</span>
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-map-marker-alt"></i>
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-clock"></i>
                      {job.workType}
                    </span>
                    <span className="font-medium">{job.type}</span>
                  </div>

                  {/* Job Tags */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                      Open Positions ~ 2
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                      Product
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                      B2B
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                      Full Time
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex items-center gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Posted: {job.postedDays} days ago</span>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleViewMore(job)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded font-medium" 
                        size="sm" 
                        data-testid={`button-view-more-${job.id}`}
                      >
                        View More
                      </Button>
                      <Button 
                        onClick={() => handleApplyJob(job)}
                        disabled={appliedJobs.has(`${job.title}-${job.company}`)}
                        className={`px-4 py-2 rounded font-medium ${
                          appliedJobs.has(`${job.title}-${job.company}`)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        size="sm"
                        data-testid={`button-apply-${job.id}`}
                      >
                        {appliedJobs.has(`${job.title}-${job.company}`) ? 'Applied' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing page {currentPage} of {totalPages} ({totalJobs} total jobs)
          </div>
          
          {/* Page Navigation */}
          <div className="flex items-center gap-3">
            <Button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              data-testid="button-prev-page"
            >
              <i className="fas fa-chevron-left mr-2"></i>
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <Button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              data-testid="button-next-page"
            >
              Next
              <i className="fas fa-chevron-right ml-2"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>

      {/* Apply Job Confirmation Modal */}
      {showApplyConfirmation && pendingApplyJob && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Apply for Job</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to apply for {pendingApplyJob?.title} at {pendingApplyJob?.company}?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApplyConfirmation(false);
                  setPendingApplyJob(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={confirmApplyJob} className="bg-blue-600 hover:bg-blue-700 text-white">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}