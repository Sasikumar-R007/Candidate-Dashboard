import { db } from "../server/db";
import { nudges, employees } from "../shared/schema";
import { eq } from "drizzle-orm";

async function diagnose() {
  const allNudges = await db.select().from(nudges);
  console.log("Total Nudges:", allNudges.length);
  
  for (const nudge of allNudges) {
    console.log(`Nudge ${nudge.id}: recruiterId=${nudge.recruiterId}, job=${nudge.jobTitle}`);
  }

  const allEmployees = await db.select().from(employees);
  for (const emp of allEmployees) {
    console.log(`Employee ${emp.name}: id=${emp.id}, employeeId=${emp.employeeId}`);
  }
}

diagnose().catch(console.error);
