import { db } from "./server/db";
import { nudges, employees, jobApplications } from "./shared/schema";
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const allNudges = await db.select().from(nudges);
    console.log("All Nudges:");
    console.log(JSON.stringify(allNudges, null, 2));

    const allEmps = await db.select().from(employees);
    console.log("\nEmployees mapping:");
    allEmps.forEach(e => console.log(`${e.id} -> ${e.employeeId} (${e.email})`));

  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
run();
