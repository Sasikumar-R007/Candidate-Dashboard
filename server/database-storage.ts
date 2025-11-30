// Database storage implementation for recruitment platform - integrated from blueprint:javascript_database
import { 
  type User, 
  type InsertUser, 
  type Profile, 
  type InsertProfile,
  type JobPreferences,
  type InsertJobPreferences,
  type Skill,
  type InsertSkill,
  type Activity,
  type InsertActivity,
  type JobApplication,
  type InsertJobApplication,
  type SavedJob,
  type InsertSavedJob,
  type Requirement,
  type InsertRequirement,
  type ArchivedRequirement,
  type InsertArchivedRequirement,
  type Employee,
  type InsertEmployee,
  type Candidate,
  type InsertCandidate,
  type CandidateLoginAttempts,
  type InsertCandidateLoginAttempts,
  type BulkUploadJob,
  type InsertBulkUploadJob,
  type BulkUploadFile,
  type InsertBulkUploadFile,
  type Notification,
  type InsertNotification,
  type Client,
  type InsertClient,
  type ImpactMetrics,
  type InsertImpactMetrics,
  type TargetMappings,
  type InsertTargetMappings,
  type RevenueMapping,
  type InsertRevenueMapping,
  type RecruiterJob,
  type InsertRecruiterJob,
  type RecruiterCommand,
  type InsertRecruiterCommand,
  type Meeting,
  users,
  profiles,
  jobPreferences,
  skills,
  activities,
  jobApplications,
  savedJobs,
  requirements,
  archivedRequirements,
  employees,
  candidates,
  candidateLoginAttempts,
  bulkUploadJobs,
  bulkUploadFiles,
  notifications,
  clients,
  impactMetrics,
  targetMappings,
  revenueMappings,
  recruiterJobs,
  recruiterCommands,
  meetings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import bcrypt from "bcrypt";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private otpStorage: Map<string, { otp: string; expiry: Date; email: string }> = new Map();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Profile methods
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || undefined;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.userId, userId))
      .returning();
    return profile || undefined;
  }

  // Job preferences methods
  async getJobPreferences(profileId: string): Promise<JobPreferences | undefined> {
    const [prefs] = await db.select().from(jobPreferences).where(eq(jobPreferences.profileId, profileId));
    return prefs || undefined;
  }

  async createJobPreferences(insertPreferences: InsertJobPreferences): Promise<JobPreferences> {
    const [prefs] = await db.insert(jobPreferences).values(insertPreferences).returning();
    return prefs;
  }

  async updateJobPreferences(profileId: string, updates: Partial<JobPreferences>): Promise<JobPreferences | undefined> {
    const [prefs] = await db
      .update(jobPreferences)
      .set(updates)
      .where(eq(jobPreferences.profileId, profileId))
      .returning();
    return prefs || undefined;
  }

  // Skills methods
  async getSkillsByProfile(profileId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.profileId, profileId));
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  async updateSkillsByProfile(profileId: string, newSkills: InsertSkill[]): Promise<Skill[]> {
    // Delete existing skills for this profile
    await db.delete(skills).where(eq(skills.profileId, profileId));
    
    // Insert new skills
    if (newSkills.length === 0) return [];
    
    const createdSkills = await db.insert(skills).values(newSkills).returning();
    return createdSkills;
  }

  // Activities methods
  async getActivitiesByProfile(profileId: string): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.profileId, profileId)).orderBy(desc(activities.date));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Job applications methods
  async getJobApplicationsByProfile(profileId: string): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.profileId, profileId)).orderBy(desc(jobApplications.appliedDate));
  }

  async createJobApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const [application] = await db.insert(jobApplications).values(insertApplication).returning();
    return application;
  }

  // Saved jobs methods
  async getSavedJobsByProfile(profileId: string): Promise<SavedJob[]> {
    return await db.select().from(savedJobs).where(eq(savedJobs.profileId, profileId)).orderBy(desc(savedJobs.savedDate));
  }

  async createSavedJob(insertSavedJob: InsertSavedJob): Promise<SavedJob> {
    const [savedJob] = await db.insert(savedJobs).values(insertSavedJob).returning();
    return savedJob;
  }

  async removeSavedJob(profileId: string, jobTitle: string, company: string): Promise<boolean> {
    const result = await db
      .delete(savedJobs)
      .where(
        and(
          eq(savedJobs.profileId, profileId),
          eq(savedJobs.jobTitle, jobTitle),
          eq(savedJobs.company, company)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  // Requirements methods
  async getRequirements(): Promise<Requirement[]> {
    return await db.select().from(requirements).where(eq(requirements.isArchived, false)).orderBy(desc(requirements.createdAt));
  }

  async createRequirement(insertRequirement: InsertRequirement): Promise<Requirement> {
    const requirementData = {
      ...insertRequirement,
      isArchived: false,
      createdAt: new Date().toISOString()
    };
    const [requirement] = await db.insert(requirements).values(requirementData).returning();
    return requirement;
  }

  async updateRequirement(id: string, updates: Partial<Requirement>): Promise<Requirement | undefined> {
    const [requirement] = await db
      .update(requirements)
      .set(updates)
      .where(eq(requirements.id, id))
      .returning();
    return requirement || undefined;
  }

  async archiveRequirement(id: string): Promise<ArchivedRequirement | undefined> {
    // Get the requirement first
    const [requirement] = await db.select().from(requirements).where(eq(requirements.id, id));
    if (!requirement) return undefined;

    // Create archived version
    const archivedData: InsertArchivedRequirement = {
      position: requirement.position,
      criticality: requirement.criticality,
      company: requirement.company,
      spoc: requirement.spoc,
      talentAdvisor: requirement.talentAdvisor,
      teamLead: requirement.teamLead,
      archivedAt: new Date().toISOString(),
      originalId: requirement.id
    };

    const [archived] = await db.insert(archivedRequirements).values(archivedData).returning();
    
    // Mark original as archived
    await db.update(requirements).set({ isArchived: true }).where(eq(requirements.id, id));
    
    return archived;
  }

  async getArchivedRequirements(): Promise<ArchivedRequirement[]> {
    return await db.select().from(archivedRequirements).orderBy(desc(archivedRequirements.archivedAt));
  }

  // Employee methods
  async getEmployeeById(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.email, email));
    return employee || undefined;
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employeeId, employeeId));
    return employee || undefined;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    // Hash password only if provided (for login credentials)
    // If no password, employee record is created without login capability
    let hashedPassword = null;
    if (insertEmployee.password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(insertEmployee.password, saltRounds);
    }
    
    const employeeData = {
      ...insertEmployee,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const [employee] = await db.insert(employees).values(employeeData).returning();
    return employee;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.isActive, true)).orderBy(desc(employees.createdAt));
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    // If password is being updated, hash it
    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }

    const [employee] = await db
      .update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return employee || undefined;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    // Soft delete by marking as inactive
    const result = await db
      .update(employees)
      .set({ isActive: false })
      .where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateNextEmployeeId(role: string): Promise<string> {
    // Determine prefix based on role
    let prefix = 'STTA'; // Default to recruiter
    if (role === 'team_leader') {
      prefix = 'STTL';
    } else if (role === 'client') {
      prefix = 'STCL';
    }

    // Get all employees with this prefix
    const allEmployees = await db.select().from(employees);
    const maxNumber = allEmployees
      .filter(e => e.employeeId.startsWith(prefix))
      .map(e => parseInt(e.employeeId.replace(prefix, '')))
      .filter(n => !isNaN(n))
      .reduce((max, current) => Math.max(max, current), 0);
    
    const nextNumber = maxNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  // Candidate methods
  async getCandidateByEmail(email: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.email, email));
    return candidate || undefined;
  }

  async getCandidateByCandidateId(candidateId: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.candidateId, candidateId));
    return candidate || undefined;
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(insertCandidate.password, saltRounds);
    
    const candidateData = {
      ...insertCandidate,
      password: hashedPassword,
      isActive: true,
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    const [candidate] = await db.insert(candidates).values(candidateData).returning();
    return candidate;
  }

  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).where(eq(candidates.isActive, true)).orderBy(desc(candidates.createdAt));
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined> {
    // If password is being updated, hash it
    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }

    const [candidate] = await db
      .update(candidates)
      .set(updates)
      .where(eq(candidates.id, id))
      .returning();
    return candidate || undefined;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    // Soft delete by marking as inactive
    const result = await db
      .update(candidates)
      .set({ isActive: false })
      .where(eq(candidates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateNextCandidateId(): Promise<string> {
    // Get the highest candidate ID number
    const allCandidates = await db.select().from(candidates);
    const maxNumber = allCandidates
      .map(c => parseInt(c.candidateId.replace('STCA', '')))
      .filter(n => !isNaN(n))
      .reduce((max, current) => Math.max(max, current), 0);
    
    const nextNumber = maxNumber + 1;
    return `STCA${nextNumber.toString().padStart(3, '0')}`;
  }

  // Login attempt tracking methods
  async getLoginAttempts(email: string): Promise<CandidateLoginAttempts | undefined> {
    const [attempts] = await db.select().from(candidateLoginAttempts).where(eq(candidateLoginAttempts.email, email));
    return attempts || undefined;
  }

  async createOrUpdateLoginAttempts(insertAttempts: InsertCandidateLoginAttempts): Promise<CandidateLoginAttempts> {
    const existing = await this.getLoginAttempts(insertAttempts.email);
    
    if (existing) {
      const [updated] = await db
        .update(candidateLoginAttempts)
        .set({
          attempts: insertAttempts.attempts,
          lastAttemptAt: insertAttempts.lastAttemptAt,
          lockedUntil: insertAttempts.lockedUntil
        })
        .where(eq(candidateLoginAttempts.email, insertAttempts.email))
        .returning();
      return updated;
    } else {
      const attemptData = {
        ...insertAttempts,
        createdAt: new Date().toISOString()
      };
      const [created] = await db.insert(candidateLoginAttempts).values(attemptData).returning();
      return created;
    }
  }

  async resetLoginAttempts(email: string): Promise<boolean> {
    const result = await db
      .update(candidateLoginAttempts)
      .set({
        attempts: "0",
        lastAttemptAt: null,
        lockedUntil: null
      })
      .where(eq(candidateLoginAttempts.email, email));
    return (result.rowCount ?? 0) > 0;
  }

  // OTP storage methods (keeping in-memory for security and temporary nature)
  async storeOTP(email: string, otp: string): Promise<void> {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes expiry
    this.otpStorage.set(email, { otp, expiry, email });
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const stored = this.otpStorage.get(email);
    if (!stored) return false;
    
    if (new Date() > stored.expiry) {
      this.otpStorage.delete(email);
      return false;
    }
    
    if (stored.otp === otp) {
      this.otpStorage.delete(email);
      return true;
    }
    
    return false;
  }

  async updateEmployeePassword(email: string, newPasswordHash: string): Promise<boolean> {
    const result = await db
      .update(employees)
      .set({ password: newPasswordHash })
      .where(eq(employees.email, email));
    return (result.rowCount ?? 0) > 0;
  }

  async updateCandidatePassword(email: string, newPasswordHash: string): Promise<boolean> {
    const result = await db
      .update(candidates)
      .set({ password: newPasswordHash })
      .where(eq(candidates.email, email));
    return (result.rowCount ?? 0) > 0;
  }

  async getCandidateCounts(): Promise<{total: number, active: number, inactive: number}> {
    const allCandidates = await db.select().from(candidates);
    const total = allCandidates.length;
    const active = allCandidates.filter(c => c.isActive).length;
    const inactive = allCandidates.filter(c => !c.isActive).length;
    return { total, active, inactive };
  }

  async createBulkUploadJob(job: InsertBulkUploadJob): Promise<BulkUploadJob> {
    const [bulkJob] = await db.insert(bulkUploadJobs).values(job).returning();
    return bulkJob;
  }

  async getBulkUploadJob(jobId: string): Promise<BulkUploadJob | undefined> {
    const [job] = await db.select().from(bulkUploadJobs).where(eq(bulkUploadJobs.jobId, jobId));
    return job || undefined;
  }

  async updateBulkUploadJob(jobId: string, updates: Partial<BulkUploadJob>): Promise<BulkUploadJob | undefined> {
    const [job] = await db
      .update(bulkUploadJobs)
      .set(updates)
      .where(eq(bulkUploadJobs.jobId, jobId))
      .returning();
    return job || undefined;
  }

  async getAllBulkUploadJobs(): Promise<BulkUploadJob[]> {
    return await db.select().from(bulkUploadJobs).orderBy(desc(bulkUploadJobs.createdAt));
  }

  async createBulkUploadFile(file: InsertBulkUploadFile): Promise<BulkUploadFile> {
    const [uploadFile] = await db.insert(bulkUploadFiles).values(file).returning();
    return uploadFile;
  }

  async getBulkUploadFile(id: string): Promise<BulkUploadFile | undefined> {
    const [file] = await db.select().from(bulkUploadFiles).where(eq(bulkUploadFiles.id, id));
    return file || undefined;
  }

  async getBulkUploadFilesByJobId(jobId: string): Promise<BulkUploadFile[]> {
    return await db.select().from(bulkUploadFiles).where(eq(bulkUploadFiles.jobId, jobId));
  }

  async updateBulkUploadFile(id: string, updates: Partial<BulkUploadFile>): Promise<BulkUploadFile | undefined> {
    const [file] = await db
      .update(bulkUploadFiles)
      .set(updates)
      .where(eq(bulkUploadFiles.id, id))
      .returning();
    return file || undefined;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ status: "read", readAt: new Date().toISOString() })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Client methods
  async generateNextClientCode(): Promise<string> {
    const prefix = 'STCL';
    
    const allClients = await db.select().from(clients);
    const maxNumber = allClients
      .filter(c => c.clientCode.startsWith(prefix))
      .map(c => parseInt(c.clientCode.replace(prefix, '')))
      .filter(n => !isNaN(n))
      .reduce((max, current) => Math.max(max, current), 0);
    
    const nextNumber = maxNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClientByClientCode(clientCode: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.clientCode, clientCode));
    return client || undefined;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Impact Metrics methods
  async createImpactMetrics(metrics: InsertImpactMetrics): Promise<ImpactMetrics> {
    const [newMetrics] = await db.insert(impactMetrics).values(metrics).returning();
    return newMetrics;
  }

  async getImpactMetrics(clientId?: string): Promise<ImpactMetrics | undefined> {
    if (clientId) {
      const [metrics] = await db.select().from(impactMetrics).where(eq(impactMetrics.clientId, clientId));
      return metrics || undefined;
    } else {
      const [metrics] = await db.select().from(impactMetrics).limit(1);
      return metrics || undefined;
    }
  }

  async getAllImpactMetrics(): Promise<ImpactMetrics[]> {
    return await db.select().from(impactMetrics);
  }

  async updateImpactMetrics(id: string, updates: Partial<ImpactMetrics>): Promise<ImpactMetrics | undefined> {
    const [metrics] = await db
      .update(impactMetrics)
      .set(updates)
      .where(eq(impactMetrics.id, id))
      .returning();
    return metrics || undefined;
  }

  async deleteImpactMetrics(id: string): Promise<boolean> {
    const result = await db.delete(impactMetrics).where(eq(impactMetrics.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createTargetMapping(mapping: InsertTargetMappings): Promise<TargetMappings> {
    const [targetMapping] = await db.insert(targetMappings).values(mapping).returning();
    return targetMapping;
  }

  async getAllTargetMappings(): Promise<TargetMappings[]> {
    return await db.select().from(targetMappings).orderBy(desc(targetMappings.createdAt));
  }

  async getTeamLeaderTargetSummary(teamLeadId: string): Promise<{
    currentQuarter: {
      quarter: string;
      year: number;
      minimumTarget: number;
      targetAchieved: number;
      incentiveEarned: number;
      closures: number;
    };
    allQuarters: Array<{
      quarter: string;
      year: number;
      minimumTarget: number;
      targetAchieved: number;
      incentiveEarned: number;
      closures: number;
      status: string;
    }>;
  }> {
    // Fetch all target mappings for this team leader
    const mappings = await db
      .select()
      .from(targetMappings)
      .where(eq(targetMappings.teamLeadId, teamLeadId))
      .orderBy(desc(targetMappings.year), desc(targetMappings.quarter));

    // Determine current quarter based on current date
    // Quarter labels match the Admin Target Mapping UI: Q1, Q2, Q3, Q4
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    let currentQuarterLabel = "";
    
    if (month >= 0 && month <= 2) {
      currentQuarterLabel = "Q1"; // January-February-March
    } else if (month >= 3 && month <= 5) {
      currentQuarterLabel = "Q2"; // April-May-June
    } else if (month >= 6 && month <= 8) {
      currentQuarterLabel = "Q3"; // July-August-September
    } else {
      currentQuarterLabel = "Q4"; // October-November-December
    }

    // Group by quarter+year and aggregate
    const quarterMap = new Map<string, {
      quarter: string;
      year: number;
      minimumTarget: number;
      targetAchieved: number;
      incentiveEarned: number;
      closures: number;
    }>();

    for (const mapping of mappings) {
      const key = `${mapping.quarter}-${mapping.year}`;
      if (!quarterMap.has(key)) {
        quarterMap.set(key, {
          quarter: mapping.quarter,
          year: mapping.year,
          minimumTarget: 0,
          targetAchieved: 0,
          incentiveEarned: 0,
          closures: 0
        });
      }
      const entry = quarterMap.get(key)!;
      entry.minimumTarget += mapping.minimumTarget;
      entry.targetAchieved += mapping.targetAchieved || 0;
      entry.incentiveEarned += mapping.incentives || 0;
      entry.closures += mapping.closures || 0;
    }

    // Find current quarter data
    const currentKey = `${currentQuarterLabel}-${year}`;
    const currentQuarter = quarterMap.get(currentKey) || {
      quarter: currentQuarterLabel,
      year: year,
      minimumTarget: 0,
      targetAchieved: 0,
      incentiveEarned: 0,
      closures: 0
    };

    // Build allQuarters array with status
    const allQuarters = Array.from(quarterMap.values()).map(q => {
      let status = "Pending";
      if (q.targetAchieved >= q.minimumTarget && q.minimumTarget > 0) {
        status = "Completed";
      } else if (q.targetAchieved > 0 && q.targetAchieved < q.minimumTarget) {
        status = "In Progress";
      } else if (`${q.quarter}-${q.year}` === currentKey && q.minimumTarget > 0) {
        status = "In Progress";
      }
      
      return {
        ...q,
        status
      };
    });

    return {
      currentQuarter,
      allQuarters
    };
  }

  async getRecruiterTargetSummary(recruiterId: string): Promise<{
    currentQuarter: {
      quarter: string;
      year: number;
      minimumTarget: number;
      targetAchieved: number;
      incentiveEarned: number;
      closures: number;
    };
    allQuarters: Array<{
      quarter: string;
      year: number;
      minimumTarget: number;
      targetAchieved: number;
      incentiveEarned: number;
      closures: number;
      status: string;
    }>;
  }> {
    const mappings = await db
      .select()
      .from(targetMappings)
      .where(eq(targetMappings.teamMemberId, recruiterId))
      .orderBy(desc(targetMappings.year), desc(targetMappings.quarter));

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let currentQuarterLabel = "";
    
    // Quarter labels match the Admin Target Mapping UI: Q1, Q2, Q3, Q4
    if (month >= 0 && month <= 2) {
      currentQuarterLabel = "Q1"; // January-February-March
    } else if (month >= 3 && month <= 5) {
      currentQuarterLabel = "Q2"; // April-May-June
    } else if (month >= 6 && month <= 8) {
      currentQuarterLabel = "Q3"; // July-August-September
    } else {
      currentQuarterLabel = "Q4"; // October-November-December
    }

    const quarterMap = new Map<string, {
      quarter: string;
      year: number;
      minimumTarget: number;
      targetAchieved: number;
      incentiveEarned: number;
      closures: number;
    }>();

    for (const mapping of mappings) {
      const key = `${mapping.quarter}-${mapping.year}`;
      if (!quarterMap.has(key)) {
        quarterMap.set(key, {
          quarter: mapping.quarter,
          year: mapping.year,
          minimumTarget: 0,
          targetAchieved: 0,
          incentiveEarned: 0,
          closures: 0
        });
      }
      const entry = quarterMap.get(key)!;
      entry.minimumTarget += mapping.minimumTarget;
      entry.targetAchieved += mapping.targetAchieved || 0;
      entry.incentiveEarned += mapping.incentives || 0;
      entry.closures += mapping.closures || 0;
    }

    const currentKey = `${currentQuarterLabel}-${year}`;
    const currentQuarter = quarterMap.get(currentKey) || {
      quarter: currentQuarterLabel,
      year: year,
      minimumTarget: 0,
      targetAchieved: 0,
      incentiveEarned: 0,
      closures: 0
    };

    const allQuarters = Array.from(quarterMap.values()).map(q => {
      let status = "Pending";
      if (q.targetAchieved >= q.minimumTarget && q.minimumTarget > 0) {
        status = "Completed";
      } else if (q.targetAchieved > 0 && q.targetAchieved < q.minimumTarget) {
        status = "In Progress";
      } else if (`${q.quarter}-${q.year}` === currentKey && q.minimumTarget > 0) {
        status = "In Progress";
      }
      
      return {
        ...q,
        status
      };
    });

    return {
      currentQuarter,
      allQuarters
    };
  }

  async createRevenueMapping(mapping: InsertRevenueMapping): Promise<RevenueMapping> {
    const [revenueMapping] = await db.insert(revenueMappings).values(mapping).returning();
    return revenueMapping;
  }

  async getAllRevenueMappings(): Promise<RevenueMapping[]> {
    return await db.select().from(revenueMappings).orderBy(desc(revenueMappings.createdAt));
  }

  async getRevenueMappingById(id: string): Promise<RevenueMapping | undefined> {
    const [mapping] = await db.select().from(revenueMappings).where(eq(revenueMappings.id, id));
    return mapping || undefined;
  }

  async updateRevenueMapping(id: string, updates: Partial<RevenueMapping>): Promise<RevenueMapping | undefined> {
    const [mapping] = await db
      .update(revenueMappings)
      .set(updates)
      .where(eq(revenueMappings.id, id))
      .returning();
    return mapping || undefined;
  }

  async deleteRevenueMapping(id: string): Promise<boolean> {
    const result = await db.delete(revenueMappings).where(eq(revenueMappings.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  // Recruiter Jobs methods
  async createRecruiterJob(job: InsertRecruiterJob): Promise<RecruiterJob> {
    const [recruiterJob] = await db.insert(recruiterJobs).values(job).returning();
    return recruiterJob;
  }

  async getAllRecruiterJobs(): Promise<RecruiterJob[]> {
    return await db.select().from(recruiterJobs).orderBy(desc(recruiterJobs.postedDate));
  }

  async getRecruiterJobsByRecruiterId(recruiterId: string): Promise<RecruiterJob[]> {
    return await db.select().from(recruiterJobs)
      .where(eq(recruiterJobs.recruiterId, recruiterId))
      .orderBy(desc(recruiterJobs.postedDate));
  }

  async getRecruiterJobById(id: string): Promise<RecruiterJob | undefined> {
    const [job] = await db.select().from(recruiterJobs).where(eq(recruiterJobs.id, id));
    return job || undefined;
  }

  async updateRecruiterJob(id: string, updates: Partial<RecruiterJob>): Promise<RecruiterJob | undefined> {
    const [job] = await db
      .update(recruiterJobs)
      .set(updates)
      .where(eq(recruiterJobs.id, id))
      .returning();
    return job || undefined;
  }

  async deleteRecruiterJob(id: string): Promise<boolean> {
    const result = await db.delete(recruiterJobs).where(eq(recruiterJobs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getRecruiterJobCounts(): Promise<{total: number, active: number, closed: number, draft: number}> {
    const allJobs = await db.select().from(recruiterJobs);
    const total = allJobs.length;
    const active = allJobs.filter(j => j.status === 'Active').length;
    const closed = allJobs.filter(j => j.status === 'Closed').length;
    const draft = allJobs.filter(j => j.status === 'Draft').length;
    return { total, active, closed, draft };
  }

  // Applicant methods (for job applications from job board and recruiter tags)
  async getAllJobApplications(): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).orderBy(desc(jobApplications.appliedDate));
  }

  async getJobApplicationsByRecruiterJobId(recruiterJobId: string): Promise<JobApplication[]> {
    return await db.select().from(jobApplications)
      .where(eq(jobApplications.recruiterJobId, recruiterJobId))
      .orderBy(desc(jobApplications.appliedDate));
  }

  async getJobApplicationsByRequirementId(requirementId: string): Promise<JobApplication[]> {
    return await db.select().from(jobApplications)
      .where(eq(jobApplications.requirementId, requirementId))
      .orderBy(desc(jobApplications.appliedDate));
  }

  async createRecruiterJobApplication(application: InsertJobApplication & { profileId: string }): Promise<JobApplication> {
    const [jobApplication] = await db.insert(jobApplications).values(application).returning();
    return jobApplication;
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined> {
    const [application] = await db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, id))
      .returning();
    return application || undefined;
  }

  async getRequirementsByTeamLead(teamLeadName: string): Promise<Requirement[]> {
    return await db.select().from(requirements)
      .where(eq(requirements.teamLead, teamLeadName))
      .orderBy(desc(requirements.createdAt));
  }

  // Recruiter Commands methods
  async createRecruiterCommand(command: InsertRecruiterCommand): Promise<RecruiterCommand> {
    const [recruiterCommand] = await db.insert(recruiterCommands).values({
      ...command,
      createdAt: new Date().toISOString()
    }).returning();
    return recruiterCommand;
  }

  async getRecruiterCommandsByRecruiterId(recruiterId: string): Promise<RecruiterCommand[]> {
    return await db.select().from(recruiterCommands)
      .where(eq(recruiterCommands.recruiterId, recruiterId))
      .orderBy(desc(recruiterCommands.createdAt));
  }

  async getAllRecruiterCommands(): Promise<RecruiterCommand[]> {
    return await db.select().from(recruiterCommands)
      .orderBy(desc(recruiterCommands.createdAt));
  }

  async updateRecruiterCommand(id: string, updates: Partial<RecruiterCommand>): Promise<RecruiterCommand | undefined> {
    const [command] = await db
      .update(recruiterCommands)
      .set(updates)
      .where(eq(recruiterCommands.id, id))
      .returning();
    return command || undefined;
  }

  async deleteRecruiterCommand(id: string): Promise<boolean> {
    const result = await db.delete(recruiterCommands).where(eq(recruiterCommands.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Recruiter Meetings methods (fetch meetings assigned to a specific recruiter by personId)
  async getMeetingsByRecruiterId(recruiterId: string): Promise<Meeting[]> {
    return await db.select().from(meetings)
      .where(eq(meetings.personId, recruiterId))
      .orderBy(desc(meetings.createdAt));
  }

  async getMeetingsByRecruiterName(recruiterName: string): Promise<Meeting[]> {
    return await db.select().from(meetings)
      .where(eq(meetings.person, recruiterName))
      .orderBy(desc(meetings.createdAt));
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return await db.select().from(meetings)
      .orderBy(desc(meetings.createdAt));
  }
}