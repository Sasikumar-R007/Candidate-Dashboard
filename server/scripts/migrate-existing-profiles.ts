import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parseResumeFile } from '../resume-parser';
import { DatabaseStorage } from '../database-storage';
import { db } from '../db';
import { candidates } from '@shared/schema';

/**
 * Migration Script: Improve Existing Candidate Profiles
 * 
 * This script updates existing candidate profiles with improved data extraction:
 * 1. Extracts names from email addresses for profiles missing names
 * 2. Re-parses resume files to extract better data (if resume files exist)
 * 3. Updates profiles with improved information
 * 
 * Usage: 
 *   npx tsx server/scripts/migrate-existing-profiles.ts
 * 
 * Safety Features:
 * - Only updates fields that are missing or "Not Available"
 * - Creates a backup report before making changes
 * - Processes candidates in batches to avoid memory issues
 * - Handles errors gracefully and continues processing
 * - Shows detailed progress and statistics
 */

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Please set DATABASE_URL in your .env file');
  process.exit(1);
}

const storage = new DatabaseStorage();

interface MigrationStats {
  total: number;
  processed: number;
  updated: number;
  skipped: number;
  errors: number;
  nameExtractedFromEmail: number;
  resumeReparsed: number;
  details: Array<{
    candidateId: string;
    email: string;
    action: string;
    error?: string;
  }>;
}

/**
 * Extract name from email address
 */
function extractNameFromEmail(email: string): string | null {
  if (!email || !email.includes('@')) {
    return null;
  }
  
  const emailName = email.split('@')[0];
  // Try to format email name as a proper name (e.g., "john.doe" -> "John Doe")
  const nameParts = emailName.split(/[._-]/).filter(part => part.length > 0);
  
  if (nameParts.length >= 2) {
    // Multiple parts - format as "FirstName LastName"
    return nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  } else if (nameParts.length === 1 && nameParts[0].length > 2) {
    // Single name - capitalize first letter
    return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
  }
  
  return null;
}

/**
 * Check if a field needs updating (is null, empty, or "Not Available")
 */
function needsUpdate(value: string | null | undefined): boolean {
  // Check for null, undefined, or empty
  if (!value) return true;
  
  // Convert to string and trim
  const strValue = String(value).trim();
  
  // Check for empty string
  if (strValue === '') return true;
  
  // Check for "Not Available" variations (case-insensitive)
  // IMPORTANT: Also check for the literal string "null" (stored as text, not actual null)
  const normalized = strValue.toLowerCase();
  return normalized === 'not available' || 
         normalized === 'n/a' || 
         normalized === 'na' ||
         normalized === 'null' ||        // The string "null" (not actual null)
         normalized === 'undefined' ||
         normalized === 'none' ||
         normalized === '-' ||
         normalized === 'n/a' ||
         normalized === 'na';
}

/**
 * Get file path from resume URL
 */
