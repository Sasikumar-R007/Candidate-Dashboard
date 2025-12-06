import { IStorage } from "./storage";
import type { InsertUserActivity } from "@shared/schema";

export type ActivityType = 
  | 'requirement_added'
  | 'candidate_pipeline_changed'
  | 'closure_made'
  | 'candidate_submitted'
  | 'interview_scheduled';

interface LogActivityParams {
  storage: IStorage;
  actorId: string;
  actorName: string;
  actorRole: string;
  type: ActivityType;
  title: string;
  description: string;
  targetRole?: string;
  relatedId?: string;
  relatedType?: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const activity: InsertUserActivity = {
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      type: params.type,
      title: params.title,
      description: params.description,
      targetRole: params.targetRole || 'all',
      relatedId: params.relatedId,
      relatedType: params.relatedType,
      createdAt: new Date().toISOString()
    };
    
    await params.storage.createUserActivity(activity);
    console.log(`Activity logged: ${params.type} - ${params.title}`);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export function logRequirementAdded(
  storage: IStorage,
  actorId: string,
  actorName: string,
  actorRole: string,
  requirementTitle: string,
  clientName: string,
  requirementId?: string
): Promise<void> {
  return logActivity({
    storage,
    actorId,
    actorName,
    actorRole,
    type: 'requirement_added',
    title: 'New requirement added',
    description: `${requirementTitle} at ${clientName}`,
    targetRole: 'all',
    relatedId: requirementId,
    relatedType: 'requirement'
  });
}

export function logCandidatePipelineChanged(
  storage: IStorage,
  actorId: string,
  actorName: string,
  actorRole: string,
  candidateName: string,
  fromStage: string,
  toStage: string,
  candidateId?: string
): Promise<void> {
  return logActivity({
    storage,
    actorId,
    actorName,
    actorRole,
    type: 'candidate_pipeline_changed',
    title: 'Pipeline update',
    description: `${candidateName} moved from ${fromStage} to ${toStage}`,
    targetRole: 'all',
    relatedId: candidateId,
    relatedType: 'candidate'
  });
}

export function logClosureMade(
  storage: IStorage,
  actorId: string,
  actorName: string,
  actorRole: string,
  candidateName: string,
  position: string,
  clientName: string,
  closureId?: string
): Promise<void> {
  return logActivity({
    storage,
    actorId,
    actorName,
    actorRole,
    type: 'closure_made',
    title: 'New closure',
    description: `${candidateName} joined ${clientName} as ${position}`,
    targetRole: 'all',
    relatedId: closureId,
    relatedType: 'closure'
  });
}

export function logCandidateSubmitted(
  storage: IStorage,
  actorId: string,
  actorName: string,
  actorRole: string,
  candidateName: string,
  requirementTitle: string,
  candidateId?: string
): Promise<void> {
  return logActivity({
    storage,
    actorId,
    actorName,
    actorRole,
    type: 'candidate_submitted',
    title: 'New candidate submitted',
    description: `${candidateName} submitted for ${requirementTitle}`,
    targetRole: 'all',
    relatedId: candidateId,
    relatedType: 'candidate'
  });
}

export function logInterviewScheduled(
  storage: IStorage,
  actorId: string,
  actorName: string,
  actorRole: string,
  candidateName: string,
  interviewType: string,
  interviewDate: string,
  interviewId?: string
): Promise<void> {
  return logActivity({
    storage,
    actorId,
    actorName,
    actorRole,
    type: 'interview_scheduled',
    title: 'Interview scheduled',
    description: `${interviewType} interview for ${candidateName} on ${interviewDate}`,
    targetRole: 'all',
    relatedId: interviewId,
    relatedType: 'interview'
  });
}
