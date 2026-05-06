import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
  try {
    const result = await db.execute(sql`SELECT id, name, role FROM employees`);
    console.log(result.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
