// ============================================
// ENTERPRISE SOURCE RESUME SEARCH ENGINE
// ============================================
// Server-side indexed search with skill normalization,
// semantic matching, and advanced scoring

import { db } from "./db";
import { candidates } from "@shared/schema";
import { sql, and, or, like, ilike, gte, lte, inArray, eq, desc, asc } from "drizzle-orm";

// ============================================
// PHASE B: SKILL NORMALIZATION ENGINE
// ============================================

const SKILL_NORMALIZATION_MAP: Record<string, string> = {
  // React variants
  'reactjs': 'react',
  'react.js': 'react',
  'react-js': 'react',
  'reactjsx': 'react',
  
  // Node variants
  'nodejs': 'node.js',
  'node.js': 'node.js',
  'node-js': 'node.js',
  
  // JavaScript variants
  'js': 'javascript',
  'javascript': 'javascript',
  'ecmascript': 'javascript',
  
  // TypeScript variants
  'ts': 'typescript',
  'typescript': 'typescript',
  
  // Machine Learning variants
  'ml': 'machine learning',
  'machinelearning': 'machine learning',
  'machine-learning': 'machine learning',
  'ai': 'artificial intelligence',
  'artificialintelligence': 'artificial intelligence',
  
  // Python variants
  'py': 'python',
  'python3': 'python',
  'python2': 'python',
  
  // Java variants
  'java': 'java',
  'j2ee': 'java',
  'j2se': 'java',
  
  // Database variants
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'postgres-db': 'postgresql',
  'mysql': 'mysql',
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'nosql': 'mongodb',
  
  // Cloud variants
  'aws': 'amazon web services',
  'amazonwebservices': 'amazon web services',
  'azure': 'microsoft azure',
  'gcp': 'google cloud platform',
  'googlecloud': 'google cloud platform',
  
  // Frontend variants
  'html5': 'html',
  'html': 'html',
  'css3': 'css',
  'css': 'css',
  'sass': 'scss',
  'scss': 'scss',
  
  // Framework variants
  'expressjs': 'express',
  'express.js': 'express',
  'express-js': 'express',
  'nextjs': 'next.js',
  'next.js': 'next.js',
  'vuejs': 'vue.js',
  'vue.js': 'vue.js',
  'angularjs': 'angular',
  'angular': 'angular',
  
  // DevOps variants
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  'docker': 'docker',
  'docker-container': 'docker',
  'ci-cd': 'ci/cd',
  'cicd': 'ci/cd',
  'jenkins': 'jenkins',
  'gitlab-ci': 'gitlab ci',
  'github-actions': 'github actions',
};

/**
 * Normalize a skill name to its canonical form
 */
export function normalizeSkill(skill: string): string {
  if (!skill) return '';
  
  const normalized = skill.toLowerCase().trim()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  return SKILL_NORMALIZATION_MAP[normalized] || normalized;
}

/**
 * Normalize an array of skills
 */
export function normalizeSkills(skills: string[]): string[] {
  return skills.map(normalizeSkill).filter(Boolean);
}

/**
 * Parse skills from comma-separated string and normalize
 */
export function parseAndNormalizeSkills(skillsString: string): string[] {
  if (!skillsString) return [];
  return normalizeSkills(skillsString.split(',').map(s => s.trim()).filter(Boolean));
}

// ============================================
// PHASE C: SEMANTIC LAYER
// ============================================

const SYNONYM_MAP: Record<string, string[]> = {
  // Role synonyms
  'developer': ['engineer', 'programmer', 'coder', 'software developer'],
  'engineer': ['developer', 'programmer', 'coder'],
  'programmer': ['developer', 'engineer', 'coder'],
  'backend': ['server-side', 'server', 'back-end', 'api developer'],
  'frontend': ['ui developer', 'front-end', 'client-side', 'ui engineer'],
  'fullstack': ['full stack', 'full-stack', 'full stack developer'],
  'full stack': ['fullstack', 'full-stack', 'full stack developer'],
  
  // Technology synonyms
  'database': ['db', 'data storage', 'data store'],
  'api': ['rest api', 'restful api', 'web api', 'api development'],
  'microservices': ['microservice', 'micro service', 'distributed systems'],
  'cloud': ['cloud computing', 'cloud platform', 'cloud services'],
  
  // Experience level synonyms
  'senior': ['sr', 'sr.', 'senior level', 'experienced'],
  'lead': ['tech lead', 'technical lead', 'team lead', 'lead developer'],
  'junior': ['jr', 'jr.', 'entry level', 'fresher', 'beginner'],
  'mid': ['mid-level', 'mid level', 'intermediate'],
};

/**
 * Get synonyms for a term
 */
export function getSynonyms(term: string): string[] {
  const lowerTerm = term.toLowerCase().trim();
  return SYNONYM_MAP[lowerTerm] || [];
}

