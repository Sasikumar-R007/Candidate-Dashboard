import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
  try {
    const result = await db.execute(sql`SELECT * FROM requirement_assignments LIMIT 1`);
    console.log("Requirement Assignments row:", result.rows[0]);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
