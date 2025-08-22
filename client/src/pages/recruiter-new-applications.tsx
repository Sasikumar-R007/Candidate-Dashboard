import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from "wouter";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, User, Download, Star, CheckCircle, XCircle } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  location: string;
  experience: string;
  appliedDate: string;
  status: 'New' | 'Reviewed' | 'Shortlisted' | 'Rejected';
  skills: string[];
  currentCompany: string;
  education: string;
  resumeUrl: string;
  profilePicture?: string;
  rating: number;
}

const newApplications: Candidate[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 9876543210',
    jobTitle: 'Senior Full Stack Developer',
    company: 'TechCorp Inc.',
    location: 'Bangalore, India',
    experience: '6 years',
    appliedDate: '2 hours ago',
    status: 'New',
    skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
    currentCompany: 'Microsoft',
    education: 'B.Tech Computer Science',
    resumeUrl: '#',
    rating: 4.5
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 9876543211',
    jobTitle: 'DevOps Engineer',
    company: 'CloudBase Solutions',
    location: 'Mumbai, India',
    experience: '4 years',
    appliedDate: '5 hours ago',
    status: 'New',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    currentCompany: 'Amazon',
    education: 'M.Tech Information Technology',
    resumeUrl: '#',
    rating: 4.8
  },
  {
    id: '3',
    name: 'Amit Singh',
    email: 'amit.singh@email.com',
    phone: '+91 9876543212',
    jobTitle: 'UI/UX Designer',
    company: 'DesignMasters',
    location: 'Remote',
    experience: '3 years',
    appliedDate: '1 day ago',
    status: 'Reviewed',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing'],
    currentCompany: 'Adobe',
    education: 'B.Des Visual Communication',
    resumeUrl: '#',
    rating: 4.2
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha.patel@email.com',
    phone: '+91 9876543213',
    jobTitle: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Hyderabad, India',
    experience: '5 years',
    appliedDate: '1 day ago',
    status: 'New',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas'],
    currentCompany: 'Google',
    education: 'M.Sc Data Science',
    resumeUrl: '#',
    rating: 4.9
  },
  {
    id: '5',
    name: 'Karan Verma',
    email: 'karan.verma@email.com',
    phone: '+91 9876543214',
    jobTitle: 'Frontend Developer',
    company: 'WebSolutions Ltd.',
    location: 'Chennai, India',
    experience: '2.5 years',
    appliedDate: '6 hours ago',
    status: 'New',
    skills: ['React', 'JavaScript', 'CSS3', 'HTML5', 'Redux'],
    currentCompany: 'Infosys',
    education: 'BCA',
    resumeUrl: '#',
    rating: 3.8
  },
  {
    id: '6',
    name: 'Neha Gupta',
    email: 'neha.gupta@email.com',
    phone: '+91 9876543215',
    jobTitle: 'Backend Developer',
    company: 'ServerTech Inc.',
    location: 'Pune, India',
    experience: '4 years',
    appliedDate: '3 hours ago',
    status: 'New',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Microservices'],
    currentCompany: 'TCS',
    education: 'B.Tech Computer Engineering',
    resumeUrl: '#',
    rating: 4.3
  },
  {
    id: '7',
    name: 'Vikash Yadav',
    email: 'vikash.yadav@email.com',
    phone: '+91 9876543216',
    jobTitle: 'Product Manager',
    company: 'InnovateTech',
    location: 'Gurgaon, India',
    experience: '6 years',
    appliedDate: '4 hours ago',
    status: 'Shortlisted',
    skills: ['Product Strategy', 'Agile', 'Analytics', 'Roadmapping', 'Leadership'],
    currentCompany: 'Flipkart',
    education: 'MBA + B.Tech',
    resumeUrl: '#',
    rating: 4.6
  },
  {
    id: '8',
    name: 'Pooja Reddy',
    email: 'pooja.reddy@email.com',
    phone: '+91 9876543217',
    jobTitle: 'Mobile App Developer',
    company: 'MobileFirst Solutions',
    location: 'Kochi, India',
    experience: '3 years',
    appliedDate: '8 hours ago',
    status: 'New',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'JavaScript'],
    currentCompany: 'Wipro',
    education: 'B.Tech Electronics',
    resumeUrl: '#',
    rating: 4.1
  }
];

export default function RecruiterNewApplications() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'shortlisted' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [candidates, setCandidates] = useState(newApplications);
  const candidatesPerPage = 6;

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.currentCompany.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const currentCandidates = filteredCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Reviewed': 'bg-yellow-100 text-yellow-800',
      'Shortlisted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const updateCandidateStatus = (candidateId: string, newStatus: 'New' | 'Reviewed' | 'Shortlisted' | 'Rejected') => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, status: newStatus }
          : candidate
      )
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} className="fill-yellow-400 text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => setLocation('/recruiter')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">New Applications</h1>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {filteredCandidates.length} Candidates
          </span>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search candidates..."
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
              All
            </Button>
            <Button
              onClick={() => setStatusFilter('new')}
              variant={statusFilter === 'new' ? 'default' : 'outline'}
              size="sm"
            >
              New
            </Button>
            <Button
              onClick={() => setStatusFilter('reviewed')}
              variant={statusFilter === 'reviewed' ? 'default' : 'outline'}
              size="sm"
            >
              Reviewed
            </Button>
            <Button
              onClick={() => setStatusFilter('shortlisted')}
              variant={statusFilter === 'shortlisted' ? 'default' : 'outline'}
              size="sm"
            >
              Shortlisted
            </Button>
          </div>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {candidate.profilePicture ? (
                    <img
                      src={candidate.profilePicture}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {renderStars(candidate.rating)}
                      </div>
                      <span className="text-sm text-gray-500">({candidate.rating})</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`}>
                  {candidate.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={14} />
                  <span>Applied for: <span className="font-medium">{candidate.jobTitle}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-3.5 h-3.5" />
                  <span>Current: <span className="font-medium">{candidate.currentCompany}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{candidate.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>Applied {candidate.appliedDate}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="font-medium">Experience:</span> {candidate.experience}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="font-medium">Education:</span> {candidate.education}
                </div>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 4 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{candidate.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Mail size={14} />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Phone size={14} />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download size={14} />
                  Resume
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateCandidateStatus(candidate.id, 'Shortlisted')}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                  >
                    <CheckCircle size={14} />
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCandidateStatus(candidate.id, 'Rejected')}
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 flex items-center gap-1"
                  >
                    <XCircle size={14} />
                    Reject
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCandidateStatus(candidate.id, 'Reviewed')}
                  disabled={candidate.status === 'Reviewed'}
                >
                  {candidate.status === 'Reviewed' ? 'Reviewed' : 'Mark as Reviewed'}
                </Button>
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

// Simple Building icon component since lucide-react might not have it
const Building = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);