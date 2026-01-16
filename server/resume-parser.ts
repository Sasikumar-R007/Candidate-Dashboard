import mammoth from 'mammoth';
import fs from 'fs';

interface ParsedResume {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  designation: string | null;
  experience: string | null;
  skills: string | null;
  location: string | null;
  company: string | null;
  education: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  websiteUrl: string | null;
  currentRole: string | null;
  rawText: string;
}

async function parsePdf(dataBuffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

export async function parseResumeFile(filePath: string, mimeType: string): Promise<ParsedResume> {
  let text = '';

  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      text = await parsePdf(dataBuffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume file');
  }

  const extractedData = extractResumeData(text);
  
  return {
    ...extractedData,
    rawText: text
  };
}

function extractResumeData(text: string): { 
  fullName: string | null; 
  email: string | null; 
  phone: string | null;
  designation: string | null;
  experience: string | null;
  skills: string | null;
  location: string | null;
  company: string | null;
  education: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  websiteUrl: string | null;
  currentRole: string | null;
} {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;
  
  const emails = text.match(emailRegex);
  const phones = text.match(phoneRegex);
  
  const email = emails && emails.length > 0 ? emails[0].toLowerCase() : null;
  const phone = phones && phones.length > 0 ? phones[0].replace(/[^\d+]/g, '') : null;
  
  const fullName = extractName(text);
  const designation = extractDesignation(text);
  const experience = extractExperience(text);
  const skills = extractSkills(text);
  const location = extractLocation(text);
  const company = extractCompany(text);
  const education = extractEducation(text);
  const linkedinUrl = extractLinkedIn(text);
  const portfolioUrl = extractPortfolio(text);
  const websiteUrl = extractWebsite(text);
  const currentRole = extractCurrentRole(text);
  
  return { fullName, email, phone, designation, experience, skills, location, company, education, linkedinUrl, portfolioUrl, websiteUrl, currentRole };
}

function extractName(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Try multiple strategies to find the name
  // Strategy 1: Look for name in first few lines (most common location)
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines that are clearly not names
    if (line.includes('@') || 
        line.match(/\d{5,}/) || 
        line.match(/^[+\d\s()-]+$/) ||
        line.toLowerCase().includes('phone') ||
        line.toLowerCase().includes('email') ||
        line.toLowerCase().includes('mobile') ||
        line.toLowerCase().includes('linkedin') ||
        line.match(/^https?:\/\//i)) {
      continue;
    }
    
    // Skip common resume headers
    const commonHeaders = ['resume', 'cv', 'curriculum vitae', 'objective', 'summary', 'experience', 'education', 'skills', 'contact', 'profile', 'address', 'location', 'qualification', 'certification', 'project', 'achievement'];
    if (commonHeaders.some(header => line.toLowerCase().includes(header))) {
      continue;
    }
    
    // Pattern 1: Standard name format "FirstName LastName" or "FirstName MiddleName LastName"
    const namePattern1 = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/;
    if (namePattern1.test(line) && line.length >= 4 && line.length <= 60) {
      // Additional validation: should not be all caps (likely a header)
      if (line !== line.toUpperCase()) {
        return line;
      }
    }
    
    // Pattern 2: All words capitalized (common in resumes)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5) {
      const allCapitalized = words.every(word => /^[A-Z]/.test(word) && word.length > 1);
      const noNumbers = !/\d/.test(line);
      const noSpecialChars = !/[@#$%^&*()_+=\[\]{}|\\:";'<>?,./]/.test(line);
      const notAllCaps = line !== line.toUpperCase();
      
      if (allCapitalized && noNumbers && noSpecialChars && notAllCaps && line.length >= 4 && line.length <= 60) {
        return line;
      }
    }
    
    // Pattern 3: Name with middle initial "John D. Smith"
    const middleInitialPattern = /^[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+$/;
    if (middleInitialPattern.test(line) && line.length >= 6 && line.length <= 50) {
      return line;
    }
    
    // Pattern 4: Name with comma "LastName, FirstName"
    const commaNamePattern = /^[A-Z][a-z]+,\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/;
    if (commaNamePattern.test(line) && line.length >= 6 && line.length <= 50) {
      // Reverse it to "FirstName LastName" format
      const parts = line.split(',').map(p => p.trim());
      if (parts.length === 2) {
        return `${parts[1]} ${parts[0]}`;
      }
    }
  }
  
  // Strategy 2: Look for name patterns near email (name often appears before email)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch.index !== undefined) {
    const emailIndex = emailMatch.index;
    const textBeforeEmail = text.substring(Math.max(0, emailIndex - 200), emailIndex);
    const linesBeforeEmail = textBeforeEmail.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Check last 3 lines before email
    for (let i = Math.max(0, linesBeforeEmail.length - 3); i < linesBeforeEmail.length; i++) {
      const line = linesBeforeEmail[i];
      if (line.length >= 4 && line.length <= 60 && 
          !line.includes('@') && 
          !/\d{5,}/.test(line) &&
          /^[A-Z]/.test(line)) {
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 5 && 
            words.every(word => /^[A-Z]/.test(word)) &&
            !/\d/.test(line)) {
          return line;
        }
      }
    }
  }
  
  return null;
}

