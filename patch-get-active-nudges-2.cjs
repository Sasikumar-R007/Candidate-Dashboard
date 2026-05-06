const fs = require('fs');

let dbStorageContent = fs.readFileSync('server/database-storage.ts', 'utf8');

const regex = /async getActiveNudges\(\): Promise<Nudge\[\]> \{\s*return await db\.select\(\)\.from\(nudges\)\.where\(eq\(nudges\.isResponded, false\)\);\s*\}/g;

const replacement = `async getActiveNudges(): Promise<Nudge[]> {
    return await db.select().from(nudges).orderBy(desc(nudges.createdAt));
  }`;

if (regex.test(dbStorageContent)) {
    dbStorageContent = dbStorageContent.replace(regex, replacement);
    
    // Add desc to imports
    if (!dbStorageContent.includes('desc,')) {
        dbStorageContent = dbStorageContent.replace('eq, and, or, sql', 'eq, and, or, sql, desc');
    }
    
    fs.writeFileSync('server/database-storage.ts', dbStorageContent);
    console.log("Patched database-storage.ts getActiveNudges");
} else {
    console.log("Regex didn't match getActiveNudges in database-storage.ts");
}
