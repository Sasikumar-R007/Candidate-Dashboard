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
  type InsertJobApplication
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private jobPreferences: Map<string, JobPreferences>;
  private skills: Map<string, Skill>;
  private activities: Map<string, Activity>;
  private jobApplications: Map<string, JobApplication>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.jobPreferences = new Map();
    this.skills = new Map();
    this.activities = new Map();
    this.jobApplications = new Map();
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
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
      appliedJobsCount: "12"
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
      appliedJobsCount: insertProfile.appliedJobsCount || null
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
}

export const storage = new MemStorage();
