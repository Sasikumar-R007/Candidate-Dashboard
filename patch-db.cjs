const fs = require('fs');
let content = fs.readFileSync('server/database-storage.ts', 'utf8');

// Add the method to IStorage interface
content = content.replace(
  "updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined>;",
  "updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined>;\n  updateJobApplicationWithdrawReason(id: string, reason: string): Promise<JobApplication | undefined>;"
);

// Add the implementation to DatabaseStorage class
const dbStorageMethod = `  async updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined> {
    const [application] = await db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, id))
      .returning();
    return application;
  }`;

const newDbStorageMethod = `  async updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined> {
    const [application] = await db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, id))
      .returning();
    return application;
  }

  async updateJobApplicationWithdrawReason(id: string, reason: string): Promise<JobApplication | undefined> {
    const [application] = await db
      .update(jobApplications)
      .set({ withdrawReason: reason })
      .where(eq(jobApplications.id, id))
      .returning();
    return application;
  }`;

content = content.replace(dbStorageMethod, newDbStorageMethod);

fs.writeFileSync('server/database-storage.ts', content);
console.log("Patched server/database-storage.ts successfully.");
