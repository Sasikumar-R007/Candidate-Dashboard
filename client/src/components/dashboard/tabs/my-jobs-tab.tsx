import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MapPin, Flame, Eye, Archive } from 'lucide-react';
import type { JobApplication } from '@shared/schema';

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

export default function MyJobsTab({ className, onNavigateToJobBoard }: MyJobsTabProps) {
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobSuggestion | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const jobsPerPage = 3;
  const { data: jobApplications = [], isLoading } = useQuery({
    queryKey: ['/api/job-applications'],
  });

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Applied Jobs Section */}
      <div className="bg-white rounded-lg p-6 m-3 shadow-sm">
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
              {(jobApplications as JobApplication[])
                .slice(0, showAllJobs ? undefined : 5)
                .map((job: JobApplication) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">{job.jobTitle}</td>
                  <td className="py-4 px-4 text-gray-700">{job.company}</td>
                  <td className="py-4 px-4 text-gray-700">{job.jobType}</td>
                  <td className="py-4 px-4">
                    <Badge className={`${getStatusBadge('In Process')} border`}>
                      ● In Process
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

        {(jobApplications as JobApplication[]).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No job applications found. Start applying to jobs to see them here.
          </div>
        )}

        {/* See all button for Applied Jobs - moved below the table */}
        {(jobApplications as JobApplication[]).length > 5 && !showAllJobs && (
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
      <div className="bg-white rounded-lg p-6 m-3 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Job Suggestions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobSuggestions
            .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
            .map((job) => (
            <Card key={job.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
              <CardContent className="p-0">
                {/* Company Logo Section */}
                <div className="flex items-center justify-between p-4">
                <div className={`${job.bgColor} p-6 text-center rounded w-full`}>
                  <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-10 h-8 object-contain"
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

                  {/* View More Button */}
                  <Button 
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded"
                    onClick={() => handleViewMore(job)}
                    data-testid={`button-view-more-${job.id}`}
                  >
                    View More
                  </Button>
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

      {/* Job Details Modal - Similar to JobBoardTab */}
      {showJobModal && selectedJob && (
        <div className="fixed top-0 left-64 right-0 bottom-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl shadow-2xl max-w-2xl w-full mx-8 max-h-[85vh] flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
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
                      <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center ml-2">
                        <button
                          onClick={() => setShowJobModal(false)}
                          className="text-white text-xs hover:bg-red-600 w-full h-full rounded flex items-center justify-center"
                          data-testid="button-close-modal"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Experience Card */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-briefcase text-blue-600"></i>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedJob.experience}</p>
                </div>

                {/* Salary Card */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-dollar-sign text-green-600"></i>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedJob.salary}</p>
                </div>

                {/* Location Card */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-map-marker-alt text-red-600"></i>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedJob.location}</p>
                </div>

                {/* Work Type Card */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-laptop text-purple-600"></i>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Mode</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedJob.workMode}</p>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 mb-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Required Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 rounded-b-2xl">
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded"
                  data-testid="button-save-job-modal"
                >
                  <i className="far fa-bookmark mr-2"></i>
                  Save
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  data-testid="button-apply-job-modal"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}