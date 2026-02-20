import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parseResumeFile } from '../resume-parser';
import { DatabaseStorage } from '../database-storage';

/**
 * Script to import sample resumes from public/Sample Resumes folder into the database
 * 
 * Usage: 
 *   npx tsx server/scripts/import-sample-resumes.ts
 *   or
 *   npm run import-sample-resumes (if script is added to package.json)
 */

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Please set DATABASE_URL in your .env file');
  process.exit(1);
}

const storage = new DatabaseStorage();

async function importSampleResumes() {
  try {
    // Path to sample resumes folder
    const sampleResumesDir = path.join(process.cwd(), 'client', 'public', 'Sample Resumes');
    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Check if sample resumes directory exists
    if (!fs.existsSync(sampleResumesDir)) {
      console.error(`❌ Sample Resumes directory not found: ${sampleResumesDir}`);
      process.exit(1);
    }
    
    // Get all PDF files from sample resumes directory
    const files = fs.readdirSync(sampleResumesDir).filter(file => 
      file.toLowerCase().endsWith('.pdf')
    );
    
    if (files.length === 0) {
      console.log('⚠️  No PDF files found in Sample Resumes directory');
      return;
    }
    
    console.log(`📄 Found ${files.length} resume files to process\n`);
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      const filePath = path.join(sampleResumesDir, file);
      const fileName = path.basename(file, path.extname(file));
      
      try {
        console.log(`\n📋 Processing: ${file}`);
        
        // Parse the resume
        const parsed = await parseResumeFile(filePath, 'application/pdf');
        
        if (!parsed.fullName || !parsed.email) {
          console.log(`⚠️  Skipping ${file}: Missing name or email`);
          skippedCount++;
          continue;
        }
        
        // Check if candidate already exists
        const existing = await storage.getCandidateByEmail(parsed.email.toLowerCase());
        if (existing) {
          console.log(`⚠️  Skipping ${file}: Candidate with email ${parsed.email} already exists`);
          skippedCount++;
          continue;
        }
        
        // Copy file to uploads directory
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFileName = `resume-${uniqueSuffix}${path.extname(file)}`;
        const destPath = path.join(uploadsDir, newFileName);
        fs.copyFileSync(filePath, destPath);
        
        // Generate candidate ID
        const candidateId = await storage.generateNextCandidateId();
        
        // Create candidate in database
        const newCandidate = await storage.createCandidate({
          candidateId,
          fullName: parsed.fullName,
          email: parsed.email.toLowerCase(),
          phone: parsed.phone || null,
          designation: parsed.designation || parsed.currentRole || null,
          experience: parsed.experience || null,
          skills: parsed.skills || null,
          location: parsed.location || null,
          company: parsed.company || null,
          education: parsed.education || null,
          currentRole: parsed.currentRole || parsed.designation || null,
          linkedinUrl: parsed.linkedinUrl || null,
          portfolioUrl: parsed.portfolioUrl || null,
          websiteUrl: parsed.websiteUrl || null,
          resumeFile: `/uploads/resumes/${newFileName}`,
          resumeText: parsed.rawText || null,
          addedBy: 'Sample Resume Import',
          pipelineStatus: 'New',
          isActive: true,
          isVerified: false,
          createdAt: new Date().toISOString()
        });
        
        console.log(`✅ Successfully imported: ${parsed.fullName} (${parsed.email})`);
        console.log(`   Candidate ID: ${newCandidate.candidateId}`);
        successCount++;
        
      } catch (error: any) {
        console.error(`❌ Error processing ${file}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n\n📊 Import Summary:`);
    console.log(`   ✅ Successfully imported: ${successCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📄 Total processed: ${files.length}\n`);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the import
importSampleResumes()
  .then(() => {
    console.log('✅ Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });

