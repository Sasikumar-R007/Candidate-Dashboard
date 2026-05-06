const fs = require('fs');

let dbStorageContent = fs.readFileSync('server/database-storage.ts', 'utf8');

const target1 = `  async getActiveNudges(): Promise<Nudge[]> {
    return await db.select().from(nudges).where(eq(nudges.isResponded, false));
  }`;

const replace1 = `  async getActiveNudges(): Promise<Nudge[]> {
    return await db.select().from(nudges).orderBy(desc(nudges.createdAt));
  }`;

if (dbStorageContent.includes(target1)) {
    dbStorageContent = dbStorageContent.replace(target1, replace1);
    
    // Make sure 'desc' is imported from drizzle-orm
    if (!dbStorageContent.includes('desc,')) {
        dbStorageContent = dbStorageContent.replace('eq, and, or, sql', 'eq, and, or, sql, desc');
    }
    
    fs.writeFileSync('server/database-storage.ts', dbStorageContent);
    console.log("Patched database-storage.ts getActiveNudges");
} else {
    console.log("Could not find getActiveNudges in database-storage.ts");
}
