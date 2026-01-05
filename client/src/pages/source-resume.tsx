import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Briefcase,
  MapPin,
  GraduationCap,
  Clock,
  RotateCw,
  ArrowRight,
  Search,
  Lightbulb,
  Building,
  DollarSign,
  Calendar,
  User,
  X,
  Check,
  Star,
  Bookmark,
  Phone,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Download,
  Send,
  Database,
  UserPlus,
  ArrowUp,
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import type { Employee } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Location data (same as Upload Resume)
const locations = [
  { value: 'chennai', label: 'Chennai' },
  { value: 'coimbatore', label: 'Coimbatore' },
  { value: 'madurai', label: 'Madurai' },
  { value: 'trichy', label: 'Trichy' },
  { value: 'salem', label: 'Salem' },
  { value: 'tirunelveli', label: 'Tirunelveli' },
  { value: 'erode', label: 'Erode' },
  { value: 'vellore', label: 'Vellore' },
  { value: 'dindigul', label: 'Dindigul' },
  { value: 'thanjavur', label: 'Thanjavur' },
  { value: 'tiruppur', label: 'Tiruppur' },
  { value: 'karur', label: 'Karur' },
  { value: 'hosur', label: 'Hosur' },
  { value: 'nagercoil', label: 'Nagercoil' },
  { value: 'kanchipuram', label: 'Kanchipuram' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'pune', label: 'Pune' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'kolkata', label: 'Kolkata' },
  { value: 'ahmedabad', label: 'Ahmedabad' },
  { value: 'jaipur', label: 'Jaipur' },
  { value: 'surat', label: 'Surat' },
  { value: 'lucknow', label: 'Lucknow' },
  { value: 'nagpur', label: 'Nagpur' },
  { value: 'indore', label: 'Indore' },
  { value: 'gurgaon', label: 'Gurgaon' },
  { value: 'noida', label: 'Noida' },
  { value: 'kochi', label: 'Kochi' },
  { value: 'visakhapatnam', label: 'Visakhapatnam' },
  { value: 'vadodara', label: 'Vadodara' },
  { value: 'remote', label: 'Remote' },
];

// Sample data for dropdowns
const allRoles = [
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Engineer",
  "DevOps Engineer",
  "Software Engineer",
  "Senior Software Engineer",
  "Tech Lead",
  "Product Manager",
  "Data Scientist",
  "Machine Learning Engineer",
  "UI/UX Designer",
  "QA Engineer",
  "System Administrator",
  "Cloud Architect",
];

const allCompanies = [
  "Tech Solutions Inc.",
  "Freshworks",
  "Google",
  "Amazon",
  "Microsoft",
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture",
  "IBM",
  "Oracle",
  "Cognizant",
];

const allNoticePeriods = [
  "Immediate",
  "15 days",
  "30 days",
  "45 days",
  "60 days",
  "90 days",
  "Any",
];

const allAvailability = [
  "Immediate",
  "15 days",
  "30 days",
  "60 days",
  "90 days",
  "Any",
];

const allEducationUG = [
  "BCA",
  "B.Tech",
  "BE",
  "B.Sc",
  "B.Com",
  "BA",
  "BBA",
  "B.E",
  "B.Sc IT",
  "BCS",
];

const allEducationPG = [
  "MCA",
  "M.Tech",
  "ME",
  "M.Sc",
  "MBA",
  "MS",
  "M.E",
  "PGDM",
  "M.Sc IT",
];

const allEmploymentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];

const allJobTypes = [
  "Permanent",
  "Contract",
  "Temporary",
  "Internship",
  "Any",
];

const allWorkPermits = [
  "India",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Any",
];

const allPedigreeLevels = [
  "Tier 1",
  "Tier 2",
  "Tier 3",
  "Others",
];

const allCompanyLevels = [
  "Startup",
  "Mid-size",
  "Enterprise",
  "MNC",
];

const allCompanySectors = [
  "Technology",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Consulting",
  "Manufacturing",
  "Education",
];

const allProductServices = [
  "SaaS",
  "Product",
  "Service",
  "Hybrid",
];

const allProductCategories = [
  "B2B",
  "B2C",
  "B2B2C",
];

const allSkills = [
  "React",
  "Node.js",
  "Python",
  "AWS",
  "MongoDB",
  "Express",
  "Docker",
  "Redis",
  "TypeScript",
  "Kubernetes",
  "Java",
  "JavaScript",
  "Angular",
  "Vue.js",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "Flutter",
  "Dart",
  "Swift",
  "Kotlin",
  "Go",
  "Ruby",
  "PHP",
  "C++",
  "C#",
  ".NET",
  "Spring",
  "Django",
  "Flask",
  "Laravel",
  "TensorFlow",
  "PyTorch",
  "Machine Learning",
  "Data Science",
];

