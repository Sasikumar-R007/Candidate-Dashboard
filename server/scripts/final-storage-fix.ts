import fs from 'fs';
import path from 'path';

const dbStoragePath = path.resolve('server/database-storage.ts');
let dbContent = fs.readFileSync(dbStoragePath, 'utf-8');

// Add imports to database-storage.ts
if (!dbContent.includes('userActivities,')) {
  dbContent = dbContent.replace(
    '  teamMembers,',
    '  teamMembers,\n  userActivities,'
  );
  dbContent = dbContent.replace(
    '  type ResumeSubmission,',
    '  type ResumeSubmission,\n  type UserActivity,\n  type InsertUserActivity,'
  );
}

// Add methods to DatabaseStorage class
if (!dbContent.includes('async getUserActivities')) {
  const lastBraceIndex = dbContent.lastIndexOf('}');
  dbContent = dbContent.substring(0, lastBraceIndex) + 
`  async getUserActivities(role: string, limit: number = 5): Promise<UserActivity[]> {
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
` + dbContent.substring(lastBraceIndex);
}

fs.writeFileSync(dbStoragePath, dbContent);

const storagePath = path.resolve('server/storage.ts');
let sContent = fs.readFileSync(storagePath, 'utf-8');

// Add to IStorage interface
if (!sContent.includes('getUserActivities(role: string')) {
  sContent = sContent.replace(
    '  getAllInterviews(): Promise<InterviewTracker[]>;',
    '  getAllInterviews(): Promise<InterviewTracker[]>;\n  getUserActivities(role: string, limit?: number): Promise<UserActivity[]>;\n  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;'
  );
}

// Add to MemStorage class
if (!sContent.includes('async getUserActivities')) {
  // Find where calculateOrgDailyMetrics ends - it's the last method before the closing brace of MemStorage
  const classEndIndex = sContent.lastIndexOf('export const storage = new DatabaseStorage();');
  const classBraceIndex = sContent.lastIndexOf('}', classEndIndex - 1);
  
  sContent = sContent.substring(0, classBraceIndex) + 
`  async getUserActivities(role: string, limit: number = 5): Promise<UserActivity[]> {
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
` + sContent.substring(classBraceIndex);
}

fs.writeFileSync(storagePath, sContent);
console.log('Final storage fixes applied');
