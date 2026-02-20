import 'dotenv/config';
import { db } from '../db';
import { candidates } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Script to fix candidate isActive status
 * Sets all candidates to isActive = true if they are null or false
 * 
 * Usage: 
 *   npx tsx server/scripts/fix-candidate-active-status.ts
 */

async function fixCandidateActiveStatus() {
  try {
    // Ensure DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.error('   Please set DATABASE_URL in your .env file');
      process.exit(1);
    }

    console.log('🔍 Checking candidate status...\n');

    // Check total candidates
    const totalQuery = db.select({ count: sql<number>`count(*)` })
      .from(candidates);
    const [totalResult] = await totalQuery;
    const totalCandidates = Number(totalResult?.count || 0);
    console.log(`📊 Total candidates in database: ${totalCandidates}`);

    // Check active candidates
    const activeQuery = db.select({ count: sql<number>`count(*)` })
      .from(candidates)
      .where(eq(candidates.isActive, true));
    const [activeResult] = await activeQuery;
    const activeCandidates = Number(activeResult?.count || 0);
    console.log(`✅ Active candidates: ${activeCandidates}`);

    // Check inactive/null candidates
    const inactiveQuery = db.select({ count: sql<number>`count(*)` })
      .from(candidates)
      .where(sql`${candidates.isActive} = false OR ${candidates.isActive} IS NULL`);
    const [inactiveResult] = await inactiveQuery;
    const inactiveCandidates = Number(inactiveResult?.count || 0);
    console.log(`❌ Inactive/null candidates: ${inactiveCandidates}\n`);

    if (inactiveCandidates === 0) {
      console.log('✅ All candidates are already active. No changes needed.');
      process.exit(0);
    }

    // Update all candidates to isActive = true
    console.log(`🔄 Updating ${inactiveCandidates} candidates to isActive = true...`);
    
    const updateResult = await db
      .update(candidates)
      .set({ isActive: true })
      .where(sql`${candidates.isActive} = false OR ${candidates.isActive} IS NULL`);

    console.log(`✅ Successfully updated candidates!\n`);

    // Verify the update
    const verifyActiveQuery = db.select({ count: sql<number>`count(*)` })
      .from(candidates)
      .where(eq(candidates.isActive, true));
    const [verifyResult] = await verifyActiveQuery;
    const verifyActive = Number(verifyResult?.count || 0);
    console.log(`✅ Verified: ${verifyActive} candidates are now active`);
    console.log(`\n🎉 Fix completed successfully!`);

  } catch (error: any) {
    console.error('❌ Error fixing candidate status:', error);
    console.error('   Error details:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixCandidateActiveStatus()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