/**
 * Expand search term with synonyms
 */
export function expandWithSynonyms(term: string): string[] {
  const synonyms = getSynonyms(term);
  return [term, ...synonyms];
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Calculate similarity score (0-1) using Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;
  
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - (distance / maxLen);
}

/**
 * Detect role seniority from title
 */
export function detectSeniority(title: string): 'junior' | 'mid' | 'senior' | 'lead' | 'unknown' {
  if (!title) return 'unknown';
  
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('lead') || lowerTitle.includes('principal') || lowerTitle.includes('architect')) {
    return 'lead';
  }
  if (lowerTitle.includes('senior') || lowerTitle.includes('sr') || lowerTitle.includes('sr.')) {
    return 'senior';
  }
  if (lowerTitle.includes('junior') || lowerTitle.includes('jr') || lowerTitle.includes('jr.') || lowerTitle.includes('entry') || lowerTitle.includes('fresher')) {
    return 'junior';
  }
  if (lowerTitle.includes('mid') || lowerTitle.includes('intermediate')) {
    return 'mid';
  }
  
  return 'unknown';
}

// ============================================
// PHASE D: ADVANCED SCORING MODEL
// ============================================

interface CandidateScore {
  candidate: any;
  relevanceScore: number;
  matchPercentage?: number;
  matchedTerms: string[];
  fieldMatches: Record<string, number>;
}

/**
 * Calculate skill recency weight
 * Assumes more recent skills in the list are more relevant
 */
function calculateSkillRecencyWeight(skill: string, candidateSkills: string[], searchSkills: string[]): number {
  const skillIndex = candidateSkills.indexOf(skill);
  if (skillIndex === -1) return 0;
  
  // Skills listed first are weighted higher
  const positionWeight = 1 - (skillIndex / candidateSkills.length) * 0.3; // Max 30% reduction
  return positionWeight;
}

/**
 * Calculate multi-skill synergy score
 * Higher score when multiple related skills are present
 */
function calculateSkillSynergy(candidateSkills: string[], searchSkills: string[]): number {
  const normalizedCandidate = candidateSkills.map(normalizeSkill);
  const normalizedSearch = searchSkills.map(normalizeSkill);
  
  let matchedCount = 0;
  for (const searchSkill of normalizedSearch) {
    if (normalizedCandidate.includes(searchSkill)) {
      matchedCount++;
    }
  }
  
  // Synergy bonus: having multiple matching skills increases score
  const baseMatch = matchedCount / normalizedSearch.length;
  const synergyBonus = matchedCount > 1 ? (matchedCount - 1) * 0.1 : 0;
  
  return Math.min(1.0, baseMatch + synergyBonus);
}

/**
 * Calculate stability score based on tenure
 * Higher score for candidates with longer average tenure
 */
function calculateStabilityScore(candidate: any): number {
  // This would ideally use work history, but for now we use experience as proxy
  const experience = parseFloat(candidate.experience?.replace(/[^\d.]/g, '') || '0');
  
  // Higher experience suggests stability
  // Normalize to 0-1 scale (assuming 0-20 years range)
  return Math.min(1.0, experience / 20);
}

/**
 * Calculate career progression score
 * Based on title progression and experience
 */
function calculateCareerProgressionScore(candidate: any): number {
  const seniority = detectSeniority(candidate.designation || candidate.currentRole || candidate.title || '');
  const experience = parseFloat(candidate.experience?.replace(/[^\d.]/g, '') || '0');
  
  // Expected progression: Junior (0-2), Mid (2-5), Senior (5-10), Lead (10+)
  const expectedRanges: Record<string, [number, number]> = {
    'junior': [0, 2],
    'mid': [2, 5],
    'senior': [5, 10],
    'lead': [10, 20],
    'unknown': [0, 20],
  };
  
  const [minExp, maxExp] = expectedRanges[seniority] || [0, 20];
  
  if (experience >= minExp && experience <= maxExp) {
    return 1.0; // Good progression
  } else if (experience < minExp) {
    return 0.7; // Under-experienced for role
  } else {
    return 0.8; // Over-experienced (might be under-leveled)
  }
}

/**
 * Calculate comprehensive relevance score
 */
