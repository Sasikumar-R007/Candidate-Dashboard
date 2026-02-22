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
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Resume file not found');
    }

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      text = await parsePdf(dataBuffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg' || mimeType === 'image/png') {
      // For images, we would need OCR - for now, return empty text
      // TODO: Implement OCR for image-based resumes
      text = '';
      console.warn('Image-based resumes require OCR which is not yet implemented. Please upload a PDF or Word document.');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Validate that we extracted some text
    if (!text || text.trim().length < 10) {
      throw new Error('Could not extract sufficient text from resume. The file may be corrupted, password-protected, or in an unsupported format.');
    }
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to parse resume file: ' + (error.message || 'Unknown error'));
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
  
  let fullName = extractName(text);
  
  // If name not found, try to extract from email (before @)
  if (!fullName && email) {
    const emailName = email.split('@')[0];
    // Try to format email name as a proper name (e.g., "john.doe" -> "John Doe")
    const nameParts = emailName.split(/[._-]/).filter(part => part.length > 0);
    if (nameParts.length >= 2) {
      fullName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
    } else if (nameParts.length === 1 && nameParts[0].length > 2) {
      // Single name - capitalize first letter
      fullName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    }
  }
  
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
  
  // Enhanced name extraction with multiple strategies
  // Strategy 1: Look for name in first few lines (most common location) - expanded to 20 lines
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines that are clearly not names
    if (line.includes('@') || 
        line.match(/\d{5,}/) || 
        line.match(/^[+\d\s()-]+$/) ||
        line.toLowerCase().includes('phone') ||
        line.toLowerCase().includes('email') ||
        line.toLowerCase().includes('mobile') ||
        line.toLowerCase().includes('linkedin') ||
        line.match(/^https?:\/\//i) ||
        line.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) || // Date format
        line.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i)) {
      continue;
    }
    
    // Skip common resume headers (expanded list)
    const commonHeaders = ['resume', 'cv', 'curriculum vitae', 'objective', 'summary', 'experience', 'education', 'skills', 'contact', 'profile', 'address', 'location', 'qualification', 'certification', 'project', 'achievement', 'work history', 'employment', 'professional', 'career', 'accomplishments', 'awards', 'publications', 'references'];
    if (commonHeaders.some(header => line.toLowerCase().includes(header))) {
      continue;
    }
    
    // Pattern 1: Standard name format "FirstName LastName" or "FirstName MiddleName LastName"
    // More flexible: allows for mixed case and common name patterns
    const namePattern1 = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}$/;
    if (namePattern1.test(line) && line.length >= 4 && line.length <= 70) {
      // Additional validation: should not be all caps (likely a header)
      if (line !== line.toUpperCase()) {
        // Check it's not a common false positive
        const lowerLine = line.toLowerCase();
        if (!lowerLine.includes('years') && !lowerLine.includes('experience') && 
            !lowerLine.includes('developer') && !lowerLine.includes('engineer') &&
            !lowerLine.includes('manager') && !lowerLine.includes('analyst')) {
          return line;
        }
      }
    }
    
    // Pattern 2: All words capitalized (common in resumes) - more flexible
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 6) {
      const allCapitalized = words.every(word => {
        // Allow single letters (middle initials) or words starting with capital
        return (word.length === 1 && /^[A-Z]$/.test(word)) || 
               (/^[A-Z]/.test(word) && word.length > 1);
      });
      const noNumbers = !/\d/.test(line);
      const noSpecialChars = !/[@#$%^&*()_+=\[\]{}|\\:";'<>?,./]/.test(line);
      const notAllCaps = line !== line.toUpperCase();
      
      if (allCapitalized && noNumbers && noSpecialChars && notAllCaps && line.length >= 4 && line.length <= 70) {
        // Additional check: not a job title or common phrase
        const lowerLine = line.toLowerCase();
        const jobTitleIndicators = ['years', 'experience', 'developer', 'engineer', 'manager', 'analyst', 'consultant', 'specialist', 'director', 'lead', 'senior', 'junior'];
        if (!jobTitleIndicators.some(indicator => lowerLine.includes(indicator))) {
          return line;
        }
      }
    }
    
    // Pattern 3: Name with middle initial "John D. Smith" or "John D Smith"
    const middleInitialPattern = /^[A-Z][a-z]+\s+[A-Z]\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/;
    if (middleInitialPattern.test(line) && line.length >= 6 && line.length <= 60) {
      return line;
    }
    
    // Pattern 4: Name with comma "LastName, FirstName"
    const commaNamePattern = /^[A-Z][a-z]+,\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/;
    if (commaNamePattern.test(line) && line.length >= 6 && line.length <= 60) {
      // Reverse it to "FirstName LastName" format
      const parts = line.split(',').map(p => p.trim());
      if (parts.length === 2) {
        return `${parts[1]} ${parts[0]}`;
      }
    }
    
    // Pattern 5: Name with hyphen (e.g., "Mary-Jane Smith")
    const hyphenNamePattern = /^[A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+){1,3}$/;
    if (hyphenNamePattern.test(line) && line.length >= 4 && line.length <= 70 && 
        line !== line.toUpperCase() && !/\d/.test(line)) {
      return line;
    }
    
    // Pattern 6: More lenient - just check if it looks like a name (2-4 words, all start with capital, no numbers)
    if (words.length >= 2 && words.length <= 4 && 
        words.every(word => /^[A-Z]/.test(word) && word.length > 1) &&
        !/\d/.test(line) &&
        !/[@#$%^&*()_+=\[\]{}|\\:";'<>?,./]/.test(line) &&
        line.length >= 4 && line.length <= 60 &&
        line !== line.toUpperCase()) {
      // Final validation: check it's not a common phrase
      const lowerLine = line.toLowerCase();
      const invalidPhrases = ['years experience', 'work experience', 'professional experience', 
                              'current role', 'present position', 'contact information'];
      if (!invalidPhrases.some(phrase => lowerLine.includes(phrase))) {
        return line;
      }
    }
  }
  
  // Strategy 2: Look for name patterns near email (name often appears before email)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch.index !== undefined) {
    const emailIndex = emailMatch.index;
    const textBeforeEmail = text.substring(Math.max(0, emailIndex - 300), emailIndex);
    const linesBeforeEmail = textBeforeEmail.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Check last 5 lines before email (increased from 3)
    for (let i = Math.max(0, linesBeforeEmail.length - 5); i < linesBeforeEmail.length; i++) {
      const line = linesBeforeEmail[i];
      if (line.length >= 4 && line.length <= 70 && 
          !line.includes('@') && 
          !/\d{5,}/.test(line) &&
          /^[A-Z]/.test(line)) {
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 5 && 
            words.every(word => /^[A-Z]/.test(word) && word.length > 1) &&
            !/\d/.test(line) &&
            !/[@#$%^&*()_+=\[\]{}|\\:";'<>?,./]/.test(line) &&
            line !== line.toUpperCase()) {
          // Additional validation
          const lowerLine = line.toLowerCase();
          if (!lowerLine.includes('phone') && !lowerLine.includes('email') && 
              !lowerLine.includes('location') && !lowerLine.includes('address')) {
            return line;
          }
        }
      }
    }
  }
  
  // Strategy 3: Look for name in the very first line (often the name is at the top)
  if (lines.length > 0) {
    const firstLine = lines[0];
    const words = firstLine.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 &&
        words.every(word => /^[A-Z]/.test(word) && word.length > 1) &&
        !/\d/.test(firstLine) &&
        !/[@#$%^&*()_+=\[\]{}|\\:";'<>?,./]/.test(firstLine) &&
        firstLine.length >= 4 && firstLine.length <= 70 &&
        firstLine !== firstLine.toUpperCase()) {
      const lowerLine = firstLine.toLowerCase();
      const invalidPhrases = ['resume', 'cv', 'curriculum vitae', 'objective', 'summary', 
                              'experience', 'education', 'skills', 'contact', 'phone', 'email'];
      if (!invalidPhrases.some(phrase => lowerLine.includes(phrase))) {
        return firstLine;
      }
    }
  }
  
  return null;
}

