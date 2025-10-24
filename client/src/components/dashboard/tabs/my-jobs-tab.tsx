import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MapPin, Flame, Eye, Archive } from 'lucide-react';
import { useSavedJobs, useSaveJob, useRemoveSavedJob } from "@/hooks/use-saved-jobs";
import { useToast } from "@/hooks/use-toast";
import type { JobApplication } from '@shared/schema';
import CandidateMetrics from '@/components/dashboard/candidate-metrics';

interface MyJobsTabProps {
  className?: string;
  onNavigateToJobBoard?: () => void;
}

interface JobSuggestion {
  id: string;
  company: string;
  logo: string;
  title: string;
  salary: string;
  location: string;
  workMode: string;
  skills: string[];
  bgColor: string;
  description: string;
  experience: string;
  type: string;
  background: string;
  isHot?: boolean;
}

// Mock job suggestions data based on the design
const jobSuggestions: JobSuggestion[] = [
  {
    id: '1',
    company: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png',
    title: 'Cloud Engineer',
    salary: '₹ 12 LPA',
    location: 'Bengaluru',
    workMode: 'Work from office',
    skills: ['CI/CD', 'Docker', 'Azure'],
    bgColor: 'bg-blue-200',
    description: 'We are looking for a skilled Cloud Engineer to join our team and help build scalable cloud infrastructure.',
    experience: '3-5 years',
    type: 'Full-time',
    background: 'bg-blue-50',
    isHot: true
  },
  {
    id: '2',
    company: 'Unity',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Unity_Technologies_logo.svg/480px-Unity_Technologies_logo.svg.png',
    title: 'Backend Developer',
    salary: '₹ 12 LPA',
    location: 'Bengaluru',
    workMode: 'Work from office',
    skills: ['CI/CD', 'Docker', 'Azure'],
    bgColor: 'bg-green-200',
    description: 'Join our backend team to develop robust and scalable server-side applications.',
    experience: '2-4 years',
    type: 'Full-time',
    background: 'bg-green-50'
  },
  {
    id: '3',
    company: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/480px-Meta_Platforms_Inc._logo.svg.png',
    title: 'Frontend Developer',
    salary: '₹ 15 LPA',
    location: 'Mumbai',
    workMode: 'Work from office',
    skills: ['React', 'TypeScript', 'Next.js'],
    bgColor: 'bg-red-200',
    description: 'Build amazing user experiences for billions of users worldwide.',
    experience: '1-3 years',
    type: 'Full-time',
    background: 'bg-red-50'
  },
  {
    id: '4',
    company: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/480px-Microsoft_logo_%282012%29.svg.png',
    title: 'DevOps Engineer',
    salary: '₹ 18 LPA',
    location: 'Hyderabad',
    workMode: 'Hybrid',
    skills: ['Kubernetes', 'AWS', 'Terraform'],
    bgColor: 'bg-purple-200',
    description: 'Help us build and maintain robust infrastructure for cloud-based applications.',
    experience: '4-6 years',
    type: 'Full-time',
    background: 'bg-purple-50'
  },
  {
    id: '5',
    company: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/480px-Amazon_logo.svg.png',
    title: 'Full Stack Developer',
    salary: '₹ 20 LPA',
    location: 'Pune',
    workMode: 'Remote',
    skills: ['Node.js', 'Python', 'MongoDB'],
    bgColor: 'bg-yellow-200',
    description: 'Build end-to-end solutions for our e-commerce platform.',
    experience: '3-5 years',
    type: 'Full-time',
    background: 'bg-yellow-50'
  },
  {
    id: '6',
    company: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/480px-Netflix_2015_logo.svg.png',
    title: 'Data Scientist',
    salary: '₹ 25 LPA',
    location: 'Bangalore',
    workMode: 'Work from office',
    skills: ['Python', 'Machine Learning', 'SQL'],
    bgColor: 'bg-red-200',
    description: 'Analyze user behavior and content performance to improve our platform.',
    experience: '2-4 years',
    type: 'Full-time',
    background: 'bg-red-50'
  }
];

// Mock applied jobs data with status
const mockAppliedJobs: any[] = [
  {
    id: '1',
    jobTitle: 'Frontend Developer',
    company: 'TechCorp',
    jobType: 'Full-Time',
    status: 'In Process',
    appliedDate: '06-06-2025',
    daysAgo: '40 days'
  },
  {
    id: '2',
    jobTitle: 'UI/UX Designer',
    company: 'Designify',
    jobType: 'Internship',
    status: 'Rejected',
    appliedDate: '08-06-2025',
    daysAgo: '37 days'
  },
  {
    id: '3',
    jobTitle: 'Backend Developer',
    company: 'CodeLabs',
    jobType: 'Full-Time',
    status: 'Rejected',
    appliedDate: '20-06-2025',
    daysAgo: '22 days'
  },
  {
    id: '4',
    jobTitle: 'QA Tester',
    company: 'AppLogic',
    jobType: 'Internship',
    status: 'In Process',
    appliedDate: '01-07-2025',
    daysAgo: '22 days'
  },
  {
    id: '5',
    jobTitle: 'Bug Catchers',
    company: 'Mobile App Developer',
    jobType: 'Full-Time',
    status: 'In Process',
    appliedDate: '23-07-2025',
    daysAgo: '2 days'
  }
];

