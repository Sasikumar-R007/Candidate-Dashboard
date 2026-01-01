# Defaulted Count Explanation

## What is "Defaulted"?

**Defaulted** represents the **shortfall** or **gap** between the number of resumes **required** and the number **delivered** for a given date.

## Formula

```
Defaulted = max(0, Total Resumes Required - Total Resumes Delivered)
```

## Real Use Case

### Purpose:

- **Performance Tracking**: Shows how many resumes are still needed to meet the target
- **Gap Analysis**: Helps identify which requirements are falling short
- **Daily Accountability**: Tracks daily delivery performance against targets

### Example Scenario:

**Requirement**: Software Developer (HIGH criticality, MEDIUM toughness)

- **Target**: 3 resumes required
- **Delivered**: 1 resume submitted
- **Defaulted**: 3 - 1 = **2 resumes defaulted**

This means the recruiter still needs to deliver 2 more resumes to meet the requirement target.

## How It's Calculated

1. **Total Resumes Required**: Sum of all resume targets for all requirements assigned to the recruiter

   - Each requirement has a target based on `criticality` and `toughness`
   - Formula: `getResumeTarget(criticality, toughness)`

2. **Total Resumes Delivered**: Count of:

   - Resume submissions from `resume_submissions` table (filtered by date and recruiter)
   - Tagged candidates from `job_applications` table where `source = 'recruiter_tagged'` (filtered by date)

3. **Defaulted**: The difference between required and delivered

## When Defaulted = 0

- All requirements are fully met
- No shortfall in resume delivery
- Perfect performance for that day

## When Defaulted > 0

- Indicates incomplete delivery
- Shows how many resumes are still needed
- Helps prioritize which requirements need attention

## Business Value

1. **Performance Monitoring**: Track daily delivery gaps
2. **Resource Planning**: Identify which recruiters need support
3. **Target Achievement**: Measure progress toward meeting requirements
4. **Accountability**: Clear metric for daily performance

## Note

The count is **date-based**, meaning it shows the defaulted count for the selected date. This allows tracking performance over time and identifying trends.
