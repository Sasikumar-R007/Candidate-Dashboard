import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('shared/schema.ts');
let content = fs.readFileSync(schemaPath, 'utf-8');

// Reconstruction of correct candidates table
const candidatesEndRegex = /ownerEmployeeId: varchar\("owner_employee_id"\)[^,]*?,?\s*expiresAt: text\("expires_at"\)\.notNull\(\),\s*createdAt: text\("createdAt"\)\.notNull\(\),\s*\}\);/;
// Wait, the corrupted part looks like this in the view:
// 359:   ownerEmployeeId: varchar("owner_employee_id"), // Recruiter or team leader who sourced/uploaded this candidate
// 360:   expiresAt: text("expires_at").notNull(),
// 361:   createdAt: text("created_at").notNull(),
// 362: });

const corruptedPart = `  ownerEmployeeId: varchar("owner_employee_id"), // Recruiter or team leader who sourced/uploaded this candidate
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});`;

const fixedPart = `  ownerEmployeeId: varchar("owner_employee_id"), // Recruiter or team leader who sourced/uploaded this candidate
  ownerRole: text("owner_role"), // recruiter or team_leader
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  createdAt: text("created_at").notNull(),
  lastViewedAt: text("last_viewed_at"), // Track when profile was last viewed
  registrationStage: text("registration_stage"),
  onboardingSource: text("onboarding_source"),
  parsedData: json("parsed_data"),
});

export const otps = pgTable("otps", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});`;

if (content.includes(corruptedPart)) {
  content = content.replace(corruptedPart, fixedPart);
  fs.writeFileSync(schemaPath, content);
  console.log('schema.ts fixed successfully');
} else {
  console.log('Corrupted part not found exactly, trying regex');
  const relaxedCorruptionRegex = /ownerEmployeeId: varchar\("owner_employee_id"\)[^,]*?,?\s*expiresAt: text\("expires_at"\)\.notNull\(\),\s*createdAt: text\("created_at"\)\.notNull\(\),\s*\}\);/;
  if (relaxedCorruptionRegex.test(content)) {
    content = content.replace(relaxedCorruptionRegex, fixedPart);
    fs.writeFileSync(schemaPath, content);
    console.log('schema.ts fixed successfully via regex');
  } else {
    console.log('Could not fix schema.ts automatically');
  }
}
