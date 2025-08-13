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
    experience: '5-8 Years',
    salary: '25 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['CICD', 'Docker', 'Azure'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 3,
    background: 'bg-gradient-to-br from-green-100 to-green-200',
    isHot: true
  },
  {
    id: '2', 
    company: 'Microsoft Corp.',
    title: 'Senior Software Engineer',
    description: 'Join our innovative team building next-generation cloud solutions.',
    experience: '3-5 Years',
    salary: '20 LPA',
    location: 'Mumbai',
    type: 'Full Time',
    workType: 'Hybrid',
    skills: ['React', 'Node.js', 'TypeScript'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 1,
    background: 'bg-gradient-to-br from-purple-100 to-purple-200',
    isHot: false
  },
  {
    id: '3',
    company: 'Amazon Web Services',
    title: 'DevOps Engineer',
    description: 'Build and maintain scalable infrastructure for millions of users.',
    experience: '4-6 Years',
    salary: '30 LPA',
    location: 'Hyderabad',
    type: 'Full Time',
    workType: 'Remote',
    skills: ['AWS', 'Kubernetes', 'Terraform'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 2,
    background: 'bg-gradient-to-br from-orange-100 to-orange-200',
    isHot: true
  },
  {
    id: '4',
    company: 'Meta Platforms',
    title: 'Frontend Developer',
    description: 'Create amazing user experiences for billions of users worldwide.',
    experience: '2-4 Years',
    salary: '18 LPA',
    location: 'Delhi',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['React', 'JavaScript', 'CSS'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 5,
    background: 'bg-gradient-to-br from-blue-100 to-blue-200',
    isHot: false
  },
  {
    id: '5',
    company: 'Netflix Inc.',
    title: 'Data Scientist',
    description: 'Drive data-driven decisions to enhance user experience.',
    experience: '6-8 Years',
    salary: '35 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    workType: 'Hybrid',
    skills: ['Python', 'Machine Learning', 'SQL'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 1,
    background: 'bg-gradient-to-br from-pink-100 to-pink-200',
    isHot: true
  },
  {
    id: '6',
    company: 'Adobe Systems',
    title: 'UI/UX Designer',
    description: 'Design intuitive and beautiful digital experiences.',
    experience: '3-5 Years',
    salary: '22 LPA',
    location: 'Pune',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['Figma', 'Adobe XD', 'Prototyping'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 4,
    background: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    isHot: false
  },
  {
    id: '7',
    company: 'Salesforce Inc.',
    title: 'Backend Developer',
    description: 'Build robust and scalable backend systems.',
    experience: '4-7 Years',
    salary: '28 LPA',
    location: 'Chennai',
    type: 'Full Time',
    workType: 'Remote',
    skills: ['Java', 'Spring Boot', 'PostgreSQL'],
    logo: '/api/placeholder/60/60',
    isRemote: true,
    postedDays: 2,
    background: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
    isHot: true
  },
  {
    id: '8',
    company: 'Spotify Technology',
    title: 'Mobile Developer',
    description: 'Develop mobile apps used by millions of music lovers.',
    experience: '2-5 Years',
    salary: '24 LPA',
    location: 'Gurgaon',
    type: 'Full Time',
    workType: 'Hybrid',
    skills: ['React Native', 'iOS', 'Android'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 6,
    background: 'bg-gradient-to-br from-teal-100 to-teal-200',
    isHot: false
  },
  {
    id: '9',
    company: 'Tesla Inc.',
    title: 'Full Stack Developer',
    description: 'Work on cutting-edge automotive technology solutions.',
    experience: '5-8 Years',
    salary: '32 LPA',
    location: 'Bangalore',
    type: 'Full Time',
    workType: 'Work from office',
    skills: ['Python', 'React', 'MongoDB'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 3,
    background: 'bg-gradient-to-br from-red-100 to-red-200',
    isHot: true
  },
  {
    id: '10',
    company: 'Airbnb Inc.',
    title: 'Product Manager',
    description: 'Lead product strategy for our global marketplace.',
    experience: '6-9 Years',
    salary: '40 LPA',
    location: 'Mumbai',
    type: 'Full Time',
    workType: 'Hybrid',
    skills: ['Product Strategy', 'Analytics', 'Leadership'],
    logo: '/api/placeholder/60/60',
    isRemote: false,
    postedDays: 1,
    background: 'bg-gradient-to-br from-cyan-100 to-cyan-200',
    isHot: false
  }
];

export default function JobBoardTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [jobFilter, setJobFilter] = useState<'all' | 'hot' | 'saved'>('all');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    company: '',
    role: '',
    experience: '',
    location: '',
    workType: '',
    skills: ''
  });
  const itemsPerPage = 5;

  const handleViewMore = (job: JobListing) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      company: '',
      role: '',
      experience: '',
      location: '',
      workType: '',
      skills: ''
    });
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSavedJobs = new Set(prev);
      if (newSavedJobs.has(jobId)) {
        newSavedJobs.delete(jobId);
      } else {
        newSavedJobs.add(jobId);
      }
      return newSavedJobs;
    });
  };

  const filteredJobs = jobListings.filter(job => {
    // Filter by job type
    if (jobFilter === 'hot' && !job.isHot) return false;
    if (jobFilter === 'saved' && !savedJobs.has(job.id)) return false;
    
    // Filter by search query
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply additional filters
    const matchesCompany = !filters.company || job.company.toLowerCase().includes(filters.company.toLowerCase());
    const matchesRole = !filters.role || job.title.toLowerCase().includes(filters.role.toLowerCase());
    const matchesExperience = !filters.experience || job.experience.toLowerCase().includes(filters.experience.toLowerCase());
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesWorkType = !filters.workType || job.workType.toLowerCase().includes(filters.workType.toLowerCase());
    const matchesSkills = !filters.skills || job.skills.some(skill => 
      skill.toLowerCase().includes(filters.skills.toLowerCase())
    );
    
    return matchesSearch && matchesCompany && matchesRole && matchesExperience && 
           matchesLocation && matchesWorkType && matchesSkills;
  });

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Job Board</h1>
        
        {/* Search Bar and Controls - Same Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search Jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              data-testid="input-search-jobs"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* Job Type Toggle and Filters */}
          <div className="flex items-center gap-4">
            {/* Saved Jobs Button */}
            <button
              onClick={() => setJobFilter('saved')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                jobFilter === 'saved'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600'
              }`}
              data-testid="button-saved-jobs"
            >
              <i className="fas fa-bookmark mr-2"></i>
              Saved Jobs ({savedJobs.size})
            </button>

            {/* Hot Jobs / All Jobs Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setJobFilter('hot')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  jobFilter === 'hot'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                data-testid="button-hot-jobs"
              >
                <i className="fas fa-fire mr-2"></i>
                Hot Jobs
              </button>
              <button
                onClick={() => setJobFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  jobFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
                data-testid="button-all-jobs"
              >
                All Jobs
              </button>
            </div>

            {/* Add Filters Button */}
            <Button 
              onClick={() => setShowFilterModal(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100" 
              variant="ghost" 
              size="sm"
              data-testid="button-add-filters"
            >
              <i className="fas fa-sliders-h mr-2"></i>
              Add Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="p-6">
        <div className="space-y-4">
          {currentJobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden m-4">
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
                    onClick={() => toggleSaveJob(job.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                      savedJobs.has(job.id) 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                    data-testid={`button-save-${job.id}`}
                  >
                    <i className={`${savedJobs.has(job.id) ? 'fas fa-bookmark' : 'far fa-bookmark'} text-white`}></i>
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
                    <Button 
                      onClick={() => handleViewMore(job)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium" 
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

      {/* Job Details Modal - Full Width Right Side */}
      {showJobModal && selectedJob && (
        <div className="fixed top-0 left-64 right-0 bottom-0 z-50 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl">
          <div className="h-full flex flex-col">
            {/* Close Button */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Job Details</h2>
              <button
                onClick={() => setShowJobModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <i className="fas fa-times text-gray-500 dark:text-gray-400"></i>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-1">
              {/* Job Card Header - Same as List */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 m-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex">
                    {/* Company Logo Section */}
                    <div className="w-24 flex items-center justify-center">
                      <div className={`${selectedJob.background} rounded-xl p-3 flex flex-col items-center justify-center w-20 h-16`}>
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
                          <i className="fas fa-bookmark text-white text-xs"></i>
                        </div>
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
                        >
                          View Less
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Sections - Separate Boxes */}
                <div className="px-4 pb-4 space-y-4">
                  {/* About Company Box */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
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
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Role Definition:</h5>
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
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
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

                  {/* Skills Required - Three Colored Boxes */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700">
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
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Secondary Skills</h6>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div>Corporate Sales</div>
                        <div>Resource Manager</div>
                        <div>Customer Interaction</div>
                        <div>Customer Service</div>
                        <div>Direct sales</div>
                      </div>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
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

            {/* Apply Button Footer */}
            <div className="bg-blue-600 p-4 flex justify-center border-t border-gray-200 dark:border-gray-700">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium border-0">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Jobs</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <Input
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                placeholder="e.g. Google, Microsoft"
                data-testid="input-filter-company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <Input
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                placeholder="e.g. Software Engineer, Designer"
                data-testid="input-filter-role"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
              <Input
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                placeholder="e.g. 2-4 Years, 5-8 Years"
                data-testid="input-filter-experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <Input
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="e.g. Bangalore, Mumbai"
                data-testid="input-filter-location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Type</label>
              <Input
                value={filters.workType}
                onChange={(e) => setFilters({ ...filters, workType: e.target.value })}
                placeholder="e.g. Remote, Hybrid, Work from office"
                data-testid="input-filter-work-type"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
              <Input
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                placeholder="e.g. React, Python, Docker"
                data-testid="input-filter-skills"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={clearFilters}
                variant="outline" 
                className="flex-1"
                data-testid="button-clear-filters"
              >
                Clear All
              </Button>
              <Button 
                onClick={applyFilters}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-apply-filters"
              >
                Search
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}