function extractDesignation(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Expanded designation keywords list
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
    'java developer', '.net developer', 'salesforce developer', 'salesforce admin',
    'tester', 'qa', 'quality assurance', 'test engineer', 'automation engineer',
    'site reliability', 'solutions architect', 'technical lead', 'team lead',
    'staff engineer', 'senior staff', 'principal engineer', 'distinguished engineer',
    'vice president', 'vp', 'chief', 'cto', 'cfo', 'ceo', 'coo',
    'accountant', 'auditor', 'financial analyst', 'hr', 'human resources',
    'recruiter', 'talent acquisition', 'marketing', 'sales', 'business development',
    'operations', 'operations manager', 'supply chain', 'logistics',
    'researcher', 'scientist', 'research scientist', 'data analyst',
    'product designer', 'ux designer', 'ui designer', 'graphic designer',
    'content writer', 'technical writer', 'copywriter', 'editor',
    'administrator', 'coordinator', 'assistant', 'executive assistant',
    'customer service', 'support', 'support engineer', 'help desk'
  ];
  
  // Strategy 1: Look for current position/designation (usually near the top after name)
  // Expanded search to first 40 lines
  for (let i = 0; i < Math.min(40, lines.length); i++) {
    const lowerLine = lines[i].toLowerCase();
    const originalLine = lines[i];
    
    // Skip if it's likely a name or contact info
    if (lowerLine.includes('@') || 
        lowerLine.match(/^\d/) || 
        lowerLine.includes('phone') || 
        lowerLine.includes('email') ||
        lowerLine.includes('linkedin') ||
        lowerLine.match(/^https?:\/\//i) ||
        lowerLine.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) || // Date format
        lowerLine.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i)) {
      continue;
    }
    
    // Skip common section headers
    const sectionHeaders = ['experience', 'work experience', 'employment', 'professional experience', 
                           'career', 'objective', 'summary', 'profile', 'education', 'skills', 
                           'qualifications', 'certifications', 'projects', 'achievements'];
    if (sectionHeaders.some(header => lowerLine === header || lowerLine.startsWith(header + ':') || 
        lowerLine.startsWith(header + ' -') || lowerLine.startsWith(header + ' |'))) {
      continue;
    }
    
    // Check if line contains designation keywords
    for (const keyword of designationKeywords) {
      if (lowerLine.includes(keyword)) {
        // Extract the full designation phrase - return original line (preserves capitalization)
        // Try to get a complete phrase (up to 100 chars to allow for longer titles)
        if (originalLine.length <= 100) {
          // Additional validation: check it's not just a section header
          if (!sectionHeaders.some(header => lowerLine === header)) {
            return originalLine;
          }
        } else {
          // If too long, try to extract just the relevant part
          const keywordIndex = lowerLine.indexOf(keyword);
          const start = Math.max(0, keywordIndex - 25);
          const end = Math.min(originalLine.length, keywordIndex + keyword.length + 40);
          const extracted = originalLine.substring(start, end).trim();
          if (extracted.length > 5 && extracted.length < 100) {
            return extracted;
          }
        }
      }
    }
    
    // Pattern matching for job titles: "Senior Software Engineer", "Product Manager", etc.
    // Look for lines that have title-like structure (Title Case or mixed case)
    if (originalLine.length >= 5 && originalLine.length <= 100 &&
        !lowerLine.includes('@') && !/\d{5,}/.test(originalLine)) {
      // Check if it looks like a job title (has common title words)
      const titleIndicators = ['engineer', 'developer', 'manager', 'analyst', 'designer', 
                               'architect', 'specialist', 'consultant', 'director', 'lead',
                               'coordinator', 'administrator', 'executive', 'officer'];
      const hasTitleIndicator = titleIndicators.some(indicator => lowerLine.includes(indicator));
      
      if (hasTitleIndicator) {
        // Additional check: should have proper capitalization (Title Case or similar)
        const words = originalLine.split(/\s+/);
        const capitalizedWords = words.filter(word => /^[A-Z]/.test(word));
        if (capitalizedWords.length >= 2 || (words.length === 1 && /^[A-Z]/.test(words[0]))) {
          return originalLine;
        }
      }
    }
  }
  
  // Strategy 2: Check for patterns like "Current Role:", "Position:", etc. (enhanced)
  const rolePatterns = [
    /(?:current|present|current role|present role|current position|present position)[:\s]+(.+?)(?:\n|$)/i,
    /(?:role|position|designation|title|job title)[:\s]+(.+?)(?:\n|$)/i,
    /(?:working as|currently working as|employed as)[:\s]+(.+?)(?:\n|$)/i,
    /(?:at\s+)?([A-Z][a-zA-Z\s&]+)\s+(?:as|–|-|—)\s+(.+)/i, // "Company Name – Job Title"
    /(.+?)\s+(?:at|@)\s+([A-Z][a-zA-Z\s&]+)/i // "Job Title at Company"
  ];
  
  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let role = match[1].trim();
      // If pattern captured company name, try to get the role from match[2]
      if (match[2] && match[2].trim().length > 3) {
        role = match[2].trim();
      }
      // Clean up the role
      role = role.split('\n')[0].trim();
      role = role.replace(/^[:\-–—\s]+|[:\-–—\s]+$/g, ''); // Remove leading/trailing separators
      
      if (role.length > 3 && role.length < 100) {
        // Validate it's not just a company name or other false positive
        const lowerRole = role.toLowerCase();
        if (!lowerRole.includes('@') && !lowerRole.match(/^\d+$/) &&
            !lowerRole.includes('phone') && !lowerRole.includes('email')) {
          return role;
        }
      }
    }
  }
  
  // Strategy 3: Look in experience section for the most recent/current role
  let experienceSectionIndex = -1;
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const lowerLine = lines[i].toLowerCase();
    if (lowerLine.includes('experience') || lowerLine.includes('employment') || 
        lowerLine.includes('work history') || lowerLine.includes('career')) {
      experienceSectionIndex = i;
      break;
    }
  }
  
  if (experienceSectionIndex >= 0) {
    // Look at the first few lines after experience section (usually current role)
    const searchStart = experienceSectionIndex + 1;
    const searchEnd = Math.min(searchStart + 10, lines.length);
    
    for (let i = searchStart; i < searchEnd; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Skip dates and contact info
      if (lowerLine.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) ||
          lowerLine.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i) ||
          lowerLine.includes('@') || lowerLine.includes('phone')) {
        continue;
      }
      
      // Check for designation keywords
      for (const keyword of designationKeywords) {
        if (lowerLine.includes(keyword) && line.length <= 100) {
          return line;
        }
      }
    }
  }
  
  // Strategy 4: Look for patterns like "Company | Role" or "Role | Company"
  const pipePattern = /([A-Z][a-zA-Z\s&]+)\s*[|]\s*([A-Z][a-zA-Z\s&]+)/;
  const pipeMatch = text.match(pipePattern);
  if (pipeMatch) {
    // Usually format is "Company | Role", so take the second part
    // But sometimes it's "Role | Company", so check which looks more like a role
    const part1 = pipeMatch[1].trim();
    const part2 = pipeMatch[2].trim();
    
    // Check which part contains designation keywords
    const part1Lower = part1.toLowerCase();
    const part2Lower = part2.toLowerCase();
    
    const part1HasKeyword = designationKeywords.some(kw => part1Lower.includes(kw));
    const part2HasKeyword = designationKeywords.some(kw => part2Lower.includes(kw));
    
    if (part1HasKeyword && !part2HasKeyword) {
      return part1;
    } else if (part2HasKeyword && !part1HasKeyword) {
      return part2;
    } else if (part2.length < part1.length && part2.length > 3) {
      // Usually role is shorter than company name
      return part2;
    }
  }
  
  return null;
}