export function calculateRelevanceScore(
  candidate: any,
  searchQuery: string,
  searchSkills: string[],
  requirement?: any
): CandidateScore {
  let totalScore = 0;
  const matchedTerms: string[] = [];
  const fieldMatches: Record<string, number> = {};
  
  // Field weights
  const FIELD_WEIGHTS = {
    skills: 1.0,
    title: 0.8,
    name: 0.6,
    resumeText: 0.5,
    company: 0.4,
    education: 0.3,
    location: 0.2,
  };
  
  // Parse candidate skills
  const candidateSkills = parseAndNormalizeSkills(candidate.skills || '');
  
  // 1. Skill matching (40% weight)
  if (searchSkills.length > 0) {
    const skillSynergy = calculateSkillSynergy(candidateSkills, searchSkills);
    let skillScore = skillSynergy;
    
    // Add recency weight
    for (const searchSkill of searchSkills) {
      const normalizedSearch = normalizeSkill(searchSkill);
      if (candidateSkills.includes(normalizedSearch)) {
        const recencyWeight = calculateSkillRecencyWeight(normalizedSearch, candidateSkills, searchSkills);
        skillScore += recencyWeight * 0.1;
        matchedTerms.push(searchSkill);
      }
    }
    
    skillScore = Math.min(1.0, skillScore);
    const weightedSkillScore = skillScore * 100 * FIELD_WEIGHTS.skills * 0.4;
    totalScore += weightedSkillScore;
    fieldMatches.skills = weightedSkillScore;
  }
  
  // 2. Title/Role matching (20% weight)
  const title = (candidate.designation || candidate.currentRole || candidate.title || '').toLowerCase();
  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    const titleSimilarity = calculateSimilarity(title, queryLower);
    const titleScore = titleSimilarity * 100 * FIELD_WEIGHTS.title * 0.2;
    totalScore += titleScore;
    fieldMatches.title = titleScore;
    
    if (titleSimilarity > 0.7) {
      matchedTerms.push(searchQuery);
    }
  }
  
  // 3. Experience relevance (10% weight)
  const experience = parseFloat(candidate.experience?.replace(/[^\d.]/g, '') || '0');
  // This would ideally use filter range, but for now we use a simple score
  const expScore = Math.min(1.0, experience / 15) * 100 * 0.1;
  totalScore += expScore;
  fieldMatches.experience = expScore;
  
  // 4. Recency (10% weight)
  if (candidate.createdAt) {
    const createdDate = new Date(candidate.createdAt);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 100 - (daysSinceCreation / 30) * 10);
    totalScore += recencyScore * 0.1;
    fieldMatches.recency = recencyScore * 0.1;
  }
  
  // 5. Stability score (10% weight)
  const stabilityScore = calculateStabilityScore(candidate) * 100 * 0.1;
  totalScore += stabilityScore;
  fieldMatches.stability = stabilityScore;
  
  // 6. Career progression (10% weight)
  const progressionScore = calculateCareerProgressionScore(candidate) * 100 * 0.1;
  totalScore += progressionScore;
  fieldMatches.progression = progressionScore;
  
  // Calculate requirement match if provided
  let matchPercentage: number | undefined;
  if (requirement) {
    matchPercentage = calculateRequirementMatch(candidate, requirement, candidateSkills);
  }
  
  return {
    candidate,
    relevanceScore: Math.min(100, Math.round(totalScore)),
    matchPercentage,
    matchedTerms: [...new Set(matchedTerms)],
    fieldMatches,
  };
}

/**
 * Calculate requirement match percentage
 */
function calculateRequirementMatch(candidate: any, requirement: any, candidateSkills: string[]): number {
  let matchScore = 0;
  let totalWeight = 0;
  
  // Skills match (40% weight)
  if (requirement.skills || requirement.requiredSkills) {
    const reqSkills = (requirement.skills || requirement.requiredSkills || [])
      .map((s: string) => normalizeSkill(s));
    const skillSynergy = calculateSkillSynergy(candidateSkills, reqSkills);
    matchScore += skillSynergy * 100 * 0.4;
    totalWeight += 0.4;
  }
  
  // Experience match (20% weight)
  if (requirement.experience) {
    const reqExp = parseFloat(String(requirement.experience).replace(/[^\d.]/g, '') || '0');
    const candidateExp = parseFloat(candidate.experience?.replace(/[^\d.]/g, '') || '0');
    const expDiff = Math.abs(candidateExp - reqExp);
    const expScore = Math.max(0, 100 - (expDiff * 10));
    matchScore += expScore * 0.2;
    totalWeight += 0.2;
  }
  
  // Location match (15% weight)
  if (requirement.location) {
    const locationMatch = 
      (candidate.location || '').toLowerCase().includes(requirement.location.toLowerCase()) ||
      (candidate.preferredLocation || '').toLowerCase().includes(requirement.location.toLowerCase());
    matchScore += (locationMatch ? 100 : 0) * 0.15;
    totalWeight += 0.15;
  }
  
  // Title/Role match (15% weight)
  if (requirement.position || requirement.jobTitle) {
    const reqTitle = (requirement.position || requirement.jobTitle || '').toLowerCase();
    const candidateTitle = (candidate.designation || candidate.currentRole || candidate.title || '').toLowerCase();
    const titleSimilarity = calculateSimilarity(candidateTitle, reqTitle);
    matchScore += titleSimilarity * 100 * 0.15;
    totalWeight += 0.15;
  }
  
  // Education match (10% weight)
  if (requirement.education) {
    const eduMatch = (candidate.education || '').toLowerCase().includes(requirement.education.toLowerCase());
    matchScore += (eduMatch ? 100 : 0) * 0.1;
    totalWeight += 0.1;
  }
  
  return totalWeight > 0 ? Math.round(matchScore / totalWeight) : 0;
}

