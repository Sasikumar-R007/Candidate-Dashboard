import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
];

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
  showWith: ["resume"],
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
  
  const optionsList = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
  
  const selectedLabel = optionsList.find(opt => opt.value === value)?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-gray-200 rounded-lg h-10 font-normal text-gray-700 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <span className="text-purple-600 flex-shrink-0">{icon}</span>}
            <span className="truncate">{selectedLabel}</span>
          </span>
          <X className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {optionsList.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
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
    title: dbCandidate.designation || dbCandidate.currentRole || dbCandidate.position || 'Not specified',
    location: dbCandidate.location || 'Not specified',
    preferredLocation: dbCandidate.preferredLocation || dbCandidate.location || 'Not specified',
    experience: experienceNum,
    education: dbCandidate.education || dbCandidate.highestQualification || 'Not specified',
    currentCompany: dbCandidate.company || 'Not specified',
    email: dbCandidate.email,
    phone: dbCandidate.phone || '',
    ctc: dbCandidate.ctc || 'Not specified',
    skills: skillsArray,
    summary: `Experienced professional with a proven track record of delivering quality work on time. Interested in a role that values efficiency, ownership, and continuous learning.`,
    profilePic: dbCandidate.profilePicture || '',
    noticePeriod: dbCandidate.noticePeriod || 'Not specified',
    university: dbCandidate.collegeName || 'Not specified',
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
  const [view, setView] = useState<'search' | 'results'>('search');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [locationOpen, setLocationOpen] = useState(false);
  const [preferredLocationOpen, setPreferredLocationOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDisplay | null>(null);
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsSearchQuery, setResultsSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showSavedProfiles, setShowSavedProfiles] = useState(false);
  
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
  
  const [, setLocation] = useLocation();
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

  // Fetch candidates to get unique values
  const { data: dbCandidates = [], isLoading: isLoadingCandidates } = useQuery<DatabaseCandidate[]>({
    queryKey: ['/api/admin/candidates'],
  });

  // Map candidates to display format
  const [candidates, setCandidates] = useState<CandidateDisplay[]>([]);
  
  useEffect(() => {
    const mapped = dbCandidates.map(mapDatabaseCandidateToDisplay);
    // Combine database candidates with sample candidates
    setCandidates([...mapped, ...sampleCandidates]);
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

      // Search query filter with Boolean support
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
          const query = resultsSearchQuery.toLowerCase();
          const matches = 
            candidate.name.toLowerCase().includes(query) ||
            candidate.title.toLowerCase().includes(query) ||
            candidate.currentCompany.toLowerCase().includes(query) ||
            candidate.skills.some(skill => skill.toLowerCase().includes(query));
          if (!matches) return false;
        }
      }

      // Experience filter
      if (candidate.experience < filters.experience[0] || candidate.experience > filters.experience[1]) {
        return false;
      }

      // Location filter
      if (filters.location && filters.location !== "All Location" && 
          !candidate.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Role filter
      if (filters.role && filters.role !== "All roles" && 
          !candidate.title.toLowerCase().includes(filters.role.toLowerCase())) {
        return false;
      }

      // Company filter
      if (filters.company && filters.company !== "XYZ company" && 
          !candidate.currentCompany.toLowerCase().includes(filters.company.toLowerCase())) {
        return false;
      }

      // Notice period filter
      if (filters.noticePeriod && filters.noticePeriod !== "Any" && 
          !candidate.noticePeriod.toLowerCase().includes(filters.noticePeriod.toLowerCase())) {
        return false;
      }

      // Education filter
      if (filters.educationUG && !candidate.education.toLowerCase().includes(filters.educationUG.toLowerCase())) {
        return false;
      }

      if (filters.educationPG && !candidate.education.toLowerCase().includes(filters.educationPG.toLowerCase())) {
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
      if (filters.employmentType && filters.employmentType !== "Any" && candidate.employmentType && 
          !candidate.employmentType.toLowerCase().includes(filters.employmentType.toLowerCase())) {
        return false;
      }

      // Display Details - Show candidate with
      if (filters.showWith.includes("resume") && !candidate.profilePic) {
        // If resume is required but candidate doesn't have one, skip
        // This is a placeholder - you may need to check actual resume availability
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

  const savedCount = savedCandidates.size;

  const resetFilters = () => {
    setFilters(initialFilters);
    setKeywordInput("");
    setExcludeKeywordInput("");
    setSpecificSkillInput("");
    setExcludeCompanyInput("");
    setAddDegreeInput("");
    setShowExcludeKeywords(false);
    setShowSpecificSkills(false);
    setShowExcludeCompany(false);
    setShowAddDegree(false);
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
                placeholder="Frontend Developer"
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
                placeholder="1 month"
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
                  onChange={(e) => setResultsSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter the skills, company, designation..."
                />
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                            <p className="text-blue-600 font-medium">{candidate.title} in {candidate.currentCompany}</p>
                            <p className="text-sm text-gray-600 mt-1">{candidate.email}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveCandidate(candidate.id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
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
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div><span className="font-semibold">CTC:</span> {candidate.ctc}</div>
                          <div><span className="font-semibold">Education:</span> {candidate.education}</div>
                          <div><span className="font-semibold">Experience:</span> +{candidate.experience} years</div>
                          <div><span className="font-semibold">Location:</span> {candidate.location}</div>
                        </div>
                        <div className="mb-3">
                          <span className="font-semibold text-sm">Preferred Location: </span>
                          <span className="text-sm text-gray-600">{candidate.preferredLocation}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {candidate.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{candidate.summary}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
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
                        <p className="text-xs text-gray-600">University: {candidate.university}</p>
                        <p className="text-xs text-gray-600">Education: {candidate.education}</p>
                        <div className="flex gap-2 mt-2 justify-end">
                          {candidate.linkedinUrl && (
                            <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {candidate.websiteUrl && (
                            <a href={candidate.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:text-blue-700">
                            <Mail className="w-4 h-4" />
                          </a>
                          {candidate.phone && (
                            <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:text-blue-700">
                              <Phone className="w-4 h-4" />
                            </a>
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
                              <div><span className="font-medium">Current Company:</span> {candidate.currentCompany}</div>
                              <div><span className="font-medium">Role:</span> {candidate.title}</div>
                              <div><span className="font-medium">Company Sector:</span> {candidate.companySector || 'N/A'}</div>
                              <div><span className="font-medium">Company Type:</span> {candidate.productService || 'N/A'}</div>
                              <div><span className="font-medium">Product Category:</span> {candidate.productCategory || 'N/A'}</div>
                              <div><span className="font-medium">Product Domain:</span> {candidate.productDomain || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Work Preference</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-medium">Job Title:</span> {candidate.title}</div>
                            <div><span className="font-medium">Employment Type:</span> {candidate.employmentType || 'Full time'}</div>
                            <div><span className="font-medium">Preferred Location:</span> {candidate.preferredLocation}</div>
                            <div><span className="font-medium">Current Status:</span> Seeking for job</div>
                            <div><span className="font-medium">Candidate Type:</span> Experienced</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Resume</h4>
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="w-5 h-5" />
                              <span>Resume preview will be displayed here</span>
                            </div>
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
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">
                    View Profile
                  </button>
                  <button className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50">
                    Reply
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">last seen: {candidate.lastSeen}</p>
              </div>
            ))}
          </div>
        </div>
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
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={locationOpen}
                    className="w-full justify-between bg-white border-gray-200 rounded-lg h-10 font-normal text-gray-700 hover:bg-gray-50"
                  >
                    {filters.location
                      ? locations.find((loc) => loc.value === filters.location)?.label
                      : "All Location"}
                    <X className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search location..." />
                    <CommandList>
                      <CommandEmpty>No location found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setFilters({ ...filters, location: "" });
                            setLocationOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !filters.location ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Location
                        </CommandItem>
                        {locations.map((location) => (
                          <CommandItem
                            key={location.value}
                            value={location.value}
                            onSelect={() => {
                              setFilters({ ...filters, location: location.value });
                              setLocationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filters.location === location.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {location.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                <Popover open={preferredLocationOpen} onOpenChange={setPreferredLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={preferredLocationOpen}
                      className="w-full justify-between bg-white border-gray-200 rounded-lg h-10 font-normal text-gray-700 hover:bg-gray-50"
                    >
                      {filters.preferredLocation
                        ? locations.find((loc) => loc.value === filters.preferredLocation)?.label
                        : "Any location"}
                      <X className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search location..." />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="any"
                            onSelect={() => {
                              setFilters({ ...filters, preferredLocation: "" });
                              setPreferredLocationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !filters.preferredLocation ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Any location
                          </CommandItem>
                          {locations.map((location) => (
                            <CommandItem
                              key={location.value}
                              value={location.value}
                              onSelect={() => {
                                setFilters({ ...filters, preferredLocation: location.value });
                                setPreferredLocationOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.preferredLocation === location.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {location.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
