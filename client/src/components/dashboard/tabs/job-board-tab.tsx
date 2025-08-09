import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const itemsPerPage = 6;

  const handleViewMore = (job: JobListing) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

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
            <div key={job.id} className={`${job.background} dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 relative`}>
              {/* Bookmark Icon - Top Right */}
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bookmark text-white text-sm" data-testid="icon-bookmark"></i>
                </div>
              </div>

              <div className="flex items-start gap-6">
                {/* Large Company Logo */}
                <div className={`w-32 h-32 ${job.background} rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-600 flex-shrink-0`}>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-700 dark:text-gray-300 mb-2">G</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Google</div>
                  </div>
                </div>
                
                {/* Job Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">{job.company}</h3>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    {job.title}
                    <i className="fas fa-fire text-red-500 text-lg"></i>
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{job.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                      Work from office
                    </span>
                    <span className="font-medium">{job.type}</span>
                  </div>

                  {/* Job Tags */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                      Open Positions ~ 2
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                      Product
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                      B2B
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                      Full Time
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex items-center gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Posted: {job.postedDays} days ago</span>
                    <Button 
                      onClick={() => handleViewMore(job)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium" 
                      size="sm" 
                      data-testid="button-view-more"
                    >
                      View More
                    </Button>
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

      {/* Job Details Modal */}
      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-20 h-20 ${selectedJob.background} rounded-xl flex items-center justify-center`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">G</div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Google</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{selectedJob.company}</h3>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedJob.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedJob.description}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bookmark text-white text-sm"></i>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-briefcase"></i>
                    {selectedJob.experience}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-rupee-sign"></i>
                    {selectedJob.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-map-marker-alt"></i>
                    {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-clock"></i>
                    Work from office
                  </span>
                  <span className="font-medium">{selectedJob.type}</span>
                </div>

                {/* Job Tags */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                    Open Positions ~ 2
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                    Product
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                    B2B
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                    Full Time
                  </span>
                </div>

                {/* Skills */}
                <div className="flex items-center gap-2 mb-6">
                  {selectedJob.skills.map((skill, index) => (
                    <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* About Company */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">About Company</h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Google, from a subsidiary of Alphabet Inc., is a multinational technology company known for 
                    its Internet search engine, online advertising technologies, cloud computing, and more. 
                    Founded in 1998 by Larry Page and Sergey Brin while they were PhD students 
                    at Stanford University, Google's core mission is to organize the world's information and 
                    make it universally accessible and useful.
                  </p>
                </div>

                {/* Role Definition */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Role Definition</h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                    We are seeking a skilled Cloud Engineer to join our team and work with our engineering team to 
                    ensure that software components are expertly designed and 
                    built to specification.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    A Cloud Engineer's responsibilities include: deploying and debugging systems, as well as 
                    executing new cloud initiatives. experience working with Linux/Unix administration and 
                    connecting various server over the roots of our organization and customers.
                  </p>
                </div>

                {/* Key Responsibilities */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Responsibilities</h5>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Implementing and deploy enabled cloud-based systems.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Develop our applications and services in accordance with best practices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Support the global technology team and infrastructure team in accordance with company security policies to ensure our cloud infrastructure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Identify, analyze and identify new technologies that could support deployment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Regularly review existing systems and make recommendations for improvements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Interact with clients, provide expertise support and ensure client satisfaction</span>
                    </li>
                  </ul>
                </div>

                {/* Skills Required */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Must Have Skills</h6>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>Business Development</div>
                      <div>Marketing Analysis</div>
                      <div>Lead Generation</div>
                      <div>Business Process</div>
                      <div>Digital Marketing</div>
                      <div>SEO</div>
                    </div>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Good-to-Have</h6>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>Corporate Sales</div>
                      <div>Resource Manager</div>
                      <div>Customer Relations</div>
                      <div>Key Account Mgt</div>
                      <div>Direct sales</div>
                    </div>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Nice-to-Have</h6>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>E-tech communication</div>
                      <div>Data Management</div>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="flex justify-center pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                    Apply
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}