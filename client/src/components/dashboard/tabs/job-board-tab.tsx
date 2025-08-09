import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JobListing {
  id: string;
  company: string;
  title: string;
  description: string;
  experience: string;
  salary: string;
  location: string;
  type: string;
  skills: string[];
  logo: string;
  isRemote: boolean;
  postedDays: number;
  background: string;
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
    skills: ['CICD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 3,
    background: 'bg-gradient-to-br from-green-100 to-green-200'
  },
  {
    id: '2', 
    company: 'Google Technologies Inc.',
    title: 'Cloud Engineer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    skills: ['CICD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 3,
    background: 'bg-gradient-to-br from-purple-100 to-purple-200'
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
    skills: ['CICD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 3,
    background: 'bg-gradient-to-br from-orange-100 to-orange-200'
  },
  {
    id: '4',
    company: 'Google Technologies Inc.',
    title: 'Cloud Engineer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    skills: ['CICD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 3,
    background: 'bg-gradient-to-br from-blue-100 to-blue-200'
  },
  {
    id: '5',
    company: 'Google Technologies Inc.',
    title: 'Cloud Engineer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    skills: ['CICD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 3,
    background: 'bg-gradient-to-br from-pink-100 to-pink-200'
  },
  {
    id: '6',
    company: 'Google Technologies Inc.',
    title: 'Frontend Developer',
    description: 'Technology Product based hyper growth, innovative company.',
    experience: '8 Years',
    salary: '25 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    skills: ['CICD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 3,
    background: 'bg-gradient-to-br from-yellow-100 to-yellow-200'
  }
];

export default function JobBoardTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredJobs = jobListings.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job Board</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500 bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-sm font-medium">Hot Jobs</span>
              <span className="text-blue-500 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-sm font-medium">All Jobs</span>
            </div>
            <Button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100" variant="ghost" size="sm">
              <i className="fas fa-filter mr-2"></i>
              Add Filters
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search Jobs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full max-w-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            data-testid="input-search-jobs"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Job Listings */}
      <div className="p-6">
        <div className="space-y-4">
          {currentJobs.map((job) => (
            <div key={job.id} className={`${job.background} dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Company Logo */}
                  <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                    <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">G</div>
                  </div>
                  
                  {/* Job Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{job.company}</h3>
                      <i className="fas fa-bookmark text-red-500" data-testid="icon-bookmark"></i>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{job.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{job.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-briefcase"></i>
                        {job.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-rupee-sign"></i>
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-map-marker-alt"></i>
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-clock"></i>
                        {job.type}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Open Positions - 2</span>
                      <div className="flex gap-2">
                        {job.skills.map((skill, index) => (
                          <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Posted: {job.postedDays} days ago</span>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm" data-testid="button-view-more">
                        View More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {[1, 2, 3, 4, 5].map((page) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}