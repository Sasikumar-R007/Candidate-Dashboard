# Client JD Flow - Current Status & Next Steps

## 📋 **How the Current JD Flow Works**

### **Step 1: Client Submits JD** ✅ COMPLETE
**Location:** `client/src/pages/client-dashboard.tsx` (Dashboard tab)

1. **Client fills JD form:**
   - Uploads JD file (PDF/DOCX) OR writes JD text
   - Enters Primary Skills
   - Enters Secondary Skills  
   - Enters Knowledge Only skills
   - Enters Special Instructions

2. **Client clicks "Preview & Submit":**
   - Opens preview modal showing job card with all entered data
   - Client reviews the preview

3. **Client clicks "Submit" in preview:**
   - If file uploaded → Uploads to `/api/client/upload-jd-file`
   - Submits JD data to `/api/client/submit-jd`
   - Backend creates a **Requirement** record in database

### **Step 2: Backend Processing** ⚠️ PARTIALLY COMPLETE
**Location:** `server/routes.ts` (lines 7053-7129)

**What happens:**
1. ✅ Validates client authentication
2. ✅ Gets client company name from employee profile
3. ✅ Uploads JD file (if provided)
4. ✅ Creates Requirement record with:
   - `position: 'Position from JD'` (hardcoded - **ISSUE**)
   - `criticality: 'Medium'` (default)
   - `toughness: 'Medium'` (default)
   - `company: companyName`
   - `spoc: client.spoc || employee.name`
   - `talentAdvisor: null` (not assigned yet)
   - `teamLead: null` (not assigned yet)
   - `status: 'open'`

**⚠️ PROBLEM:** JD details (text, file URL, skills, instructions) are **NOT stored** in database!
- The `jdDetails` object is created but never saved
- Requirements table has no field for JD text/file/skills
- This data is **LOST** after submission

### **Step 3: Requirement Appears in Client Dashboard** ✅ COMPLETE
**Location:** `client/src/pages/client-dashboard.tsx` (Dashboard tab - "Roles & Status" table)

- Client can see their submitted requirements in the "Roles & Status" table
- Shows: Role ID, Role, Team, Recruiter, Shared on, Status, Profiles Shared, Last Active
- Data fetched from `/api/client/requirements`

---

## 🛑 **Where the Flow STOPS**

### **Issue #1: JD Data Not Persisted** ❌
**Problem:** JD text, file URL, skills, and instructions are not saved to database.

**Current Code:**
```typescript
// server/routes.ts line 7085-7118
const jdDetails = {
  jdText: jdText || null,
  jdFile: jdFile || null,
  primarySkills: primarySkills || null,
  // ... all JD data
};
// ❌ This object is created but NEVER saved!
```

**Impact:**
- Admin/Team Lead cannot see the actual JD content
- Cannot extract position name from JD
- Skills and instructions are lost
- Cannot review or edit JD later

### **Issue #2: Position Name is Hardcoded** ❌
**Problem:** All requirements created from JD have position = `'Position from JD'`

**Current Code:**
```typescript
position: 'Position from JD', // ❌ Hardcoded, not extracted from JD
```

**Impact:**
- All client-submitted JDs show same position name
- Cannot identify different roles
- Makes tracking impossible

### **Issue #3: No Assignment Flow** ❌
**Problem:** Requirements created from JD have:
- `talentAdvisor: null`
- `teamLead: null`

**What should happen:**
1. Admin/Team Lead should see new requirements from clients
2. Admin assigns Team Lead
3. Team Lead assigns Talent Advisor (Recruiter)
4. Recruiter starts sourcing candidates

**Current Status:** Requirements are created but **orphaned** - no one is assigned to work on them.

### **Issue #4: No JD Review/Edit** ❌
**Problem:** Once submitted, JD cannot be:
- Viewed by Admin/Team Lead
- Edited by Client
- Updated with extracted position name

---

## 🔧 **What Needs to Be Done Next**

### **Priority 1: Store JD Data in Database** 🔴 CRITICAL

**Option A: Add fields to requirements table (Recommended)**
```sql
ALTER TABLE requirements ADD COLUMN jd_text TEXT;
ALTER TABLE requirements ADD COLUMN jd_file_url TEXT;
ALTER TABLE requirements ADD COLUMN primary_skills TEXT;
ALTER TABLE requirements ADD COLUMN secondary_skills TEXT;
ALTER TABLE requirements ADD COLUMN knowledge_only TEXT;
ALTER TABLE requirements ADD COLUMN special_instructions TEXT;
```

**Option B: Create separate JD table**
```sql
CREATE TABLE job_descriptions (
  id VARCHAR PRIMARY KEY,
  requirement_id VARCHAR REFERENCES requirements(id),
  jd_text TEXT,
  jd_file_url TEXT,
  primary_skills TEXT,
  secondary_skills TEXT,
  secondary_skills TEXT,
  knowledge_only TEXT,
  special_instructions TEXT,
  submitted_at TIMESTAMP
);
```

