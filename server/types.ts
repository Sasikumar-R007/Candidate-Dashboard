import 'express-session';

declare module 'express-session' {
  interface SessionData {
    candidateId?: string;
    employeeId?: string;
    employeeRole?: string;
    userType?: 'candidate' | 'employee' | 'support';
    supportUserId?: string;
    conversationId?: string;
    resumeMergePreview?: {
      candidateUuid: string;
      fileUrl: string;
      mergedProfile: Record<string, unknown>;
      mergedCandidate: Record<string, unknown>;
      skillList: string[];
      changes: import('./resume-profile-merge').ResumeFieldChange[];
      fromResume: import('./resume-profile-merge').ResumeFieldChange[];
      retained: import('./resume-profile-merge').ResumeFieldChange[];
      createdAt: number;
    };
  }
}
