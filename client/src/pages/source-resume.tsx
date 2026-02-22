import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Edit,
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
import EditCandidateModal from "@/components/dashboard/modals/edit-candidate-modal";

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

// ============================================
// ENTERPRISE-GRADE BOOLEAN SEARCH ENGINE
// ============================================

interface SearchToken {
  type: 'term' | 'phrase' | 'wildcard' | 'must_include' | 'must_exclude' | 'operator' | 'group_start' | 'group_end';
  value: string;
  field?: string; // For field-specific searches like "skills:React"
}

interface SearchResult {
  matches: boolean;
  score: number;
  matchedTerms: string[];
  fieldMatches: Record<string, number>;
}

// Field weights for scoring
const FIELD_WEIGHTS = {
  skills: 1.0,        // Highest weight
  title: 0.8,         // High weight
  name: 0.6,          // Medium-high
  resumeText: 0.5,    // Medium
  company: 0.4,       // Medium-low
  education: 0.3,      // Low
  location: 0.2,      // Low
  other: 0.1,         // Lowest
};

// Tokenize boolean query with full operator support
const tokenizeBooleanQuery = (query: string): SearchToken[] => {
  const tokens: SearchToken[] = [];
  let i = 0;
  const len = query.length;
  
  while (i < len) {
    // Skip whitespace
    if (/\s/.test(query[i])) {
      i++;
      continue;
    }
    
    // Group start
    if (query[i] === '(') {
      tokens.push({ type: 'group_start', value: '(' });
      i++;
      continue;
    }
    
    // Group end
    if (query[i] === ')') {
      tokens.push({ type: 'group_end', value: ')' });
      i++;
      continue;
    }
    
    // Must include operator (+)
    if (query[i] === '+' && (i === 0 || /\s/.test(query[i - 1]))) {
      tokens.push({ type: 'must_include', value: '+' });
      i++;
      continue;
    }
    
    // Must exclude operator (-)
    if (query[i] === '-' && (i === 0 || /\s/.test(query[i - 1]))) {
      tokens.push({ type: 'must_exclude', value: '-' });
      i++;
      continue;
    }
    
    // NOT operator
    if (query.substr(i, 3).toUpperCase() === 'NOT' && (i === 0 || /\s/.test(query[i - 1]))) {
      tokens.push({ type: 'must_exclude', value: 'NOT' });
      i += 3;
      continue;
    }
    
    // AND operator
    if (query.substr(i, 3).toUpperCase() === 'AND' && (i === 0 || /\s/.test(query[i - 1]))) {
      tokens.push({ type: 'operator', value: 'AND' });
      i += 3;
      continue;
    }
    
    // OR operator
    if (query.substr(i, 2).toUpperCase() === 'OR' && (i === 0 || /\s/.test(query[i - 1]))) {
      tokens.push({ type: 'operator', value: 'OR' });
      i += 2;
      continue;
    }
    
    // Phrase (quoted string)
    if (query[i] === '"') {
      const endQuote = query.indexOf('"', i + 1);
      if (endQuote !== -1) {
        const phrase = query.substring(i + 1, endQuote);
        tokens.push({ type: 'phrase', value: phrase });
        i = endQuote + 1;
        continue;
      }
    }
    
    // Field-specific search (e.g., "skills:React")
    const fieldMatch = query.substr(i).match(/^(\w+):\s*([^\s]+(?:\s+[^\s]+)*)/);
    if (fieldMatch) {
      const field = fieldMatch[1].toLowerCase();
      let value = fieldMatch[2];
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      tokens.push({ type: 'term', value: value, field });
      i += fieldMatch[0].length;
      continue;
    }
    
    // Extract term (word or wildcard)
    let term = '';
    while (i < len && !/\s/.test(query[i]) && query[i] !== '(' && query[i] !== ')' && 
           query.substr(i, 3).toUpperCase() !== 'AND' && query.substr(i, 2).toUpperCase() !== 'OR' &&
           query.substr(i, 3).toUpperCase() !== 'NOT') {
      term += query[i];
      i++;
    }
    
    if (term) {
      // Check for wildcard
      if (term.includes('*')) {
        tokens.push({ type: 'wildcard', value: term });
      } else {
        tokens.push({ type: 'term', value: term });
      }
    }
  }
  
  return tokens;
};

// Get field text from candidate
const getFieldText = (candidate: CandidateDisplay, field?: string): { text: string; weight: number } => {
  if (!field) {
    return { text: getCandidateSearchText(candidate), weight: FIELD_WEIGHTS.other };
  }
  
  const fieldLower = field.toLowerCase();
  let text = '';
  let weight = FIELD_WEIGHTS.other;
  
  switch (fieldLower) {
    case 'skill':
    case 'skills':
      text = candidate.skills.join(' ').toLowerCase();
      weight = FIELD_WEIGHTS.skills;
      break;
    case 'title':
    case 'role':
    case 'designation':
      text = candidate.title.toLowerCase();
      weight = FIELD_WEIGHTS.title;
      break;
    case 'name':
      text = candidate.name.toLowerCase();
      weight = FIELD_WEIGHTS.name;
      break;
    case 'company':
      text = candidate.currentCompany.toLowerCase();
      weight = FIELD_WEIGHTS.company;
      break;
    case 'location':
      text = candidate.location.toLowerCase();
      weight = FIELD_WEIGHTS.location;
      break;
    case 'education':
      text = candidate.education.toLowerCase();
      weight = FIELD_WEIGHTS.education;
      break;
    case 'resume':
    case 'resumetext':
      text = (candidate.resumeText || '').substring(0, 2000).toLowerCase();
      weight = FIELD_WEIGHTS.resumeText;
      break;
    default:
      text = getCandidateSearchText(candidate);
      weight = FIELD_WEIGHTS.other;
  }
  
  return { text, weight };
};

