import { db } from "./db";
import { employees, candidates, requirements } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    await db.delete(employees);
    await db.delete(candidates);
    await db.delete(requirements);
    console.log("✓ Cleared existing data");

    // Hash passwords
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash("admin123", saltRounds);
    const recruiterPasswordHash = await bcrypt.hash("recruiter123", saltRounds);
    const supportPasswordHash = await bcrypt.hash("support123", saltRounds);
    const candidatePasswordHash = await bcrypt.hash("candidate123", saltRounds);

    // Seed employees
    const employeesData = [
      {
        employeeId: "STTA001",
        name: "Admin User",
        email: "admin@staffos.com",
        password: adminPasswordHash,
        role: "admin",
        age: "30",
        phone: "+1234567890",
        department: "Administration",
        joiningDate: "2024-01-01",
        reportingTo: "CEO",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        employeeId: "STTA002",
        name: "John Recruiter",
        email: "recruiter@staffos.com",
        password: recruiterPasswordHash,
        role: "recruiter",
        age: "28",
        phone: "+1234567891",
        department: "Recruitment",
        joiningDate: "2024-02-01",
        reportingTo: "Admin User",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        employeeId: "STTL001",
        name: "Team Leader",
        email: "teamlead@staffos.com",
        password: recruiterPasswordHash,
        role: "team_leader",
        age: "32",
        phone: "+1234567892",
        department: "Recruitment",
        joiningDate: "2024-01-15",
        reportingTo: "Admin User",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        employeeId: "STTS001",
        name: "Support Team",
        email: "support@staffos.com",
        password: supportPasswordHash,
        role: "admin",
        age: "30",
        phone: "+1234567895",
        department: "Support",
        joiningDate: "2024-01-01",
        reportingTo: "CEO",
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    await db.insert(employees).values(employeesData);
    console.log(`✓ Seeded ${employeesData.length} employees`);

    // Seed candidates
    const candidatesData = [
      {
        candidateId: "STCA001",
        fullName: "Jane Candidate",
        email: "candidate@example.com",
        password: candidatePasswordHash,
        phone: "+1234567893",
        company: "Tech Corp",
        designation: "Software Engineer",
        age: "25",
        location: "New York",
        experience: "3 years",
        skills: "JavaScript, React, Node.js",
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        candidateId: "STCA002",
        fullName: "Bob Developer",
        email: "bob@example.com",
        password: candidatePasswordHash,
        phone: "+1234567894",
        company: "Startup Inc",
        designation: "Full Stack Developer",
        age: "27",
        location: "San Francisco",
        experience: "5 years",
        skills: "Python, Django, React, AWS",
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString()
      }
    ];

    await db.insert(candidates).values(candidatesData);
    console.log(`✓ Seeded ${candidatesData.length} candidates`);

    // Seed some requirements
    const requirementsData = [
      {
        position: "Senior Frontend Developer",
        criticality: "HIGH",
        company: "Tech Giant Inc",
        spoc: "John Doe",
        talentAdvisor: "John Recruiter",
        teamLead: "Team Leader",
        isArchived: false,
        createdAt: new Date().toISOString()
      },
      {
        position: "Backend Engineer",
        criticality: "MEDIUM",
        company: "Startup Co",
        spoc: "Jane Smith",
        talentAdvisor: "John Recruiter",
        teamLead: "Team Leader",
        isArchived: false,
        createdAt: new Date().toISOString()
      }
    ];

    await db.insert(requirements).values(requirementsData);
    console.log(`✓ Seeded ${requirementsData.length} requirements`);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("Employee Login:");
    console.log("  - admin@staffos.com / admin123");
    console.log("  - support@staffos.com / support123 (Support Team)");
    console.log("  - recruiter@staffos.com / recruiter123");
    console.log("  - teamlead@staffos.com / recruiter123");
    console.log("\nCandidate Login:");
    console.log("  - candidate@example.com / candidate123");
    console.log("  - bob@example.com / candidate123");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\n🎉 Seeding process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
  });