export default function MyJobsTab({ className, onNavigateToJobBoard }: MyJobsTabProps) {
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobSuggestion | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showApplyConfirmation, setShowApplyConfirmation] = useState(false);
  const [pendingApplyJob, setPendingApplyJob] = useState<JobSuggestion | null>(null);
  const jobsPerPage = 3;
  const { data: jobApplications = mockAppliedJobs, isLoading } = useQuery({
    queryKey: ['/api/job-applications'],
  });
  
  const { data: savedJobsData } = useSavedJobs();
  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();
  const { toast } = useToast();

  // Create a Set of saved job keys for fast lookup
  const savedJobs = new Set(
    savedJobsData?.map(job => `${job.jobTitle}-${job.company}`) || []
  );

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'In Process': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Applied': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleViewMore = (job: JobSuggestion) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleViewJob = (job: JobApplication) => {
    console.log('View job:', job);
    // Navigate to job details or open in new window
  };

  const handleArchiveJob = (job: JobApplication) => {
    console.log('Archive job:', job);
    // Archive job logic
  };

  const handleSeeAllJobs = () => {
    if (onNavigateToJobBoard) {
      onNavigateToJobBoard();
    }
  };

  const toggleSaveJob = async (job: JobSuggestion) => {
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

  const handleApplyJob = (job: JobSuggestion) => {
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex gap-6 p-6 ${className}`}>
      {/* Left Column - Applied Jobs and Job Suggestions */}
      <div className="flex-1 space-y-8">
        {/* Applied Jobs Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Applied Jobs</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Job Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Company</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Applied On</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Applied Since</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(jobApplications as any[])
                .slice(0, showAllJobs ? undefined : 5)
                .map((job: any) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">{job.jobTitle}</td>
                  <td className="py-4 px-4 text-gray-700">{job.company}</td>
                  <td className="py-4 px-4 text-gray-700">{job.jobType}</td>
                  <td className="py-4 px-4">
                    <Badge className={`${getStatusBadge(job.status || 'In Process')} border`}>
                      ● {job.status || 'In Process'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{job.appliedDate}</td>
                  <td className="py-4 px-4 text-gray-600">{job.daysAgo}</td>
                  <td className="py-4 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`button-menu-${job.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewJob(job)} data-testid={`menu-view-${job.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveJob(job)} data-testid={`menu-archive-${job.id}`}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(jobApplications as any[]).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No job applications found. Start applying to jobs to see them here.
          </div>
        )}

        {/* See all button for Applied Jobs - moved below the table */}
        {(jobApplications as any[]).length > 5 && !showAllJobs && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-700 p-0 rounded"
              onClick={() => setShowAllJobs(true)}
              data-testid="button-see-all-applied"
            >
              See all applied jobs
            </Button>
          </div>
        )}
      </div>

        {/* Job Suggestions Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Job Suggestions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobSuggestions
            .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
            .map((job) => (
            <Card key={job.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden relative">
              <CardContent className="p-0">
                {/* Save Button */}
                <button
                  onClick={() => toggleSaveJob(job)}
                  className={`absolute top-6 right-6 p-3 rounded-full transition-all duration-200 z-10 ${
                    savedJobs.has(`${job.title}-${job.company}`) 
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  data-testid={`button-save-${job.id}`}
                >
                  <i className={`${savedJobs.has(`${job.title}-${job.company}`) ? 'fas fa-bookmark' : 'far fa-bookmark'} text-white`}></i>
                </button>

                {/* Company Logo Section */}
                <div className="flex items-center justify-between p-4">
                <div className={`${job.bgColor} p-6 text-center rounded w-full`}>
                  <div className="w-20 h-14 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-12 h-10 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{job.company}</h3>
                </div>
                </div>

                {/* Job Details Section */}
                <div className="pt-2 p-6">
                  {/* Product Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs px-2 py-1 rounded">
                      Product
                    </Badge>
                    <div className="w-4 h-4 text-orange-500">
                      <Flame className="w-full h-full" />
                    </div>
                  </div>

                  {/* Job Title */}
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{job.title}</h4>

                  {/* Salary and Location - Same Row */}
                  <div className="flex items-center gap-7 mb-1">
                    <span className="text-gray-900 font-medium">{job.salary}</span>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm mb-3">{job.workMode}</div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill) => (
                      <Badge 
                        key={skill} 
                        className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-3 rounded"
                      onClick={() => handleViewMore(job)}
                      data-testid={`button-view-more-${job.id}`}
                    >
                      View More
                    </Button>
                    <Button 
                      className={`flex-1 py-3 rounded ${
                        appliedJobs.has(`${job.title}-${job.company}`)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      onClick={() => handleApplyJob(job)}
                      disabled={appliedJobs.has(`${job.title}-${job.company}`)}
                      data-testid={`button-apply-${job.id}`}
                    >
                      {appliedJobs.has(`${job.title}-${job.company}`) ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(jobSuggestions.length / jobsPerPage) }, (_, i) => (
            <Button 
              key={i + 1}
              variant="ghost" 
              size="sm" 
              className={`w-8 h-8 p-0 rounded ${
                currentPage === i + 1 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button 
            variant="link" 
            className="text-blue-600 hover:text-blue-700 p-0 ml-2 rounded"
            onClick={handleSeeAllJobs}
            data-testid="button-see-all-suggestions"
          >
            See all
          </Button>
        </div>
        </div>

      </div>

      {/* Right Column - Candidate Metrics */}
      <div className="w-80 flex-shrink-0">
        <CandidateMetrics />
      </div>

      {/* Job Details Modal - Exact copy of JobBoardTab modal */}
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
                        <span className="font-medium">{selectedJob.workMode}</span>
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
                <div className=" pb-4 space-y-4">
                  {/* About Company Box */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">About Company</h5>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Google, now a subsidiary of Alphabet Inc., is a multinational technology company known for 
                      its Internet search engine, online advertising technologies, cloud computing, and other 
                      software services. Originally founded in 1998 by Larry Page and Sergey Brin, initially as a research project 
                      at Stanford University. Google's core mission is to organize the world's information and 
                      make it universally accessible and useful.
                    </p>
                  </div>

                  {/* Role Definition Box */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Role Definition</h5>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                      We are looking for a Cloud Engineer to join our team and work with our engineering team to 
                      optimize, implement, and maintain our organization's cloud-based systems.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                      A Cloud Engineer's responsibilities include deploying and debugging systems, as well as 
                      executing new cloud initiatives.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Ultimately, you will work with different IT professionals and teams to ensure our cloud 
                      computing systems meet the needs of our organization and customers.
                    </p>
                  </div>

                  {/* Key Responsibilities Box */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Responsibilities</h5>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Design, develop, and deploy modular cloud-based systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Develop and maintain cloud solutions in accordance with best practices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Ensure efficient functioning of data storage and process functions in accordance with 
                        company security policies and best practices in cloud security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Identify, analyse, and resolve infrastructure vulnerabilities and application deployment 
                        issues</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Regularly review existing systems and make recommendations for improvements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Interact with clients, provide cloud support, and make recommendations based on client 
                        needs</span>
                      </li>
                    </ul>
                  </div>

                  {/* Skills Required Box */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Skills Required</h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-700">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Primary Skills</h6>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <div>Business Development</div>
                          <div>Marketing Analysis</div>
                          <div>Lead Generation</div>
                          <div>International Sales</div>
                          <div>Digital Marketing</div>
                          <div>SEO</div>
                        </div>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-700">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Secondary Skills</h6>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <div>Corporate Sales</div>
                          <div>Resource Manager</div>
                          <div>Customer Interaction</div>
                          <div>Customer Service</div>
                          <div>Direct sales</div>
                        </div>
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded border border-yellow-200 dark:border-yellow-700">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Knowledge Only</h6>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <div>Telecalling</div>
                          <div>English communication</div>
                          <div>Sales requirement</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Apply and Save Buttons Footer */}
            <div className="p-4 flex justify-center gap-3">
              <Button 
                onClick={() => selectedJob && toggleSaveJob(selectedJob)}
                className={`px-6 py-2 rounded font-medium border-0 text-sm transition-all ${
                  selectedJob && savedJobs.has(`${selectedJob.title}-${selectedJob.company}`)
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
                data-testid="button-save-job-modal"
              >
                <i className={`${selectedJob && savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'fas fa-bookmark' : 'far fa-bookmark'} mr-1`}></i>
                {selectedJob && savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Saved' : 'Save'}
              </Button>
              <Button 
                onClick={() => selectedJob && handleApplyJob(selectedJob)}
                disabled={selectedJob && appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`)}
                className={`px-6 py-2 rounded font-medium border-0 text-sm ${
                  selectedJob && appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                data-testid="button-apply-job-modal"
              >
                {selectedJob && appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Applied' : 'Apply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Confirmation Dialog */}
      <Dialog open={showApplyConfirmation} onOpenChange={setShowApplyConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Confirm Application</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to apply for <span className="font-medium">{pendingApplyJob?.title}</span> at <span className="font-medium">{pendingApplyJob?.company}</span>?
            </p>
            <p className="text-sm text-gray-500">
              Recruiters will be contacting you shortly regarding your application.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowApplyConfirmation(false)}
              className="px-4 py-2 rounded"
              data-testid="button-cancel-apply"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApplyJob}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              data-testid="button-confirm-apply"
            >
              Confirm Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}