// Match term with wildcard support
const matchTerm = (text: string, term: string, isWildcard: boolean = false): { matches: boolean; score: number } => {
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  
  if (isWildcard) {
    // Convert wildcard pattern to regex
    const pattern = lowerTerm.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${pattern}$`, 'i');
    if (regex.test(lowerText)) {
      return { matches: true, score: 0.8 };
    }
    
    // Also check if pattern matches any word in text
    const words = lowerText.split(/\s+/);
    for (const word of words) {
      if (regex.test(word)) {
        return { matches: true, score: 0.7 };
      }
    }
    return { matches: false, score: 0 };
  }
  
  // Exact match
  if (lowerText === lowerTerm) {
    return { matches: true, score: 1.0 };
  }
  
  // Word boundary match
  const wordBoundaryRegex = new RegExp(`\\b${lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  if (wordBoundaryRegex.test(lowerText)) {
    return { matches: true, score: 0.9 };
  }
  
  // Contains match
  if (lowerText.includes(lowerTerm)) {
    return { matches: true, score: 0.7 };
  }
  
  // Fuzzy match
  const similarity = calculateSimilarity(lowerText, lowerTerm);
  if (similarity >= 0.75) {
    return { matches: true, score: similarity * 0.6 };
  }
  
  return { matches: false, score: 0 };
};

// Match phrase (exact phrase matching)
const matchPhrase = (text: string, phrase: string): { matches: boolean; score: number } => {
  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();
  
  if (lowerText.includes(lowerPhrase)) {
    // Calculate score based on position and frequency
    const positions = [];
    let index = lowerText.indexOf(lowerPhrase);
    while (index !== -1) {
      positions.push(index);
      index = lowerText.indexOf(lowerPhrase, index + 1);
    }
    
    // Higher score for earlier matches and multiple matches
    const baseScore = 0.9;
    const frequencyBonus = Math.min(positions.length * 0.1, 0.2);
    const positionBonus = positions[0] < 100 ? 0.1 : 0;
    
    return { matches: true, score: baseScore + frequencyBonus + positionBonus };
  }
  
  return { matches: false, score: 0 };
};

// Evaluate boolean expression tree
const evaluateBooleanExpression = (
  tokens: SearchToken[],
  candidate: CandidateDisplay
): SearchResult => {
  if (tokens.length === 0) {
    return { matches: true, score: 0, matchedTerms: [], fieldMatches: {} };
  }
  
  // Handle parentheses by recursively evaluating groups
  const processGroups = (tokens: SearchToken[]): SearchToken[] => {
    const result: SearchToken[] = [];
    let i = 0;
    
    while (i < tokens.length) {
      if (tokens[i].type === 'group_start') {
        // Find matching closing parenthesis
        let depth = 1;
        let j = i + 1;
        while (j < tokens.length && depth > 0) {
          if (tokens[j].type === 'group_start') depth++;
          if (tokens[j].type === 'group_end') depth--;
          j++;
        }
        
        // Evaluate inner expression
        const innerTokens = tokens.slice(i + 1, j - 1);
        const innerResult = evaluateBooleanExpression(innerTokens, candidate);
        
        // Replace group with a virtual token representing the result
        result.push({
          type: innerResult.matches ? 'term' : 'must_exclude',
          value: innerResult.matches ? '__TRUE__' : '__FALSE__',
        });
        
        i = j;
      } else {
        result.push(tokens[i]);
        i++;
      }
    }
    
    return result;
  };
  
  tokens = processGroups(tokens);
  
  // Process must-exclude terms first (NOT, -)
  const mustExcludeTerms: SearchToken[] = [];
  const remainingTokens: SearchToken[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'must_exclude') {
      // Get next term
      if (i + 1 < tokens.length && (tokens[i + 1].type === 'term' || tokens[i + 1].type === 'phrase' || tokens[i + 1].type === 'wildcard')) {
        mustExcludeTerms.push(tokens[i + 1]);
        i++; // Skip the term
      }
    } else if (tokens[i].type !== 'must_include') {
      remainingTokens.push(tokens[i]);
    } else {
      // Must include - keep the operator and next term together
      remainingTokens.push(tokens[i]);
    }
  }
  
  // Check must-exclude terms
  for (const token of mustExcludeTerms) {
    const fieldData = getFieldText(candidate, token.field);
    let matchResult: { matches: boolean; score: number };
    
    if (token.type === 'phrase') {
      matchResult = matchPhrase(fieldData.text, token.value);
    } else if (token.type === 'wildcard') {
      matchResult = matchTerm(fieldData.text, token.value, true);
    } else {
      matchResult = matchTerm(fieldData.text, token.value);
    }
    
    if (matchResult.matches) {
      return { matches: false, score: 0, matchedTerms: [], fieldMatches: {} };
    }
  }
  
  // Evaluate remaining expression with AND/OR logic
  let totalScore = 0;
  let matchedTerms: string[] = [];
  const fieldMatches: Record<string, number> = {};
  
  // Default to OR if no explicit operator
  const hasExplicitOperator = tokens.some(t => t.type === 'operator');
  const defaultOperator = hasExplicitOperator ? null : 'OR';
  
  // Split by operators
  const segments: SearchToken[][] = [];
  let currentSegment: SearchToken[] = [];
  let currentOperator: string | null = defaultOperator;
  
  for (let i = 0; i < remainingTokens.length; i++) {
    const token = remainingTokens[i];
    
    if (token.type === 'operator') {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
      currentOperator = token.value.toUpperCase();
    } else if (token.type === 'must_include') {
      // Must include operator - treat next term as required
      if (i + 1 < remainingTokens.length) {
        currentSegment.push({ ...remainingTokens[i + 1], type: 'must_include' as any });
        i++;
      }
    } else {
      currentSegment.push(token);
    }
  }
  
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }
  
  // Evaluate segments
  let allMatch = true;
  let anyMatch = false;
  
  for (const segment of segments) {
    let segmentMatches = false;
    let segmentScore = 0;
    const segmentMatchedTerms: string[] = [];
    
    for (const token of segment) {
      if (token.value === '__TRUE__') {
        segmentMatches = true;
        segmentScore = 1.0;
        continue;
      }
      if (token.value === '__FALSE__') {
        segmentMatches = false;
        segmentScore = 0;
        continue;
      }
      
      const isRequired = token.type === 'must_include';
      const fieldData = getFieldText(candidate, token.field);
      let matchResult: { matches: boolean; score: number };
      
      if (token.type === 'phrase') {
        matchResult = matchPhrase(fieldData.text, token.value);
      } else if (token.type === 'wildcard') {
        matchResult = matchTerm(fieldData.text, token.value, true);
      } else {
        matchResult = matchTerm(fieldData.text, token.value);
      }
      
      if (matchResult.matches) {
        const weightedScore = matchResult.score * fieldData.weight;
        segmentScore += weightedScore;
        segmentMatchedTerms.push(token.value);
        
        // Track field matches
        const fieldKey = token.field || 'general';
        fieldMatches[fieldKey] = (fieldMatches[fieldKey] || 0) + weightedScore;
        
        if (isRequired || segment.length === 1) {
          segmentMatches = true;
        }
      } else if (isRequired) {
        // Required term didn't match
        segmentMatches = false;
        break;
      }
    }
    
    if (segmentMatches) {
      anyMatch = true;
      totalScore += segmentScore;
      matchedTerms.push(...segmentMatchedTerms);
    } else {
      allMatch = false;
    }
  }
  
  // Determine final match based on operator
  let finalMatch = false;
  if (currentOperator === 'AND' || (!hasExplicitOperator && segments.length > 1)) {
    finalMatch = allMatch && segments.length > 0;
  } else {
    finalMatch = anyMatch || segments.length === 0;
  }
  
  // Normalize score (0-100)
  const normalizedScore = Math.min(100, Math.round(totalScore * 100));
  
  return {
    matches: finalMatch,
    score: normalizedScore,
    matchedTerms: [...new Set(matchedTerms)],
    fieldMatches,
  };
};

// Main boolean search function with full operator support
const parseAdvancedBooleanSearch = (query: string, candidate: CandidateDisplay): SearchResult => {
  if (!query || !query.trim()) {
    return { matches: true, score: 0, matchedTerms: [], fieldMatches: {} };
  }
  
  try {
    const tokens = tokenizeBooleanQuery(query.trim());
    return evaluateBooleanExpression(tokens, candidate);
  } catch (error) {
    console.error('Boolean search parsing error:', error);
    // Fallback to simple search
    const searchText = getCandidateSearchText(candidate);
    const simpleMatch = matchTerm(searchText, query);
    return {
      matches: simpleMatch.matches,
      score: simpleMatch.score * 50,
      matchedTerms: simpleMatch.matches ? [query] : [],
      fieldMatches: {},
    };
  }
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
  // New filter options
  skillMatchPercentage: number;
  filterLogic: 'all' | 'any';
  selectedRequirementId?: string;
}

interface CandidateWithScore extends CandidateDisplay {
  relevanceScore: number;
  matchPercentage?: number;
  matchedTerms: string[];
}

type SortOption = 'relevance' | 'experience-high' | 'experience-low' | 'ctc-high' | 'ctc-low' | 'notice-period' | 'recently-updated' | 'alphabetical';

