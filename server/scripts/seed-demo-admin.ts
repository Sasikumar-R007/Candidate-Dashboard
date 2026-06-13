/**
 * Seed the first admin employee on a fresh database.
 *
 * Usage (set DATABASE_URL to target Neon DB):
 *   npx tsx server/scripts/seed-demo-admin.ts
 *
 * Optional env overrides:
 *   SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_PHONE
 */
import "dotenv/config";
import { DatabaseStorage } from "../database-storage";

const name = process.env.SEED_ADMIN_NAME || "Sasikumar R";
const email = process.env.SEED_ADMIN_EMAIL || "sasirajkumar7rs@gmail.com";
const password = process.env.SEED_ADMIN_PASSWORD || "sasi123";
const phone = process.env.SEED_ADMIN_PHONE || "6369196110";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const storage = new DatabaseStorage();

async function main() {
  const existing = await storage.getEmployeeByEmail(email);
  if (existing) {
    console.log("Admin already exists for this email:");
    console.log({
      id: existing.id,
      employeeId: existing.employeeId,
      name: existing.name,
      email: existing.email,
      role: existing.role,
    });
    return;
  }

  const allEmployees = await storage.getAllEmployees();
  const existingAdmins = allEmployees.filter((emp) => emp.role === "admin");
  if (existingAdmins.length > 0) {
    console.error("Another admin already exists. Aborting to avoid duplicates.");
    console.error(
      existingAdmins.map((a) => ({ employeeId: a.employeeId, email: a.email })),
    );
    process.exit(1);
  }

  const employeeId = await storage.generateNextEmployeeId("admin");
  const admin = await storage.createEmployee({
    employeeId,
    name,
    email,
    password,
    phone,
    role: "admin",
    department: "Administration",
    isActive: true,
  });

  console.log("✓ Admin seeded successfully");
  console.log({
    id: admin.id,
    employeeId: admin.employeeId,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    phone: admin.phone,
  });
  console.log("\nLogin at /employer-login with the email and password above.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