// Utility function to highlight search terms in text
const highlightText = (text: string, searchTerms: string[]): React.ReactNode => {
  if (!searchTerms || searchTerms.length === 0 || !text) {
    return text;
  }

  // Create a regex pattern that matches any of the search terms (case-insensitive)
  const escapedTerms = searchTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  
  const parts = text.split(pattern);
  
  return parts.map((part, index) => {
    const isMatch = searchTerms.some(term => 
      part.toLowerCase() === term.toLowerCase()
    );
    
    if (isMatch) {
      return (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
};

// Extract search terms from query string
const extractSearchTerms = (query: string): string[] => {
  if (!query || !query.trim()) return [];
  
  // Split by spaces and filter out empty strings
  return query.trim().split(/\s+/).filter(term => term.length > 0);
};

interface FilterState {
  keywords: string[];
  excludedKeywords: string[];
  specificSkills: string[];
  searchQuery: string;
  booleanMode: boolean;
  experience: [number, number];
  ctcMin: string;
  ctcMax: string;
  location: string;
  role: string;
  noticePeriod: string;
  preferredLocation: string;
  company: string;
  excludedCompanies: string[];
  educationUG: string;
  educationPG: string;
  additionalDegrees: string[];
  employmentType: string;
  jobType: string;
  workPermit: string;
  candidateStatus: string;
  showWith: string[];
}

interface RecentSearch {
  id: string;
  keywords: string[];
  experience: [number, number];
  location: string;
  role: string;
  noticePeriod: string;
  timestamp: number;
}

const initialFilters: FilterState = {
  keywords: [],
  excludedKeywords: [],
  specificSkills: [],
  searchQuery: "",
  booleanMode: false,
  experience: [0, 15],
  ctcMin: "",
  ctcMax: "",
  location: "",
  role: "",
  noticePeriod: "",
  preferredLocation: "",
  company: "",
  excludedCompanies: [],
  educationUG: "",
  educationPG: "",
  additionalDegrees: [],
  employmentType: "",
  jobType: "",
  workPermit: "",
  candidateStatus: "all",
  showWith: [],
};

// Filterable Dropdown Component
interface FilterableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[] | string[];
  placeholder: string;
  icon?: React.ReactNode;
}

function FilterableDropdown({ value, onChange, options, placeholder, icon }: FilterableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  const optionsList = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
  
  const selectedLabel = optionsList.find(opt => opt.value === value)?.label || value || placeholder;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
    setInputValue("");
  };

  // Filter options based on input
  const filteredOptions = inputValue.trim()
    ? optionsList.filter(opt => 
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        opt.value.toLowerCase().includes(inputValue.toLowerCase())
      )
    : optionsList;

  const hasExactMatch = filteredOptions.some(opt => 
    opt.value.toLowerCase() === inputValue.trim().toLowerCase() ||
    opt.label.toLowerCase() === inputValue.trim().toLowerCase()
  );
  const showCustomOption = inputValue.trim() && !hasExactMatch;

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setInputValue("");
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-gray-200 rounded-lg h-10 font-normal text-gray-700 hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
            setInputValue("");
          }}
        >
          <span className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <span className="text-purple-600 flex-shrink-0">{icon}</span>}
            <span className="truncate">{selectedLabel}</span>
          </span>
          {value && (
            <X 
              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setOpen(false);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search or type ${placeholder.toLowerCase()}...`}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {showCustomOption && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => handleSelect(inputValue.trim())}
                  className="text-blue-600 font-medium"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Use "{inputValue.trim()}"
                </CommandItem>
              </CommandGroup>
            )}
            {filteredOptions.length > 0 ? (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              !showCustomOption && (
                <CommandEmpty>
                  No results found. Type to add a custom value.
                </CommandEmpty>
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface DatabaseCandidate {
  id: string;
  candidateId: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  location?: string;
  experience?: string;
  skills?: string;
  profilePicture?: string;
  education?: string;
  currentRole?: string;
  ctc?: string;
  ectc?: string;
  noticePeriod?: string;
  position?: string;
  pedigreeLevel?: string;
  companyLevel?: string;
  companySector?: string;
  productService?: string;
  productCategory?: string;
  productDomain?: string;
  employmentType?: string;
  createdAt: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  highestQualification?: string;
  collegeName?: string;
  preferredLocation?: string;
  resumeFile?: string;
  addedBy?: string;
}

interface CandidateDisplay {
  id: string;
  name: string;
  title: string;
  location: string;
  preferredLocation: string;
  experience: number;
  education: string;
  currentCompany: string;
  email: string;
  phone: string;
  ctc: string;
  skills: string[];
  summary: string;
  profilePic: string;
  noticePeriod: string;
  university: string;
  saved: boolean;
  pedigreeLevel: string;
  companyLevel: string;
  companySector: string;
  productService: string;
  productCategory: string;
  productDomain: string;
  employmentType: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  lastSeen: string;
  resumeFile?: string;
}

function mapDatabaseCandidateToDisplay(dbCandidate: DatabaseCandidate): CandidateDisplay {
  const skillsArray = dbCandidate.skills 
    ? dbCandidate.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  
  const experienceNum = dbCandidate.experience 
    ? parseFloat(dbCandidate.experience.replace(/[^\d.]/g, '')) || 0
    : 0;
  
  const createdDate = new Date(dbCandidate.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const lastSeen = diffHours < 1 ? 'Just now' : diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;

  return {
    id: dbCandidate.id,
    name: dbCandidate.fullName,
    title: dbCandidate.designation || dbCandidate.currentRole || dbCandidate.position || 'Not Available',
    location: dbCandidate.location || 'Not Available',
    preferredLocation: dbCandidate.preferredLocation || dbCandidate.location || 'Not Available',
    experience: experienceNum,
    education: dbCandidate.education || dbCandidate.highestQualification || 'Not Available',
    currentCompany: dbCandidate.company || 'Not Available',
    email: dbCandidate.email,
    phone: dbCandidate.phone || '',
    ctc: dbCandidate.ctc || dbCandidate.ectc || 'Not Available',
    skills: skillsArray,
    summary: `Experienced professional with a proven track record of delivering quality work on time. Interested in a role that values efficiency, ownership, and continuous learning.`,
    profilePic: dbCandidate.profilePicture || '',
    noticePeriod: dbCandidate.noticePeriod || 'Not Available',
    university: dbCandidate.collegeName || 'Not Available',
    saved: false,
    pedigreeLevel: dbCandidate.pedigreeLevel || '',
    companyLevel: dbCandidate.companyLevel || '',
    companySector: dbCandidate.companySector || '',
    productService: dbCandidate.productService || '',
    productCategory: dbCandidate.productCategory || '',
    productDomain: dbCandidate.productDomain || '',
    employmentType: dbCandidate.employmentType || '',
    linkedinUrl: dbCandidate.linkedinUrl,
    websiteUrl: dbCandidate.websiteUrl,
    portfolioUrl: dbCandidate.portfolioUrl,
    lastSeen,
    resumeFile: dbCandidate.resumeFile,
    candidateId: dbCandidate.candidateId,
    // Show "DB" tag only for candidates uploaded via Master Database (has resumeFile or addedBy)
    // Direct registrations (no resumeFile and no addedBy) should not have any tag
    isFromDatabase: !!(dbCandidate.resumeFile || dbCandidate.addedBy),
  };
}

// Sample candidates for testing (defined outside component to avoid recreation)
const sampleCandidates: CandidateDisplay[] = [
  {
    id: 'sample-1',
    name: 'Rajesh Kumar',
    title: 'Senior Frontend Developer',
    location: 'Bangalore',
    preferredLocation: 'Mumbai, Maharashtra, Karnataka, Tamil Nadu',
    experience: 8,
    education: 'B.Tech, M.Tech',
    currentCompany: 'Techcorp',
    email: 'rajesh.kumar@example.com',
    phone: '+91 9876543210',
    ctc: '30L',
    skills: ['React', 'Node.js', 'Kubernetes', 'Python', 'Redis', 'TypeScript'],
    summary: 'Experienced professional with a proven track record of delivering quality work on time. Interested in a role that values efficiency, ownership, and continuous learning.',
    profilePic: '',
    noticePeriod: '30 days',
    university: 'IIT Madras',
    saved: false,
    pedigreeLevel: 'Tier 1',
    companyLevel: 'MNC',
    companySector: 'Technology',
    productService: 'Product',
    productCategory: 'B2B',
    productDomain: 'Software development',
    employmentType: 'Full-time',
    linkedinUrl: 'https://linkedin.com/in/rajesh-kumar',
    websiteUrl: 'https://rajeshkumar.dev',
    portfolioUrl: 'https://portfolio.rajeshkumar.dev',
    lastSeen: '2 hours ago',
  },
  {
    id: 'sample-2',
    name: 'Priya Sharma',
    title: 'Full Stack Developer',
    location: 'Mumbai',
    preferredLocation: 'Mumbai, Pune, Bangalore',
    experience: 5,
    education: 'B.Tech, MCA',
    currentCompany: 'Freshworks',
    email: 'priya.sharma@example.com',
    phone: '+91 9876543211',
    ctc: '25L',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Docker', 'AWS'],
    summary: 'Experienced professional with a proven track record of delivering quality work on time. Interested in a role that values efficiency, ownership, and continuous learning.',
    profilePic: '',
    noticePeriod: '60 days',
    university: 'IIT Delhi',
    saved: false,
    pedigreeLevel: 'Tier 1',
    companyLevel: 'MNC',
    companySector: 'Technology',
    productService: 'SaaS',
    productCategory: 'B2B',
    productDomain: 'Cloud Computing',
    employmentType: 'Full-time',
    linkedinUrl: 'https://linkedin.com/in/priya-sharma',
    websiteUrl: '',
    portfolioUrl: 'https://portfolio.priyasharma.dev',
    lastSeen: '1 hour ago',
  },
  {
    id: 'sample-3',
    name: 'Amit Patel',
    title: 'Backend Developer',
    location: 'Pune',
    preferredLocation: 'Pune, Mumbai, Bangalore',
    experience: 6,
    education: 'B.Tech',
    currentCompany: 'Google',
    email: 'amit.patel@example.com',
    phone: '+91 9876543212',
    ctc: '28L',
    skills: ['Python', 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL', 'AWS'],
    summary: 'Experienced professional with a proven track record of delivering quality work on time. Interested in a role that values efficiency, ownership, and continuous learning.',
    profilePic: '',
    noticePeriod: '45 days',
    university: 'IIT Bombay',
    saved: false,
    pedigreeLevel: 'Tier 1',
    companyLevel: 'MNC',
    companySector: 'Technology',
    productService: 'Product',
    productCategory: 'B2C',
    productDomain: 'AI/ML',
    employmentType: 'Full-time',
    linkedinUrl: 'https://linkedin.com/in/amit-patel',
    websiteUrl: 'https://amitpatel.dev',
    portfolioUrl: '',
    lastSeen: '3 hours ago',
  },
  {
    id: 'sample-4',
    name: 'Sneha Reddy',
    title: 'DevOps Engineer',
    location: 'Hyderabad',
    preferredLocation: 'Hyderabad, Bangalore, Chennai',
    experience: 7,
    education: 'B.Tech, M.Tech',
    currentCompany: 'Amazon',
    email: 'sneha.reddy@example.com',
    phone: '+91 9876543213',
    ctc: '32L',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'Python'],
    summary: 'Experienced professional with a proven track record of delivering quality work on time. Interested in a role that values efficiency, ownership, and continuous learning.',
    profilePic: '',
    noticePeriod: '90 days',
    university: 'IIT Kanpur',
    saved: false,
    pedigreeLevel: 'Tier 1',
    companyLevel: 'MNC',
    companySector: 'Technology',
    productService: 'Service',
    productCategory: 'B2B',
    productDomain: 'Cloud Computing',
    employmentType: 'Full-time',
    linkedinUrl: 'https://linkedin.com/in/sneha-reddy',
    websiteUrl: '',
    portfolioUrl: '',
    lastSeen: '4 hours ago',
  },
  {
    id: 'sample-5',
    name: 'Vikram Singh',
    title: 'Frontend Engineer',
    location: 'Delhi',
    preferredLocation: 'Delhi, Noida, Gurgaon',
    experience: 4,
    education: 'B.Tech',
    currentCompany: 'Microsoft',
    email: 'vikram.singh@example.com',
    phone: '+91 9876543214',
    ctc: '22L',
    skills: ['React', 'TypeScript', 'Angular', 'Vue.js', 'JavaScript', 'Node.js'],
    summary: 'Experienced professional with a proven track record of delivering quality work on time. Interested in a role that values efficiency, ownership, and continuous learning.',
    profilePic: '',
    noticePeriod: '30 days',
    university: 'IIT Roorkee',
    saved: false,
    pedigreeLevel: 'Tier 1',
    companyLevel: 'MNC',
    companySector: 'Technology',
    productService: 'Product',
    productCategory: 'B2B2C',
    productDomain: 'Web Development',
    employmentType: 'Full-time',
    linkedinUrl: 'https://linkedin.com/in/vikram-singh',
    websiteUrl: 'https://vikramsingh.dev',
    portfolioUrl: 'https://portfolio.vikramsingh.dev',
    lastSeen: '5 hours ago',
  },
];

const SourceResume = () => {
  // CRITICAL SECURITY: Defense-in-depth authentication check
  // This ensures the page is NEVER accessible without proper authentication
  const { user, isLoading: authLoading, isVerified } = useAuth();
  const [, setLocation] = useLocation();
  
  // Block ALL rendering until authentication is verified
  useEffect(() => {
    if (authLoading || !isVerified) {
      // Still loading, wait
      return;
    }
    
    // Authentication check failed - redirect immediately
    if (!user) {
      setLocation('/employer-login');
      return;
    }
    
    // Check user type
    if (user.type !== 'employee') {
      setLocation('/employer-login');
      return;
    }
    
    // Check allowed roles
    const employee = user.data as Employee;
    const allowedRoles = ["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"];
    if (!allowedRoles.includes(employee.role)) {
      setLocation('/employer-login');
      return;
    }
  }, [user, authLoading, isVerified, setLocation]);
  
  // Show loading while auth is being verified
  if (authLoading || !isVerified || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // Double-check role after verification
  const employee = user.data as Employee;
  const allowedRoles = ["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"];
  if (!allowedRoles.includes(employee.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }
  
  const [view, setView] = useState<'search' | 'results'>('search');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDisplay | null>(null);
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsSearchQuery, setResultsSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showSavedProfiles, setShowSavedProfiles] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // State for showing/hiding input fields
  const [showExcludeKeywords, setShowExcludeKeywords] = useState(false);
  const [showSpecificSkills, setShowSpecificSkills] = useState(false);
  const [showExcludeCompany, setShowExcludeCompany] = useState(false);
  const [showAddDegree, setShowAddDegree] = useState(false);
  
  // Input values for new fields
  const [excludeKeywordInput, setExcludeKeywordInput] = useState("");
  const [specificSkillInput, setSpecificSkillInput] = useState("");
  const [excludeCompanyInput, setExcludeCompanyInput] = useState("");
  const [addDegreeInput, setAddDegreeInput] = useState("");
  
  const { toast } = useToast();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sourceResumeRecentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load recent searches', e);
      }
    }
  }, []);

  const queryClient = useQueryClient();

  // Fetch candidates to get unique values
  const { data: dbCandidates = [], isLoading: isLoadingCandidates } = useQuery<DatabaseCandidate[]>({
    queryKey: ['/api/admin/candidates'],
  });

  // Fetch recruiter requirements
  const { data: requirements = [], isLoading: isLoadingRequirements } = useQuery<any[]>({
    queryKey: ['/api/recruiter/requirements'],
    enabled: true,
  });

  // Fetch applications to track tagged candidates
  const { data: allApplications = [] } = useQuery<any[]>({
    queryKey: ['/api/recruiter/applications'],
  });

  // Track tagged candidates (those already in applications)
  const taggedCandidates = useMemo(() => {
    if (!allApplications || allApplications.length === 0) return new Set<string>();
    return new Set(allApplications.map((app: any) => app.candidateEmail?.toLowerCase()).filter(Boolean));
  }, [allApplications]);

  // Map candidates to display format
  const [candidates, setCandidates] = useState<CandidateDisplay[]>([]);
  
  useEffect(() => {
    const mapped = dbCandidates.map(mapDatabaseCandidateToDisplay);
    // Use only database candidates (remove sample candidates)
    setCandidates(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbCandidates]);

  // Save search to recent searches
  const saveSearchToHistory = () => {
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      keywords: filters.keywords,
      experience: filters.experience,
      location: filters.location,
      role: filters.role,
      noticePeriod: filters.noticePeriod,
      timestamp: Date.now(),
    };
    
    const updated = [newSearch, ...recentSearches].slice(0, 3); // Keep only last 3
    setRecentSearches(updated);
    localStorage.setItem('sourceResumeRecentSearches', JSON.stringify(updated));
  };

  // Apply recent search filters
  const applyRecentSearch = (search: RecentSearch) => {
    setFilters({
      ...filters,
      keywords: search.keywords,
      experience: search.experience,
      location: search.location,
      role: search.role,
      noticePeriod: search.noticePeriod,
    });
    toast({
      title: "Filters applied",
      description: "Search filters from recent search have been applied",
    });
  };

  const handleKeywordAdd = (keyword: string) => {
    if (keyword && !filters.keywords.includes(keyword)) {
      setFilters({ ...filters, keywords: [...filters.keywords, keyword] });
    }
    setKeywordInput("");
  };

  const handleKeywordRemove = (keyword: string) => {
    setFilters({
      ...filters,
      keywords: filters.keywords.filter((k) => k !== keyword),
    });
  };

  const handleExcludeKeywordAdd = (keyword: string) => {
    if (keyword && !filters.excludedKeywords.includes(keyword)) {
      setFilters({ ...filters, excludedKeywords: [...filters.excludedKeywords, keyword] });
    }
    setExcludeKeywordInput("");
  };

  const handleExcludeKeywordRemove = (keyword: string) => {
    setFilters({
      ...filters,
      excludedKeywords: filters.excludedKeywords.filter((k) => k !== keyword),
    });
  };

  const handleSpecificSkillAdd = (skill: string) => {
    if (skill && !filters.specificSkills.includes(skill)) {
      setFilters({ ...filters, specificSkills: [...filters.specificSkills, skill] });
    }
    setSpecificSkillInput("");
  };

  const handleSpecificSkillRemove = (skill: string) => {
    setFilters({
      ...filters,
      specificSkills: filters.specificSkills.filter((s) => s !== skill),
    });
  };

  const handleExcludeCompanyAdd = (company: string) => {
    if (company && !filters.excludedCompanies.includes(company)) {
      setFilters({ ...filters, excludedCompanies: [...filters.excludedCompanies, company] });
    }
    setExcludeCompanyInput("");
  };

  const handleExcludeCompanyRemove = (company: string) => {
    setFilters({
      ...filters,
      excludedCompanies: filters.excludedCompanies.filter((c) => c !== company),
    });
  };

  const handleAddDegree = (degree: string) => {
    if (degree && !filters.additionalDegrees.includes(degree)) {
      setFilters({ ...filters, additionalDegrees: [...filters.additionalDegrees, degree] });
    }
    setAddDegreeInput("");
  };

  const handleRemoveDegree = (degree: string) => {
    setFilters({
      ...filters,
      additionalDegrees: filters.additionalDegrees.filter((d) => d !== degree),
    });
  };

  const handleSkillAdd = (skill: string) => {
    handleKeywordAdd(skill);
  };

  const handleShowWithToggle = (value: string) => {
    setFilters({
      ...filters,
      showWith: filters.showWith.includes(value)
        ? filters.showWith.filter((v) => v !== value)
        : [...filters.showWith, value],
    });
  };

  // Boolean search parser
  const parseBooleanSearch = (query: string): boolean => {
    if (!filters.booleanMode) return true;
    
    const andPattern = /AND/gi;
    const orPattern = /OR/gi;
    
    if (andPattern.test(query)) {
      const terms = query.split(/AND/gi).map(t => t.trim()).filter(Boolean);
      return terms.every(term => 
        resultsSearchQuery.toLowerCase().includes(term.toLowerCase())
      );
    } else if (orPattern.test(query)) {
      const terms = query.split(/OR/gi).map(t => t.trim()).filter(Boolean);
      return terms.some(term => 
        resultsSearchQuery.toLowerCase().includes(term.toLowerCase())
      );
    }
    return true;
  };

  // Filter candidates based on search criteria
  const filterCandidates = (candidatesList: CandidateDisplay[]): CandidateDisplay[] => {
    return candidatesList.filter((candidate) => {
      // Excluded keywords filter (must not contain)
      if (filters.excludedKeywords.length > 0) {
        const hasExcluded = filters.excludedKeywords.some(keyword =>
          candidate.skills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase())) ||
          candidate.name.toLowerCase().includes(keyword.toLowerCase()) ||
          candidate.title.toLowerCase().includes(keyword.toLowerCase()) ||
          candidate.currentCompany.toLowerCase().includes(keyword.toLowerCase())
        );
        if (hasExcluded) return false;
      }

      // Excluded companies filter
      if (filters.excludedCompanies.length > 0) {
        const hasExcludedCompany = filters.excludedCompanies.some(company =>
          candidate.currentCompany.toLowerCase().includes(company.toLowerCase())
        );
        if (hasExcludedCompany) return false;
      }

      // Keywords filter
      if (filters.keywords.length > 0) {
        const hasKeyword = filters.keywords.some(keyword =>
          candidate.skills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase())) ||
          candidate.name.toLowerCase().includes(keyword.toLowerCase()) ||
          candidate.title.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }

      // Specific skills filter (must have all)
      if (filters.specificSkills.length > 0) {
        const hasAllSkills = filters.specificSkills.every(skill =>
          candidate.skills.some(cSkill => cSkill.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!hasAllSkills) return false;
      }

      // Search query filter - Multiple words use OR logic by default
      if (resultsSearchQuery.trim()) {
        if (filters.booleanMode) {
          // Boolean search: parse AND/OR logic
          const query = resultsSearchQuery.toLowerCase();
          const andMatch = /AND/gi.test(query);
          const orMatch = /OR/gi.test(query);
          
          if (andMatch) {
            const terms = query.split(/AND/gi).map(t => t.trim()).filter(Boolean);
            const allMatch = terms.every(term => {
              const searchText = `${candidate.name} ${candidate.title} ${candidate.currentCompany} ${candidate.skills.join(' ')}`.toLowerCase();
              return searchText.includes(term);
            });
            if (!allMatch) return false;
          } else if (orMatch) {
            const terms = query.split(/OR/gi).map(t => t.trim()).filter(Boolean);
            const anyMatch = terms.some(term => {
              const searchText = `${candidate.name} ${candidate.title} ${candidate.currentCompany} ${candidate.skills.join(' ')}`.toLowerCase();
              return searchText.includes(term);
            });
            if (!anyMatch) return false;
          } else {
            // Single term search
            const searchText = `${candidate.name} ${candidate.title} ${candidate.currentCompany} ${candidate.skills.join(' ')}`.toLowerCase();
            if (!searchText.includes(query)) return false;
          }
        } else {
          // Default behavior: Split multiple words and use OR logic (show candidates with ANY of the words)
          const searchTerms = extractSearchTerms(resultsSearchQuery);
          const searchText = `${candidate.name} ${candidate.title} ${candidate.currentCompany} ${candidate.skills.join(' ')}`.toLowerCase();
          
          // At least one term must match
          const matches = searchTerms.some(term => 
            searchText.includes(term.toLowerCase())
          );
          
          if (!matches) return false;
        }
      }

      // Experience filter
      if (candidate.experience < filters.experience[0] || candidate.experience > filters.experience[1]) {
        return false;
      }

      // Location filter
      if (filters.location && filters.location.trim() !== "" && 
          !candidate.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Preferred Location filter
      if (filters.preferredLocation && filters.preferredLocation.trim() !== "" && 
          !candidate.preferredLocation.toLowerCase().includes(filters.preferredLocation.toLowerCase())) {
        return false;
      }

      // Role filter
      if (filters.role && filters.role.trim() !== "" && 
          !candidate.title.toLowerCase().includes(filters.role.toLowerCase())) {
        return false;
      }

      // Company filter
      if (filters.company && filters.company.trim() !== "" && 
          !candidate.currentCompany.toLowerCase().includes(filters.company.toLowerCase())) {
        return false;
      }

      // Notice period filter
      if (filters.noticePeriod && filters.noticePeriod.trim() !== "" && 
          !candidate.noticePeriod.toLowerCase().includes(filters.noticePeriod.toLowerCase())) {
        return false;
      }

      // Education filter
      if (filters.educationUG && filters.educationUG.trim() !== "" && 
          !candidate.education.toLowerCase().includes(filters.educationUG.toLowerCase())) {
        return false;
      }

      if (filters.educationPG && filters.educationPG.trim() !== "" && 
          !candidate.education.toLowerCase().includes(filters.educationPG.toLowerCase())) {
        return false;
      }

      // Additional degrees filter
      if (filters.additionalDegrees.length > 0) {
        const hasDegree = filters.additionalDegrees.some(degree =>
          candidate.education.toLowerCase().includes(degree.toLowerCase())
        );
        if (!hasDegree) return false;
      }

      // Employment type filter
      if (filters.employmentType && filters.employmentType.trim() !== "" && candidate.employmentType && 
          !candidate.employmentType.toLowerCase().includes(filters.employmentType.toLowerCase())) {
        return false;
      }

      // Display Details - Show candidate with
      if (filters.showWith.includes("resume") && !candidate.resumeFile && !candidate.profilePic) {
        // If resume is required but candidate doesn't have one, skip
        return false;
      }

      if (filters.showWith.includes("portfolio") && !candidate.portfolioUrl) {
        return false;
      }

      if (filters.showWith.includes("website") && !candidate.websiteUrl) {
        return false;
      }

      // Candidate status filter
      if (filters.candidateStatus === "new_registration") {
        // Filter for new candidates (e.g., created in last 7 days)
        const createdDate = new Date();
        // This would need actual creation date from candidate data
      }

      if (filters.candidateStatus === "modified_candidates") {
        // Filter for recently modified candidates
        // This would need actual modification date from candidate data
      }

      return true;
    });
  };

  const filteredCandidates = filterCandidates(candidates);
  
  // Filter to show only saved candidates if showSavedProfiles is true
  const displayCandidates = showSavedProfiles 
    ? filteredCandidates.filter(c => savedCandidates.has(c.id))
    : filteredCandidates;

  // Generate AI suggestions based on candidates data
  const searchSuggestions = useMemo(() => {
    if (!resultsSearchQuery.trim() || resultsSearchQuery.trim().length < 1) {
      return [];
    }

    const query = resultsSearchQuery.toLowerCase().trim();
    const suggestions: string[] = [];
    
    // Get unique skills from all candidates
    const allUniqueSkills = new Set<string>();
    candidates.forEach(c => {
      c.skills.forEach(skill => allUniqueSkills.add(skill));
    });
    
    // Get unique companies
    const allUniqueCompanies = new Set<string>();
    candidates.forEach(c => {
      if (c.currentCompany && c.currentCompany !== 'Not Available') {
        allUniqueCompanies.add(c.currentCompany);
      }
    });
    
    // Get unique roles/titles
    const allUniqueRoles = new Set<string>();
    candidates.forEach(c => {
      if (c.title && c.title !== 'Not Available') {
        allUniqueRoles.add(c.title);
      }
    });
    
    // Filter and add matching skills
    allUniqueSkills.forEach(skill => {
      if (skill.toLowerCase().includes(query) && !suggestions.includes(skill)) {
        suggestions.push(skill);
      }
    });
    
    // Filter and add matching companies
    allUniqueCompanies.forEach(company => {
      if (company.toLowerCase().includes(query) && !suggestions.includes(company)) {
        suggestions.push(company);
      }
    });
    
    // Filter and add matching roles
    allUniqueRoles.forEach(role => {
      if (role.toLowerCase().includes(query) && !suggestions.includes(role)) {
        suggestions.push(role);
      }
    });
    
    // Also add from predefined allSkills list
    allSkills.forEach(skill => {
      if (skill.toLowerCase().includes(query) && !suggestions.includes(skill)) {
        suggestions.push(skill);
      }
    });
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }, [resultsSearchQuery, candidates]);
  
  const candidatesPerPage = 10;
  const totalPages = Math.ceil(displayCandidates.length / candidatesPerPage);
  const paginatedCandidates = displayCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  // Recommended candidates (other matching candidates when one is selected)
  const recommendedCandidates = selectedCandidate
    ? displayCandidates
        .filter(c => c.id !== selectedCandidate.id)
        .filter(c => {
          // Show candidates with similar skills or experience
          const hasCommonSkills = c.skills.some(skill => 
            selectedCandidate.skills.some(selectedSkill => 
              skill.toLowerCase().includes(selectedSkill.toLowerCase()) ||
              selectedSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
          const similarExperience = Math.abs(c.experience - selectedCandidate.experience) <= 2;
          return hasCommonSkills || similarExperience;
        })
        .slice(0, 5)
    : displayCandidates.slice(0, 5);

  const handleSourceResume = () => {
    // Save to recent searches
    saveSearchToHistory();
    
    setView('results');
    setCurrentPage(1);
    setShowSavedProfiles(false); // Reset to show all candidates on new search
    toast({
      title: "Search initiated",
      description: `Found ${filteredCandidates.length} candidates matching your criteria`,
    });
  };

  const selectedCandidateRef = useRef<HTMLDivElement>(null);

  const handleCandidateClick = (candidate: CandidateDisplay) => {
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate(null);
    } else {
      setSelectedCandidate(candidate);
      // Scroll to the selected candidate after a short delay
      setTimeout(() => {
        selectedCandidateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const handleSaveCandidate = (candidateId: string) => {
    setSavedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
        toast({ title: "Removed from saved", description: "Candidate removed from saved profiles" });
      } else {
        newSet.add(candidateId);
        toast({ title: "Saved", description: "Candidate added to saved profiles" });
      }
      return newSet;
    });
  };

  // Tag candidate to requirement mutation
  const tagToRequirementMutation = useMutation({
    mutationFn: async ({ candidate, requirementId }: { candidate: CandidateDisplay; requirementId: string }) => {
      const requirement = requirements.find((r: any) => r.id === requirementId);
      if (!requirement) {
        throw new Error('Requirement not found');
      }

      const response = await apiRequest('POST', '/api/recruiter/applications', {
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone || null,
        jobTitle: requirement.position || candidate.title,
        company: requirement.company || candidate.currentCompany,
        requirementId: requirementId,
        experience: candidate.experience ? `${candidate.experience} years` : null,
        skills: candidate.skills.length > 0 ? JSON.stringify(candidate.skills) : null,
        location: candidate.location || null,
      });

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Candidate tagged to requirement successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to tag candidate to requirement",
        variant: "destructive",
      });
    },
  });

  const handleTagToRequirement = (candidate: CandidateDisplay, requirementId: string) => {
    tagToRequirementMutation.mutate({ candidate, requirementId });
  };

  // Check if candidate is tagged
  const isCandidateTagged = (candidate: CandidateDisplay): boolean => {
    return taggedCandidates.has(candidate.email.toLowerCase());
  };

  // Scroll to top function - scrolls the candidate cards container
  const scrollToTop = () => {
    // Find the candidate cards scrollable container by ID
    const candidateCardsContainer = document.getElementById('candidate-cards-scrollable');
    if (candidateCardsContainer) {
      candidateCardsContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fallback: try any scrollable container in the results view
      const scrollableContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (scrollableContainer) {
        scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Final fallback to window scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleOpenCandidateDetails = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/candidate-profile/${candidateId}`, '_blank');
  };

  const savedCount = savedCandidates.size;

  const resetFilters = () => {
    setFilters(initialFilters);
    setKeywordInput("");
    setExcludeKeywordInput("");
    setSpecificSkillInput("");
    setExcludeCompanyInput("");
    setAddDegreeInput("");
    setResultsSearchQuery("");
    setShowExcludeKeywords(false);
    setShowSpecificSkills(false);
    setShowExcludeCompany(false);
    setShowAddDegree(false);
    setCurrentPage(1);
  };

  const suggestedKeywords = allSkills.filter(
    (skill) => !filters.keywords.includes(skill)
  );

  // Results View
  if (view === 'results') {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Filters (Static) */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={() => setView('search')}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keywords
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={filters.booleanMode}
                  onChange={(e) => setFilters({ ...filters, booleanMode: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Boolean search</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      filters.keywords.includes(keyword)
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Experience
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  max={filters.experience[1]}
                  value={filters.experience[0]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      experience: [parseInt(e.target.value) || 0, filters.experience[1]],
                    })
                  }
                  className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min={filters.experience[0]}
                  max={15}
                  value={filters.experience[1]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      experience: [filters.experience[0], parseInt(e.target.value) || 15],
                    })
                  }
                  className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* CTC Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CTC Range (Lakhs)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.ctcMin}
                  onChange={(e) => setFilters({ ...filters, ctcMin: e.target.value })}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.ctcMax}
                  onChange={(e) => setFilters({ ...filters, ctcMax: e.target.value })}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Designation
              </label>
              <FilterableDropdown
                value={filters.role}
                onChange={(value) => setFilters({ ...filters, role: value })}
                options={allRoles}
                placeholder="All roles"
              />
            </div>

            {/* Notice Period */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notice period
              </label>
              <FilterableDropdown
                value={filters.noticePeriod}
                onChange={(value) => setFilters({ ...filters, noticePeriod: value })}
                options={allNoticePeriods}
                placeholder="Any"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company
              </label>
              <FilterableDropdown
                value={filters.company}
                onChange={(value) => setFilters({ ...filters, company: value })}
                options={allCompanies}
                placeholder="All Location"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <FilterableDropdown
                value={filters.location}
                onChange={(value) => setFilters({ ...filters, location: value })}
                options={locations.map(l => l.label)}
                placeholder="All Location"
              />
            </div>

            {/* Preferred Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Location
              </label>
              <FilterableDropdown
                value={filters.preferredLocation}
                onChange={(value) => setFilters({ ...filters, preferredLocation: value })}
                options={locations.map(l => l.label)}
                placeholder="Any location"
              />
            </div>

            {/* Education UG */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Education UG
              </label>
              <FilterableDropdown
                value={filters.educationUG}
                onChange={(value) => setFilters({ ...filters, educationUG: value })}
                options={allEducationUG}
                placeholder="Any"
              />
            </div>

            {/* Education PG */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Education PG
              </label>
              <FilterableDropdown
                value={filters.educationPG}
                onChange={(value) => setFilters({ ...filters, educationPG: value })}
                options={allEducationPG}
                placeholder="Any"
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employment Type
              </label>
              <FilterableDropdown
                value={filters.employmentType}
                onChange={(value) => setFilters({ ...filters, employmentType: value })}
                options={allEmploymentTypes}
                placeholder="Any"
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Type
              </label>
              <FilterableDropdown
                value={filters.jobType}
                onChange={(value) => setFilters({ ...filters, jobType: value })}
                options={allJobTypes}
                placeholder="Any"
              />
            </div>

            {/* Work Permit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Work Permit for
              </label>
              <FilterableDropdown
                value={filters.workPermit}
                onChange={(value) => setFilters({ ...filters, workPermit: value })}
                options={allWorkPermits}
                placeholder="Any"
              />
            </div>

            {/* Candidate Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Show
              </label>
              <div className="flex flex-col gap-2">
                {["All Candidates", "New registration", "Modified Candidates"].map((option) => {
                  const value = option === "All Candidates" ? "all" : option.toLowerCase().replace(" ", "_");
                  return (
                    <button
                      key={option}
                      onClick={() => setFilters({ ...filters, candidateStatus: value })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors text-left ${
                        filters.candidateStatus === value
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-blue-200 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Show Candidate With */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Show candidate with
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { value: "resume", label: "Attached Resume" },
                  { value: "portfolio", label: "Attached Portfolio" },
                  { value: "website", label: "Attached Website" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleShowWithToggle(option.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors text-left ${
                      filters.showWith.includes(option.value)
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-blue-200 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Candidate Cards (Scrollable) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Search Bar */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center gap-3">
              <div className="w-80 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={resultsSearchQuery}
                  onChange={(e) => {
                    setResultsSearchQuery(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter the skills, company, designation..."
                />
                {/* AI Suggestions Dropdown */}
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-2 py-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        <span>Suggestions</span>
                      </div>
                      {searchSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setResultsSearchQuery(suggestion);
                            setShowSearchSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded flex items-center gap-2"
                        >
                          <Search className="w-3 h-3 text-gray-400" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowSavedProfiles(!showSavedProfiles);
                  setCurrentPage(1); // Reset to first page when toggling
                  if (!showSavedProfiles) {
                    toast({
                      title: "Showing Saved Profiles",
                      description: `Displaying ${savedCount} saved profile${savedCount !== 1 ? 's' : ''}`,
                    });
                  } else {
                    toast({
                      title: "Showing All Candidates",
                      description: "Displaying all filtered candidates",
                    });
                  }
                }}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  showSavedProfiles 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {showSavedProfiles ? "Show All" : `Saved Profiles (${savedCount})`}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                {filters.booleanMode && (
                  <span className="text-xs text-blue-600 cursor-pointer">Boolean search</span>
                )}
                <span className="text-xs text-gray-600">Total Profiles {displayCandidates.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs"
                >
                  <RotateCw className="w-3 h-3 mr-1" />
                  Reset Filters
                </Button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600">Pages</span>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Candidate Cards List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="candidate-cards-scrollable">
            {isLoadingCandidates ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : paginatedCandidates.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No candidates found matching your criteria</p>
              </div>
            ) : (
              <>
                {paginatedCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    ref={selectedCandidate?.id === candidate.id ? selectedCandidateRef : null}
                    className={`bg-white rounded-lg border p-6 hover:shadow-md transition-all cursor-pointer ${
                      selectedCandidate?.id === candidate.id
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleCandidateClick(candidate)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3 relative">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-gray-900">
                                {highlightText(candidate.name, extractSearchTerms(resultsSearchQuery))}
                              </h3>
                              {candidate.isFromDatabase && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title="From Master Database">
                                  <Database className="w-3 h-3" />
                                  DB
                                </span>
                              )}
                            </div>
                            <p className="text-blue-600 font-medium">
                              {candidate.title && candidate.title !== 'Not Available'
                                ? (
                                    <>
                                      {highlightText(candidate.title, extractSearchTerms(resultsSearchQuery))}
                                      {candidate.currentCompany && candidate.currentCompany !== 'Not Available' && (
                                        <>
                                          {' in '}
                                          {highlightText(candidate.currentCompany, extractSearchTerms(resultsSearchQuery))}
                                        </>
                                      )}
                                    </>
                                  )
                                : (candidate.currentCompany && candidate.currentCompany !== 'Not Available' 
                                    ? highlightText(candidate.currentCompany, extractSearchTerms(resultsSearchQuery))
                                    : 'Not Available')
                              }
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{candidate.email}</p>
                          </div>
                          <div className="absolute top-0 right-0 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCandidateDetails(candidate.id, e);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-full"
                              title="Open candidate details in new tab"
                            >
                              <ExternalLink className="w-5 h-5 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveCandidate(candidate.id);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-full"
                              title="Save candidate"
                            >
                              <Bookmark
                                className={`w-5 h-5 ${
                                  savedCandidates.has(candidate.id)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-400"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <span className="font-semibold">CTC:</span>{' '}
                            <span className={candidate.ctc === 'Not Available' ? 'text-gray-400' : ''}>{candidate.ctc}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Education:</span>{' '}
                            <span className={candidate.education === 'Not Available' ? 'text-gray-400' : ''}>{candidate.education}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Experience:</span>{' '}
                            <span className={candidate.experience === 0 ? 'text-gray-400' : ''}>
                              {candidate.experience > 0 ? `+${candidate.experience} years` : 'Not Available'}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold">Location:</span>{' '}
                            <span className={candidate.location === 'Not Available' ? 'text-gray-400' : ''}>{candidate.location}</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="font-semibold text-sm">Preferred Location: </span>
                          <span className={`text-sm ${candidate.preferredLocation === 'Not Available' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {candidate.preferredLocation}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {candidate.skills.slice(0, 5).map((skill, idx) => {
                            const searchTerms = extractSearchTerms(resultsSearchQuery);
                            const isHighlighted = searchTerms.some(term => 
                              skill.toLowerCase().includes(term.toLowerCase())
                            );
                            return (
                              <span
                                key={idx}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isHighlighted 
                                    ? "bg-yellow-200 text-yellow-900 font-semibold" 
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {highlightText(skill, searchTerms)}
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{candidate.summary}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end justify-between min-h-full">
                        <div className="flex flex-col items-end">
                          {candidate.profilePic ? (
                            <img
                              src={candidate.profilePic}
                              alt={candidate.name}
                              className="w-20 h-20 rounded-full object-cover mb-2"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-xl mb-2">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <p className="text-xs text-gray-600 text-right mb-1">University: {candidate.university !== 'Not Available' ? candidate.university : 'Not Available'}</p>
                          <p className="text-xs text-gray-600 text-right mb-2">Education: {candidate.education !== 'Not Available' ? candidate.education : 'Not Available'}</p>
                          <div className="flex gap-2 mb-3 justify-end">
                            {candidate.linkedinUrl && (
                              <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                            {candidate.portfolioUrl && (
                              <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
                              <Mail className="w-4 h-4" />
                            </a>
                            {candidate.websiteUrl && (
                              <a href={candidate.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {candidate.phone && (
                              <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-xs text-gray-500">last seen: {candidate.lastSeen}</p>
                          {isCandidateTagged(candidate) ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      onClick={(e) => e.stopPropagation()}
                                      disabled
                                      className="bg-green-100 hover:bg-green-200 text-green-700 flex items-center gap-2 px-3 py-1.5 text-sm cursor-not-allowed"
                                    >
                                      Tagged
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Candidate can be removed in the Applicant Overview table only</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-3 py-1.5 text-sm"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Tag to Requirement
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                {isLoadingRequirements ? (
                                  <DropdownMenuItem disabled>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading requirements...
                                  </DropdownMenuItem>
                                ) : requirements.length === 0 ? (
                                  <DropdownMenuItem disabled>
                                    No requirements
                                  </DropdownMenuItem>
                                ) : (
                                  requirements.map((req: any) => (
                                    <DropdownMenuItem
                                      key={req.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTagToRequirement(candidate, req.id);
                                      }}
                                    >
                                      {req.position} - {req.company}
                                    </DropdownMenuItem>
                                  ))
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details (shown when selected) */}
                    {selectedCandidate?.id === candidate.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Key Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Work Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Current Company:</span>{' '}
                                <span className={candidate.currentCompany === 'Not Available' ? 'text-gray-400' : ''}>
                                  {candidate.currentCompany}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Role:</span>{' '}
                                <span className={candidate.title === 'Not Available' ? 'text-gray-400' : ''}>
                                  {candidate.title}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Company Sector:</span>{' '}
                                <span className={!candidate.companySector ? 'text-gray-400' : ''}>
                                  {candidate.companySector || 'Not Available'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Company Type:</span>{' '}
                                <span className={!candidate.productService ? 'text-gray-400' : ''}>
                                  {candidate.productService || 'Not Available'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Product Category:</span>{' '}
                                <span className={!candidate.productCategory ? 'text-gray-400' : ''}>
                                  {candidate.productCategory || 'Not Available'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Product Domain:</span>{' '}
                                <span className={!candidate.productDomain ? 'text-gray-400' : ''}>
                                  {candidate.productDomain || 'Not Available'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Work Preference</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Job Title:</span>{' '}
                              <span className={candidate.title === 'Not Available' ? 'text-gray-400' : ''}>
                                {candidate.title}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Employment Type:</span>{' '}
                              <span className={!candidate.employmentType ? 'text-gray-400' : ''}>
                                {candidate.employmentType || 'Not Available'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Preferred Location:</span>{' '}
                              <span className={candidate.preferredLocation === 'Not Available' ? 'text-gray-400' : ''}>
                                {candidate.preferredLocation}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Notice Period:</span>{' '}
                              <span className={candidate.noticePeriod === 'Not Available' ? 'text-gray-400' : ''}>
                                {candidate.noticePeriod}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Resume</h4>
                          <div className="border border-gray-200 rounded-lg bg-gray-100 dark:bg-gray-900 flex flex-col relative overflow-hidden" style={{ minHeight: '600px', height: '600px' }}>
                            {candidate.resumeFile ? (
                              <>
                                {(() => {
                                  const resumeUrl = candidate.resumeFile;
                                  const lowerUrl = resumeUrl.toLowerCase();
                                  const urlWithoutQuery = lowerUrl.split('?')[0];
                                  const isPdf = urlWithoutQuery.endsWith('.pdf');
                                  const isDocx = urlWithoutQuery.endsWith('.docx');
                                  const isDoc = urlWithoutQuery.endsWith('.doc') && !isDocx;
                                  
                                  if (isPdf) {
                                    return (
                                      <iframe
                                        key={resumeUrl}
                                        src={resumeUrl}
                                        className="w-full h-full border-0"
                                        title="Resume Preview"
                                      />
                                    );
                                  } else if (isDocx || isDoc) {
                                    return (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                        <div className="text-center space-y-4 p-8 max-w-md">
                                          <FileText className="h-16 w-16 mx-auto text-gray-400" />
                                          <div>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                              Word Document
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                              Word documents cannot be previewed in the browser. Please download the file to view it.
                                            </p>
                                            <Button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(resumeUrl, '_blank');
                                              }}
                                              className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                              <Download className="h-4 w-4 mr-2" />
                                              Download Resume
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                        <div className="text-center space-y-4 p-8 max-w-md">
                                          <FileText className="h-16 w-16 mx-auto text-gray-400" />
                                          <div>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                              Resume File
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                              This file type cannot be previewed. Please download to view.
                                            </p>
                                            <Button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(resumeUrl, '_blank');
                                              }}
                                              className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                              <Download className="h-4 w-4 mr-2" />
                                              Download Resume
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                })()}
                                <div className="absolute top-4 right-4 z-10">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(candidate.resumeFile, '_blank');
                                    }}
                                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-md"
                                    title="Download Resume"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Resume</p>
                                  <p className="text-sm text-gray-400 mt-4">Resume Not Available</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar - Recommended Candidates (Static) */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recommended candidates</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {recommendedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCandidateClick(candidate)}
              >
                <div className="flex gap-3 mb-3">
                  {candidate.profilePic ? (
                    <img
                      src={candidate.profilePic}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{candidate.name}</h4>
                    <p className="text-sm text-blue-600 truncate">{candidate.title} in {candidate.currentCompany}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">{candidate.email}</p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div><span className="font-medium">CTC:</span> {candidate.ctc}</div>
                  <div><span className="font-medium">Education:</span> {candidate.education}</div>
                  <div><span className="font-medium">Experience:</span> +{candidate.experience} years</div>
                  <div><span className="font-medium">Location:</span> {candidate.location}</div>
                </div>
                <div className="mb-2">
                  <span className="text-xs font-medium">Preferred Location: </span>
                  <span className="text-xs text-gray-600">{candidate.preferredLocation}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {candidate.skills.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCandidateDetails(candidate.id, e);
                    }}
                    className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                  >
                    View Profile
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">last seen: {candidate.lastSeen}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-all hover:scale-110"
          title="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Search Form View
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Source Resume</h1>
              <p className="text-gray-600 mt-1">
                Find the perfect candidates for your requirements
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Reset filters"
            >
              <RotateCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Keywords Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Boolean search</span>
                <button
                  onClick={() => setFilters({ ...filters, booleanMode: !filters.booleanMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    filters.booleanMode ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      filters.booleanMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Selected Keywords */}
            {filters.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    <Star className="w-3 h-3" />
                    {keyword}
                    <button
                      onClick={() => handleKeywordRemove(keyword)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Keywords */}
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedKeywords.slice(0, 6).map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillAdd(skill)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <Star className="w-3 h-3" />
                  {skill}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && keywordInput.trim()) {
                    handleKeywordAdd(keywordInput.trim());
                  }
                }}
                className="w-full max-w-md border-2 border-gray-200 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter the skills,company,designation...."
              />
            </div>

            {/* AI Suggestions Link */}
            <div className="flex items-center gap-4 mt-3">
              <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                <Lightbulb className="w-4 h-4" />
                AI Suggestions
              </button>
              <button 
                onClick={() => setShowExcludeKeywords(!showExcludeKeywords)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Exclude Keywords
              </button>
              <button 
                onClick={() => setShowSpecificSkills(!showSpecificSkills)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Specific Skills
              </button>
            </div>

            {/* Exclude Keywords Input */}
            {showExcludeKeywords && (
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {filters.excludedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {keyword}
                      <button
                        onClick={() => handleExcludeKeywordRemove(keyword)}
                        className="ml-1 hover:text-red-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={excludeKeywordInput}
                  onChange={(e) => setExcludeKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && excludeKeywordInput.trim()) {
                      handleExcludeKeywordAdd(excludeKeywordInput.trim());
                    }
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter keywords to exclude..."
                />
              </div>
            )}

            {/* Specific Skills Input */}
            {showSpecificSkills && (
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {filters.specificSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => handleSpecificSkillRemove(skill)}
                        className="ml-1 hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={specificSkillInput}
                  onChange={(e) => setSpecificSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && specificSkillInput.trim()) {
                      handleSpecificSkillAdd(specificSkillInput.trim());
                    }
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter specific skills (must have all)..."
                />
              </div>
            )}
          </div>

          {/* Experience, CTC Range, Location - Combined with Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Experience */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Experience
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  max={filters.experience[1]}
                  value={filters.experience[0]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      experience: [parseInt(e.target.value) || 0, filters.experience[1]],
                    })
                  }
                  className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min={filters.experience[0]}
                  max={15}
                  value={filters.experience[1]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      experience: [filters.experience[0], parseInt(e.target.value) || 15],
                    })
                  }
                  className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* CTC Range */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign className="w-4 h-4 text-purple-600" />
                CTC Range (Lakhs)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.ctcMin}
                  onChange={(e) => setFilters({ ...filters, ctcMin: e.target.value })}
                  className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.ctcMax}
                  onChange={(e) => setFilters({ ...filters, ctcMax: e.target.value })}
                  className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <MapPin className="w-4 h-4 text-purple-600" />
                Location
              </label>
              <FilterableDropdown
                value={filters.location}
                onChange={(value) => setFilters({ ...filters, location: value })}
                options={locations.map(l => l.label)}
                placeholder="All Location"
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Employee Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Role */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 text-purple-600" />
                  Role
                </label>
                <FilterableDropdown
                  value={filters.role}
                  onChange={(value) => setFilters({ ...filters, role: value })}
                  options={allRoles}
                  placeholder="All roles"
                  icon={<Briefcase className="w-4 h-4" />}
                />
              </div>

              {/* Preferred Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Preferred Location
                </label>
                <FilterableDropdown
                  value={filters.preferredLocation}
                  onChange={(value) => setFilters({ ...filters, preferredLocation: value })}
                  options={locations.map(l => l.label)}
                  placeholder="Any location"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Building className="w-4 h-4 text-purple-600" />
                  Company
                </label>
                <FilterableDropdown
                  value={filters.company}
                  onChange={(value) => setFilters({ ...filters, company: value })}
                  options={allCompanies}
                  placeholder="XYZ company"
                  icon={<Building className="w-4 h-4" />}
                />
              </div>

              {/* Notice Period */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Notice period
                </label>
                <FilterableDropdown
                  value={filters.noticePeriod}
                  onChange={(value) => setFilters({ ...filters, noticePeriod: value })}
                  options={allNoticePeriods}
                  placeholder="Any"
                  icon={<Calendar className="w-4 h-4" />}
                />
                {/* Quick Select Buttons */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {["+3 Months", "Current Designation", "+1 Months", "+1 Week", "Any"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        if (option === "Any") {
                          setFilters({ ...filters, noticePeriod: "" });
                        } else if (option === "+3 Months") {
                          setFilters({ ...filters, noticePeriod: "90 days" });
                        } else if (option === "+1 Months") {
                          setFilters({ ...filters, noticePeriod: "30 days" });
                        } else if (option === "+1 Week") {
                          setFilters({ ...filters, noticePeriod: "15 days" });
                        }
                      }}
                      className="px-3 py-1 text-xs border border-blue-200 rounded-full text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button 
                onClick={() => setShowExcludeCompany(!showExcludeCompany)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Exclude Company
              </button>
              
              {/* Exclude Company Input */}
              {showExcludeCompany && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {filters.excludedCompanies.map((company) => (
                      <span
                        key={company}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                      >
                        {company}
                        <button
                          onClick={() => handleExcludeCompanyRemove(company)}
                          className="ml-1 hover:text-red-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={excludeCompanyInput}
                    onChange={(e) => setExcludeCompanyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && excludeCompanyInput.trim()) {
                        handleExcludeCompanyAdd(excludeCompanyInput.trim());
                      }
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter company names to exclude..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Education Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  Education UG
                </label>
                <FilterableDropdown
                  value={filters.educationUG}
                  onChange={(value) => setFilters({ ...filters, educationUG: value })}
                  options={allEducationUG}
                  placeholder="BCA, Btech..."
                  icon={<GraduationCap className="w-4 h-4" />}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  Education PG
                </label>
                <FilterableDropdown
                  value={filters.educationPG}
                  onChange={(value) => setFilters({ ...filters, educationPG: value })}
                  options={allEducationPG}
                  placeholder="MCA, Mtech...."
                  icon={<GraduationCap className="w-4 h-4" />}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => setShowAddDegree(!showAddDegree)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add More degree or certificates
              </button>
              
              {/* Additional Degrees Input */}
              {showAddDegree && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {filters.additionalDegrees.map((degree) => (
                      <span
                        key={degree}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                      >
                        {degree}
                        <button
                          onClick={() => handleRemoveDegree(degree)}
                          className="ml-1 hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={addDegreeInput}
                    onChange={(e) => setAddDegreeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && addDegreeInput.trim()) {
                        handleAddDegree(addDegreeInput.trim());
                      }
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter degree or certificate name..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Employment Type</label>
                <FilterableDropdown
                  value={filters.employmentType}
                  onChange={(value) => setFilters({ ...filters, employmentType: value })}
                  options={allEmploymentTypes}
                  placeholder="Any"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Job Type</label>
                <FilterableDropdown
                  value={filters.jobType}
                  onChange={(value) => setFilters({ ...filters, jobType: value })}
                  options={allJobTypes}
                  placeholder="Any"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Work Permit for</label>
                <FilterableDropdown
                  value={filters.workPermit}
                  onChange={(value) => setFilters({ ...filters, workPermit: value })}
                  options={allWorkPermits}
                  placeholder="Any"
                />
              </div>
            </div>
          </div>

          {/* Display Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Show</label>
                <div className="flex gap-2">
                  {["All Candidates", "New registration", "Modified Candidates"].map((option) => {
                    const value = option === "All Candidates" ? "all" : option.toLowerCase().replace(" ", "_");
                    return (
                      <button
                        key={option}
                        onClick={() => setFilters({ ...filters, candidateStatus: value })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          filters.candidateStatus === value
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-blue-200 text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Show candidate with
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "resume", label: "Attached Resume" },
                    { value: "portfolio", label: "Attached Portfolio" },
                    { value: "website", label: "Attached Website" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleShowWithToggle(option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filters.showWith.includes(option.value)
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-blue-200 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Searches Sidebar - Static (Not Scrollable) */}
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Searches</h2>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {recentSearches.length === 0 ? (
            <p className="text-sm text-gray-500">No recent searches</p>
          ) : (
            recentSearches.map((search) => (
              <div key={search.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-3">
                  {/* Keywords */}
                  {search.keywords.length > 0 && (
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                        <Search className="w-3 h-3 text-purple-600" />
                        Keywords
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {search.keywords.slice(0, 3).map((keyword: string) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            <Star className="w-2 h-2" />
                            {keyword}
                          </span>
                        ))}
                        {search.keywords.length > 3 && (
                          <span className="text-xs text-gray-500">+{search.keywords.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                      <Briefcase className="w-3 h-3 text-purple-600" />
                      Experience
                    </label>
                    <p className="text-xs text-gray-600">{search.experience[0]} - {search.experience[1]} years</p>
                  </div>

                  {/* Location */}
                  {search.location && (
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        Location
                      </label>
                      <p className="text-xs text-gray-600">{search.location}</p>
                    </div>
                  )}

                  {/* Role */}
                  {search.role && (
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                        <User className="w-3 h-3 text-purple-600" />
                        Role
                      </label>
                      <p className="text-xs text-gray-600">{search.role}</p>
                    </div>
                  )}

                  {/* Notice Period */}
                  {search.noticePeriod && (
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                        <Clock className="w-3 h-3 text-purple-600" />
                        Notice period
                      </label>
                      <p className="text-xs text-gray-600">{search.noticePeriod}</p>
                    </div>
                  )}

                  {/* Continue with button */}
                  <button
                    onClick={() => applyRecentSearch(search)}
                    className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continue with
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fixed Source Resume Button - Bottom Right */}
      <button
        onClick={handleSourceResume}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-3 z-50"
      >
        <span>Source Resume</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SourceResume;
