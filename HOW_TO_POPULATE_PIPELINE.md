# How to Populate the Recruiter Pipeline

## Why is the Pipeline Empty?

The pipeline shows candidates based on:
1. **Date Filter** - Only shows candidates tagged/applied on the selected date
2. **Tagged Candidates** - Candidates you've tagged to requirements
3. **Job Applications** - Candidates who applied to your job postings

---

## Solution 1: Fix the Date Filter (Most Common Issue)

### Problem:
The date filter is set to **01-02-2026** (February 1, 2026), which is a future date. This filters out all candidates.

### Fix:
1. **Click on the date picker** in the top right of the Pipeline page
2. **Select today's date** (or the date when candidates were tagged)
3. **Or clear the date filter** to show all candidates

---

## Solution 2: Tag Candidates to Requirements

To add candidates to the pipeline, you need to **tag them to a requirement**:

### Steps:
1. **Go to "Source Resume" page** (from the sidebar)
2. **Search for candidates** using filters or keywords
3. **Click on a candidate** to view their profile
4. **Click "Tag to Requirement"** button
5. **Select a requirement** from the dropdown
6. **Click "Tag Candidate"**

The candidate will now appear in your pipeline with status "In-Process" (or "Sourced").

---

## Solution 3: Post Jobs and Get Applications

Candidates who apply to your job postings will automatically appear in the pipeline:

### Steps:
1. **Go to "Active Jobs" tab** in the recruiter dashboard
2. **Click "Post Job"** to create a new job posting
3. **Fill in job details** (title, company, description, etc.)
4. **Publish the job**
5. **Candidates can apply** from the job board
6. **Applications appear in your pipeline** automatically

---

## Solution 4: Check if Candidates Exist

If you've already tagged candidates but they're not showing:

### Check:
1. **Go to "Applicant Overview" tab** - Do you see candidates there?
2. **Check the date filter** - Is it set to the correct date?
3. **Check candidate status** - Candidates with status "Archived" or "Screened Out" won't show in pipeline
4. **Check the requirement** - Make sure you tagged them to a valid requirement

---

## Pipeline Stages Mapping

Candidates appear in pipeline stages based on their status:

| Pipeline Stage | Status Values |
|---------------|---------------|
| **Level 1** | L1 |
| **Level 2** | L2 |
| **Level 3** | L3 |
| **Final Round** | Final Round |
| **HR Round** | HR Round |
| **Offer Stage** | Offer Stage, Selected |
| **Closure** | Closure, Joined |

**Note:** Candidates with status "In-Process" or "Sourced" appear in the "Sourced" stage (if that stage exists in your pipeline view).

---

## Quick Fix Checklist

- [ ] **Change date filter to today's date** (or clear it)
- [ ] **Tag at least one candidate** from Source Resume page
- [ ] **Check Applicant Overview** to see if candidates exist
- [ ] **Update candidate status** to L1, L2, L3, etc. to see them in pipeline stages
- [ ] **Refresh the page** after tagging candidates

---

## Still Empty?

If the pipeline is still empty after trying the above:

1. **Check browser console** for errors (F12 → Console tab)
2. **Check network tab** - Is `/api/recruiter/applications` returning data?
3. **Verify you're logged in** as a recruiter
4. **Contact admin** to verify your account has proper permissions

---

**Most Common Issue:** The date filter is set to a future date. **Change it to today's date or clear it!**