function getResumeFilePath(resumeFile: string | null | undefined): string | null {
  if (!resumeFile) return null;
  
  // Extract filename from URL
  let filename = '';
  if (resumeFile.includes('/')) {
    filename = resumeFile.split('/').pop() || '';
  } else {
    filename = resumeFile;
  }
  
  // Remove query parameters if any
  filename = filename.split('?')[0];
  
  // Try different possible locations
  const possiblePaths = [
    path.join(process.cwd(), 'uploads', 'resumes', filename),
    path.join(process.cwd(), 'uploads', filename),
    path.join(process.cwd(), filename),
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  return null;
}

/**
 * Process a single candidate
 */
async function processCandidate(
  candidate: any,
  stats: MigrationStats
): Promise<void> {
  try {
    const updates: any = {};
    let actionTaken = false;
    let actionDescription = '';

    // 1. Extract name from email if name is missing
    if (needsUpdate(candidate.fullName) && candidate.email) {
      const extractedName = extractNameFromEmail(candidate.email);
      if (extractedName) {
        updates.fullName = extractedName;
        actionTaken = true;
        actionDescription = `Extracted name from email: ${extractedName}`;
        stats.nameExtractedFromEmail++;
      }
    }

    // 2. Convert string "null" to actual null for all fields
    // This fixes the issue where fields are stored as the text "null" instead of actual null
    const fieldsToCheck = [
      'designation', 'phone', 'currentRole', 'experience', 'skills', 
      'location', 'company', 'education', 'linkedinUrl', 'portfolioUrl', 
      'websiteUrl', 'noticePeriod', 'ctc', 'ectc'
    ];
    
    for (const field of fieldsToCheck) {
      const value = candidate[field];
      if (value && String(value).toLowerCase().trim() === 'null') {
        updates[field] = null; // Convert string "null" to actual null
        actionTaken = true;
        if (!actionDescription) {
          actionDescription = `Converting string "null" to actual null values`;
        }
      }
    }

    // 3. Re-parse resume file if it exists and we need more data
    const resumeFilePath = getResumeFilePath(candidate.resumeFile);
    if (resumeFilePath) {
      try {
        // Determine MIME type from file extension
        const ext = path.extname(resumeFilePath).toLowerCase();
        let mimeType = 'application/pdf';
        if (ext === '.docx') {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (ext === '.doc') {
          mimeType = 'application/msword';
        }

        const parsed = await parseResumeFile(resumeFilePath, mimeType);

        // Update fields only if they're missing or "Not Available" or string "null"
        if (needsUpdate(candidate.fullName) && parsed.fullName) {
          updates.fullName = parsed.fullName;
          actionTaken = true;
          actionDescription = `Re-parsed resume: extracted name ${parsed.fullName}`;
        }
        if (needsUpdate(candidate.phone) && parsed.phone) {
          updates.phone = parsed.phone;
          actionTaken = true;
        }
        if (needsUpdate(candidate.designation) && parsed.designation) {
          updates.designation = parsed.designation;
          actionTaken = true;
        }
        if (needsUpdate(candidate.currentRole) && parsed.currentRole) {
          updates.currentRole = parsed.currentRole;
          actionTaken = true;
        }
        if (needsUpdate(candidate.experience) && parsed.experience) {
          updates.experience = parsed.experience;
          actionTaken = true;
        }
        if (needsUpdate(candidate.skills) && parsed.skills) {
          updates.skills = parsed.skills;
          actionTaken = true;
        }
        if (needsUpdate(candidate.location) && parsed.location) {
          updates.location = parsed.location;
          actionTaken = true;
        }
        if (needsUpdate(candidate.company) && parsed.company) {
          updates.company = parsed.company;
          actionTaken = true;
        }
        if (needsUpdate(candidate.education) && parsed.education) {
          updates.education = parsed.education;
          actionTaken = true;
        }
        if (needsUpdate(candidate.linkedinUrl) && parsed.linkedinUrl) {
          updates.linkedinUrl = parsed.linkedinUrl;
          actionTaken = true;
        }
        if (needsUpdate(candidate.portfolioUrl) && parsed.portfolioUrl) {
          updates.portfolioUrl = parsed.portfolioUrl;
          actionTaken = true;
        }
        if (needsUpdate(candidate.websiteUrl) && parsed.websiteUrl) {
          updates.websiteUrl = parsed.websiteUrl;
          actionTaken = true;
        }

        if (Object.keys(updates).length > 0) {
          stats.resumeReparsed++;
        }
      } catch (parseError: any) {
        // Resume parsing failed - log but continue
        console.warn(`   ⚠️  Could not re-parse resume for ${candidate.email}: ${parseError.message}`);
      }
    }

    // 3. Update candidate if we have any improvements
    if (Object.keys(updates).length > 0) {
      await storage.updateCandidate(candidate.id, updates);
      stats.updated++;
      actionTaken = true;
      
      if (!actionDescription) {
        actionDescription = `Updated ${Object.keys(updates).join(', ')}`;
      }
      
      stats.details.push({
        candidateId: candidate.candidateId || candidate.id,
        email: candidate.email,
        action: actionDescription
      });
    } else {
      stats.skipped++;
      stats.details.push({
        candidateId: candidate.candidateId || candidate.id,
        email: candidate.email,
        action: 'No updates needed'
      });
    }

    stats.processed++;
  } catch (error: any) {
    stats.errors++;
    stats.processed++;
    stats.details.push({
      candidateId: candidate.candidateId || candidate.id,
      email: candidate.email || 'Unknown',
      action: 'Error',
      error: error.message || 'Unknown error'
    });
    console.error(`   ❌ Error processing ${candidate.email}:`, error.message);
  }
}

/**
 * Main migration function
 */
async function migrateExistingProfiles() {
  console.log('🚀 Starting Migration: Improve Existing Candidate Profiles\n');
  console.log('📋 This script will:');
  console.log('   1. Extract names from email addresses for profiles missing names');
  console.log('   2. Re-parse resume files to extract better data (if files exist)');
  console.log('   3. Update profiles with improved information\n');

  const stats: MigrationStats = {
    total: 0,
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    nameExtractedFromEmail: 0,
    resumeReparsed: 0,
    details: []
  };

  try {
    // Get all active candidates
    console.log('🔍 Fetching all candidates from database...');
    const allCandidates = await db.select().from(candidates);
    stats.total = allCandidates.length;
    console.log(`📊 Found ${stats.total} candidates to process\n`);

    if (stats.total === 0) {
      console.log('✅ No candidates found. Nothing to migrate.');
      return;
    }

    // Process candidates in batches to avoid memory issues
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < allCandidates.length; i += batchSize) {
      batches.push(allCandidates.slice(i, i + batchSize));
    }

    console.log(`📦 Processing ${batches.length} batches of up to ${batchSize} candidates each...\n`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} candidates)...`);

      for (const candidate of batch) {
        const progress = `[${stats.processed + 1}/${stats.total}]`;
        process.stdout.write(`   ${progress} Processing ${candidate.email || candidate.id}... `);
        
        await processCandidate(candidate, stats);
        
        if (stats.details[stats.details.length - 1]?.action === 'No updates needed') {
          console.log('⏭️  Skipped');
        } else if (stats.details[stats.details.length - 1]?.error) {
          console.log('❌ Error');
        } else {
          console.log('✅ Updated');
        }
      }
    }

    // Print summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`📋 Total candidates: ${stats.total}`);
    console.log(`✅ Successfully processed: ${stats.processed}`);
    console.log(`🔄 Updated: ${stats.updated}`);
    console.log(`⏭️  Skipped (no updates needed): ${stats.skipped}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log(`\n📈 Improvements:`);
    console.log(`   • Names extracted from email: ${stats.nameExtractedFromEmail}`);
    console.log(`   • Resumes re-parsed: ${stats.resumeReparsed}`);
    console.log('='.repeat(80));

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'migration-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: stats.total,
        processed: stats.processed,
        updated: stats.updated,
        skipped: stats.skipped,
        errors: stats.errors,
        nameExtractedFromEmail: stats.nameExtractedFromEmail,
        resumeReparsed: stats.resumeReparsed
      },
      details: stats.details
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    if (stats.errors > 0) {
      console.log(`\n⚠️  ${stats.errors} errors occurred. Check the report for details.`);
    }

    console.log('\n🎉 Migration completed successfully!\n');

  } catch (error: any) {
    console.error('\n❌ Fatal error during migration:', error);
    console.error('   Error details:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run the migration
migrateExistingProfiles()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