interface SavedSearchTemplate {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: number;
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
  skillMatchPercentage: 0,
  filterLogic: 'all',
  selectedRequirementId: undefined,
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
          className="w-full justify-between bg-white border-gray-200 rounded-lg h-10 font-normal text-gray-700 hover:bg-gray-50 relative"
          onClick={(e) => {
            // Don't open if clicking on the X button
            if ((e.target as HTMLElement).closest('.clear-filter-button')) {
              return;
            }
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
              className="clear-filter-button ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer z-10" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
                setOpen(false);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
  resumeText?: string; // Raw resume text for better searchability
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
  resumeText?: string; // Raw resume text for better searchability
  createdAt?: string; // For reactive lastSeen calculation
  isFromDatabase?: boolean;
}

function mapDatabaseCandidateToDisplay(dbCandidate: DatabaseCandidate, currentTime: Date): CandidateDisplay {
  const skillsArray = dbCandidate.skills 
    ? dbCandidate.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  
  const experienceNum = dbCandidate.experience 
    ? parseFloat(dbCandidate.experience.replace(/[^\d.]/g, '')) || 0
    : 0;
  
  // Use lastViewedAt if available, otherwise fall back to createdAt
  const lastViewedAt = (dbCandidate as any).lastViewedAt;
  const dateToUse = lastViewedAt 
    ? new Date(lastViewedAt) 
    : new Date(dbCandidate.createdAt);
  
  // Validate date
  const isValidDate = !isNaN(dateToUse.getTime());
  if (!isValidDate) {
    // If date is invalid, use current time as fallback
    dateToUse.setTime(currentTime.getTime());
  }
  
  const diffMs = currentTime.getTime() - dateToUse.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  let lastSeen = '';
  if (diffMinutes < 1) {
    lastSeen = 'Just now';
  } else if (diffMinutes < 60) {
    lastSeen = diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    lastSeen = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    lastSeen = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else {
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      lastSeen = diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      lastSeen = diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    }
  }

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
    resumeText: dbCandidate.resumeText, // Include raw resume text for enhanced searchability
    candidateId: dbCandidate.candidateId,
    createdAt: dbCandidate.createdAt, // Store for reactive calculation
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

    // Security check: Prevent direct URL access - must come from recruiter dashboard
    const isFromRecruiter = sessionStorage.getItem('sourceResumeAccess') === 'true';
    const referrer = document.referrer;
    
    // Check if accessed from recruiter page or if referrer contains the recruiter dashboard path
    if (!isFromRecruiter && !referrer.includes('/recruiter-login-2') && !referrer.includes('/source-resume')) {
      // If accessed directly via URL, redirect to recruiter login
      setLocation('/recruiter-login-2');
      return;
    }
    
    // Clear the access flag after use
    sessionStorage.removeItem('sourceResumeAccess');
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
  
  // Trigger initial search if we're already in results view (e.g., page refresh)
  useEffect(() => {
    // Check if we should be in results view (e.g., from URL or session)
    // For now, we'll trigger search when component mounts if view is results
    if (view === 'results' && searchResults === null && !isSearching) {
      const timer = setTimeout(() => {
        if (performSearchRef.current) {
          console.log('Initial search trigger on mount');
          performSearchRef.current(1);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []); // Only run on mount
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDisplay | null>(null);
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsSearchQuery, setResultsSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showSavedProfiles, setShowSavedProfiles] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<CandidateDisplay | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
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
  
  // New state for enhanced features
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [savedSearchTemplates, setSavedSearchTemplates] = useState<SavedSearchTemplate[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [compareCandidates, setCompareCandidates] = useState<CandidateDisplay[]>([]);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  const { toast } = useToast();
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(resultsSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [resultsSearchQuery]);
  
  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input in results view
        if (view === 'results') {
          const searchInput = document.querySelector('input[placeholder*="skills, company"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);
  
  // Export candidates to CSV
  const exportToCSV = (candidatesToExport: CandidateWithScore[]) => {
    const headers = ['Name', 'Email', 'Title', 'Company', 'Location', 'Experience', 'Skills', 'CTC', 'Notice Period', 'Education', 'Relevance Score', 'Match %'];
    const rows = candidatesToExport.map(c => [
      c.name,
      c.email,
      c.title,
      c.currentCompany,
      c.location,
      `${c.experience} years`,
      c.skills.join('; '),
      c.ctc,
      c.noticePeriod,
      c.education,
      c.relevanceScore?.toString() || '0',
      c.matchPercentage?.toString() || '0',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${candidatesToExport.length} candidates to CSV`,
    });
  };
  
  // Toggle candidate selection
  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };
  
  // Load saved search templates
  useEffect(() => {
    const stored = localStorage.getItem('sourceResumeSavedTemplates');
    if (stored) {
      try {
        setSavedSearchTemplates(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved templates', e);
      }
    }
  }, []);

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

  // Server-side search state
  const [searchResults, setSearchResults] = useState<{
    candidates: CandidateWithScore[];
    pagination: { page: number; pageSize: number; totalCount: number; totalPages: number };
    analytics: any;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Server-side search query
  const searchMutation = useMutation({
    mutationFn: async (searchParams: any) => {
      const response = await apiRequest('POST', '/api/source-resume/search', searchParams);
      return await response.json();
    },
  });

  // Fetch candidates for initial load (fallback for non-search views)
  const { data: dbCandidates = [], isLoading: isLoadingCandidates } = useQuery<DatabaseCandidate[]>({
    queryKey: ['/api/admin/candidates'],
    enabled: view === 'search', // Only fetch all candidates in search view
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

  // Update current time every minute for reactive lastSeen calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Map candidates to display format - use useMemo to prevent infinite loops
  const candidates = useMemo(() => {
    if (!dbCandidates || dbCandidates.length === 0) return [];
    return dbCandidates.map(c => mapDatabaseCandidateToDisplay(c, currentTime));
  }, [dbCandidates, currentTime]);

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

  // Fuzzy string matching utility (Levenshtein distance based)
  const fuzzyMatch = (text: string, pattern: string, threshold: number = 0.8): boolean => {
    const lowerText = text.toLowerCase();
    const lowerPattern = pattern.toLowerCase();
    
    // Exact match (highest priority)
    if (lowerText.includes(lowerPattern)) return true;
    
    // Word boundary match
    const wordBoundaryRegex = new RegExp(`\\b${lowerPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (wordBoundaryRegex.test(lowerText)) return true;
    
    // Fuzzy match using simple similarity
    const words = lowerText.split(/\s+/);
    for (const word of words) {
      if (word.length >= 3 && lowerPattern.length >= 3) {
        // Check if pattern is contained in word or vice versa with similarity
        const similarity = calculateSimilarity(word, lowerPattern);
        if (similarity >= threshold) return true;
      }
    }
    
    return false;
  };

  // Calculate similarity between two strings (simple Jaccard-like similarity)
  const calculateSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    // Check if one contains the other
    if (str1.includes(str2) || str2.includes(str1)) {
      return Math.min(str1.length, str2.length) / Math.max(str1.length, str2.length);
    }
    
    // Simple character overlap similarity
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  };

  // Extract searchable text from candidate - includes resumeText for comprehensive searching
  const getCandidateSearchText = (candidate: CandidateDisplay): string => {
    // Base searchable fields
    let searchText = `${candidate.name} ${candidate.title} ${candidate.currentCompany} ${candidate.skills.join(' ')} ${candidate.location} ${candidate.education} ${candidate.email}`;
    
    // Add resumeText if available for more comprehensive search (first 2000 chars to avoid performance issues)
    if (candidate.resumeText) {
      const resumeTextSnippet = candidate.resumeText.substring(0, 2000).toLowerCase();
      searchText += ` ${resumeTextSnippet}`;
    }
    
    // Add other searchable fields
    if (candidate.preferredLocation) {
      searchText += ` ${candidate.preferredLocation}`;
    }
    if (candidate.university) {
      searchText += ` ${candidate.university}`;
    }
    if (candidate.productDomain) {
      searchText += ` ${candidate.productDomain}`;
    }
    
    return searchText.toLowerCase();
  };

  // Use the enhanced boolean search parser (defined above as a module-level function)

  // Filter candidates based on search criteria
  const filterCandidates = (candidatesList: CandidateDisplay[]): CandidateDisplay[] => {
    return candidatesList.filter((candidate) => {
      // Excluded keywords filter (must not contain) - with fuzzy matching
      if (filters.excludedKeywords.length > 0) {
        const searchText = getCandidateSearchText(candidate);
        const hasExcluded = filters.excludedKeywords.some(keyword =>
          fuzzyMatch(searchText, keyword, 0.85) // Higher threshold for exclusion to avoid false positives
        );
        if (hasExcluded) return false;
      }

      // Excluded companies filter - with fuzzy matching
      if (filters.excludedCompanies.length > 0) {
        const hasExcludedCompany = filters.excludedCompanies.some(company =>
          fuzzyMatch(candidate.currentCompany.toLowerCase(), company.toLowerCase(), 0.85)
        );
        if (hasExcludedCompany) return false;
      }

      // Keywords filter - with fuzzy matching
      if (filters.keywords.length > 0) {
        const searchText = getCandidateSearchText(candidate);
        const hasKeyword = filters.keywords.some(keyword =>
          fuzzyMatch(searchText, keyword, 0.75)
        );
        if (!hasKeyword) return false;
      }

      // Specific skills filter (must have all) - with fuzzy matching
      if (filters.specificSkills.length > 0) {
        const skillsText = candidate.skills.join(' ').toLowerCase();
        const hasAllSkills = filters.specificSkills.every(skill =>
          fuzzyMatch(skillsText, skill.toLowerCase(), 0.75)
        );
        if (!hasAllSkills) return false;
      }

      // Search query filter - Enhanced with scoring
      let searchScore = 0;
      let matchedTerms: string[] = [];
      
      if (resultsSearchQuery.trim()) {
        if (filters.booleanMode) {
          // Use enhanced boolean search parser with full capabilities
          const searchResult = parseAdvancedBooleanSearch(resultsSearchQuery, candidate);
          if (!searchResult.matches) {
            return false;
          }
          searchScore = searchResult.score;
          matchedTerms = searchResult.matchedTerms;
        } else {
          // Default behavior: Split multiple words and use OR logic with fuzzy matching
          const searchTerms = extractSearchTerms(resultsSearchQuery);
          const searchText = getCandidateSearchText(candidate);
          
          // At least one term must match (with fuzzy matching for better results)
          const matches = searchTerms.some(term => 
            fuzzyMatch(searchText, term, 0.7) // Lower threshold for default mode
          );
          
          if (!matches) return false;
          
          // Calculate simple score for non-boolean mode
          let matchCount = 0;
          for (const term of searchTerms) {
            if (fuzzyMatch(searchText, term, 0.7)) {
              matchCount++;
              matchedTerms.push(term);
            }
          }
          searchScore = (matchCount / searchTerms.length) * 50; // Normalize to 0-50
        }
      }

      // Experience filter
      if (candidate.experience < filters.experience[0] || candidate.experience > filters.experience[1]) {
        return false;
      }

      // Location filter - with fuzzy matching for better accuracy
      if (filters.location && filters.location.trim() !== "") {
        const locationMatch = fuzzyMatch(candidate.location.toLowerCase(), filters.location.toLowerCase(), 0.8) ||
                             candidate.location.toLowerCase().includes(filters.location.toLowerCase());
        if (!locationMatch) return false;
      }

      // Preferred Location filter - with fuzzy matching
      if (filters.preferredLocation && filters.preferredLocation.trim() !== "") {
        const prefLocationMatch = fuzzyMatch(candidate.preferredLocation.toLowerCase(), filters.preferredLocation.toLowerCase(), 0.8) ||
                                 candidate.preferredLocation.toLowerCase().includes(filters.preferredLocation.toLowerCase());
        if (!prefLocationMatch) return false;
      }

      // Role filter - with fuzzy matching for partial matches
      if (filters.role && filters.role.trim() !== "") {
        const roleMatch = fuzzyMatch(candidate.title.toLowerCase(), filters.role.toLowerCase(), 0.75) ||
                         candidate.title.toLowerCase().includes(filters.role.toLowerCase());
        if (!roleMatch) return false;
      }

      // Company filter - with fuzzy matching
      if (filters.company && filters.company.trim() !== "") {
        const companyMatch = fuzzyMatch(candidate.currentCompany.toLowerCase(), filters.company.toLowerCase(), 0.8) ||
                            candidate.currentCompany.toLowerCase().includes(filters.company.toLowerCase());
        if (!companyMatch) return false;
      }

      // Notice period filter - exact/partial matching
      if (filters.noticePeriod && filters.noticePeriod.trim() !== "") {
        const noticeLower = candidate.noticePeriod.toLowerCase();
        const filterLower = filters.noticePeriod.toLowerCase();
        
        // Handle special cases like "Immediate", "Any"
        if (filterLower === "any") {
          // Accept all
        } else if (filterLower === "immediate" && !noticeLower.includes("immediate") && !noticeLower.includes("0")) {
          return false;
        } else if (!noticeLower.includes(filterLower)) {
          // Try to match numbers
          const noticeNum = noticeLower.match(/\d+/);
          const filterNum = filterLower.match(/\d+/);
          if (noticeNum && filterNum && noticeNum[0] !== filterNum[0]) {
            return false;
          } else if (!noticeNum || !filterNum) {
            return false;
          }
        }
      }

      // Education filter - with fuzzy matching
      if (filters.educationUG && filters.educationUG.trim() !== "") {
        const eduMatch = fuzzyMatch(candidate.education.toLowerCase(), filters.educationUG.toLowerCase(), 0.8) ||
                        candidate.education.toLowerCase().includes(filters.educationUG.toLowerCase());
        if (!eduMatch) return false;
      }

      if (filters.educationPG && filters.educationPG.trim() !== "") {
        const eduMatch = fuzzyMatch(candidate.education.toLowerCase(), filters.educationPG.toLowerCase(), 0.8) ||
                        candidate.education.toLowerCase().includes(filters.educationPG.toLowerCase());
        if (!eduMatch) return false;
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

  // Calculate comprehensive relevance score for a candidate
  const calculateRelevanceScore = (candidate: CandidateDisplay, matchedTerms: string[] = []): number => {
    let score = 0;
    
    // Base search score (from boolean search or simple search)
    if (debouncedSearchQuery.trim()) {
      if (filters.booleanMode) {
        const searchResult = parseAdvancedBooleanSearch(debouncedSearchQuery, candidate);
        score += searchResult.score * 0.4; // 40% weight
      } else {
        const searchTerms = extractSearchTerms(debouncedSearchQuery);
        const searchText = getCandidateSearchText(candidate);
        let matchCount = 0;
        for (const term of searchTerms) {
          if (fuzzyMatch(searchText, term, 0.7)) matchCount++;
        }
        score += (matchCount / searchTerms.length) * 50 * 0.4;
      }
    }
    
    // Skill match score (highest weight)
    if (filters.specificSkills.length > 0) {
      const skillsText = candidate.skills.join(' ').toLowerCase();
      let skillMatchCount = 0;
      for (const skill of filters.specificSkills) {
        if (fuzzyMatch(skillsText, skill.toLowerCase(), 0.75)) {
          skillMatchCount++;
        }
      }
      score += (skillMatchCount / filters.specificSkills.length) * 100 * 0.3; // 30% weight
    }
    
    // Experience relevance (proximity to filter range)
    const expMid = (filters.experience[0] + filters.experience[1]) / 2;
    const expDiff = Math.abs(candidate.experience - expMid);
    const expRange = filters.experience[1] - filters.experience[0];
    if (expRange > 0) {
      const expScore = Math.max(0, 1 - (expDiff / expRange)) * 100;
      score += expScore * 0.1; // 10% weight
    }
    
    // Recency score (based on last seen/created)
    if (candidate.createdAt) {
      const createdDate = new Date(candidate.createdAt);
      const daysSinceCreation = (currentTime.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 100 - (daysSinceCreation / 30) * 10); // Decay over 30 days
      score += recencyScore * 0.1; // 10% weight
    }
    
    // Title similarity (if role filter is set)
    if (filters.role && filters.role.trim() !== "") {
      const titleSimilarity = calculateSimilarity(candidate.title.toLowerCase(), filters.role.toLowerCase());
      score += titleSimilarity * 100 * 0.1; // 10% weight
    }
    
    return Math.min(100, Math.round(score));
  };
  
  // Calculate match percentage for requirement (if selected)
  const calculateRequirementMatch = (candidate: CandidateDisplay, requirement: any): number => {
    if (!requirement) return 0;
    
    let matchScore = 0;
    let totalWeight = 0;
    
    // Skills match
    if (requirement.skills || requirement.requiredSkills) {
      const reqSkills = requirement.skills || requirement.requiredSkills || [];
      const candidateSkills = candidate.skills.map(s => s.toLowerCase());
      let skillMatches = 0;
      for (const reqSkill of reqSkills) {
        if (candidateSkills.some(cs => cs.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(cs))) {
          skillMatches++;
        }
      }
      if (reqSkills.length > 0) {
        const skillScore = (skillMatches / reqSkills.length) * 100;
        matchScore += skillScore * 0.4;
        totalWeight += 0.4;
      }
    }
    
    // Experience match
    if (requirement.experience) {
      const reqExp = parseFloat(requirement.experience) || 0;
      const expDiff = Math.abs(candidate.experience - reqExp);
      const expScore = Math.max(0, 100 - (expDiff * 10));
      matchScore += expScore * 0.2;
      totalWeight += 0.2;
    }
    
    // Location match
    if (requirement.location) {
      const locationMatch = candidate.location.toLowerCase().includes(requirement.location.toLowerCase()) ||
                           candidate.preferredLocation.toLowerCase().includes(requirement.location.toLowerCase());
      matchScore += (locationMatch ? 100 : 0) * 0.15;
      totalWeight += 0.15;
    }
    
    // Title/Role match
    if (requirement.position || requirement.jobTitle) {
      const reqTitle = (requirement.position || requirement.jobTitle).toLowerCase();
      const titleSimilarity = calculateSimilarity(candidate.title.toLowerCase(), reqTitle);
      matchScore += titleSimilarity * 100 * 0.15;
      totalWeight += 0.15;
    }
    
    // Education match
    if (requirement.education) {
      const eduMatch = candidate.education.toLowerCase().includes(requirement.education.toLowerCase());
      matchScore += (eduMatch ? 100 : 0) * 0.1;
      totalWeight += 0.1;
    }
    
    return totalWeight > 0 ? Math.round(matchScore / totalWeight) : 0;
  };
  
  // Sort candidates based on sort option
  const sortCandidates = (candidates: CandidateWithScore[], sortBy: SortOption): CandidateWithScore[] => {
    const sorted = [...candidates];
    
    switch (sortBy) {
      case 'relevance':
        // If requirement is selected, prioritize match percentage, then relevance score
        if (filters.selectedRequirementId) {
          return sorted.sort((a, b) => {
            const aMatch = a.matchPercentage || 0;
            const bMatch = b.matchPercentage || 0;
            if (bMatch !== aMatch) return bMatch - aMatch;
            return b.relevanceScore - a.relevanceScore;
          });
        }
        return sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      case 'experience-high':
        return sorted.sort((a, b) => b.experience - a.experience);
      
      case 'experience-low':
        return sorted.sort((a, b) => a.experience - b.experience);
      
      case 'ctc-high':
        return sorted.sort((a, b) => {
          const aCtc = parseFloat(a.ctc.replace(/[^\d.]/g, '')) || 0;
          const bCtc = parseFloat(b.ctc.replace(/[^\d.]/g, '')) || 0;
          return bCtc - aCtc;
        });
      
      case 'ctc-low':
        return sorted.sort((a, b) => {
          const aCtc = parseFloat(a.ctc.replace(/[^\d.]/g, '')) || 0;
          const bCtc = parseFloat(b.ctc.replace(/[^\d.]/g, '')) || 0;
          return aCtc - bCtc;
        });
      
      case 'notice-period':
        return sorted.sort((a, b) => {
          const aNotice = parseInt(a.noticePeriod.match(/\d+/)?.[0] || '999');
          const bNotice = parseInt(b.noticePeriod.match(/\d+/)?.[0] || '999');
          return aNotice - bNotice;
        });
      
      case 'recently-updated':
        return sorted.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      default:
        return sorted;
    }
  };
  
  // Use server-side search results if available, otherwise fallback to client-side
  const displayCandidates: CandidateWithScore[] = useMemo(() => {
    if (view === 'results' && searchResults) {
      // Use server-side search results
      let candidates = searchResults.candidates.map(c => {
        // Calculate lastSeen from lastViewedAt or createdAt
        const lastViewedAt = (c as any).lastViewedAt;
        const dateToUse = lastViewedAt 
          ? new Date(lastViewedAt) 
          : new Date(c.createdAt);
        
        const diffMs = currentTime.getTime() - dateToUse.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let lastSeen = '';
        if (diffMinutes < 1) {
          lastSeen = 'Just now';
        } else if (diffMinutes < 60) {
          lastSeen = diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
          lastSeen = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays < 7) {
          lastSeen = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        } else {
          const diffWeeks = Math.floor(diffDays / 7);
          if (diffWeeks < 4) {
            lastSeen = diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
          } else {
            const diffMonths = Math.floor(diffDays / 30);
            lastSeen = diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
          }
        }

        return {
          ...c,
          // Ensure all required fields are present
          name: c.fullName || c.name,
          title: c.designation || c.currentRole || c.title || 'Not Available',
          currentCompany: c.company || 'Not Available',
          location: c.location || 'Not Available',
          preferredLocation: c.preferredLocation || c.location || 'Not Available',
          experience: parseFloat(c.experience?.replace(/[^\d.]/g, '') || '0'),
          education: c.education || 'Not Available',
          skills: c.skills ? (typeof c.skills === 'string' ? c.skills.split(',').map(s => s.trim()) : c.skills) : [],
          ctc: c.ctc || c.ectc || 'Not Available',
          noticePeriod: c.noticePeriod || 'Not Available',
          email: c.email,
          phone: c.phone || '',
          profilePic: c.profilePicture || '',
          university: c.collegeName || 'Not Available',
          saved: savedCandidates.has(c.id),
          resumeFile: c.resumeFile,
          resumeText: c.resumeText,
          createdAt: c.createdAt,
          lastSeen, // Add calculated lastSeen
          isFromDatabase: !!(c.resumeFile || c.addedBy),
        } as CandidateWithScore;
      });
      
      // Filter saved profiles if needed
      if (showSavedProfiles) {
        candidates = candidates.filter(c => savedCandidates.has(c.id));
      }
      
      return candidates;
    }
    
    // Fallback to client-side filtering (for search view or when no server results)
    const filteredCandidates = filterCandidates(candidates);
    const scoredCandidates: CandidateWithScore[] = filteredCandidates.map(candidate => {
      let matchedTerms: string[] = [];
      if (debouncedSearchQuery.trim()) {
        if (filters.booleanMode) {
          const searchResult = parseAdvancedBooleanSearch(debouncedSearchQuery, candidate);
          matchedTerms = searchResult.matchedTerms;
        } else {
          const searchTerms = extractSearchTerms(debouncedSearchQuery);
          const searchText = getCandidateSearchText(candidate);
          matchedTerms = searchTerms.filter(term => fuzzyMatch(searchText, term, 0.7));
        }
      }
      
      const relevanceScore = calculateRelevanceScore(candidate, matchedTerms);
      
      let matchPercentage: number | undefined;
      if (filters.selectedRequirementId) {
        const requirement = requirements.find((r: any) => r.id === filters.selectedRequirementId);
        if (requirement) {
          matchPercentage = calculateRequirementMatch(candidate, requirement);
        }
      }
      
      return {
        ...candidate,
        relevanceScore,
        matchPercentage,
        matchedTerms,
      };
    });
    
    const sortedCandidates = sortCandidates(scoredCandidates, sortOption);
    return showSavedProfiles 
      ? sortedCandidates.filter(c => savedCandidates.has(c.id))
      : sortedCandidates;
  }, [view, searchResults, showSavedProfiles, savedCandidates, candidates, filters, debouncedSearchQuery, sortOption, requirements]);

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
  
  // Fetch all candidates for recommended candidates (separate from search results)
  const { data: allCandidates = [] } = useQuery<DatabaseCandidate[]>({
    queryKey: ['/api/admin/candidates'],
    enabled: true, // Always fetch for recommended candidates
  });

  // Convert all candidates to display format for recommended section
  const allDisplayCandidates = useMemo(() => {
    return allCandidates.map(c => mapDatabaseCandidateToDisplay(c, currentTime));
  }, [allCandidates, currentTime]);

  const candidatesPerPage = 10;
  const totalPages = searchResults?.pagination?.totalPages || Math.ceil(displayCandidates.length / candidatesPerPage);
  const paginatedCandidates = searchResults 
    ? displayCandidates // Server-side already paginated
    : displayCandidates.slice(
        (currentPage - 1) * candidatesPerPage,
        currentPage * candidatesPerPage
      );

  // Recommended candidates - show different candidates from main database, not search results
  const recommendedCandidates = useMemo(() => {
    if (selectedCandidate) {
      // When a candidate is selected, show similar candidates from ALL candidates (not search results)
      return allDisplayCandidates
        .filter(c => c.id !== selectedCandidate.id)
        .filter(c => {
          // Exclude candidates that are already in search results
          const isInSearchResults = displayCandidates.some(dc => dc.id === c.id);
          if (isInSearchResults) return false;
          
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
        .slice(0, 5);
    } else {
      // When no candidate is selected, show random candidates from ALL candidates (not search results)
      return allDisplayCandidates
        .filter(c => {
          // Exclude candidates that are already in search results
          return !displayCandidates.some(dc => dc.id === c.id);
        })
        .slice(0, 5);
    }
  }, [selectedCandidate, allDisplayCandidates, displayCandidates]);

  // Store current values in refs to avoid dependency issues
  const filtersRef = useRef(filters);
  const sortOptionRef = useRef(sortOption);
  const debouncedSearchQueryRef = useRef(debouncedSearchQuery);
  const resultsSearchQueryRef = useRef(resultsSearchQuery);
  
  // Update refs when values change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  
  useEffect(() => {
    sortOptionRef.current = sortOption;
  }, [sortOption]);
  
  useEffect(() => {
    debouncedSearchQueryRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);
  
  useEffect(() => {
    resultsSearchQueryRef.current = resultsSearchQuery;
  }, [resultsSearchQuery]);

  // Perform server-side search - use refs to avoid recreation
  const performSearch = useCallback(async (page: number = 1) => {
    setIsSearching(true);
    try {
      const currentFilters = filtersRef.current;
      const currentSortOption = sortOptionRef.current;
      const currentSearchQuery = debouncedSearchQueryRef.current || resultsSearchQueryRef.current;
      
      const searchParams = {
        searchQuery: currentSearchQuery,
        booleanMode: currentFilters.booleanMode,
        filters: {
          keywords: currentFilters.keywords,
          excludedKeywords: currentFilters.excludedKeywords,
          specificSkills: currentFilters.specificSkills,
          experience: currentFilters.experience,
          ctcMin: currentFilters.ctcMin,
          ctcMax: currentFilters.ctcMax,
          location: currentFilters.location,
          role: currentFilters.role,
          noticePeriod: currentFilters.noticePeriod,
          preferredLocation: currentFilters.preferredLocation,
          company: currentFilters.company,
          excludedCompanies: currentFilters.excludedCompanies,
          educationUG: currentFilters.educationUG,
          educationPG: currentFilters.educationPG,
          additionalDegrees: currentFilters.additionalDegrees,
          employmentType: currentFilters.employmentType,
          jobType: currentFilters.jobType,
          workPermit: currentFilters.workPermit,
          candidateStatus: currentFilters.candidateStatus,
          showWith: currentFilters.showWith,
        },
        pagination: {
          page,
          pageSize: candidatesPerPage,
        },
        sortOption: currentSortOption,
        requirementId: currentFilters.selectedRequirementId || null,
      };

      const response = await apiRequest('POST', '/api/source-resume/search', searchParams);
      const data = await response.json();
      
      setSearchResults(data);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error.message || "Failed to perform search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [candidatesPerPage, toast]);

  // Create ref for performSearch to avoid dependency issues
  const performSearchRef = useRef(performSearch);
  // Update ref whenever performSearch function changes (but don't trigger searches)
  useEffect(() => {
    performSearchRef.current = performSearch;
  }, [performSearch]);

  // Track if we should skip the next filter change (to prevent loops)
  const skipNextFilterChange = useRef(false);

  const handleSourceResume = () => {
    // Save to recent searches
    saveSearchToHistory();
    
    setView('results');
    setCurrentPage(1);
    setShowSavedProfiles(false);
    hasPerformedInitialSearch.current = false; // Reset flag
    
    // Perform server-side search (even with empty query to show all candidates)
    skipNextFilterChange.current = true; // Skip the filter change trigger
    performSearch(1);
  };
  
  // Track if initial search has been performed
  const hasPerformedInitialSearch = useRef(false);

  // Auto-perform search when switching to results view to show all candidates
  useEffect(() => {
    if (view === 'results' && !hasPerformedInitialSearch.current && !isSearching) {
      // Small delay to ensure ref is initialized
      const timer = setTimeout(() => {
        if (performSearchRef.current) {
          performSearchRef.current(1);
          hasPerformedInitialSearch.current = true;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [view, isSearching]);

  // Reset initial search flag when switching away from results view
  useEffect(() => {
    if (view !== 'results') {
      hasPerformedInitialSearch.current = false;
    }
  }, [view]);

  // Track previous filter values to detect actual changes
  const prevFiltersRef = useRef<string>('');
  const prevSearchQueryRef = useRef<string>('');
  const prevSortOptionRef = useRef<string>('');

  // Auto-search when filters change in results view (debounced)
  useEffect(() => {
    if (view !== 'results' || isSearching || skipNextFilterChange.current) {
      skipNextFilterChange.current = false;
      return;
    }

    // Serialize filters to string for comparison
    const filtersString = JSON.stringify({
      keywords: filters.keywords,
      excludedKeywords: filters.excludedKeywords,
      specificSkills: filters.specificSkills,
      experience: filters.experience,
      ctcMin: filters.ctcMin,
      ctcMax: filters.ctcMax,
      location: filters.location,
      role: filters.role,
      noticePeriod: filters.noticePeriod,
      preferredLocation: filters.preferredLocation,
      company: filters.company,
      excludedCompanies: filters.excludedCompanies,
      educationUG: filters.educationUG,
      educationPG: filters.educationPG,
      additionalDegrees: filters.additionalDegrees,
      employmentType: filters.employmentType,
      jobType: filters.jobType,
      workPermit: filters.workPermit,
      candidateStatus: filters.candidateStatus,
      showWith: filters.showWith,
      selectedRequirementId: filters.selectedRequirementId,
      booleanMode: filters.booleanMode,
    });

    const currentSearchQuery = debouncedSearchQuery || resultsSearchQuery;
    const currentSortOption = sortOption;

    // Only trigger if something actually changed
    const filtersChanged = filtersString !== prevFiltersRef.current;
    const searchQueryChanged = currentSearchQuery !== prevSearchQueryRef.current;
    const sortOptionChanged = currentSortOption !== prevSortOptionRef.current;

    if (filtersChanged || searchQueryChanged || sortOptionChanged) {
      // Update refs
      prevFiltersRef.current = filtersString;
      prevSearchQueryRef.current = currentSearchQuery;
      prevSortOptionRef.current = currentSortOption;

      // Only search if we've performed initial search
      if (hasPerformedInitialSearch.current) {
        // Debounce filter changes to avoid too many requests
        const timer = setTimeout(() => {
          if (performSearchRef.current) {
            performSearchRef.current(1); // Reset to page 1 on filter change
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [view, filters, debouncedSearchQuery, resultsSearchQuery, sortOption, isSearching]);

  const selectedCandidateRef = useRef<HTMLDivElement>(null);

  const handleCandidateClick = async (candidate: CandidateDisplay) => {
    // Update last viewed timestamp
    try {
      await apiRequest('POST', `/api/recruiter/candidates/${candidate.id}/view`, {});
      // Refresh ALL candidate data to get updated lastViewedAt
      // Use refetch to immediately get fresh data
      await queryClient.refetchQueries({ queryKey: ['/api/admin/candidates'] });
      await queryClient.refetchQueries({ queryKey: ['/api/source-resume/search'] });
      // Also invalidate to ensure all related queries refresh
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/source-resume/search'] });
    } catch (error) {
      console.error('Failed to update view timestamp:', error);
    }

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

  const handleOpenCandidateDetails = async (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Update last viewed timestamp before opening profile
    try {
      await apiRequest('POST', `/api/recruiter/candidates/${candidateId}/view`, {});
      // Refresh ALL candidate data to get updated lastViewedAt
      // Use refetch to immediately get fresh data
      await queryClient.refetchQueries({ queryKey: ['/api/admin/candidates'] });
      await queryClient.refetchQueries({ queryKey: ['/api/source-resume/search'] });
      // Also invalidate to ensure all related queries refresh
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/source-resume/search'] });
    } catch (error) {
      console.error('Failed to update view timestamp:', error);
    }
    
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
    
    // Trigger new search after resetting filters
    if (view === 'results') {
      setTimeout(() => {
        if (performSearchRef.current) {
          performSearchRef.current(1);
        }
      }, 100);
    }
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
            {/* AI Match Mode - Requirement Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                AI Match Mode (Optional)
              </label>
              <Select
                value={filters.selectedRequirementId || 'none'}
                onValueChange={(value) => {
                  const requirementId = value === 'none' ? undefined : value;
                  setFilters({ ...filters, selectedRequirementId: requirementId });
                  if (requirementId) {
                    toast({
                      title: "AI Match Mode Enabled",
                      description: "Candidates will be scored against this requirement",
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select requirement for AI matching" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (General Search)</SelectItem>
                  {requirements.map((req: any) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.position} - {req.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.selectedRequirementId && (
                <div className="mt-2 space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      // Sort by match percentage and go to first page
                      setSortOption('relevance');
                      setCurrentPage(1);
                      toast({
                        title: "Sorted by Best Match",
                        description: "Candidates sorted by requirement match score",
                      });
                    }}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Sort by Best Match
                  </Button>
                  <p className="text-xs text-gray-500">
                    Top candidates will show match % badge
                  </p>
                </div>
              )}
            </div>
            {/* Skills Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skills
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type skill and press Enter (e.g., Python, Java)"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && keywordInput.trim()) {
                      e.preventDefault();
                      handleKeywordAdd(keywordInput.trim());
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm"
                />
                {keywordInput && (
                  <X
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => setKeywordInput("")}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {keyword}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-blue-600"
                      onClick={() => handleKeywordRemove(keyword)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Keywords (Boolean Search) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keywords (Boolean Search)
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
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Experience
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
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
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 pr-7 text-sm"
                  />
                  {filters.experience[0] !== 0 && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setFilters({ ...filters, experience: [0, filters.experience[1]] })}
                    />
                  )}
                </div>
                <span className="text-gray-500">-</span>
                <div className="relative flex-1">
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
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 pr-7 text-sm"
                  />
                  {filters.experience[1] !== 15 && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setFilters({ ...filters, experience: [filters.experience[0], 15] })}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* CTC Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CTC Range (Lakhs)
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.ctcMin}
                    onChange={(e) => setFilters({ ...filters, ctcMin: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 pr-7 text-sm"
                  />
                  {filters.ctcMin && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setFilters({ ...filters, ctcMin: "" })}
                    />
                  )}
                </div>
                <span className="text-gray-500">-</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.ctcMax}
                    onChange={(e) => setFilters({ ...filters, ctcMax: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 pr-7 text-sm"
                  />
                  {filters.ctcMax && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setFilters({ ...filters, ctcMax: "" })}
                    />
                  )}
                </div>
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

            {/* Analytics Panel */}
            {searchResults?.analytics && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Search Analytics</h3>
                
                {/* Top Skills */}
                {searchResults.analytics.topSkills && searchResults.analytics.topSkills.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Top Skills</label>
                    <div className="flex flex-wrap gap-1">
                      {searchResults.analytics.topSkills.slice(0, 5).map((item: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                        >
                          {item.skill} ({item.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Distribution */}
                {searchResults.analytics.experienceDistribution && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Experience Distribution</label>
                    <div className="space-y-1">
                      {Object.entries(searchResults.analytics.experienceDistribution).map(([range, count]: [string, any]) => (
                        <div key={range} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{range} years</span>
                          <span className="font-medium text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Distribution */}
                {searchResults.analytics.locationDistribution && Object.keys(searchResults.analytics.locationDistribution).length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Top Locations</label>
                    <div className="space-y-1">
                      {Object.entries(searchResults.analytics.locationDistribution)
                        .slice(0, 5)
                        .map(([location, count]: [string, any]) => (
                          <div key={location} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{location}</span>
                            <span className="font-medium text-gray-900">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Average CTC */}
                {searchResults.analytics.avgCTC > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Average CTC</label>
                    <p className="text-sm font-bold text-blue-600">{searchResults.analytics.avgCTC.toFixed(1)}L</p>
                  </div>
                )}
              </div>
            )}
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
                <span className="text-xs text-gray-600 font-semibold">
                  {searchResults?.pagination?.totalCount || displayCandidates.length} {(searchResults?.pagination?.totalCount || displayCandidates.length) === 1 ? 'Candidate' : 'Candidates'} Found
                </span>
                {/* Active Filter Chips */}
                {(filters.keywords.length > 0 || filters.location || filters.role || filters.experience[0] > 0 || filters.experience[1] < 15) && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {filters.keywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {keyword}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleKeywordRemove(keyword);
                          }}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {filters.keywords.length > 3 && (
                      <span className="text-xs text-gray-500">+{filters.keywords.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="experience-high">Experience (High to Low)</SelectItem>
                    <SelectItem value="experience-low">Experience (Low to High)</SelectItem>
                    <SelectItem value="ctc-high">CTC (High to Low)</SelectItem>
                    <SelectItem value="ctc-low">CTC (Low to High)</SelectItem>
                    <SelectItem value="notice-period">Notice Period</SelectItem>
                    <SelectItem value="recently-updated">Recently Updated</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(displayCandidates)}
                  className="text-xs"
                  title="Export all results to CSV"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export All
                </Button>
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
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    setCurrentPage(newPage);
                    performSearch(newPage);
                  }}
                  disabled={currentPage === 1 || isSearching}
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
                      onClick={() => {
                        setCurrentPage(page);
                        performSearch(page);
                      }}
                      disabled={isSearching}
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
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(newPage);
                    performSearch(newPage);
                  }}
                  disabled={currentPage === totalPages || isSearching}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Candidate Cards List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="candidate-cards-scrollable">
            {(isSearching || isLoadingCandidates) ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600">Searching candidates...</span>
              </div>
            ) : paginatedCandidates.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No candidates found matching your criteria</p>
              </div>
            ) : (
              <>
                {/* Bulk Actions Bar */}
                {selectedCandidates.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Bulk tag to requirement
                          if (filters.selectedRequirementId) {
                            selectedCandidates.forEach(candidateId => {
                              const candidate = displayCandidates.find(c => c.id === candidateId);
                              if (candidate) {
                                handleTagToRequirement(candidate, filters.selectedRequirementId!);
                              }
                            });
                            setSelectedCandidates(new Set());
                            toast({
                              title: "Success",
                              description: `${selectedCandidates.size} candidates tagged to requirement`,
                            });
                          } else {
                            toast({
                              title: "No Requirement Selected",
                              description: "Please select a requirement first",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="text-xs"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Tag Selected ({selectedCandidates.size})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Export selected to CSV
                          const selected = displayCandidates.filter(c => selectedCandidates.has(c.id));
                          exportToCSV(selected);
                        }}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCandidates(new Set())}
                        className="text-xs"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}
                {paginatedCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    ref={selectedCandidate?.id === candidate.id ? selectedCandidateRef : null}
                    className={`bg-white rounded-lg border p-6 hover:shadow-md transition-all cursor-pointer ${
                      selectedCandidate?.id === candidate.id
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200"
                    } ${selectedCandidates.has(candidate.id) ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={(e) => {
                      // Don't handle card click if clicking on a button or link
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A' || target.closest('a')) {
                        return; // Let the button/link handle its own click
                      }
                      handleCandidateClick(candidate);
                    }}
                  >
                    <div className="flex gap-4">
                      {/* Bulk Selection Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(candidate.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCandidateSelection(candidate.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
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
                              {/* Relevance Score Badge */}
                              {'relevanceScore' in candidate && candidate.relevanceScore > 0 && (
                                <span 
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                                    candidate.relevanceScore >= 80 
                                      ? 'bg-green-100 text-green-800' 
                                      : candidate.relevanceScore >= 60 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                  title="Relevance Score"
                                >
                                  {candidate.relevanceScore}% Match
                                </span>
                              )}
                              {/* Requirement Match Badge */}
                              {'matchPercentage' in candidate && candidate.matchPercentage !== undefined && candidate.matchPercentage > 0 && (
                                <span 
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800`}
                                  title="Requirement Match Score"
                                >
                                  {candidate.matchPercentage}% Fit
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
                          <p className="text-xs text-gray-500">
                            last seen: {candidate.lastSeen || 'Not viewed yet'}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (candidate && candidate.id) {
                                setCandidateToEdit(candidate);
                                setIsEditModalOpen(true);
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 z-10 relative bg-white"
                            title="Edit candidate profile"
                            type="button"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit Profile
                          </button>
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
                                  // Fix resume URL - ensure it's properly formatted
                                  let resumeUrl = candidate.resumeFile;
                                  
                                  // Normalize the URL
                                  if (resumeUrl) {
                                    // If it's a full URL, extract the path
                                    if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
                                      try {
                                        const url = new URL(resumeUrl);
                                        resumeUrl = url.pathname;
                                      } catch (e) {
                                        // If URL parsing fails, try to extract path manually
                                        const match = resumeUrl.match(/\/uploads\/.*/);
                                        if (match) {
                                          resumeUrl = match[0];
                                        }
                                      }
                                    }
                                    
                                    // Ensure it starts with /uploads
                                    if (!resumeUrl.startsWith('/uploads')) {
                                      if (resumeUrl.startsWith('uploads/')) {
                                        resumeUrl = '/' + resumeUrl;
                                      } else if (!resumeUrl.startsWith('/')) {
                                        // If it's just a filename, assume it's in uploads/resumes
                                        resumeUrl = '/uploads/resumes/' + resumeUrl;
                                      }
                                    }
                                  }
                                  
                                  const lowerUrl = resumeUrl?.toLowerCase() || '';
                                  const urlWithoutQuery = lowerUrl.split('?')[0];
                                  const isPdf = urlWithoutQuery.endsWith('.pdf');
                                  const isDocx = urlWithoutQuery.endsWith('.docx');
                                  const isDoc = urlWithoutQuery.endsWith('.doc') && !isDocx;
                                  const isImage = urlWithoutQuery.endsWith('.jpg') || urlWithoutQuery.endsWith('.jpeg') || urlWithoutQuery.endsWith('.png');
                                  
                                  if (isPdf) {
                                    return (
                                      <iframe
                                        key={resumeUrl}
                                        src={resumeUrl}
                                        className="w-full h-full border-0"
                                        title="Resume Preview"
                                        onError={(e) => {
                                          console.error('Resume iframe error:', e);
                                          // Fallback to download button if iframe fails
                                        }}
                                      />
                                    );
                                  } else if (isImage) {
                                    return (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                        <img
                                          src={resumeUrl}
                                          alt="Resume"
                                          className="max-w-full max-h-full object-contain"
                                          onError={(e) => {
                                            console.error('Resume image error:', e);
                                            // Show download option on error
                                          }}
                                        />
                                      </div>
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
                                      // Fix URL before opening
                                      let resumeUrl = candidate.resumeFile;
                                      if (resumeUrl && !resumeUrl.startsWith('http') && !resumeUrl.startsWith('/')) {
                                        resumeUrl = '/' + resumeUrl;
                                      } else if (resumeUrl && resumeUrl.startsWith('uploads/')) {
                                        resumeUrl = '/' + resumeUrl;
                                      }
                                      window.open(resumeUrl, '_blank');
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
                onClick={(e) => {
                  // Don't handle card click if clicking on a button or link
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A' || target.closest('a')) {
                    return; // Let the button/link handle its own click
                  }
                  handleCandidateClick(candidate);
                }}
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
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCandidateDetails(candidate.id, e);
                    }}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (candidate && candidate.id) {
                        setCandidateToEdit(candidate);
                        setIsEditModalOpen(true);
                      } else {
                        console.error('Candidate or candidate.id is missing (recommended):', candidate);
                      }
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors flex items-center gap-1"
                    title="Edit candidate profile"
                    type="button"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  last seen: {candidate.lastSeen || 'Never'}
                </p>
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

        {/* Edit Candidate Modal - Only render when candidate is selected (in results view) */}
        {candidateToEdit && (
          <EditCandidateModal
            open={isEditModalOpen}
            onOpenChange={(open) => {
              setIsEditModalOpen(open);
              if (!open) {
                // Clear candidate when modal closes
                setTimeout(() => setCandidateToEdit(null), 300);
              }
            }}
            candidate={candidateToEdit}
          />
        )}
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
                <div className="relative">
                  <input
                    type="text"
                    value={excludeKeywordInput}
                    onChange={(e) => setExcludeKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && excludeKeywordInput.trim()) {
                        handleExcludeKeywordAdd(excludeKeywordInput.trim());
                      }
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter keywords to exclude..."
                  />
                  {excludeKeywordInput && (
                    <X
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setExcludeKeywordInput("")}
                    />
                  )}
                </div>
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
                <div className="relative">
                  <input
                    type="text"
                    value={specificSkillInput}
                    onChange={(e) => setSpecificSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && specificSkillInput.trim()) {
                        handleSpecificSkillAdd(specificSkillInput.trim());
                      }
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter specific skills (must have all)..."
                  />
                  {specificSkillInput && (
                    <X
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setSpecificSkillInput("")}
                    />
                  )}
                </div>
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
                <div className="relative">
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
                    className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 pr-7 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {filters.experience[0] !== 0 && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setFilters({ ...filters, experience: [0, filters.experience[1]] })}
                    />
                  )}
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative">
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
                    className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 pr-7 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {filters.experience[1] !== 15 && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setFilters({ ...filters, experience: [filters.experience[0], 15] })}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* CTC Range */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign className="w-4 h-4 text-purple-600" />
                CTC Range (Lakhs)
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.ctcMin}
                    onChange={(e) => setFilters({ ...filters, ctcMin: e.target.value })}
                    className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 pr-7 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {filters.ctcMin && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setFilters({ ...filters, ctcMin: "" })}
                    />
                  )}
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.ctcMax}
                    onChange={(e) => setFilters({ ...filters, ctcMax: e.target.value })}
                    className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 pr-7 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {filters.ctcMax && (
                    <X
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => setFilters({ ...filters, ctcMax: "" })}
                    />
                  )}
                </div>
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
                  <div className="relative">
                    <input
                      type="text"
                      value={excludeCompanyInput}
                      onChange={(e) => setExcludeCompanyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && excludeCompanyInput.trim()) {
                          handleExcludeCompanyAdd(excludeCompanyInput.trim());
                        }
                      }}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter company names to exclude..."
                    />
                    {excludeCompanyInput && (
                      <X
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={() => setExcludeCompanyInput("")}
                      />
                    )}
                  </div>
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
                  <div className="relative">
                    <input
                      type="text"
                      value={addDegreeInput}
                      onChange={(e) => setAddDegreeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && addDegreeInput.trim()) {
                          handleAddDegree(addDegreeInput.trim());
                        }
                      }}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter degree or certificate name..."
                    />
                    {addDegreeInput && (
                      <X
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={() => setAddDegreeInput("")}
                      />
                    )}
                  </div>
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
