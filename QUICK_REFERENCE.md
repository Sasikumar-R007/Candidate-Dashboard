# 🚀 Quick Reference Guide - StaffOS

## 🔑 Admin Login

**Go to:** `/employer-login`

**Credentials:**
```
Email: admin@staffos.com
Password: admin123
```

After login, you'll be redirected to `/admin` dashboard.

---

## 📋 All Test Accounts

### Employees (Login at `/employer-login`)

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | admin@staffos.com | admin123 | /admin |
| Recruiter | recruiter@staffos.com | recruiter123 | /recruiter-login-2 |
| Team Leader | teamlead@staffos.com | recruiter123 | /team-leader |

### Candidates (Login at `/candidate-login`)

| Name | Email | Password |
|------|-------|----------|
| Jane Candidate | candidate@example.com | candidate123 |
| Bob Developer | bob@example.com | candidate123 |

---

## 👥 How to Add New Employees (Admin Only)

### Option 1: Via Admin Dashboard (UI)
1. Login as admin
2. Navigate to Employee Management section
3. Click "Add Employee" button
4. Fill in the form and save

### Option 2: Via API
```bash
curl -X POST http://localhost:5000/api/admin/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "STTA005",
    "name": "New Employee Name",
    "email": "newemp@staffos.com",
    "password": "password123",
    "role": "recruiter",
    "age": "28",
    "phone": "+1234567890",
    "department": "Recruitment",
    "joiningDate": "2025-10-22",
    "reportingTo": "Admin User"
  }'
```

**Available Roles:**
- `admin` - Full system access
- `recruiter` - Recruitment operations
- `team_leader` - Team management
- `client` - Client portal access

---

## 🎯 Candidate Registration

**Candidates CAN self-register!**

1. Go to `/candidate-login`
2. Click "Register" or "Sign Up"
3. Fill in registration form
4. Verify OTP (check console logs in development)
5. Login and access candidate dashboard

**Note:** In development, OTP is printed to console. In production, it would be sent via email.

---

## 👀 View Database Entities

### Quick View Command:
```bash
npx tsx view-database.ts
```

This shows:
- All employees with details
- All candidates with status
- All job requirements
- Database statistics

### Via Replit Database UI:
1. Click "Database" in left sidebar
2. Browse tables:
   - `employees` - All staff/admin users
   - `candidates` - All registered candidates
   - `users` - General user accounts
   - `profiles` - User profile data
   - Plus 20 more tables!

---

## 🔧 Useful Commands

```bash
# Seed database with test data
npx tsx server/seed.ts

# View all database entities
npx tsx view-database.ts

# Test database connection
npx tsx test-db-connection.ts

# Push schema changes to database
npm run db:push

# Start the application
npm run dev
```

---

## 📁 Where to Find Things

### Admin Credentials:
- **Active (Database):** `employees` table → admin@staffos.com
- **Source Code:** `server/seed.ts` (line 17, 23-36)
- **To Change:** Edit seed.ts and re-run seeding

### API Routes:
- `server/routes.ts` - All API endpoints
- Employee auth: `/api/auth/employee-login`
- Candidate auth: `/api/auth/candidate-login`, `/api/auth/candidate-register`
- Employee CRUD: `/api/admin/employees`

### Database Config:
- `server/db.ts` - Database connection
- `shared/schema.ts` - Table definitions
- `drizzle.config.ts` - Drizzle configuration

### Frontend Pages:
- `client/src/pages/employer-login.tsx` - Employee login
- `client/src/pages/candidate-login.tsx` - Candidate login/register
- `client/src/pages/admin/` - Admin dashboard (if exists)

---

## 🎯 Current Database Status

✅ **3 Employees:**
- 1 Admin
- 1 Recruiter  
- 1 Team Leader

✅ **2 Candidates:**
- Both verified and active

✅ **2 Job Requirements:**
- Senior Frontend Developer (HIGH priority)
- Backend Engineer (MEDIUM priority)

**Last Seeded:** October 22, 2025

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ Session management
- ✅ Role-based access control
- ✅ Login attempt tracking
- ✅ Account lockout (3 failed attempts = 30 min lockout)
- ✅ OTP verification for candidates
- ✅ Soft delete for data preservation

---

## 📚 Documentation Files

1. **USER_GUIDE.md** - Complete user guide (this file is detailed!)
2. **DATABASE_STATUS_REPORT.md** - Database technical details
3. **QUICK_REFERENCE.md** - This quick reference
4. **README.md** - Project readme

---

## 🚨 Quick Troubleshooting

**Can't login as admin?**
```bash
npx tsx server/seed.ts
# Then use: admin@staffos.com / admin123
```

**Need to reset database?**
```bash
npx tsx server/seed.ts
# This clears and re-seeds all data
```

**Want to see what's in the database?**
```bash
npx tsx view-database.ts
```

---

**Your StaffOS application is ready to use! 🎉**