function extractExperience(text: string): string | null {
  // Enhanced patterns for experience extraction
  // Patterns for experience: "X years", "X-Y years", "X+ years", "X months", date-based calculations
  const experiencePatterns = [
    /(\d+)\s*\+\s*years?\s*(?:of|experience)?/i,
    /(\d+)\s*-\s*(\d+)\s*years?\s*(?:of|experience)?/i,
    /(\d+)\s+(?:years?|yrs?)\s*(?:of|experience)?/i,
    /experience[:\s]+(\d+)\s*(?:years?|yrs?)/i,
    /(\d+)\s*yrs?\s*(?:of|experience)?/i,
    /(\d+(?:\.\d+)?)\s*years?\s*(?:of|experience)?/i, // Decimal years like 2.5 years
    // Months converted to years
    /(\d+)\s*(?:months?|mos?)\s*(?:of|experience)?/i
  ];
  
  // Try standard patterns first
  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // Range format
        return `${match[1]}-${match[2]} years`;
      } else if (match[1]) {
        // Check if it's months
        const months = parseInt(match[1]);
        if (pattern.source.includes('months?') && months >= 12) {
          const years = Math.floor(months / 12);
          return `${years}+ years`;
        } else if (pattern.source.includes('months?') && months < 12) {
          // Less than a year, return as months
          return `${months} months`;
        } else {
          return `${match[1]}+ years`;
        }
      }
    }
  }
  
  // Try to calculate experience from employment dates
  // Pattern: "Jan 2020 - Present" or "2020 - 2023" or "January 2020 to June 2022"
  const datePatterns = [
    /(\w+\s+\d{4})\s*(?:to|–|-|—)\s*(?:present|current|now|\w+\s+\d{4})/gi,
    /(\d{4})\s*(?:to|–|-|—)\s*(?:present|current|now|\d{4})/gi
  ];
  
  const employmentDates: Date[] = [];
  const currentYear = new Date().getFullYear();
  
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const startDateStr = match[1];
      // Try to parse date
      const dateMatch = startDateStr.match(/\d{4}/);
      if (dateMatch) {
        const year = parseInt(dateMatch[0]);
        if (year >= 1990 && year <= currentYear) {
          employmentDates.push(new Date(year, 0, 1));
        }
      }
    }
  }
  
  if (employmentDates.length > 0) {
    // Calculate total years from earliest date
    const earliestDate = new Date(Math.min(...employmentDates.map(d => d.getTime())));
    const yearsDiff = (new Date().getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (yearsDiff > 0 && yearsDiff < 50) {
      const roundedYears = Math.round(yearsDiff * 10) / 10;
      return `${roundedYears}+ years`;
    }
  }
  
  return null;
}

