import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('shared/schema.ts');
let content = fs.readFileSync(schemaPath, 'utf-8');

// Add enums at the top
if (!content.includes('registrationStageEnum')) {
  content = content.replace(
    'export const users = pgTable("users", {',
    `export const registrationStageEnum = pgEnum("registration_stage", ['registered', 'verified', 'resume_uploaded', 'completed']);\nexport const onboardingSourceEnum = pgEnum("onboarding_source", ['manual', 'resume']);\n\nexport const users = pgTable("users", {`
  );
}

// Add fields to candidates table
if (!content.includes('registrationStage: text')) {
  content = content.replace(
    '  lastViewedAt: text("last_viewed_at"), // Track when profile was last viewed\n});',
    `  lastViewedAt: text("last_viewed_at"), // Track when profile was last viewed\n  registrationStage: text("registration_stage"),\n  onboardingSource: text("onboarding_source"),\n});`
  );
}

fs.writeFileSync(schemaPath, content);
console.log('Schema updated successfully');
