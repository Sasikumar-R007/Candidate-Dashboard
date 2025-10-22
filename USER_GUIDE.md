# 📚 StaffOS User Guide

## 🔐 Admin Login Credentials

### Default Admin Account
- **Email:** `admin@staffos.com`
- **Password:** `admin123`
- **Role:** Admin (Full access to all features)

### Other Employee Test Accounts
- **Recruiter:** 
  - Email: `recruiter@staffos.com`
  - Password: `recruiter123`
  
- **Team Leader:**
  - Email: `teamlead@staffos.com`
  - Password: `recruiter123`

### Where to Find/Edit Admin Credentials

#### 1. In the Database (Current Active Credentials)
Your admin credentials are stored in the `employees` table in your Neon PostgreSQL database.

To view or change them:
```bash
# Run the database viewer tool (created for you)
npx tsx view-database.ts
```

Or use the Replit Database UI:
- Click on "Database" in the left sidebar
- Select the `employees` table
- Find the admin user record

#### 2. In the Seed File (For Re-seeding)
Location: `server/seed.ts`

Lines 23-36 contain the admin user definition:
```typescript
{
  employeeId: "STTA001",
  name: "Admin User",
  email: "admin@staffos.com",
  password: adminPasswordHash,  // Will be hashed as "admin123"
  role: "admin",
  ...
}
```

**To change the default admin password:**
1. Edit line 17 in `server/seed.ts`
2. Change `"admin123"` to your desired password
3. Run: `npx tsx server/seed.ts` to re-seed the database

---

## 👥 How to Add New Users (Employees)

### Method 1: Using the Admin Dashboard (Recommended)

1. **Login as Admin:**
   - Go to: `/employer-login`
   - Use: `admin@staffos.com` / `admin123`

2. **Navigate to Employee Management:**
   - After login, you'll be redirected to `/admin`
   - Look for "Employee Management" or similar section

3. **Add New Employee:**
   - Click "Add Employee" or "+" button
   - Fill in the required details:
     - Employee ID (e.g., STTA003)
     - Name
     - Email
     - Password (will be hashed automatically)
     - Role (admin, recruiter, team_leader, client)
     - Phone
     - Department
     - Joining Date
     - Reporting To
   - Click "Save" or "Create"

### Method 2: Using the API Directly

```bash
# Add a new employee via API
curl -X POST http://localhost:5000/api/admin/employees \\
  -H "Content-Type: application/json" \\
  -d '{
    "employeeId": "STTA004",
    "name": "New Employee",
    "email": "newemployee@staffos.com",
    "password": "password123",
    "role": "recruiter",
    "age": "25",
    "phone": "+1234567895",
    "department": "Recruitment",
    "joiningDate": "2025-10-22",
    "reportingTo": "Admin User"
  }'
```

### Method 3: Using the Seed Script

1. Edit `server/seed.ts`
2. Add your employee data to the `employeesData` array
3. Run: `npx tsx server/seed.ts`

**Note:** Method 3 will clear existing data!

---

## 🎯 Candidate Registration & Login

### Candidates CAN Self-Register

#### Registration Flow:
1. **Go to Candidate Registration Page:**
   - Navigate to: `/candidate-login`
   - Click "Register" or "Sign Up"

2. **Fill Registration Form:**
   - Full Name
   - Email
   - Password (min 6 characters)
   - Phone (optional)
   - Company (optional)
   - Designation (optional)
   - Age (optional)
   - Location (optional)

3. **OTP Verification:**
   - After registration, an OTP will be generated
   - **Note:** Since email is not configured, check the console logs for the OTP
   - Enter the 6-digit OTP to verify your account

4. **Login:**
   - After verification, you can login with your email and password

#### Test Candidate Accounts (Already Created):
- **Email:** `candidate@example.com` / **Password:** `candidate123`
- **Email:** `bob@example.com` / **Password:** `candidate123`

#### Candidate Login Process:
1. Go to `/candidate-login`
2. Enter email and password
3. Click "Login"
4. If not verified, you'll be asked to verify OTP
5. After verification, you'll be redirected to the candidate dashboard

**Security Features:**
- After 3 failed login attempts, account is locked for 30 minutes
- Password is securely hashed with bcrypt
- OTP verification required for new accounts

---

## 👀 How to View Database Entities (Users)

### Method 1: Use the Database Viewer Tool (Created for You)

Run this command to view all data in your database:
```bash
npx tsx view-database.ts
```

