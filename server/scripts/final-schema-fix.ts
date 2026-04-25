import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('shared/schema.ts');
let content = fs.readFileSync(schemaPath, 'utf-8');

// Ensure enums are at the top (checking for existence first)
if (!content.includes('registrationStageEnum')) {
  console.log('Adding enums to top of schema.ts');
  content = content.replace(
    /export const users = pgTable\("users", \{/,
    `export const registrationStageEnum = pgEnum("registration_stage", ['registered', 'verified', 'resume_uploaded', 'completed']);\nexport const onboardingSourceEnum = pgEnum("onboarding_source", ['manual', 'resume']);\n\nexport const users = pgTable("users", {`
  );
}

// Add fields to candidates table using a more flexible regex
// We match the end of the candidates table definition
const candidatesTableBodyRegex = /(export const candidates = pgTable\("candidates", \{[\s\S]*?)(lastViewedAt: text\("last_viewed_at"\)[^,]*?,?\s*)(\}\);)/;

if (candidatesTableBodyRegex.test(content)) {
  console.log('Found candidates table body, adding fields...');
  content = content.replace(candidatesTableBodyRegex, (match, p1, p2, p3) => {
    // Ensure we don't duplicate
    if (p1.includes('registrationStage')) return match;
    
    return \`\${p1}\${p2}  registrationStage: text("registration_stage"),
  onboardingSource: text("onboarding_source"),
  parsedData: json("parsed_data"),\n\${p3}\`;
  });
} else {
  console.log('Could not find candidates table definition with regex');
}

fs.writeFileSync(schemaPath, content);
console.log('schema.ts operation finished');