function extractDesignation(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Common designation patterns - expanded list
  const designationKeywords = [
    'software engineer', 'developer', 'engineer', 'manager', 'analyst',
    'consultant', 'architect', 'designer', 'specialist', 'executive',
    'director', 'lead', 'senior', 'junior', 'associate', 'principal',
    'product manager', 'project manager', 'data scientist', 'data engineer',
    'programmer', 'qa engineer', 'devops', 'sre', 'sdet',
    'ui/ux designer', 'frontend', 'backend', 'full stack', 'fullstack',
    'tech lead', 'engineering manager', 'scrum master', 'product owner',
    'business analyst', 'system analyst', 'database administrator', 'dba',
    'cloud engineer', 'security engineer', 'ml engineer', 'ai engineer',
    'mobile developer', 'ios developer', 'android developer', 'react developer',
    'angular developer', 'vue developer', 'node.js developer', 'python developer',
    'java developer', '.net developer', 'salesforce developer', 'salesforce admin'
  ];
  
  // Look for current position/designation (usually near the top after name)
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const lowerLine = lines[i].toLowerCase();
    
    // Skip if it's likely a name or contact info
    if (lowerLine.includes('@') || 
        lowerLine.match(/^\d/) || 
        lowerLine.includes('phone') || 
        lowerLine.includes('email') ||
        lowerLine.includes('linkedin') ||
        lowerLine.match(/^https?:\/\//i)) {
      continue;
    }
    
    // Skip common section headers
    const sectionHeaders = ['experience', 'work experience', 'employment', 'professional experience', 'career', 'objective', 'summary', 'profile'];
    if (sectionHeaders.some(header => lowerLine === header || lowerLine.startsWith(header + ':'))) {
      continue;
    }
    
    // Check if line contains designation keywords
    for (const keyword of designationKeywords) {
      if (lowerLine.includes(keyword)) {
        // Extract the full designation phrase - return original line (preserves capitalization)
        // Try to get a complete phrase (up to 80 chars to allow for longer titles)
        if (lines[i].length <= 80) {
          return lines[i];
        } else {
          // If too long, try to extract just the relevant part
          const keywordIndex = lowerLine.indexOf(keyword);
          const start = Math.max(0, keywordIndex - 20);
          const end = Math.min(lines[i].length, keywordIndex + keyword.length + 30);
          return lines[i].substring(start, end).trim();
        }
      }
    }
  }
  
  // Also check for patterns like "Current Role:", "Position:", etc.
  const rolePatterns = [
    /(?:current|present)\s+(?:role|position|designation|title)[:\s]+(.+)/i,
    /(?:role|position|designation|title)[:\s]+(.+)/i
  ];
  
  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const role = match[1].trim().split('\n')[0].trim();
      if (role.length > 3 && role.length < 80) {
        return role;
      }
    }
  }
  
  return null;
}

function extractExperience(text: string): string | null {
  // Patterns for experience: "X years", "X-Y years", "X+ years"
  const experiencePatterns = [
    /(\d+)\s*\+\s*years?/i,
    /(\d+)\s*-\s*(\d+)\s*years?/i,
    /(\d+)\s+years?/i,
    /experience[:\s]+(\d+)\s*years?/i,
    /(\d+)\s*yr/i
  ];
  
  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        return `${match[1]}-${match[2]} years`;
      } else if (match[1]) {
        return `${match[1]}+ years`;
      }
    }
  }
  
  return null;
}

