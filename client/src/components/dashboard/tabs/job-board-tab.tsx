import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Edit, Heart } from "lucide-react";
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

  const filteredJobs = jobListings.filter(job => {
    // Filter by job type
    if (jobFilter === 'hot' && !job.isHot) return false;
    if (jobFilter === 'saved' && !savedJobs.has(`${job.title}-${job.company}`)) return false;
    
    // Filter by search query
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

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
          {filteredJobs.map((job) => (
            <Card key={job.id} className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Company Logo Section */}
                  <div className={`w-32 ${job.background} rounded-l-lg p-6 flex flex-col items-center justify-center`}>
                    <img
                      src={job.logo}
                      alt={`${job.company} logo`}
                      className="w-16 h-16 object-contain mb-2"
                    />
                    <div className="text-xs font-bold text-gray-700 text-center">
                      {job.company.split(' ')[0]}
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.company}</h3>
                          {job.isHot && (
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          )}
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                          {job.title}
                          <span className="text-orange-500">🔥</span>
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{job.experience}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            ₹ <span className="font-semibold">{job.salary}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span>{job.workType}</span>
                          <span>{job.type}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Product</Badge>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">B2B</Badge>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">{job.type}</Badge>
                          <span className="text-sm text-gray-500">
                            Open Positions • 2
                          </span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill, idx) => (
                            <Badge 
                              key={idx}
                              className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-xs text-gray-500">
                          Posted: {job.postedDays} days ago
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => toggleSaveJob(job)}
                          className={`p-2 rounded transition-colors ${
                            savedJobs.has(`${job.title}-${job.company}`)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <Button className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded">
                          View More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}