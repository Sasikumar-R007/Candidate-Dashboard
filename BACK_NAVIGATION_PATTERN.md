# Back Navigation Pattern for Dashboards

This document explains how to implement proper back navigation that returns users to the correct page/tab they came from within any dashboard.

## Problem Solved
- **Before**: When navigating to sub-pages (like "View Full Database"), clicking back would return to the first tab/page of the dashboard instead of the page you came from
- **After**: Clicking back now properly returns to the exact page/tab you were on before navigation

## How It Works
The pattern uses sessionStorage to save the current active tab before navigating to a sub-page, then restores it when returning from that sub-page.

### Two-Part Implementation:

#### Part 1: Set active tab when navigating (Parent Dashboard)
Before ANY navigate call that goes to a sub-page, add these two lines:
```typescript
sessionStorage.setItem('[dashboard-name]ActiveTab', activeTab);
navigate('/sub-page-path');
```

#### Part 2: Restore active tab when entering dashboard (Parent Dashboard)
Add this restoration logic near your useState declarations:
```typescript
const initial[DashboardName]Tab = () => {
  const saved = sessionStorage.getItem('[dashboard-name]ActiveTab');
  sessionStorage.removeItem('[dashboard-name]ActiveTab');
  return saved ? saved : '[default-tab-name]';
};
const [activeTab, setActiveTab] = useState(initial[DashboardName]Tab());
```

## Implementation for Each Dashboard

### **Admin Dashboard** ✅ COMPLETED
**File**: `client/src/pages/admin-dashboard.tsx`
**State Variable**: `activeTab`
**SessionStorage Key**: `adminDashboardActiveTab`
**Default Tab**: `'team'`
**Sub-page Routes**: `/master-database`, `/archives`

**Status**: ✅ WORKING - All navigate calls to `/master-database` have sessionStorage.setItem. The `/archives` navigate was missing sessionStorage.setItem (FIXED).

**Example Code:**
```typescript
// Restoration (lines ~912-916)
const initialActiveTab = () => {
  const saved = sessionStorage.getItem('adminDashboardActiveTab');
  sessionStorage.removeItem('adminDashboardActiveTab');
  return saved ? saved : 'team';
};
const [activeTab, setActiveTab] = useState(initialActiveTab());

// Navigation (example)
const handleArchivesClick = () => {
  sessionStorage.setItem('adminDashboardActiveTab', activeTab);
  navigate('/archives');
};
```

---

### **Client Dashboard** - NEEDS IMPLEMENTATION
**File**: `client/src/pages/client-dashboard.tsx`
**Default Tab**: Check the first tab in the dashboard
**Sub-page Routes**: Check for any navigate() calls to sub-pages

**Steps**:
1. Find the state variable that tracks active tab/page (likely `const [activeTab, setActiveTab] = useState('...')`)
2. Replace it with the restoration pattern shown above
3. Find all navigate() calls to sub-pages and wrap them with sessionStorage.setItem
4. Test by clicking on any page/tab → clicking "View Full Database" or any sub-page → clicking back

---

### **Recruiter Dashboard** - NEEDS IMPLEMENTATION  
**File**: `client/src/pages/recruiter-dashboard-2.tsx`
**Default Tab**: Check the first tab in the dashboard
**Sub-page Routes**: Check for any navigate() calls to sub-pages

**Steps**:
1. Find the state variable that tracks active tab/page
2. Replace it with the restoration pattern
3. Find all navigate() calls to sub-pages and wrap them with sessionStorage.setItem
4. Test navigation

---

### **Team Leader Dashboard** - NEEDS IMPLEMENTATION
**File**: `client/src/pages/team-leader-dashboard.tsx`
**Default Tab**: Check the first tab in the dashboard
**Sub-page Routes**: Check for any navigate() calls to sub-pages

**Steps**:
1. Find the state variable that tracks active tab/page
2. Replace it with the restoration pattern
3. Find all navigate() calls to sub-pages and wrap them with sessionStorage.setItem
4. Test navigation

---

### **Candidate Dashboard** - NEEDS IMPLEMENTATION
**File**: `client/src/pages/dashboard.tsx` or `client/src/pages/candidate-dashboard.tsx`
**Default Tab**: Check the first tab in the dashboard
**Sub-page Routes**: Check for any navigate() calls to sub-pages

**Steps**:
1. Find the state variable that tracks active tab/page
2. Replace it with the restoration pattern
3. Find all navigate() calls to sub-pages and wrap them with sessionStorage.setItem
4. Test navigation

---

## Key Points to Remember

1. **Session Storage Key Naming**: Use `[dashboardName]ActiveTab` format (e.g., `clientDashboardActiveTab`, `recruiterDashboardActiveTab`)

2. **Always Remove After Reading**: The restoration function should ALWAYS call `sessionStorage.removeItem()` after reading to prevent stale data
   ```typescript
   const saved = sessionStorage.getItem('[dashboard-name]ActiveTab');
   sessionStorage.removeItem('[dashboard-name]ActiveTab'); // IMPORTANT!
   ```

3. **Apply to ALL Sub-page Navigations**: Every navigate() call to a sub-page needs the sessionStorage.setItem BEFORE the navigate call

4. **Sub-page Back Button**: Sub-pages can safely use `window.history.back()` since the browser's back button will naturally return to the parent dashboard, and sessionStorage will restore the correct tab

## Testing the Implementation

1. Open the dashboard and note which page you're on (e.g., "Master Data" in Admin Dashboard)
2. Click on a button that navigates to a sub-page (e.g., "View Full Database")
3. On the sub-page, click the "Back" button or use browser back
4. **Expected Result**: You should return to the exact page you were on before (e.g., "Master Data"), not the default first page

## Files Modified
- ✅ `client/src/pages/admin-dashboard.tsx` - COMPLETE
- [ ] `client/src/pages/client-dashboard.tsx` - TODO
- [ ] `client/src/pages/recruiter-dashboard-2.tsx` - TODO
- [ ] `client/src/pages/team-leader-dashboard.tsx` - TODO
- [ ] `client/src/pages/dashboard.tsx` or candidate-dashboard.tsx - TODO