function extractSkills(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim());
  
  // Expanded tech skills list with variations and synonyms
  const techSkills = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'dart', 'scala',
    'perl', 'r language', 'matlab', 'shell script', 'bash', 'powershell',
    // Frontend Frameworks/Libraries
    'react', 'angular', 'vue', 'vue.js', 'next.js', 'nuxt.js', 'svelte', 'ember', 'jquery', 'redux', 'mobx',
    'webpack', 'vite', 'parcel', 'babel', 'eslint', 'prettier',
    // Backend Frameworks
    'node.js', 'nodejs', 'express', 'nest.js', 'fastify', 'koa', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
    'laravel', 'symfony', 'rails', 'ruby on rails', 'asp.net', '.net core', 'gin', 'echo',
    // Databases
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'oracle', 'sqlite', 'mariadb',
    'cassandra', 'elasticsearch', 'dynamodb', 'firebase', 'firestore', 'couchdb',
    // Cloud & DevOps
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'jenkins',
    'git', 'ci/cd', 'github actions', 'gitlab ci', 'terraform', 'ansible', 'chef', 'puppet', 'vagrant',
    'nginx', 'apache', 'linux', 'ubuntu', 'centos', 'debian',
    // Frontend Styling
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'stylus', 'bootstrap', 'tailwind', 'tailwindcss',
    'material-ui', 'mui', 'ant design', 'chakra ui', 'styled components', 'emotion',
    // Testing
    'jest', 'mocha', 'chai', 'cypress', 'selenium', 'puppeteer', 'playwright', 'junit', 'testng', 'pytest',
    // Machine Learning & AI
    'machine learning', 'ml', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'nlp', 'natural language processing',
    'scikit-learn', 'sklearn', 'opencv', 'pandas', 'numpy', 'matplotlib', 'seaborn',
    // Mobile Development
    'react native', 'flutter', 'ionic', 'xamarin', 'native android', 'native ios',
    // Other Tools & Technologies
    'agile', 'scrum', 'kanban', 'jira', 'confluence', 'trello', 'asana', 'slack', 'microservices',
    'rest api', 'graphql', 'websocket', 'grpc', 'rabbitmq', 'kafka', 'apache kafka',
    'nosql', 'relational database', 'object-oriented', 'oop', 'functional programming',
    // Version Control & Collaboration
    'git', 'svn', 'mercurial', 'bitbucket', 'github', 'gitlab',
    // Monitoring & Logging
    'prometheus', 'grafana', 'elk stack', 'splunk', 'datadog', 'new relic'
  ];
  
  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Remove common false positives
  const falsePositives = ['experience', 'years', 'skills', 'technical skills', 'core skills', 'key skills'];
  
  // Extract skills using word boundaries for better matching
  for (const skill of techSkills) {
    // Use word boundary regex for exact matching
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match whole word, case insensitive
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    if (regex.test(lowerText)) {
      // Check it's not a false positive
      if (!falsePositives.some(fp => lowerText.includes(fp + ' ' + skill) || lowerText.includes(skill + ' ' + fp))) {
        const normalizedSkill = skill.toLowerCase();
        if (!foundSkills.includes(normalizedSkill)) {
          foundSkills.push(normalizedSkill);
        }
      }
    }
  }
  
  // Common words to exclude from skills extraction (defined at function scope)
  const commonWords = ['and', 'or', 'the', 'with', 'years', 'experience', 'proficient', 'familiar', 'knowledge', 'of', 'in', 'on', 'at', 'to', 'for', 'from', 'by', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'cannot', 'work', 'worked', 'working', 'using', 'used', 'use'];
  
  // Look for skills section with various patterns
  const skillsSectionPatterns = ['skills', 'technical skills', 'core skills', 'key skills', 'competencies', 'technologies', 'tech stack'];
  let skillsSectionIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const lowerLine = lines[i].toLowerCase();
    if (skillsSectionPatterns.some(pattern => {
      return (lowerLine === pattern || 
              lowerLine.startsWith(pattern + ':') || 
              lowerLine.startsWith(pattern + ' -') ||
              lowerLine.startsWith(pattern + ' |') ||
              (lowerLine.includes(pattern) && lowerLine.length < 30));
    })) {
      skillsSectionIndex = i;
      break;
    }
  }
  
  if (skillsSectionIndex !== -1) {
    // Extract skills from the next 15 lines (more comprehensive)
    const skillsLines = lines.slice(skillsSectionIndex + 1, skillsSectionIndex + 16);
    const skillsText = skillsLines.join(' ').toLowerCase();
    
    // Split by various delimiters
    const skillsList = skillsText.split(/[,|•\-–—\/\n\t]/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && s.length < 50 && !s.match(/^(\d+|years?|months?)$/));
    
    // Add unique skills from the section, excluding common words
    for (const skill of skillsList.slice(0, 20)) {
      const normalizedSkill = skill.toLowerCase();
      if (!foundSkills.includes(normalizedSkill) && 
          !commonWords.includes(normalizedSkill) &&
          !/\d{4,}/.test(skill)) { // Exclude year numbers
        foundSkills.push(normalizedSkill);
      }
    }
  }
  
  // Also search for technologies mentioned in experience sections
  // Look for common patterns like "worked with X", "experience in Y", "proficient in Z"
  const experiencePatterns = [
    /(?:worked with|experience in|proficient in|expert in|skilled in|knowledge of|familiar with)\s+([a-z\s]+?)(?:[,.\n]|and|or)/gi,
    /(?:technologies?|tools?|frameworks?|languages?)[:\s]+([a-z\s,]+?)(?:[.\n]|$)/gi
  ];
  
  for (const pattern of experiencePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null && foundSkills.length < 30) {
      const techs = match[1].split(/[,\s]+/).map(t => t.trim()).filter(t => t.length > 2 && t.length < 30);
      for (const tech of techs) {
        const normalizedTech = tech.toLowerCase();
        if (!foundSkills.includes(normalizedTech) && !commonWords.includes(normalizedTech)) {
          foundSkills.push(normalizedTech);
        }
      }
    }
  }
  
  // Return up to 20 skills as comma-separated string (increased from 10)
  if (foundSkills.length > 0) {
    return foundSkills.slice(0, 20).join(', ');
  }
  
  return null;
}

