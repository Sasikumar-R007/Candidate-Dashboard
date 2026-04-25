import fs from 'fs';
import path from 'path';

function updateFile(filePath: string, replacements: { target: string, replacement: string }[]) {
  const absolutePath = path.resolve(filePath);
  let content = fs.readFileSync(absolutePath, 'utf-8');
  replacements.forEach(({ target, replacement }) => {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
    } else {
      console.warn(`Target not found in ${filePath}: ${target.substring(0, 50)}...`);
    }
  });
  fs.writeFileSync(absolutePath, content);
  console.log(`Updated ${filePath}`);
}

// 1. Update database-storage.ts
updateFile('server/database-storage.ts', [
  {
    target: '  type ResumeSubmission,\n  type InsertResumeSubmission,\n  users,',
    replacement: '  type ResumeSubmission,\n  type InsertResumeSubmission,\n  type UserActivity,\n  type InsertUserActivity,\n  users,'
  },
  {
    target: '  jobApplications, \n  savedJobs,',
    replacement: '  jobApplications, \n  savedJobs,\n  userActivities,'
  },
  {
    target: '  async deleteInterview(id: string): Promise<boolean> {\n    const result = await db.delete(interviewTracker)\n      .where(eq(interviewTracker.id, id));\n    return result.rowCount !== undefined && result.rowCount > 0;\n  }\n}',
    replacement: `  async deleteInterview(id: string): Promise<boolean> {
    const result = await db.delete(interviewTracker)
      .where(eq(interviewTracker.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async getUserActivities(role: string, limit: number = 5): Promise<UserActivity[]> {
    return await db.select()
      .from(userActivities)
      .where(sql\`LOWER(\${userActivities.targetRole}) LIKE LOWER(\${'%' + role + '%'})\`)
      .orderBy(desc(userActivities.createdAt))
      .limit(limit);
  }

  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [newActivity] = await db.insert(userActivities).values(activity).returning();
    return newActivity;
  }
}`
  }
]);

// 2. Update storage.ts
updateFile('server/storage.ts', [
  {
    target: '  getAllInterviews(): Promise<InterviewTracker[]>;\n}',
    replacement: '  getAllInterviews(): Promise<InterviewTracker[]>;\n\n  // User activities methods\n  getUserActivities(role: string, limit?: number): Promise<UserActivity[]>;\n  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;\n}'
  },
  {
    target: '  async calculateOrgDailyMetrics(date: string): Promise<{ delivered: number; defaulted: number; required: number; requirementCount: number }> {\n    const recruiters = Array.from(this.employees.values())\n      .filter(e => e.role === "recruiter" || e.role === "team_leader");\n    \n    let totalDelivered = 0;\n    let totalRequired = 0;\n    let totalRequirements = 0;\n    \n    for (const recruiter of recruiters) {\n      const metrics = await this.calculateRecruiterDailyMetrics(recruiter.id, date);\n      totalDelivered += metrics.delivered;\n      totalRequired += metrics.required;\n      totalRequirements += metrics.requirementCount;\n    }\n    \n    const totalDefaulted = Math.max(0, totalRequired - totalDelivered);\n    \n    return { delivered: totalDelivered, defaulted: totalDefaulted, required: totalRequired, requirementCount: totalRequirements };\n  }\n}',
    replacement: `  async calculateOrgDailyMetrics(date: string): Promise<{ delivered: number; defaulted: number; required: number; requirementCount: number }> {
    const recruiters = Array.from(this.employees.values())
      .filter(e => e.role === "recruiter" || e.role === "team_leader");
    
    let totalDelivered = 0;
    let totalRequired = 0;
    let totalRequirements = 0;
    
    for (const recruiter of recruiters) {
      const metrics = await this.calculateRecruiterDailyMetrics(recruiter.id, date);
      totalDelivered += metrics.delivered;
      totalRequired += metrics.required;
      totalRequirements += metrics.requirementCount;
    }
    
    const totalDefaulted = Math.max(0, totalRequired - totalDelivered);
    
    return { delivered: totalDelivered, defaulted: totalDefaulted, required: totalRequired, requirementCount: totalRequirements };
  }

  async getUserActivities(role: string, limit: number = 5): Promise<UserActivity[]> {
    return Array.from(this.userActivities.values())
      .filter(a => a.targetRole.toLowerCase().includes(role.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const id = randomUUID();
    const newActivity: UserActivity = { ...activity, id };
    this.userActivities.set(id, newActivity);
    return newActivity;
  }
}`
  }
]);