function extractSkills(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim());
  
  // Common tech skills
  const techSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd',
    'html', 'css', 'sass', 'bootstrap', 'tailwind', 'material-ui',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp',
    'agile', 'scrum', 'jira', 'confluence'
  ];
  
  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const skill of techSkills) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.push(skill);
    }
  }
  
  // Also look for a "Skills:" section
  let skillsSectionIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const lowerLine = lines[i].toLowerCase();
    if (lowerLine.includes('skills') && (lowerLine.includes(':') || lowerLine.length < 20)) {
      skillsSectionIndex = i;
      break;
    }
  }
  
  if (skillsSectionIndex !== -1) {
    // Extract skills from the next few lines
    const skillsLines = lines.slice(skillsSectionIndex + 1, skillsSectionIndex + 10);
    const skillsText = skillsLines.join(' ').toLowerCase();
    const skillsList = skillsText.split(/[,|•\-\n]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 50);
    
    // Add unique skills from the section
    for (const skill of skillsList.slice(0, 15)) {
      if (!foundSkills.includes(skill) && skill.length > 2) {
        foundSkills.push(skill);
      }
    }
  }
  
  // Return first 10 skills as comma-separated string
  if (foundSkills.length > 0) {
    return foundSkills.slice(0, 10).join(', ');
  }
  
  return null;
}

function extractLocation(text: string): string | null {
  // Common location patterns
  const locationPatterns = [
    /(?:location|address|city|based in)[:\s]+([A-Z][a-zA-Z\s,]+(?:,\s*[A-Z][a-zA-Z\s]+)?)/i,
    /([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2})?(?:\s+\d{5})?)/g
  ];
  
  const lines = text.split('\n').slice(0, 15); // Check first 15 lines
  
  // Look for location keywords
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('location') || lowerLine.includes('address') || lowerLine.includes('city')) {
      // Extract text after the keyword
      const match = line.match(/[:\s]+([A-Z][a-zA-Z\s,]+)/);
      if (match && match[1]) {
        const location = match[1].trim();
        // Validate it looks like a location (not too long, has letters)
        if (location.length > 3 && location.length < 50 && /^[A-Z]/.test(location)) {
          return location;
        }
      }
    }
  }
  
  // Try to find common city patterns
  const commonCities = [
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
    'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
    'san francisco', 'indianapolis', 'columbus', 'fort worth', 'charlotte',
    'seattle', 'denver', 'washington', 'boston', 'el paso', 'detroit',
    'nashville', 'portland', 'oklahoma city', 'las vegas', 'memphis',
    'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
    'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur',
    'london', 'paris', 'berlin', 'madrid', 'rome', 'amsterdam',
    'toronto', 'vancouver', 'sydney', 'melbourne', 'tokyo', 'singapore'
  ];
  
  const lowerText = text.toLowerCase();
  for (const city of commonCities) {
    if (lowerText.includes(city)) {
      return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }
  
  return null;
}

function extractCompany(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Common company-related keywords
  const companyKeywords = ['company', 'employer', 'organization', 'corporation', 'works at', 'current company', 'present company'];
  
  // Look for company name near experience/employment section
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const lowerLine = lines[i].toLowerCase();
    
    // Skip if it's likely contact info or other metadata
    if (lowerLine.includes('@') || lowerLine.match(/^\d/) || lowerLine.includes('phone') || lowerLine.includes('email')) {
      continue;
    }
    
    // Check if line contains company keywords
    for (const keyword of companyKeywords) {
      if (lowerLine.includes(keyword)) {
        // Extract company name from the same line or next line
        const parts = lines[i].split(/[:–-]/);
        if (parts.length > 1) {
          const company = parts[parts.length - 1].trim();
          if (company.length > 2 && company.length < 60) {
            return company;
          }
        }
        // Try next line
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.length > 2 && nextLine.length < 60 && !nextLine.match(/^\d/) && !nextLine.includes('@')) {
            return nextLine;
          }
        }
      }
    }
  }
  
  return null;
}