function extractLocation(text: string): string | null {
  // Enhanced location patterns with more variations
  const locationPatterns = [
    /(?:location|address|city|based in|current location|residence|residing in)[:\s]+([A-Z][a-zA-Z\s,]+(?:,\s*[A-Z][a-zA-Z\s]+)?)/i,
    /([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2})?(?:\s+\d{5,})?)/g
  ];
  
  const lines = text.split('\n').slice(0, 25); // Check first 25 lines (increased coverage)
  
  // Look for location keywords with better context
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const locationKeywords = ['location', 'address', 'city', 'based in', 'current location', 'residence', 'residing in'];
    
    for (const keyword of locationKeywords) {
      if (lowerLine.includes(keyword)) {
        // Extract text after the keyword
        const keywordIndex = lowerLine.indexOf(keyword);
        const afterKeyword = line.substring(keywordIndex + keyword.length);
        const match = afterKeyword.match(/[:\s]+([A-Z][a-zA-Z\s,]+(?:,\s*[A-Z][a-zA-Z\s]+)?)/);
        
        if (match && match[1]) {
          let location = match[1].trim();
          // Remove trailing special characters
          location = location.replace(/[,.]$/, '').trim();
          
          // Validate it looks like a location (not too long, has letters)
          if (location.length > 2 && location.length < 60 && /^[A-Z]/.test(location) &&
              !location.toLowerCase().includes('email') &&
              !location.toLowerCase().includes('phone') &&
              !location.match(/^\d+$/)) {
            return location;
          }
        }
      }
    }
  }
  
  // Enhanced common cities list with Indian cities prioritized
  const commonCities = [
    // Indian cities (prioritized)
    'chennai', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'pune', 'kolkata', 'calcutta',
    'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal',
    'visakhapatnam', 'vadodara', 'firozabad', 'ludhiana', 'rajkot', 'agra', 'siliguri', 'nashik',
    'faridabad', 'patna', 'meerut', 'kalyan', 'vasai-virar', 'varanasi', 'srinagar', 'amritsar',
    'noida', 'ghaziabad', 'coimbatore', 'madurai', 'trichy', 'salem', 'tirunelveli', 'erode',
    'vellore', 'dindigul', 'thanjavur', 'tiruppur', 'karur', 'hosur', 'nagercoil', 'kanchipuram',
    'gurgaon', 'gurugram',
    // US cities
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
    'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
    'san francisco', 'indianapolis', 'columbus', 'fort worth', 'charlotte',
    'seattle', 'denver', 'washington', 'boston', 'el paso', 'detroit',
    'nashville', 'portland', 'oklahoma city', 'las vegas', 'memphis',
    // International cities
    'london', 'paris', 'berlin', 'madrid', 'rome', 'amsterdam',
    'toronto', 'vancouver', 'sydney', 'melbourne', 'tokyo', 'singapore',
    'dubai', 'abu dhabi', 'hong kong', 'shanghai', 'beijing'
  ];
  
  const lowerText = text.toLowerCase();
  const foundCities: { city: string; index: number }[] = [];
  
  for (const city of commonCities) {
    const index = lowerText.indexOf(city);
    if (index !== -1) {
      // Prioritize cities found in header/contact section (first 500 chars)
      foundCities.push({ 
        city: city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
        index 
      });
    }
  }
  
  if (foundCities.length > 0) {
    // Sort by index (earlier = higher priority) and return the first
    foundCities.sort((a, b) => a.index - b.index);
    return foundCities[0].city;
  }
  
  // Try pattern matching for city, state/country format
  const cityStatePattern = /([A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+)/g;
  let match;
  const locations: string[] = [];
  while ((match = cityStatePattern.exec(text)) !== null && locations.length < 3) {
    const location = match[0].trim();
    // Check it's not an email or other false positive
    if (!location.includes('@') && location.length > 5 && location.length < 50) {
      locations.push(location);
    }
  }
  
  // Return first valid location from header area
  if (locations.length > 0) {
    return locations[0];
  }
  
  return null;
}