This will show you:
- All employees
- All candidates
- All requirements
- Statistics and counts

### Method 2: Use Replit's Database UI

1. Click on **"Database"** in the left sidebar of Replit
2. You'll see a visual interface to browse your database
3. Click on any table to view its contents:
   - `employees` - All employee/admin users
   - `candidates` - All registered candidates
   - `users` - General user accounts
   - `profiles` - User profile information
   - `requirements` - Job requirements
   - And 19+ more tables

4. You can:
   - View all records
   - Search and filter
   - Edit individual records
   - Export data

### Method 3: Use SQL Queries

Run custom SQL queries to view specific data:

```bash
# View all employees
npx drizzle-kit studio
```

Or create custom query scripts in `query-database.ts`

---

## 🔧 Employee Management by Admin

### What Admin Can Do:

1. **Add Employees** ✅
   - Create new employee accounts
   - Assign roles (admin, recruiter, team_leader, client)
   - Set permissions

2. **Remove/Deactivate Employees** ✅
   - Soft delete (mark as inactive)
   - Employee data is preserved but account is disabled

3. **Edit Employee Details** ✅
   - Update name, email, phone, department
   - Change role or reporting structure
   - Reset passwords

4. **View All Employees** ✅
   - List all active employees
   - Filter by role, department
   - Search by name or email

### API Endpoints for Employee Management:

```typescript
// Create employee
POST /api/admin/employees
Body: { employeeId, name, email, password, role, ... }

// Get all employees
GET /api/admin/employees

// Update employee
PUT /api/admin/employees/:id
Body: { name, email, role, ... }

// Delete employee (soft delete)
DELETE /api/admin/employees/:id
```

---

## 📊 Database Tables Overview

Your StaffOS database has **24 tables**:

### User Management:
- `employees` - Employee/admin accounts
- `candidates` - Candidate accounts
- `users` - General user accounts
- `profiles` - User profiles
- `candidate_login_attempts` - Login security

### Recruitment:
- `requirements` - Job requirements
- `archived_requirements` - Historical requirements
- `job_applications` - Applications tracking
- `saved_jobs` - Saved job listings
- `interview_tracker` - Interview scheduling
- `interview_tracker_counts` - Interview statistics

### Team Management:
- `team_members` - Team structure
- `team_leader_profile` - Team leader info
- `target_metrics` - Performance targets
- `daily_metrics` - Daily performance
- `meetings` - Meeting schedules

### Other:
- `job_preferences` - Candidate preferences
- `skills` - Skills tracking
- `activities` - Activity logs
- `clients` - Client information
- `notifications` - System notifications
- `bulk_upload_jobs` - Bulk operations
- `bulk_upload_files` - File tracking
- `ceo_comments` - Management feedback

---

## 🚀 Quick Start Guide

### For Admins:
1. Login with: `admin@staffos.com` / `admin123`
2. Navigate to Admin Dashboard
3. Manage employees, candidates, and requirements
4. View reports and analytics

### For Recruiters:
1. Admin creates your account
2. Login with provided credentials
3. Access recruiter dashboard
4. Manage candidates and job requirements

### For Candidates:
1. Self-register at `/candidate-login`
2. Verify OTP (check console logs in development)
3. Complete your profile
4. Apply for jobs and track applications

---

## 🔒 Security Notes

1. **Passwords are hashed** - Never stored in plain text
2. **Session management** - Secure session handling
3. **Role-based access** - Different permissions for different roles
4. **Login protection** - Account lockout after failed attempts
5. **OTP verification** - Email verification for candidates

---

## 📝 Important Files

- `server/seed.ts` - Database seeding and test data
- `server/routes.ts` - All API endpoints
- `server/db.ts` - Database configuration
- `shared/schema.ts` - Database schema definitions
- `client/src/pages/employer-login.tsx` - Employee login page
- `client/src/pages/candidate-login.tsx` - Candidate login page

---

## 🆘 Common Issues

### "Cannot login with admin credentials"
- Make sure you ran the seed script: `npx tsx server/seed.ts`
- Check the database has the admin user
- Verify you're using the correct email/password

### "Candidate OTP not working"
- Check console logs for the generated OTP
- Email service is not configured in development
- OTP expires after 10 minutes

### "How do I reset admin password?"
1. Run: `npx tsx server/seed.ts` to reset to default
2. Or update directly in database
3. Or use the forgot password feature

---

**Last Updated:** October 22, 2025  
**Database Status:** ✅ Seeded and Ready