**Action Required:**
1. Update `shared/schema.ts` to add JD fields
2. Update `server/routes.ts` to save JD data when creating requirement
3. Update `server/database-storage.ts` if needed

### **Priority 2: Extract Position Name from JD** 🟡 HIGH

**Options:**
1. **Simple:** Add position input field in JD form (client enters it)
2. **Advanced:** Use AI/NLP to extract position from JD text
3. **Hybrid:** Client enters position, system validates against JD

**Action Required:**
1. Add position field to JD form in `client-dashboard.tsx`
2. Update backend to save position from form
3. (Optional) Add position extraction logic

### **Priority 3: Admin/Team Lead Assignment Flow** 🟡 HIGH

**What needs to be built:**
1. **Admin Dashboard:**
   - View all client-submitted requirements
   - See JD details (text/file)
   - Assign Team Lead
   - Update position name if needed

2. **Team Lead Dashboard:**
   - View requirements assigned to their team
   - See JD details
   - Assign Talent Advisor (Recruiter)
   - Update criticality/toughness

3. **Notification System:**
   - Notify Admin when new JD is submitted
   - Notify Team Lead when requirement is assigned

**Action Required:**
1. Create API endpoints:
   - `GET /api/admin/client-requirements` - Get all client-submitted requirements
   - `PATCH /api/admin/requirements/:id/assign-team-lead` - Assign team lead
   - `PATCH /api/team-lead/requirements/:id/assign-recruiter` - Assign recruiter
2. Update Admin dashboard to show client requirements
3. Update Team Lead dashboard to show assigned requirements

### **Priority 4: JD Review & Edit** 🟢 MEDIUM

**Features needed:**
1. Client can view their submitted JDs
2. Client can edit JD (if not yet assigned)
3. Admin/Team Lead can view JD details
4. Extract and display position from JD

**Action Required:**
1. Create JD detail view modal
2. Add edit functionality (with status check)
3. Add JD viewer component (for file display)

### **Priority 5: Position Extraction** 🟢 LOW (Nice to have)

**If implementing AI extraction:**
1. Add position extraction service
2. Extract position when JD is submitted
3. Show extracted position to client for confirmation
4. Save confirmed position

---

## 📊 **Current Data Flow Diagram**

```
┌─────────────────┐
│  Client         │
│  Dashboard      │
└────────┬────────┘
         │
         │ 1. Fill JD Form
         │    - JD Text/File
         │    - Skills
         │    - Instructions
         │
         ▼
┌─────────────────┐
│  Preview Modal  │
└────────┬────────┘
         │
         │ 2. Submit
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  /submit-jd     │
└────────┬────────┘
         │
         │ 3. Create Requirement
         │    ✅ Saved: position, company, spoc, status
         │    ❌ LOST: jdText, jdFile, skills, instructions
         │
         ▼
┌─────────────────┐
│  Database       │
│  requirements   │
│  table          │
└────────┬────────┘
         │
         │ 4. Requirement visible
         │    in Client Dashboard
         │
         ▼
┌─────────────────┐
│  Client         │
│  Dashboard      │
│  "Roles &       │
│   Status"       │
└─────────────────┘

         │
         │ ❌ STOPS HERE
         │
         │ No assignment
         │ No JD details visible
         │ No position extraction
```

---

## 🎯 **Recommended Next Steps**

### **Immediate (This Week):**
1. ✅ **Add JD fields to requirements table** - Store JD data
2. ✅ **Add position field to JD form** - Let client enter position
3. ✅ **Update backend to save JD data** - Persist all JD information

### **Short Term (Next Week):**
4. ✅ **Admin view of client requirements** - See all client-submitted JDs
5. ✅ **Admin assignment flow** - Assign Team Lead to requirements
6. ✅ **Team Lead assignment flow** - Assign Recruiter to requirements

### **Medium Term (Next 2 Weeks):**
7. ✅ **JD detail view** - Show full JD to Admin/Team Lead/Recruiter
8. ✅ **Notification system** - Alert when new JD submitted
9. ✅ **JD edit functionality** - Allow client to edit before assignment

---

## 📝 **Summary**

**What Works:**
- ✅ Client can submit JD (text or file)
- ✅ JD preview modal works
- ✅ Requirement is created in database
- ✅ Requirement appears in client dashboard

**What's Broken:**
- ❌ JD details (text, file, skills) are NOT saved
- ❌ Position name is hardcoded
- ❌ No assignment flow (requirements are orphaned)
- ❌ No way to view JD details after submission

**What's Missing:**
- ❌ Database schema for JD storage
- ❌ Admin/Team Lead views of client requirements
- ❌ Assignment workflow
- ❌ JD detail viewing/editing

**Next Critical Step:** Add JD fields to database schema and save JD data when creating requirement.

