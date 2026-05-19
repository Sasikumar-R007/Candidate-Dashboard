/**
 * One-off: activate a client_member login with a known password.
 * Usage: npx tsx server/scripts/setup-client-member-login.ts <email> [password]
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import { clientInvites } from "@shared/schema";
import { CLIENT_MEMBER_ROLE } from "@shared/client-roles";

const email = (process.argv[2] || "").trim().toLowerCase();
const plainPassword = process.argv[3] || "StaffOS@Member2026";

async function main() {
  if (!email) {
    console.error("Usage: npx tsx server/scripts/setup-client-member-login.ts <email> [password]");
    process.exit(1);
  }

  const result = await db.execute(sql`
    SELECT id, email, name, role, is_active, employee_id, client_company_id, password
    FROM employees
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1
  `);

  const row = result.rows[0] as
    | {
        id: string;
        email: string;
        name: string;
        role: string;
        is_active: boolean;
        employee_id: string;
        client_company_id: string | null;
        password: string | null;
      }
    | undefined;

  if (!row) {
    console.error(`No employee found for ${email}`);
    process.exit(1);
  }

  const role = (row.role || "").toLowerCase();
  if (role !== CLIENT_MEMBER_ROLE && role !== "client") {
    console.error(`Employee role is "${row.role}", expected client_member`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await storage.updateEmployee(row.id, {
    password: hashedPassword,
    isActive: true,
    role: CLIENT_MEMBER_ROLE,
  } as Parameters<typeof storage.updateEmployee>[1]);

  const pending = await db
    .select()
    .from(clientInvites)
    .where(eq(clientInvites.email, email));

  for (const inv of pending) {
    if (inv.status === "pending") {
      await db
        .update(clientInvites)
        .set({
          status: "accepted",
          acceptedAt: new Date().toISOString(),
        })
        .where(eq(clientInvites.id, inv.id));
    }
  }

  console.log(JSON.stringify({
    ok: true,
    email: row.email,
    name: row.name,
    employeeId: row.employee_id,
    role: CLIENT_MEMBER_ROLE,
    clientCompanyId: row.client_company_id,
    password: plainPassword,
    loginUrl: "Use Employer Login in the app (/employer-login)",
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
