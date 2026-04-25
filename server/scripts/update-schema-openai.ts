import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('shared/schema.ts');
let content = fs.readFileSync(schemaPath, 'utf-8');

// Ensure enums are at the top (should already be there)
if (!content.includes('registrationStageEnum')) {
  console.log('Adding enums to schema.ts');
  content = content.replace(
    'export const users = pgTable("users", {',
    `export const registrationStageEnum = pgEnum("registration_stage", ['registered', 'verified', 'resume_uploaded', 'completed']);\nexport const onboardingSourceEnum = pgEnum("onboarding_source", ['manual', 'resume']);\n\nexport const users = pgTable("users", {`
  );
}

// Add fields to candidates table
// We look for lastViewedAt which was the last field in the previous view
if (!content.includes('registrationStage: text')) {
  console.log('Adding fields to candidates table in schema.ts');
  content = content.replace(
    '  lastViewedAt: text("last_viewed_at"), // Track when profile was last viewed\n});',
    `  lastViewedAt: text("last_viewed_at"), // Track when profile was last viewed\n  registrationStage: text("registration_stage"),\n  onboardingSource: text("onboarding_source"),\n  parsedData: json("parsed_data"),\n});`
  );
}

fs.writeFileSync(schemaPath, content);
console.log('schema.ts updated successfully');