// ============================================
// PHASE E: DATABASE QUERY BUILDER
// ============================================

/**
 * Build database query with filters
 */
export function buildSearchQuery(filters: any) {
  const conditions: any[] = [];
  
  // Boolean search query
  if (filters.searchQuery && filters.booleanMode) {
    // For boolean search, we'll use ILIKE for phrase matching
    // Complex boolean logic would require full-text search (PostgreSQL tsvector)
    const query = filters.searchQuery.toLowerCase();
    conditions.push(
      or(
        ilike(candidates.fullName, `%${query}%`),
        ilike(candidates.designation, `%${query}%`),
        ilike(candidates.skills, `%${query}%`),
        ilike(candidates.location, `%${query}%`),
        ilike(candidates.company, `%${query}%`),
        ilike(candidates.education, `%${query}%`),
        ilike(candidates.resumeText, `%${query}%`)
      )
    );
  }
  
  // Experience filter - only apply if not default [0, 15]
  // This allows showing all candidates when filters are reset
  if (filters.experience && filters.experience.length === 2) {
    const [minExp, maxExp] = filters.experience;
    // Only apply filter if it's not the default range [0, 15]
    if (minExp !== 0 || maxExp !== 15) {
      // Parse experience from string format, handle NULL/empty values by including them
      conditions.push(
        sql`(
          ${candidates.experience} IS NULL OR 
          ${candidates.experience} = '' OR
          (
            CAST(REGEXP_REPLACE(${candidates.experience}, '[^0-9.]', '', 'g') AS FLOAT) >= ${minExp} AND 
            CAST(REGEXP_REPLACE(${candidates.experience}, '[^0-9.]', '', 'g') AS FLOAT) <= ${maxExp}
          )
        )`
      );
    }
  }
  
  // Location filter
  if (filters.location) {
    conditions.push(ilike(candidates.location, `%${filters.location}%`));
  }
  
  // Role filter
  if (filters.role && filters.role.trim() !== "") {
    conditions.push(
      or(
        ilike(candidates.designation, `%${filters.role}%`),
        ilike(candidates.currentRole, `%${filters.role}%`),
        ilike(candidates.position, `%${filters.role}%`)
      )
    );
  }
  
  // Company filter
  if (filters.company) {
    conditions.push(ilike(candidates.company, `%${filters.company}%`));
  }
  
  // Education filter
  if (filters.educationUG) {
    conditions.push(ilike(candidates.education, `%${filters.educationUG}%`));
  }
  if (filters.educationPG) {
    conditions.push(ilike(candidates.education, `%${filters.educationPG}%`));
  }
  
  // Skills filter (normalized)
  if (filters.specificSkills && filters.specificSkills.length > 0) {
    const normalizedSkills = normalizeSkills(filters.specificSkills);
    const skillConditions = normalizedSkills.map(skill => 
      ilike(candidates.skills, `%${skill}%`)
    );
    conditions.push(or(...skillConditions));
  }
  
  // Excluded keywords
  if (filters.excludedKeywords && filters.excludedKeywords.length > 0) {
    const excludeConditions = filters.excludedKeywords.map((keyword: string) =>
      sql`NOT (${candidates.fullName} ILIKE ${`%${keyword}%`} OR ${candidates.skills} ILIKE ${`%${keyword}%`} OR ${candidates.resumeText} ILIKE ${`%${keyword}%`})`
    );
    conditions.push(and(...excludeConditions));
  }
  
  // Excluded companies
  if (filters.excludedCompanies && filters.excludedCompanies.length > 0) {
    const excludeCompanyConditions = filters.excludedCompanies.map((company: string) =>
      sql`NOT ${candidates.company} ILIKE ${`%${company}%`}`
    );
    conditions.push(and(...excludeCompanyConditions));
  }
  
  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Get sort order
 */
export function getSortOrder(sortOption: string) {
  switch (sortOption) {
    case 'experience-high':
      return desc(sql`CAST(REGEXP_REPLACE(${candidates.experience}, '[^0-9.]', '', 'g') AS FLOAT)`);
    case 'experience-low':
      return asc(sql`CAST(REGEXP_REPLACE(${candidates.experience}, '[^0-9.]', '', 'g') AS FLOAT)`);
    case 'recently-updated':
      return desc(candidates.createdAt);
    case 'alphabetical':
      return asc(candidates.fullName);
    default:
      return desc(candidates.createdAt); // Default: most recent
  }
}


