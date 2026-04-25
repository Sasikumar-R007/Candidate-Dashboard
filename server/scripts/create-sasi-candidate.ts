import * as dotenv from "dotenv";
dotenv.config();
import { storage } from "../storage";
import bcrypt from "bcrypt";

async function createSasiCandidate() {
  try {
    const email = "sasicand@gmail.com";
    const password = "sasi123";
    const fullName = "Sasi Candidate";

    console.log(`\n🚀 Starting candidate creation for: ${email}\n`);

    // Check if candidate already exists
    const existing = await storage.getCandidateByEmail(email);
    if (existing) {
      console.log(`\n⚠️  Candidate with email ${email} already exists!\n`);
      console.log("═══════════════════════════════════════");
      console.log("📧 Email: " + email);
      console.log("🆔 Candidate ID: " + existing.candidateId);
      console.log("✅ Status: " + (existing.isVerified ? 'Verified' : 'Not Verified'));
      console.log("═══════════════════════════════════════\n");
      
      // Update to verified if not already
      if (!existing.isVerified) {
        await storage.updateCandidate(existing.id, { isVerified: true });
        console.log("✅ Updated existing candidate to verified status!\n");
      }
      return;
    }

    // Generate candidate ID and create candidate
    console.log("Generating next candidate ID...");
    const candidateId = await storage.generateNextCandidateId();
    console.log(`Generated ID: ${candidateId}`);

    // Hash the password manually because createCandidate in storage might expect hashed or raw?
    // Let's check storage.ts again briefly to be sure.
    // In database-storage.ts line 664: createCandidate hashes the password if it's there.
    
    console.log("Creating candidate record...");
    const newCandidate = await storage.createCandidate({
      fullName,
      email,
      password, // createCandidate handles hashing
      candidateId,
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString()
    });

    // Explicitly update to verified just in case createCandidate defaults it to false
    await storage.updateCandidate(newCandidate.id, { isVerified: true });

    console.log("\n✅ Sasi candidate created successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("📧 Email: " + email);
    console.log("🔑 Password: " + password);
    console.log("🆔 Candidate ID: " + candidateId);
    console.log("👤 Full Name: " + fullName);
    console.log("✅ Status: Verified (ready to use - no OTP needed)");
    console.log("═══════════════════════════════════════\n");
    
  } catch (error) {
    console.error("❌ Error creating candidate:", error);
    process.exit(1);
  }
}

createSasiCandidate()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
