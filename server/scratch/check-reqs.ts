import { db } from "../db";
import { requirements } from "../../shared/schema";

async function checkRequirements() {
  const allReqs = await db.select().from(requirements);
  console.log('Total Requirements:', allReqs.length);
  allReqs.forEach(req => {
    console.log(`ID: ${req.id}, Company: ${req.client}, Status: ${req.status}`);
  });
  process.exit(0);
}

checkRequirements();
