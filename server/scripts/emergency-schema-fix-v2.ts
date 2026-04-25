import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('shared/schema.ts');
let content = fs.readFileSync(schemaPath, 'utf-8');

const targetStr = \`  ownerEmployeeId: varchar("owner_employee_id"), // Recruiter or team leader who sourced/uploaded this candidate
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});\`;

const replacementStr = \`  ownerEmployeeId: varchar("owner_employee_id"), // Recruiter or team leader who sourced/uploaded this candidate
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
});\`;

// Replace specifically searching for the CRLF or LF versions
const searchStrLF = targetStr.replace(/\\r\\n/g, '\\n');
const searchStrCRLF = targetStr.replace(/\\r?\\n/g, '\\r\\n');

if (content.includes(searchStrLF)) {
  content = content.replace(searchStrLF, replacementStr);
  fs.writeFileSync(schemaPath, content);
  console.log('Fixed schema.ts (LF)');
} else if (content.includes(searchStrCRLF)) {
  content = content.replace(searchStrCRLF, replacementStr);
  fs.writeFileSync(schemaPath, content);
  console.log('Fixed schema.ts (CRLF)');
} else {
  // Try one more time with a very flexible match
  const flexibleRegex = /ownerEmployeeId: varchar\("owner_employee_id"\)[^,]*?,?\s*expiresAt: text\("expires_at"\)\.notNull\(\),\s*createdAt: text\("created_at"\)\.notNull\(\),\s*\}\);/;
  if (flexibleRegex.test(content)) {
    content = content.replace(flexibleRegex, replacementStr);
    fs.writeFileSync(schemaPath, content);
    console.log('Fixed schema.ts (Regex)');
  } else {
    console.log('STILL FAILED TO FIND TARGET');
    console.log('Content segment around expected target:');
    const startIdx = content.indexOf('ownerEmployeeId');
    if (startIdx !== -1) {
      console.log(JSON.stringify(content.substring(startIdx, startIdx + 200)));
    }
  }
}
