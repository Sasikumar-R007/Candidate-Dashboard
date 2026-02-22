import 'dotenv/config';
import { db } from '../db';
import { candidates } from '@shared/schema';
import { sql, or, isNull, eq } from 'drizzle-orm';

/**
 * Debug Script: Check Candidate Data
 * 
 * This script checks what's actually stored in the database
 * to understand why the migration didn't update candidates.
 * 
 * Usage: 
 *   npx tsx server/scripts/debug-candidate-data.ts
 */

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Please set DATABASE_URL in your .env file');
  process.exit(1);
}

async function debugCandidateData() {
  console.log('🔍 Debugging Candidate Data\n');

  try {
    // Get total count
    const totalQuery = db.select({ count: sql<number>`count(*)` })
      .from(candidates);
    const [totalResult] = await totalQuery;
    const total = Number(totalResult?.count || 0);
    console.log(`📊 Total candidates: ${total}\n`);

    // Check candidates with missing/null names
    const nullNameQuery = db.select()
      .from(candidates)
      .where(
        or(
          isNull(candidates.fullName),
          eq(candidates.fullName, ''),
          sql`TRIM(${candidates.fullName}) = ''`
        )
      )
      .limit(10);
    
    const nullNameCandidates = await nullNameQuery;
    console.log(`\n📋 Candidates with NULL/empty names: ${nullNameCandidates.length}`);
    if (nullNameCandidates.length > 0) {
      console.log('   Sample candidates:');
      nullNameCandidates.forEach((c, i) => {
        console.log(`   ${i + 1}. ID: ${c.id}, Email: ${c.email}, Name: "${c.fullName}" (type: ${typeof c.fullName})`);
      });
    }

    // Check candidates with "Not Available" as name
    const notAvailableQuery = db.select()
      .from(candidates)
      .where(
        sql`LOWER(TRIM(${candidates.fullName})) = 'not available'`
      )
      .limit(10);
    
    const notAvailableCandidates = await notAvailableQuery;
    console.log(`\n📋 Candidates with "Not Available" as name: ${notAvailableCandidates.length}`);
    if (notAvailableCandidates.length > 0) {
      console.log('   Sample candidates:');
      notAvailableCandidates.forEach((c, i) => {
        console.log(`   ${i + 1}. ID: ${c.id}, Email: ${c.email}, Name: "${c.fullName}"`);
      });
    }

    // Check a few random candidates to see their actual data
    const sampleQuery = db.select()
      .from(candidates)
      .limit(5);
    
    const sampleCandidates = await sampleQuery;
    console.log(`\n📋 Sample candidates (first 5):`);
    sampleCandidates.forEach((c, i) => {
      console.log(`\n   ${i + 1}. Candidate ${c.id}:`);
      console.log(`      Email: ${c.email}`);
      console.log(`      Full Name: "${c.fullName}" (${c.fullName ? 'has value' : 'NULL/empty'})`);
      console.log(`      Designation: "${c.designation}" (${c.designation ? 'has value' : 'NULL/empty'})`);
      console.log(`      Location: "${c.location}" (${c.location ? 'has value' : 'NULL/empty'})`);
      console.log(`      Company: "${c.company}" (${c.company ? 'has value' : 'NULL/empty'})`);
      console.log(`      Experience: "${c.experience}" (${c.experience ? 'has value' : 'NULL/empty'})`);
      console.log(`      Skills: "${c.skills}" (${c.skills ? 'has value' : 'NULL/empty'})`);
      console.log(`      Education: "${c.education}" (${c.education ? 'has value' : 'NULL/empty'})`);
    });

    // Count candidates by data completeness
    const statsQuery = db.select({
      total: sql<number>`count(*)`,
      hasName: sql<number>`count(*) FILTER (WHERE ${candidates.fullName} IS NOT NULL AND TRIM(${candidates.fullName}) != '')`,
      hasDesignation: sql<number>`count(*) FILTER (WHERE ${candidates.designation} IS NOT NULL AND TRIM(${candidates.designation}) != '')`,
      hasLocation: sql<number>`count(*) FILTER (WHERE ${candidates.location} IS NOT NULL AND TRIM(${candidates.location}) != '')`,
      hasCompany: sql<number>`count(*) FILTER (WHERE ${candidates.company} IS NOT NULL AND TRIM(${candidates.company}) != '')`,
      hasExperience: sql<number>`count(*) FILTER (WHERE ${candidates.experience} IS NOT NULL AND TRIM(${candidates.experience}) != '')`,
      hasSkills: sql<number>`count(*) FILTER (WHERE ${candidates.skills} IS NOT NULL AND TRIM(${candidates.skills}) != '')`,
    })
      .from(candidates);
    
    const [stats] = await statsQuery;
    console.log(`\n\n📊 Data Completeness Statistics:`);
    console.log(`   Total candidates: ${stats.total}`);
    console.log(`   Has name: ${stats.hasName} (${Math.round((stats.hasName / stats.total) * 100)}%)`);
    console.log(`   Has designation: ${stats.hasDesignation} (${Math.round((stats.hasDesignation / stats.total) * 100)}%)`);
    console.log(`   Has location: ${stats.hasLocation} (${Math.round((stats.hasLocation / stats.total) * 100)}%)`);
    console.log(`   Has company: ${stats.hasCompany} (${Math.round((stats.hasCompany / stats.total) * 100)}%)`);
    console.log(`   Has experience: ${stats.hasExperience} (${Math.round((stats.hasExperience / stats.total) * 100)}%)`);
    console.log(`   Has skills: ${stats.hasSkills} (${Math.round((stats.hasSkills / stats.total) * 100)}%)`);

    console.log('\n✅ Debug complete!\n');

  } catch (error: any) {
    console.error('\n❌ Error debugging candidate data:', error);
    console.error('   Error details:', error.message);
    process.exit(1);
  }
}

// Run the debug
debugCandidateData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

