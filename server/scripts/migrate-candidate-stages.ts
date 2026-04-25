import { storage } from '../database-storage';
import { db } from '../db';
import { candidates } from '../../shared/schema';
import { eq, isNull } from 'drizzle-orm';

async function migrate() {
  console.log('Migrating existing candidates to "completed" stage...');
  
  try {
    // Update all candidates where registrationStage is NULL
    const result = await db
      .update(candidates)
      .set({ registrationStage: 'completed' })
      .where(isNull(candidates.registrationStage));
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
