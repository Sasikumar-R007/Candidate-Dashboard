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
  type InsertNotification
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
// import { DatabaseStorage } from "./database-storage"; // Commented out since we're using MemStorage

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile | undefined>;
  
  getJobPreferences(profileId: string): Promise<JobPreferences | undefined>;
  createJobPreferences(preferences: InsertJobPreferences): Promise<JobPreferences>;
  updateJobPreferences(profileId: string, preferences: Partial<JobPreferences>): Promise<JobPreferences | undefined>;
  
  getSkillsByProfile(profileId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkillsByProfile(profileId: string, skills: InsertSkill[]): Promise<Skill[]>;
  
  getActivitiesByProfile(profileId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  getJobApplicationsByProfile(profileId: string): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  
  getSavedJobsByProfile(profileId: string): Promise<SavedJob[]>;
  createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob>;
  removeSavedJob(profileId: string, jobTitle: string, company: string): Promise<boolean>;
  
  // Requirements methods
  getRequirements(): Promise<Requirement[]>;
  createRequirement(requirement: InsertRequirement): Promise<Requirement>;
  updateRequirement(id: string, updates: Partial<Requirement>): Promise<Requirement | undefined>;
  archiveRequirement(id: string): Promise<ArchivedRequirement | undefined>;
  getArchivedRequirements(): Promise<ArchivedRequirement[]>;
  
  // Employee methods
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getAllEmployees(): Promise<Employee[]>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;
  updateEmployeePassword(email: string, newPasswordHash: string): Promise<boolean>;
  
  // Candidate methods
  getCandidateByEmail(email: string): Promise<Candidate | undefined>;
  getCandidateByCandidateId(candidateId: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  getAllCandidates(): Promise<Candidate[]>;
  updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;
  generateNextCandidateId(): Promise<string>;
  updateCandidatePassword(email: string, newPasswordHash: string): Promise<boolean>;
  
  // Login attempt tracking methods
  getLoginAttempts(email: string): Promise<CandidateLoginAttempts | undefined>;
  createOrUpdateLoginAttempts(attempts: InsertCandidateLoginAttempts): Promise<CandidateLoginAttempts>;
  resetLoginAttempts(email: string): Promise<boolean>;
  
  // OTP storage methods
  storeOTP(email: string, otp: string): Promise<void>;
  verifyOTP(email: string, otp: string): Promise<boolean>;

  // Bulk upload methods
  createBulkUploadJob(job: InsertBulkUploadJob): Promise<BulkUploadJob>;
  getBulkUploadJob(jobId: string): Promise<BulkUploadJob | undefined>;
  updateBulkUploadJob(jobId: string, updates: Partial<BulkUploadJob>): Promise<BulkUploadJob | undefined>;
  getAllBulkUploadJobs(): Promise<BulkUploadJob[]>;

  createBulkUploadFile(file: InsertBulkUploadFile): Promise<BulkUploadFile>;
  getBulkUploadFile(id: string): Promise<BulkUploadFile | undefined>;
  getBulkUploadFilesByJobId(jobId: string): Promise<BulkUploadFile[]>;
  updateBulkUploadFile(id: string, updates: Partial<BulkUploadFile>): Promise<BulkUploadFile | undefined>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  deleteNotification(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private jobPreferences: Map<string, JobPreferences>;
  private skills: Map<string, Skill>;
  private activities: Map<string, Activity>;
  private jobApplications: Map<string, JobApplication>;
  private savedJobs: Map<string, SavedJob>;
  private requirements: Map<string, Requirement>;
  private archivedRequirements: Map<string, ArchivedRequirement>;
  private employees: Map<string, Employee>;
  private candidates: Map<string, Candidate>;
  private candidateLoginAttempts: Map<string, CandidateLoginAttempts>;
  private otpStorage: Map<string, { otp: string; expiry: Date; email: string }>;
  private bulkUploadJobs: Map<string, BulkUploadJob>;
  private bulkUploadFiles: Map<string, BulkUploadFile>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.jobPreferences = new Map();
    this.skills = new Map();
    this.activities = new Map();
    this.jobApplications = new Map();
    this.savedJobs = new Map();
    this.requirements = new Map();
    this.archivedRequirements = new Map();
    this.employees = new Map();
    this.candidates = new Map();
    this.candidateLoginAttempts = new Map();
    this.otpStorage = new Map();
    this.bulkUploadJobs = new Map();
    this.bulkUploadFiles = new Map();
    this.notifications = new Map();
    
    // Initialize with sample data (async)
    this.initSampleData().catch(console.error);
  }

  private async initSampleData() {
    const userId = randomUUID();
    const user: User = {
      id: userId,
      username: "mathew.anderson",
      password: "password123"
    };
    this.users.set(userId, user);

    const profileId = randomUUID();
    const profile: Profile = {
      id: profileId,
      userId: userId,
      firstName: "Mathew",
      lastName: "Anderson",
      email: "mathew.and@gmail.com",
      phone: "90347 59099",
      title: "Cloud Engineer",
      location: "Chennai",
      education: "Indian Institute of Science (IISc) in Bangalore",
      portfolio: "https://www.yourwork.com",
      mobile: "90347 59099",
      whatsapp: "90347 59099",
      primaryEmail: "anderson123@gmail.com",
      secondaryEmail: "mathew.and@gmail.com",
      currentLocation: "Chennai",
      preferredLocation: "Bengaluru",
      dateOfBirth: "8-May-2000",
      portfolioUrl: "https://www.yourwork.com",
      websiteUrl: "https://www.mynetwork.com",
      linkedinUrl: "https://www.linkedin.com/in/Mathew Anderson",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      bannerImage: null,
      appliedJobsCount: "12",
      resumeFile: null,
      // Education fields
      highestQualification: "Master's Degree",
      collegeName: "Indian Institute of Science (IISc)",
      skills: "Cloud Architecture, DevOps, AWS, Docker, Kubernetes",
      // Job details fields
      pedigreeLevel: "Tier 1",
      noticePeriod: "30 days",
      currentCompany: "TechCorp Solutions",
      currentRole: "Senior Cloud Engineer",
      currentDomain: "Cloud Infrastructure",
      companyLevel: "Mid-size",
      productService: "Cloud Services"
    };
    this.profiles.set(userId, profile);

    const preferences: JobPreferences = {
      id: randomUUID(),
      profileId: profileId,
      jobTitles: "Frontend Developer, Senior Frontend developer, User Interface Engineer and UI Developer",
      workMode: "On-site • Hybrid • Remote",
      employmentType: "Full-time",
      locations: "Delhi,India - Guruguram,Haryana,India - Noida ,Uttar Prakash,India",
      startDate: "Immediately, I am actively applying",
      instructions: "Don't call me post 6 PM and Weekends\nIf i don't pick the call message me in WhatsApp"
    };
    this.jobPreferences.set(profileId, preferences);

    // Sample skills
    const primarySkills = [
      "Business Development", "International Sales", "Marketing Analysis", 
      "Digital Marketing", "Lead Generation", "SEO"
    ];
    const secondarySkills = [
      "Corporate Sales", "Customer Service", "Resource Manager", 
      "Direct sales", "Customer Interaction"
    ];
    const knowledgeSkills = [
      "Telecalling", "Sales requirement", "ILETS English communication"
    ];

    [...primarySkills, ...secondarySkills, ...knowledgeSkills].forEach((skillName, index) => {
      const skill: Skill = {
        id: randomUUID(),
        profileId: profileId,
        name: skillName,
        category: primarySkills.includes(skillName) ? "primary" : 
                 secondarySkills.includes(skillName) ? "secondary" : "knowledge"
      };
      this.skills.set(skill.id, skill);
    });

    // Sample activities
    const activities = [
      { type: "resume_update", description: "Resume Updated", date: "12-03-2025" },
      { type: "job_applied", description: "Last Job Applied", date: "12-03-2025" }
    ];

    activities.forEach(activity => {
      const act: Activity = {
        id: randomUUID(),
        profileId: profileId,
        type: activity.type,
        description: activity.description,
        date: activity.date
      };
      this.activities.set(act.id, act);
    });

    // Sample job applications
    const applications = [
      { jobTitle: "UX Designer", company: "Micro soft", jobType: "Internship", daysAgo: "2 days" },
      { jobTitle: "Software Designer", company: "Zoho", jobType: "Full-Time", daysAgo: "31 days" },
      { jobTitle: "UX testing", company: "Google", jobType: "Part-Time", daysAgo: "33 days" },
      { jobTitle: "Software Designer", company: "Unity", jobType: "Full-Time", daysAgo: "40 days" },
      { jobTitle: "Software Designer", company: "Zoho", jobType: "Internship", daysAgo: "38 days" }
    ];

    applications.forEach(app => {
      const application: JobApplication = {
        id: randomUUID(),
        profileId: profileId,
        jobTitle: app.jobTitle,
        company: app.company,
        jobType: app.jobType,
        appliedDate: "12-03-2025",
        daysAgo: app.daysAgo
      };
      this.jobApplications.set(application.id, application);
    });

    // Sample requirements data
    const sampleRequirements = [
      { position: "Mobile App Developer", criticality: "HIGH", company: "Tesco", spoc: "Mel Gibson", talentAdvisor: "Mel Gibson", teamLead: "Arun" },
      { position: "Backend Developer", criticality: "LOW", company: "CodeLabs", spoc: "Robert Kim", talentAdvisor: "Robert Kim", teamLead: "Arun" },
      { position: "Frontend Developer", criticality: "MEDIUM", company: "TechCorp", spoc: "David Wilson", talentAdvisor: "Unassigned", teamLead: "Arun" },
      { position: "QA Tester", criticality: "HIGH", company: "AppLogic", spoc: "Kevin Brown", talentAdvisor: "Unassigned", teamLead: "Unassigned" },
      { position: "Mobile App Developer", criticality: "MEDIUM", company: "Tesco", spoc: "Mel Gibson", talentAdvisor: "Mel Gibson", teamLead: "Arun" },
      { position: "Backend Developer", criticality: "LOW", company: "CodeLabs", spoc: "Robert Kim", talentAdvisor: "Robert Kim", teamLead: "Arun" },
      { position: "UI/UX Designer", criticality: "MEDIUM", company: "Designify", spoc: "Tom Anderson", talentAdvisor: "Unassigned", teamLead: "Anusha" },
      { position: "Frontend Developer", criticality: "HIGH", company: "TechCorp", spoc: "David Wilson", talentAdvisor: "Unassigned", teamLead: "Arun" },
      { position: "UI/UX Designer", criticality: "MEDIUM", company: "Designify", spoc: "Tom Anderson", talentAdvisor: "Unassigned", teamLead: "Anusha" },
      { position: "QA Tester", criticality: "MEDIUM", company: "AppLogic", spoc: "Kevin Brown", talentAdvisor: "Unassigned", teamLead: "Unassigned" }
    ];

    sampleRequirements.forEach(req => {
      const requirement: Requirement = {
        id: randomUUID(),
        position: req.position,
        criticality: req.criticality,
        company: req.company,
        spoc: req.spoc,
        talentAdvisor: req.talentAdvisor,
        teamLead: req.teamLead,
        isArchived: false,
        createdAt: new Date().toISOString()
      };
      this.requirements.set(requirement.id, requirement);
    });

    // Sample employee data
    const sampleEmployees = [
      {
        employeeId: "STTA001",
        name: "Ram Kumar",
        email: "ram@gmail.com", 
        password: "ram123",
        role: "recruiter",
        age: "28",
        phone: "9876543210",
        department: "Talent Acquisition",
        joiningDate: "2024-01-15",
        reportingTo: "Team Lead"
      },
      {
        employeeId: "STTL001",
        name: "Priya Sharma",
        email: "priya@gmail.com",
        password: "priya123", 
        role: "team_leader",
        age: "32",
        phone: "9876543211",
        department: "Talent Acquisition",
        joiningDate: "2023-06-10",
        reportingTo: "Admin"
      },
      {
        employeeId: "STCL001",
        name: "Arjun Patel",
        email: "arjun@gmail.com",
        password: "arjun123",
        role: "client",
        age: "35", 
        phone: "9876543212",
        department: "Client Relations",
        joiningDate: "2023-03-20",
        reportingTo: "Admin"
      },
      {
        employeeId: "ADMIN",
        name: "Admin User",
        email: "admin@gmail.com",
        password: "admin123",
        role: "admin",
        age: "40",
        phone: "9876543213", 
        department: "Administration",
        joiningDate: "2022-01-01",
        reportingTo: "CEO"
      }
    ];

    // Hash passwords and create sample employees
    const saltRounds = 10;
    for (const emp of sampleEmployees) {
      const hashedPassword = await bcrypt.hash(emp.password, saltRounds);
      const employee: Employee = {
        id: randomUUID(),
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        password: hashedPassword, // Store hashed password
        role: emp.role,
        age: emp.age,
        phone: emp.phone,
        department: emp.department,
        joiningDate: emp.joiningDate,
        reportingTo: emp.reportingTo,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      this.employees.set(employee.id, employee);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(profile => profile.userId === userId);
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = { 
      ...insertProfile, 
      id,
      education: insertProfile.education || null,
      portfolio: insertProfile.portfolio || null,
      mobile: insertProfile.mobile || null,
      whatsapp: insertProfile.whatsapp || null,
      primaryEmail: insertProfile.primaryEmail || null,
      secondaryEmail: insertProfile.secondaryEmail || null,
      currentLocation: insertProfile.currentLocation || null,
      preferredLocation: insertProfile.preferredLocation || null,
      dateOfBirth: insertProfile.dateOfBirth || null,
      portfolioUrl: insertProfile.portfolioUrl || null,
      websiteUrl: insertProfile.websiteUrl || null,
      linkedinUrl: insertProfile.linkedinUrl || null,
      profilePicture: insertProfile.profilePicture || null,
      bannerImage: insertProfile.bannerImage || null,
      appliedJobsCount: insertProfile.appliedJobsCount || null,
      resumeFile: insertProfile.resumeFile || null,
      // Education fields
      highestQualification: insertProfile.highestQualification || null,
      collegeName: insertProfile.collegeName || null,
      skills: insertProfile.skills || null,
      // Job details fields
      pedigreeLevel: insertProfile.pedigreeLevel || null,
      noticePeriod: insertProfile.noticePeriod || null,
      currentCompany: insertProfile.currentCompany || null,
      currentRole: insertProfile.currentRole || null,
      currentDomain: insertProfile.currentDomain || null,
      companyLevel: insertProfile.companyLevel || null,
      productService: insertProfile.productService || null
    };
    this.profiles.set(profile.userId, profile);
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const profile = Array.from(this.profiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.profiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  async getJobPreferences(profileId: string): Promise<JobPreferences | undefined> {
    return this.jobPreferences.get(profileId);
  }

  async createJobPreferences(insertPreferences: InsertJobPreferences): Promise<JobPreferences> {
    const id = randomUUID();
    const preferences: JobPreferences = { 
      ...insertPreferences, 
      id,
      instructions: insertPreferences.instructions || null
    };
    this.jobPreferences.set(preferences.profileId, preferences);
    return preferences;
  }

  async updateJobPreferences(profileId: string, updates: Partial<JobPreferences>): Promise<JobPreferences | undefined> {
    const preferences = this.jobPreferences.get(profileId);
    if (!preferences) return undefined;
    
    const updatedPreferences = { ...preferences, ...updates };
    this.jobPreferences.set(profileId, updatedPreferences);
    return updatedPreferences;
  }

  async getSkillsByProfile(profileId: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.profileId === profileId);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = randomUUID();
    const skill: Skill = { ...insertSkill, id };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkillsByProfile(profileId: string, newSkills: InsertSkill[]): Promise<Skill[]> {
    // Remove existing skills for this profile
    const existingSkills = Array.from(this.skills.entries()).filter(([_, skill]) => skill.profileId === profileId);
    existingSkills.forEach(([id]) => this.skills.delete(id));
    
    // Add new skills
    const skills: Skill[] = [];
    for (const skillData of newSkills) {
      const skill = await this.createSkill(skillData);
      skills.push(skill);
    }
    return skills;
  }

  async getActivitiesByProfile(profileId: string): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(activity => activity.profileId === profileId);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }

  async getJobApplicationsByProfile(profileId: string): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values()).filter(app => app.profileId === profileId);
  }

  async createJobApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const id = randomUUID();
    const application: JobApplication = { ...insertApplication, id };
    this.jobApplications.set(id, application);
    return application;
  }

  async getSavedJobsByProfile(profileId: string): Promise<SavedJob[]> {
    return Array.from(this.savedJobs.values()).filter(
      job => job.profileId === profileId
    );
  }

  async createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob> {
    const id = randomUUID();
    const newSavedJob: SavedJob = {
      ...savedJob,
      id,
      salary: savedJob.salary || null,
    };
    this.savedJobs.set(id, newSavedJob);
    return newSavedJob;
  }

  async removeSavedJob(profileId: string, jobTitle: string, company: string): Promise<boolean> {
    const savedJobsArray = Array.from(this.savedJobs.entries());
    const jobToRemove = savedJobsArray.find(([, job]) => 
      job.profileId === profileId && 
      job.jobTitle === jobTitle && 
      job.company === company
    );
    
    if (jobToRemove) {
      this.savedJobs.delete(jobToRemove[0]);
      return true;
    }
    return false;
  }

  // Requirements methods implementation
  async getRequirements(): Promise<Requirement[]> {
    return Array.from(this.requirements.values()).filter(req => !req.isArchived);
  }

  async createRequirement(insertRequirement: InsertRequirement): Promise<Requirement> {
    const id = randomUUID();
    const requirement: Requirement = {
      ...insertRequirement,
      id,
      talentAdvisor: insertRequirement.talentAdvisor || null,
      teamLead: insertRequirement.teamLead || null,
      isArchived: false,
      createdAt: new Date().toISOString()
    };
    this.requirements.set(id, requirement);
    return requirement;
  }

  async updateRequirement(id: string, updates: Partial<Requirement>): Promise<Requirement | undefined> {
    const existing = this.requirements.get(id);
    if (!existing) return undefined;
    
    const updated: Requirement = { ...existing, ...updates };
    this.requirements.set(id, updated);
    return updated;
  }

  async archiveRequirement(id: string): Promise<ArchivedRequirement | undefined> {
    const requirement = this.requirements.get(id);
    if (!requirement) return undefined;

    // Create archived version
    const archivedId = randomUUID();
    const archived: ArchivedRequirement = {
      id: archivedId,
      position: requirement.position,
      criticality: requirement.criticality,
      company: requirement.company,
      spoc: requirement.spoc,
      talentAdvisor: requirement.talentAdvisor,
      teamLead: requirement.teamLead,
      archivedAt: new Date().toISOString(),
      originalId: requirement.id
    };

    this.archivedRequirements.set(archivedId, archived);
    
    // Mark original as archived
    const updated = { ...requirement, isArchived: true };
    this.requirements.set(id, updated);
    
    return archived;
  }

  async getArchivedRequirements(): Promise<ArchivedRequirement[]> {
    return Array.from(this.archivedRequirements.values());
  }

  // Employee methods implementation
  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.email === email);
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.employeeId === employeeId);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    
    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(insertEmployee.password, saltRounds);
    
    const employee: Employee = {
      ...insertEmployee,
      id,
      password: hashedPassword, // Store hashed password
      age: insertEmployee.age || null,
      phone: insertEmployee.phone || null,
      department: insertEmployee.department || null,
      joiningDate: insertEmployee.joiningDate || null,
      reportingTo: insertEmployee.reportingTo || null,
      isActive: insertEmployee.isActive ?? true,
      createdAt: new Date().toISOString()
    };
    this.employees.set(id, employee);
    return employee;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.isActive);
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    
    const updated: Employee = { ...existing, ...updates };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const employee = this.employees.get(id);
    if (!employee) return false;
    
    // Soft delete by setting isActive to false
    const updated = { ...employee, isActive: false };
    this.employees.set(id, updated);
    return true;
  }

  // Candidate methods using in-memory storage
  async getCandidateByEmail(email: string): Promise<Candidate | undefined> {
    const candidatesList = Array.from(this.candidates.values());
    for (const candidate of candidatesList) {
      if (candidate.email === email) {
        return candidate;
      }
    }
    return undefined;
  }

  async getCandidateByCandidateId(candidateId: string): Promise<Candidate | undefined> {
    const candidatesList = Array.from(this.candidates.values());
    for (const candidate of candidatesList) {
      if (candidate.candidateId === candidateId) {
        return candidate;
      }
    }
    return undefined;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const id = randomUUID();
    const candidateId = candidate.candidateId || await this.generateNextCandidateId();
    const hashedPassword = await bcrypt.hash(candidate.password, 10);
    
    const newCandidate: Candidate = {
      id,
      candidateId,
      fullName: candidate.fullName,
      email: candidate.email,
      password: hashedPassword,
      phone: candidate.phone || null,
      company: candidate.company || null,
      designation: candidate.designation || null,
      age: candidate.age || null,
      location: candidate.location || null,
      experience: candidate.experience || null,
      skills: candidate.skills || null,
      isActive: candidate.isActive ?? true,
      isVerified: candidate.isVerified ?? false,
      createdAt: candidate.createdAt || new Date().toISOString()
    };
    
    this.candidates.set(id, newCandidate);
    return newCandidate;
  }

  async getAllCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values()).filter(candidate => candidate.isActive);
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined> {
    const existing = this.candidates.get(id);
    if (!existing) return undefined;
    
    const updated: Candidate = { ...existing, ...updates };
    this.candidates.set(id, updated);
    return updated;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const candidate = this.candidates.get(id);
    if (!candidate) return false;
    
    // Soft delete by setting isActive to false
    const updated = { ...candidate, isActive: false };
    this.candidates.set(id, updated);
    return true;
  }

  async generateNextCandidateId(): Promise<string> {
    const allCandidates = Array.from(this.candidates.values());
    
    if (allCandidates.length === 0) {
      return "STCA001";
    }

    // Find the highest ID number
    let maxNumber = 0;
    for (const candidate of allCandidates) {
      const match = candidate.candidateId.match(/STCA(\d+)/);
      if (match) {
        const number = parseInt(match[1]);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }
    
    const nextNumber = maxNumber + 1;
    return `STCA${nextNumber.toString().padStart(3, '0')}`;
  }

  // Login attempt tracking methods using in-memory storage
  async getLoginAttempts(email: string): Promise<CandidateLoginAttempts | undefined> {
    return this.candidateLoginAttempts.get(email);
  }

  async createOrUpdateLoginAttempts(attempts: InsertCandidateLoginAttempts): Promise<CandidateLoginAttempts> {
    const existing = this.candidateLoginAttempts.get(attempts.email);
    
    if (existing) {
      // Update existing record
      const updated: CandidateLoginAttempts = {
        ...existing,
        attempts: attempts.attempts || existing.attempts,
        lastAttemptAt: attempts.lastAttemptAt || existing.lastAttemptAt,
        lockedUntil: attempts.lockedUntil || existing.lockedUntil
      };
      this.candidateLoginAttempts.set(attempts.email, updated);
      return updated;
    } else {
      // Create new record
      const id = randomUUID();
      const newRecord: CandidateLoginAttempts = {
        id,
        email: attempts.email,
        attempts: attempts.attempts || "0",
        lastAttemptAt: attempts.lastAttemptAt || null,
        lockedUntil: attempts.lockedUntil || null,
        createdAt: attempts.createdAt || new Date().toISOString()
      };
      this.candidateLoginAttempts.set(attempts.email, newRecord);
      return newRecord;
    }
  }

  async resetLoginAttempts(email: string): Promise<boolean> {
    const existing = this.candidateLoginAttempts.get(email);
    if (!existing) return false;
    
    const updated: CandidateLoginAttempts = {
      ...existing,
      attempts: "0",
      lastAttemptAt: null,
      lockedUntil: null
    };
    this.candidateLoginAttempts.set(email, updated);
    return true;
  }

  // OTP storage methods for verification
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
    // Find employee by email
    const employee = Array.from(this.employees.values()).find(emp => emp.email === email);
    if (!employee) return false;
    
    // Update password
    const updated: Employee = { ...employee, password: newPasswordHash };
    this.employees.set(employee.id, updated);
    return true;
  }

  async updateCandidatePassword(email: string, newPasswordHash: string): Promise<boolean> {
    // Find candidate by email
    const candidate = Array.from(this.candidates.values()).find(cand => cand.email === email);
    if (!candidate) return false;
    
    // Update password
    const updated: Candidate = { ...candidate, password: newPasswordHash };
    this.candidates.set(candidate.id, updated);
    return true;
  }

  // Bulk upload job methods
  async createBulkUploadJob(job: InsertBulkUploadJob): Promise<BulkUploadJob> {
    const id = randomUUID();
    const newJob: BulkUploadJob = {
      id,
      jobId: job.jobId,
      adminId: job.adminId,
      status: job.status || "processing",
      totalFiles: job.totalFiles,
      processedFiles: job.processedFiles || "0",
      successfulFiles: job.successfulFiles || "0",
      failedFiles: job.failedFiles || "0",
      errorReportUrl: job.errorReportUrl || null,
      createdAt: job.createdAt,
      completedAt: job.completedAt || null
    };
    this.bulkUploadJobs.set(job.jobId, newJob);
    return newJob;
  }

  async getBulkUploadJob(jobId: string): Promise<BulkUploadJob | undefined> {
    return this.bulkUploadJobs.get(jobId);
  }

  async updateBulkUploadJob(jobId: string, updates: Partial<BulkUploadJob>): Promise<BulkUploadJob | undefined> {
    const existing = this.bulkUploadJobs.get(jobId);
    if (!existing) return undefined;
    
    const updated: BulkUploadJob = { ...existing, ...updates };
    this.bulkUploadJobs.set(jobId, updated);
    return updated;
  }

  async getAllBulkUploadJobs(): Promise<BulkUploadJob[]> {
    return Array.from(this.bulkUploadJobs.values());
  }

  // Bulk upload file methods
  async createBulkUploadFile(file: InsertBulkUploadFile): Promise<BulkUploadFile> {
    const id = randomUUID();
    const newFile: BulkUploadFile = {
      id,
      jobId: file.jobId,
      fileName: file.fileName,
      originalName: file.originalName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      status: file.status || "pending",
      candidateId: file.candidateId || null,
      errorMessage: file.errorMessage || null,
      parsedText: file.parsedText || null,
      extractedName: file.extractedName || null,
      extractedEmail: file.extractedEmail || null,
      extractedPhone: file.extractedPhone || null,
      resumeUrl: file.resumeUrl || null,
      processedAt: file.processedAt || null
    };
    this.bulkUploadFiles.set(id, newFile);
    return newFile;
  }

  async getBulkUploadFile(id: string): Promise<BulkUploadFile | undefined> {
    return this.bulkUploadFiles.get(id);
  }

  async getBulkUploadFilesByJobId(jobId: string): Promise<BulkUploadFile[]> {
    return Array.from(this.bulkUploadFiles.values()).filter(file => file.jobId === jobId);
  }

  async updateBulkUploadFile(id: string, updates: Partial<BulkUploadFile>): Promise<BulkUploadFile | undefined> {
    const existing = this.bulkUploadFiles.get(id);
    if (!existing) return undefined;
    
    const updated: BulkUploadFile = { ...existing, ...updates };
    this.bulkUploadFiles.set(id, updated);
    return updated;
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      status: notification.status || "unread",
      relatedJobId: notification.relatedJobId || null,
      createdAt: notification.createdAt,
      readAt: notification.readAt || null
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => notification.userId === userId);
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const existing = this.notifications.get(id);
    if (!existing) return undefined;
    
    const updated: Notification = { ...existing, status: "read", readAt: new Date().toISOString() };
    this.notifications.set(id, updated);
    return updated;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }
}

// Note: DatabaseStorage is available but incomplete. 
// Using MemStorage for now as it has all required methods implemented.
// To switch to DatabaseStorage, complete the missing methods in database-storage.ts:
// - updateEmployeePassword, updateCandidatePassword
// - Bulk upload methods (createBulkUploadJob, etc.)
// - Notification methods (createNotification, etc.)
export const storage = new MemStorage();
