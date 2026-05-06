import { db } from "../db";
import { nudges, jobApplications, employees, requirements } from "../../shared/schema";
import { eq, isNull } from "drizzle-orm";

async function main() {
  const allNudges = await db.select().from(nudges);
  console.log(`Found ${allNudges.length} total nudges.`);

  for (const nudge of allNudges) {
    // If the recruiterId is STTA001 or missing, try to resolve it properly
    if (!nudge.recruiterId || nudge.recruiterId === "STTA001") {
      console.log(`Checking nudge ${nudge.id} for application ${nudge.applicationId}...`);
      
      const [app] = await db.select().from(jobApplications).where(eq(jobApplications.id, nudge.applicationId));
      if (!app) {
        console.log(`Application ${nudge.applicationId} not found, skipping.`);
        continue;
      }

      const potentialIds: string[] = [];
      if (app.ownerEmployeeId) potentialIds.push(app.ownerEmployeeId);
      if (app.requirementId) {
        const [req] = await db.select().from(requirements).where(eq(requirements.id, app.requirementId));
        if (req && req.talentAdvisorId) potentialIds.push(req.talentAdvisorId);
      }

      let resolvedUuid: string | undefined;

      for (const pId of potentialIds) {
        // Try UUID
        let [emp] = await db.select().from(employees).where(eq(employees.id, pId));
        if (!emp) {
          // Try employeeId
          [emp] = await db.select().from(employees).where(eq(employees.employeeId, pId));
        }
        if (emp) {
          resolvedUuid = emp.id;
          break;
        }
      }

      if (resolvedUuid && resolvedUuid !== nudge.recruiterId) {
        console.log(`Updating nudge ${nudge.id} recruiterId to ${resolvedUuid} (was ${nudge.recruiterId})`);
        await db.update(nudges)
          .set({ recruiterId: resolvedUuid })
          .where(eq(nudges.id, nudge.id));
      } else {
        // Fallback to application's ownerEmployeeId if still STTA001 and ownerEmployeeId is a UUID-like string
        if (app.ownerEmployeeId && app.ownerEmployeeId.length > 20 && app.ownerEmployeeId !== nudge.recruiterId) {
            console.log(`Fallback: Updating nudge ${nudge.id} recruiterId to application owner ${app.ownerEmployeeId}`);
            await db.update(nudges)
              .set({ recruiterId: app.ownerEmployeeId })
              .where(eq(nudges.id, nudge.id));
        } else {
            console.log(`Could not resolve better recruiter ID for nudge ${nudge.id}.`);
        }
      }
    }
  }

  console.log("Done checking and fixing nudges.");
  process.exit(0);
}

main().catch(console.error);
