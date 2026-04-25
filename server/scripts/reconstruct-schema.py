import sys
import os

schema_path = 'shared/schema.ts'

with open(schema_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

# We'll reconstruct the file line by line
i = 0
while i < len(lines):
    line = lines[i]
    
    # Check for the corrupted part in candidates table
    # It starts around the end of pedigreeLevel/companyLevel
    if 'pedigreeLevel: text("pedigree_level")' in line:
        new_lines.append(line)
        # We find companyLevel next
        i += 1
        while i < len(lines) and 'companyLevel:' not in lines[i]:
            new_lines.append(lines[i])
            i += 1
        
        if i < len(lines):
            new_lines.append(lines[i]) # companyLevel
            i += 1
            
            # Now we RE-INSERT everything that was lost
            new_lines.append('  companySector: text("company_sector"), // Technology, Finance, Healthcare, etc.\n')
            new_lines.append('  productService: text("product_service"), // SaaS, Product, Service, Hybrid\n')
            new_lines.append('  productCategory: text("product_category"), // B2B, B2C, B2B2C\n')
            new_lines.append('  productDomain: text("product_domain"), // Web Development, Mobile Apps, etc.\n')
            new_lines.append('  employmentType: text("employment_type"), // Full-time, Part-time, Contract, etc.\n')
            new_lines.append('  ownerEmployeeId: varchar("owner_employee_id"), // Recruiter or team leader who sourced/uploaded this candidate\n')
            new_lines.append('  ownerRole: text("owner_role"), // recruiter or team_leader\n')
            new_lines.append('  isActive: boolean("is_active").default(true),\n')
            new_lines.append('  isVerified: boolean("is_verified").default(false),\n')
            new_lines.append('  phoneVerified: boolean("phone_verified").default(false),\n')
            new_lines.append('  createdAt: text("created_at").notNull(),\n')
            new_lines.append('  lastViewedAt: text("last_viewed_at"), // Track when profile was last viewed\n')
            new_lines.append('  registrationStage: text("registration_stage"),\n')
            new_lines.append('  onboardingSource: text("onboarding_source"),\n')
            new_lines.append('  parsedData: json("parsed_data"),\n')
            new_lines.append('});\n\n')
            
            new_lines.append('export const otps = pgTable("otps", {\n')
            new_lines.append('  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n')
            new_lines.append('  email: text("email").notNull(),\n')
            new_lines.append('  otp: text("otp").notNull(),\n')
            new_lines.append('  expiresAt: text("expires_at").notNull(),\n')
            new_lines.append('  createdAt: text("created_at").notNull(),\n')
            new_lines.append('});\n\n')
            
            new_lines.append('export const candidateLoginAttempts = pgTable("candidate_login_attempts", {\n')
            new_lines.append('  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n')
            new_lines.append('  email: text("email").notNull(),\n')
            new_lines.append('  attempts: text("attempts").notNull().default("0"),\n')
            
            # Now we skip until we find interviewTracker (which survived)
            while i < len(lines) and 'export const interviewTracker' not in lines[i]:
                i += 1
            continue
    
    new_lines.append(line)
    i += 1

with open(schema_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Surgery successful")