function extractCompany(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Enhanced company-related keywords
  const companyKeywords = [
    'company', 'employer', 'organization', 'corporation', 'works at', 'current company', 
    'present company', 'currently at', 'employed at', 'working at', 'at', 'inc', 'ltd', 'llc'
  ];
  
  // Look for employment/experience section first
  let experienceSectionIndex = -1;
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const lowerLine = lines[i].toLowerCase();
    if (lowerLine.includes('experience') || lowerLine.includes('employment') || 
        lowerLine.includes('work history') || lowerLine.includes('career')) {
      experienceSectionIndex = i;
      break;
    }
  }
  
  // Search in experience section and nearby lines (more comprehensive)
  const searchStart = experienceSectionIndex >= 0 ? Math.max(0, experienceSectionIndex) : 0;
  const searchEnd = Math.min(searchStart + 40, lines.length);
  
  for (let i = searchStart; i < searchEnd; i++) {
    const lowerLine = lines[i].toLowerCase();
    
    // Skip if it's likely contact info, dates, or other metadata
    if (lowerLine.includes('@') || 
        lowerLine.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) || // Date format
        lowerLine.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i) ||
        lowerLine.match(/^\d{4}\s*[–\-]\s*(present|current|now|\d{4})/i) ||
        lowerLine.includes('phone') || 
        lowerLine.includes('email') ||
        lowerLine.includes('location') && !lowerLine.includes('company')) {
      continue;
    }
    
    // Check if line contains company keywords or looks like a company name
    const hasCompanyKeyword = companyKeywords.some(keyword => lowerLine.includes(keyword));
    
    // Pattern for company names: usually capitalized, may have Inc, Ltd, LLC, etc.
    const companyNamePattern = /^[A-Z][a-zA-Z0-9\s&\-.,]+(?:Inc|Ltd|LLC|Corp|Corporation|Company|Technologies|Tech|Systems|Solutions|Services)?$/;
    
    if (hasCompanyKeyword || companyNamePattern.test(lines[i])) {
      // Extract company name
      let company = lines[i];
      
      // If line contains keywords, extract the company part
      for (const keyword of companyKeywords) {
        if (lowerLine.includes(keyword)) {
          // Try to extract after the keyword
          const parts = lines[i].split(new RegExp(`\\b${keyword}\\b`, 'i'));
          if (parts.length > 1) {
            company = parts[parts.length - 1].trim();
            // Clean up separators
            company = company.replace(/^[:–\-|]+\s*/, '').trim();
          }
        }
      }
      
      // Clean up common prefixes/suffixes
      company = company.replace(/^(at|with|of|from)\s+/i, '').trim();
      
      // Validate company name
      if (company.length > 2 && company.length < 80 && 
          !company.match(/^\d+$/) && // Not just numbers
          !company.includes('@') && // Not an email
          !company.match(/^https?:\/\//i)) { // Not a URL
        return company;
      }
    }
  }
  
  // Alternative: Look for company patterns in job descriptions
  // Pattern: "Senior Developer at CompanyName" or "CompanyName | Role"
  const jobPatterns = [
    /(?:at|with)\s+([A-Z][a-zA-Z0-9\s&\-.,]+(?:Inc|Ltd|LLC|Corp|Technologies|Tech|Systems|Solutions)?)/g,
    /([A-Z][a-zA-Z0-9\s&\-.,]+(?:Inc|Ltd|LLC|Corp))\s*[|–\-]/g
  ];
  
  for (const pattern of jobPatterns) {
    let match;
    const companies = new Set<string>();
    while ((match = pattern.exec(text)) !== null && companies.size < 5) {
      const company = match[1].trim();
      if (company.length > 2 && company.length < 80) {
        companies.add(company);
      }
    }
    // Return the first (usually current) company
    if (companies.size > 0) {
      return Array.from(companies)[0];
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
