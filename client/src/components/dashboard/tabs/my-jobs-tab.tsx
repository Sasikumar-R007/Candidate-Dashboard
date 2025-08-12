import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, MapPin, Flame } from 'lucide-react';
import type { JobApplication } from '@shared/schema';

interface MyJobsTabProps {
  className?: string;
}

// Mock job suggestions data based on the design
const jobSuggestions = [
  {
    id: '1',
    company: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png',
    title: 'Cloud Engineer',
    salary: '₹ 12 LPA',
    location: 'Bengaluru',
    workMode: 'Work from office',
    skills: ['CI/CD', 'Docker', 'Azure'],
    bgColor: 'bg-blue-50'
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
    bgColor: 'bg-green-50'
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
    bgColor: 'bg-red-50'
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
    bgColor: 'bg-purple-50'
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
    bgColor: 'bg-yellow-50'
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
    bgColor: 'bg-red-100'
  }
];

export default function MyJobsTab({ className }: MyJobsTabProps) {
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className={`space-y-8 ${className}`}>
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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

        {/* See all button for Applied Jobs */}
        {(jobApplications as JobApplication[]).length > 5 && !showAllJobs && (
          <div className="mt-4 text-right">
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-700 p-0"
              onClick={() => setShowAllJobs(true)}
            >
              See all
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
            <Card key={job.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
              <CardContent className="p-0">
                {/* Company Logo Section */}
                <div className={`${job.bgColor} p-6 text-center`}>
                  <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-10 h-8 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{job.company}</h3>
                </div>

                {/* Job Details Section */}
                <div className="p-6">
                  {/* Product Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs px-2 py-1">
                      Product
                    </Badge>
                    <div className="w-4 h-4 text-orange-500">
                      <Flame className="w-full h-full" />
                    </div>
                  </div>

                  {/* Job Title */}
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{job.title}</h4>

                  {/* Salary and Location - Same Row */}
                  <div className="flex items-center justify-between mb-1">
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

                  {/* View Job Button */}
                  <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg">
                    View Job
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
              className={`w-8 h-8 p-0 ${
                currentPage === i + 1 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0 ml-2">
            See all
          </Button>
        </div>

        {/* See all button for Applied Jobs at bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-right">
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-700 p-0"
            >
              See all Applied Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}