function extractEducation(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Education degree patterns
  const degreePatterns = [
    /\b(B\.?Tech|B\.?E|B\.?Sc|B\.?Com|B\.?A|B\.?BA|BCA|MCA|M\.?Tech|M\.?E|M\.?Sc|M\.?Com|MBA|MS|Ph\.?D|PhD)\b/i,
    /\b(Bachelor|Master|Doctorate|Diploma)\b/i
  ];
  
  // Look for education section
  let educationSectionIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const lowerLine = lines[i].toLowerCase();
    if (lowerLine.includes('education') || lowerLine.includes('qualification') || lowerLine.includes('academic')) {
      educationSectionIndex = i;
      break;
    }
  }
  
  if (educationSectionIndex !== -1) {
    // Extract education from the next few lines
    const educationLines = lines.slice(educationSectionIndex, educationSectionIndex + 10);
    const educationText = educationLines.join(' ');
    
    for (const pattern of degreePatterns) {
      const match = educationText.match(pattern);
      if (match) {
        // Try to extract full degree name with specialization
        const startIndex = educationText.indexOf(match[0]);
        const extracted = educationText.substring(startIndex, startIndex + 80).split(/[,.\n]/)[0].trim();
        if (extracted.length > 3 && extracted.length < 100) {
          return extracted;
        }
      }
    }
  }
  
  // Also search throughout the text for degree patterns
  for (const pattern of degreePatterns) {
    const match = text.match(pattern);
    if (match) {
      const startIndex = text.indexOf(match[0]);
      const extracted = text.substring(startIndex, startIndex + 80).split(/[,.\n]/)[0].trim();
      if (extracted.length > 3 && extracted.length < 100) {
        return extracted;
      }
    }
  }
  
  return null;
}

function extractLinkedIn(text: string): string | null {
  // LinkedIn URL patterns
  const linkedinPatterns = [
    /linkedin\.com\/in\/[\w-]+/gi,
    /linkedin\.com\/profile\/[\w-]+/gi,
    /(?:linkedin|linkedin url|linkedin profile)[:\s]+([^\s]+)/i
  ];
  
  for (const pattern of linkedinPatterns) {
    const match = text.match(pattern);
    if (match) {
      let url = match[0];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return url;
    }
  }
  
  return null;
}

function extractPortfolio(text: string): string | null {
  // Portfolio URL patterns
  const portfolioPatterns = [
    /(?:portfolio|portfolio url|portfolio link|personal website)[:\s]+([^\s]+)/i,
    /(?:github|github\.com\/[\w-]+)/gi,
    /(?:behance|behance\.net\/[\w-]+)/gi,
    /(?:dribbble|dribbble\.com\/[\w-]+)/gi
  ];
  
  for (const pattern of portfolioPatterns) {
    const match = text.match(pattern);
    if (match) {
      let url = match[1] || match[0];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return url;
    }
  }
  
  return null;
}

function extractWebsite(text: string): string | null {
  // Website URL patterns (excluding LinkedIn, GitHub, etc.)
  const websitePatterns = [
    /(?:website|website url|website link|personal website|blog)[:\s]+(https?:\/\/[^\s]+)/i,
    /https?:\/\/(?!linkedin|github|behance|dribbble)[^\s]+/gi
  ];
  
  for (const pattern of websitePatterns) {
    const match = text.match(pattern);
    if (match) {
      const url = match[1] || match[0];
      if (url && url.length < 200) {
        return url;
      }
    }
  }
  
  return null;
}

function extractCurrentRole(text: string): string | null {
  // Current role is similar to designation but specifically looks for "current" or "present" role
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const roleKeywords = ['current role', 'present role', 'current position', 'present position', 'currently working as'];
  
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const lowerLine = lines[i].toLowerCase();
    
    for (const keyword of roleKeywords) {
      if (lowerLine.includes(keyword)) {
        const parts = lines[i].split(/[:–-]/);
        if (parts.length > 1) {
          const role = parts[parts.length - 1].trim();
          if (role.length > 2 && role.length < 80) {
            return role;
          }
        }
      }
    }
  }
  
  // Fallback to designation if current role not found
  return extractDesignation(text);
}

export interface BulkParseResult {
  success: boolean;
  fileName: string;
  data?: ParsedResume;
  error?: string;
}

export async function parseBulkResumes(files: Array<{ path: string; originalname: string; mimetype: string }>): Promise<BulkParseResult[]> {
  const results: BulkParseResult[] = [];
  
  for (const file of files) {
    try {
      const parsed = await parseResumeFile(file.path, file.mimetype);
      results.push({
        success: true,
        fileName: file.originalname,
        data: parsed
      });
    } catch (error) {
      results.push({
        success: false,
        fileName: file.originalname,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}
