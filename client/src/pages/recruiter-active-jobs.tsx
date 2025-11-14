import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Briefcase, Edit, Trash2 } from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  posted: string;
  applications: number;
  status: 'Active' | 'Closed' | 'Draft';
  description: string;
  requirements: string[];
  skills: string[];
}

const activeJobs: JobListing[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Inc.',
    location: 'Bangalore, India',
    type: 'Full Time',
    experience: '5-8 Years',
    salary: '25-35 LPA',
    posted: '3 days ago',
    applications: 24,
    status: 'Active',
    description: 'We are seeking a talented Senior Full Stack Developer to join our dynamic team...',
    requirements: ['5+ years of experience', 'Strong React/Node.js skills', 'Team leadership experience'],
    skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript']
  },
  {
    id: '2',
    title: 'DevOps Engineer',
    company: 'CloudBase Solutions',
    location: 'Mumbai, India',
    type: 'Full Time',
    experience: '3-5 Years',
    salary: '18-25 LPA',
    posted: '1 week ago',
    applications: 42,
    status: 'Active',
    description: 'Join our infrastructure team to build and maintain scalable cloud solutions...',
    requirements: ['AWS/Azure experience', 'Docker & Kubernetes', 'CI/CD pipeline expertise'],
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform']
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'DesignMasters',
    location: 'Remote',
    type: 'Full Time',
    experience: '2-4 Years',
    salary: '12-18 LPA',
    posted: '5 days ago',
    applications: 31,
    status: 'Active',
    description: 'Create beautiful and intuitive user experiences for our products...',
    requirements: ['Portfolio of design work', 'Figma/Adobe XD proficiency', 'User research experience'],
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing']
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Hyderabad, India',
    type: 'Full Time',
    experience: '4-6 Years',
    salary: '22-30 LPA',
    posted: '2 weeks ago',
    applications: 18,
    status: 'Active',
    description: 'Work with large datasets to derive insights and build predictive models...',
    requirements: ['Python/R expertise', 'Machine Learning background', 'SQL proficiency'],
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas']
  },
  {
    id: '5',
    title: 'Frontend Developer',
    company: 'WebSolutions Ltd.',
    location: 'Chennai, India',
    type: 'Full Time',
    experience: '2-3 Years',
    salary: '8-12 LPA',
    posted: '4 days ago',
    applications: 67,
    status: 'Active',
    description: 'Build responsive and interactive web applications using modern frameworks...',
    requirements: ['React/Vue.js experience', 'Responsive design skills', 'JavaScript proficiency'],
    skills: ['React', 'JavaScript', 'CSS3', 'HTML5', 'Redux']
  },
  {
    id: '6',
    title: 'Backend Developer',
    company: 'ServerTech Inc.',
    location: 'Pune, India',
    type: 'Full Time',
    experience: '3-5 Years',
    salary: '15-22 LPA',
    posted: '1 week ago',
    applications: 29,
    status: 'Active',
    description: 'Develop robust backend systems and APIs for our applications...',
    requirements: ['Java/Node.js experience', 'Database design', 'Microservices architecture'],
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Microservices']
  },
  {
    id: '7',
    title: 'Product Manager',
    company: 'InnovateTech',
    location: 'Gurgaon, India',
    type: 'Full Time',
    experience: '5-7 Years',
    salary: '28-40 LPA',
    posted: '6 days ago',
    applications: 15,
    status: 'Active',
    description: 'Lead product strategy and development for our flagship products...',
    requirements: ['Product management experience', 'Technical background', 'Stakeholder management'],
    skills: ['Product Strategy', 'Agile', 'Analytics', 'Roadmapping', 'Leadership']
  },
  {
    id: '8',
    title: 'Mobile App Developer',
    company: 'MobileFirst Solutions',
    location: 'Kochi, India',
    type: 'Full Time',
    experience: '2-4 Years',
    salary: '10-16 LPA',
    posted: '3 days ago',
    applications: 38,
    status: 'Active',
    description: 'Develop native and cross-platform mobile applications...',
    requirements: ['React Native/Flutter experience', 'iOS/Android development', 'API integration'],
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'JavaScript']
  },
  {
    id: '9',
    title: 'QA Engineer',
    company: 'QualityFirst Ltd.',
    location: 'Ahmedabad, India',
    type: 'Full Time',
    experience: '3-5 Years',
    salary: '12-18 LPA',
    posted: '1 week ago',
    applications: 22,
    status: 'Active',
    description: 'Ensure product quality through comprehensive testing strategies...',
    requirements: ['Manual and automation testing', 'Test framework experience', 'Bug tracking tools'],
    skills: ['Selenium', 'TestNG', 'Postman', 'JIRA', 'Python']
  },
  {
    id: '10',
    title: 'Business Analyst',
    company: 'AnalyticsCorp',
    location: 'Delhi, India',
    type: 'Full Time',
    experience: '3-6 Years',
    salary: '14-20 LPA',
    posted: '5 days ago',
    applications: 33,
    status: 'Active',
    description: 'Analyze business requirements and translate them into technical solutions...',
    requirements: ['Business analysis experience', 'Requirements gathering', 'Stakeholder communication'],
    skills: ['Business Analysis', 'SQL', 'Excel', 'Tableau', 'Process Mapping']
  }
];

export default function RecruiterActiveJobs() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const filteredJobs = activeJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Closed': 'bg-red-100 text-red-800',
      'Draft': 'bg-yellow-100 text-yellow-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setLocation('/recruiter-login-2');
              }
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Active Jobs</h1>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {filteredJobs.length} Jobs
          </span>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setStatusFilter('all')}
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All Jobs
            </Button>
            <Button
              onClick={() => setStatusFilter('active')}
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
            >
              Active
            </Button>
            <Button
              onClick={() => setStatusFilter('closed')}
              variant={statusFilter === 'closed' ? 'default' : 'outline'}
              size="sm"
            >
              Closed
            </Button>
            <Button
              onClick={() => setStatusFilter('draft')}
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
            >
              Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="p-6">
        <div className="space-y-4">
          {currentJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{job.company}</div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} />
                      {job.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Posted {job.posted}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Edit size={14} />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-3">{job.description}</p>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">{job.applications}</span> applications
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">Type: {job.type}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Applications
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Manage Job
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}