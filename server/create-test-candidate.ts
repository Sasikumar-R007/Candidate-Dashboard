import { storage } from "./storage";

async function createTestCandidate() {
  try {
    // Test candidate details
    const email = "testcandidate@example.com";
    const password = "test123456";
    const fullName = "Test Candidate";

    // Check if candidate already exists
    const existing = await storage.getCandidateByEmail(email);
    if (existing) {
      console.log(`\n⚠️  Candidate with email ${email} already exists!\n`);
      console.log("═══════════════════════════════════════");
      console.log("📧 Email: " + email);
      console.log("🔑 Password: " + password);
      console.log("🆔 Candidate ID: " + existing.candidateId);
      console.log("✅ Status: " + (existing.isVerified ? 'Verified' : 'Not Verified'));
      console.log("═══════════════════════════════════════\n");
      
      // Update to verified if not already
      if (!existing.isVerified) {
        await storage.updateCandidate(existing.id, { isVerified: true });
        console.log("✅ Updated candidate to verified status!\n");
      }
      return;
    }

    // Generate candidate ID and create candidate
    const candidateId = await storage.generateNextCandidateId();
    const newCandidate = await storage.createCandidate({
      fullName,
      email,
      password,
      candidateId,
      isActive: true,
      isVerified: false,
      createdAt: new Date().toISOString()
    });

    // Update to verified status (bypassing OTP requirement)
    await storage.updateCandidate(newCandidate.id, { isVerified: true });

    console.log("\n✅ Test candidate created successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("📧 Email: " + email);
    console.log("🔑 Password: " + password);
    console.log("🆔 Candidate ID: " + candidateId);
    console.log("👤 Full Name: " + fullName);
    console.log("✅ Status: Verified (ready to use - no OTP needed)");
    console.log("═══════════════════════════════════════\n");
    
  } catch (error) {
    console.error("❌ Error creating test candidate:", error);
    process.exit(1);
  }
}

createTestCandidate()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
