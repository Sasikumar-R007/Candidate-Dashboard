import type { Profile } from "@shared/schema";

export interface CompletionSection {
  id: string;
  label: string;
  isDone: boolean;
  weight: number;
}

export function calculateProfileCompletion(profile: Profile | null | undefined, jobPreferences?: any): {
  percentage: number;
  sections: CompletionSection[];
  missing: CompletionSection[];
} {
  if (!profile) {
    return { percentage: 0, sections: [], missing: [] };
  }

  const sections: CompletionSection[] = [
    {
      id: 'photo',
      label: 'Profile Photo',
      weight: 10,
      isDone: !!profile.profilePicture,
    },
    {
      id: 'basic',
      label: 'Personal Info',
      weight: 15,
      isDone: !!(
        profile.firstName && 
        profile.lastName && 
        profile.email && 
        profile.phone && 
        profile.currentLocation && 
        profile.preferredLocation && 
        profile.dateOfBirth && 
        profile.gender &&
        profile.title && profile.title !== 'Not set'
      ),
    },
    {
      id: 'presence',
      label: 'Online Presence',
      weight: 10,
      isDone: !!(profile.linkedinUrl && profile.portfolioUrl && profile.websiteUrl),
    },
    {
      id: 'journey',
      label: 'Your Journey',
      weight: 20,
      isDone: !!(
        profile.currentCompany && 
        profile.currentRole && 
        profile.currentDomain && 
        profile.noticePeriod &&
        profile.totalExperience &&
        profile.productService &&
        profile.companyLevel
      ),
    },
    {
      id: 'education',
      label: 'Education',
      weight: 15,
      isDone: !!(
        (profile.highestQualification || profile.degreeLevel) && 
        profile.collegeName &&
        profile.pedigreeLevel &&
        profile.graduationYear
      ),
    },
    {
      id: 'resume',
      label: 'Resume',
      weight: 20,
      isDone: !!(profile.resumeFile || profile.resumeText),
    },
    {
      id: 'preferences',
      label: 'Job Preferences',
      weight: 10,
      isDone: !!(
        jobPreferences && 
        jobPreferences.jobTitles?.length > 0 && 
        jobPreferences.locations?.length > 0 && 
        jobPreferences.salaryRange
      ),
    }
  ];

  const percentage = sections.reduce((acc, section) => section.isDone ? acc + section.weight : acc, 0);
  const missing = sections.filter(s => !s.isDone);

  return { percentage, sections, missing };
}
