import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './shared/schema';

class CustomWebSocket extends ws {
  constructor(address: string | URL, protocols?: string | string[]) {
    super(address, protocols, {
      rejectUnauthorized: false
    });
  }
}

neonConfig.webSocketConstructor = CustomWebSocket as typeof ws;
neonConfig.pipelineConnect = false;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function viewDatabase() {
  console.log('🔍 StaffOS Database Viewer\n');
  console.log('═══════════════════════════════════════\n');

  try {
    const pool = new Pool({ connectionString });
    const db = drizzle({ client: pool, schema });

    // View Employees
    console.log('👥 EMPLOYEES\n');
    console.log('─────────────────────────────────────');
    const employees = await db.query.employees.findMany({
      where: (employees, { eq }) => eq(employees.isActive, true)
    });
    
    if (employees.length === 0) {
      console.log('No employees found. Run: npx tsx server/seed.ts\n');
    } else {
      employees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.name}`);
        console.log(`   ID: ${emp.employeeId}`);
        console.log(`   Email: ${emp.email}`);
        console.log(`   Role: ${emp.role.toUpperCase()}`);
        console.log(`   Department: ${emp.department}`);
        console.log(`   Phone: ${emp.phone}`);
        console.log(`   Joined: ${emp.joiningDate}`);
        console.log(`   Reporting To: ${emp.reportingTo}`);
        console.log(`   Status: ${emp.isActive ? '✅ Active' : '❌ Inactive'}\n`);
      });
    }

    // View Candidates
    console.log('\n🎯 CANDIDATES\n');
    console.log('─────────────────────────────────────');
    const candidates = await db.query.candidates.findMany({
      where: (candidates, { eq }) => eq(candidates.isActive, true)
    });

    if (candidates.length === 0) {
      console.log('No candidates found.\n');
    } else {
      candidates.forEach((cand, index) => {
        console.log(`${index + 1}. ${cand.fullName}`);
        console.log(`   ID: ${cand.candidateId}`);
        console.log(`   Email: ${cand.email}`);
        console.log(`   Phone: ${cand.phone || 'N/A'}`);
        console.log(`   Company: ${cand.company || 'N/A'}`);
        console.log(`   Designation: ${cand.designation || 'N/A'}`);
        console.log(`   Experience: ${cand.experience || 'N/A'}`);
        console.log(`   Location: ${cand.location || 'N/A'}`);
        console.log(`   Verified: ${cand.isVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Status: ${cand.isActive ? '✅ Active' : '❌ Inactive'}\n`);
      });
    }

    // View Requirements
    console.log('\n📝 JOB REQUIREMENTS\n');
    console.log('─────────────────────────────────────');
    const requirements = await db.query.requirements.findMany({
      where: (requirements, { eq }) => eq(requirements.isArchived, false)
    });

    if (requirements.length === 0) {
      console.log('No job requirements found.\n');
    } else {
      requirements.forEach((req, index) => {
        console.log(`${index + 1}. ${req.position || 'N/A'}`);
        console.log(`   Company: ${req.company || 'N/A'}`);
        console.log(`   Criticality: ${req.criticality || 'N/A'}`);
        console.log(`   SPOC: ${req.spoc || 'N/A'}`);
        console.log(`   Talent Advisor: ${req.talentAdvisor || 'N/A'}`);
        console.log(`   Team Lead: ${req.teamLead || 'N/A'}`);
        console.log(`   Status: ${req.isArchived ? '📦 Archived' : '✅ Active'}\n`);
      });
    }

    // Statistics
    console.log('\n📊 DATABASE STATISTICS\n');
    console.log('─────────────────────────────────────');
    
    const allEmployees = await db.query.employees.findMany();
    const activeEmployees = allEmployees.filter(e => e.isActive);
    const adminCount = activeEmployees.filter(e => e.role === 'admin').length;
    const recruiterCount = activeEmployees.filter(e => e.role === 'recruiter').length;
    const teamLeadCount = activeEmployees.filter(e => e.role === 'team_leader').length;
    
    const allCandidates = await db.query.candidates.findMany();
    const activeCandidates = allCandidates.filter(c => c.isActive);
    const verifiedCandidates = activeCandidates.filter(c => c.isVerified);
    
    const allRequirements = await db.query.requirements.findMany();
    const activeRequirements = allRequirements.filter(r => !r.isArchived);

    console.log(`Total Employees: ${allEmployees.length} (${activeEmployees.length} active)`);
    console.log(`  - Admins: ${adminCount}`);
    console.log(`  - Recruiters: ${recruiterCount}`);
    console.log(`  - Team Leaders: ${teamLeadCount}`);
    console.log(`\nTotal Candidates: ${allCandidates.length} (${activeCandidates.length} active)`);
    console.log(`  - Verified: ${verifiedCandidates.length}`);
    console.log(`  - Unverified: ${activeCandidates.length - verifiedCandidates.length}`);
    console.log(`\nTotal Requirements: ${allRequirements.length} (${activeRequirements.length} active)`);

    console.log('\n═══════════════════════════════════════\n');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error viewing database:');
    console.error(error);
    process.exit(1);
  }
}

viewDatabase();
