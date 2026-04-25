import "dotenv/config";
import { db } from "../db";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Adding password_resets table...");
  
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        otp TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Success: password_resets table added.");
  } catch (error) {
    console.error("Error adding table:", error);
  } finally {
    process.exit();
  }
}

run();
