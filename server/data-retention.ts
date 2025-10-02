import { db } from "./db";
import { candidateLoginAttempts, activities, meetings, archivedRequirements } from "@shared/schema";
import { sql, lt } from "drizzle-orm";

// Data retention policy configuration
export const RETENTION_POLICIES = {
  LOGIN_ATTEMPTS: 30, // days
  ACTIVITIES: 90, // days
  MEETINGS: 90, // days
  ARCHIVED_REQUIREMENTS: 1825 // days (5 years for compliance)
};

/**
 * Clean up candidate login attempts older than 30 days
 */
export async function cleanupLoginAttempts(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.LOGIN_ATTEMPTS);
  const cutoffISO = cutoffDate.toISOString();
  
  try {
    const result = await db
      .delete(candidateLoginAttempts)
      .where(lt(candidateLoginAttempts.createdAt, cutoffISO));
    
    const deletedCount = result.rowCount ?? 0;
    console.log(`[Data Retention] Deleted ${deletedCount} login attempt records older than ${RETENTION_POLICIES.LOGIN_ATTEMPTS} days`);
    return deletedCount;
  } catch (error) {
    console.error('[Data Retention] Error cleaning up login attempts:', error);
    return 0;
  }
}

/**
 * Clean up activities older than 90 days
 */
export async function cleanupActivities(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.ACTIVITIES);
  
  // Convert date to string format matching the activities.date field (DD-MM-YYYY)
  // Note: This is a simplified version; you may need to adjust based on actual date format
  const cutoffDateStr = cutoffDate.toISOString();
  
  try {
    const result = await db
      .delete(activities)
      .where(sql`${activities.date} < ${cutoffDateStr}`);
    
    const deletedCount = result.rowCount ?? 0;
    console.log(`[Data Retention] Deleted ${deletedCount} activity records older than ${RETENTION_POLICIES.ACTIVITIES} days`);
    return deletedCount;
  } catch (error) {
    console.error('[Data Retention] Error cleaning up activities:', error);
    return 0;
  }
}

/**
 * Clean up meetings older than 90 days
 * Note: This assumes you have a meetings table with date tracking
 */
export async function cleanupMeetings(): Promise<number> {
  // Since meetings table doesn't have a date field in the current schema,
  // we'll skip this for now or log a message
  console.log(`[Data Retention] Meetings table cleanup skipped - no date tracking field in current schema`);
  return 0;
}

/**
 * Clean up archived requirements older than 5 years (keeping for compliance)
 */
export async function cleanupArchivedRequirements(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.ARCHIVED_REQUIREMENTS);
  const cutoffISO = cutoffDate.toISOString();
  
  try {
    const result = await db
      .delete(archivedRequirements)
      .where(lt(archivedRequirements.archivedAt, cutoffISO));
    
    const deletedCount = result.rowCount ?? 0;
    console.log(`[Data Retention] Deleted ${deletedCount} archived requirement records older than ${RETENTION_POLICIES.ARCHIVED_REQUIREMENTS} days (5 years)`);
    return deletedCount;
  } catch (error) {
    console.error('[Data Retention] Error cleaning up archived requirements:', error);
    return 0;
  }
}

/**
 * Run all data retention cleanup tasks
 */
export async function runDataRetentionCleanup(): Promise<{
  loginAttempts: number;
  activities: number;
  meetings: number;
  archivedRequirements: number;
}> {
  console.log('[Data Retention] Starting data retention cleanup...');
  
  const results = {
    loginAttempts: await cleanupLoginAttempts(),
    activities: await cleanupActivities(),
    meetings: await cleanupMeetings(),
    archivedRequirements: await cleanupArchivedRequirements()
  };
  
  const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0);
  console.log(`[Data Retention] Cleanup complete. Total records deleted: ${totalDeleted}`);
  
  return results;
}

/**
 * Schedule data retention cleanup to run daily at 2 AM
 */
export function scheduleDataRetentionCleanup(): void {
  // Calculate time until next 2 AM
  const now = new Date();
  const next2AM = new Date();
  next2AM.setHours(2, 0, 0, 0);
  
  // If it's past 2 AM today, schedule for tomorrow
  if (now > next2AM) {
    next2AM.setDate(next2AM.getDate() + 1);
  }
  
  const timeUntilNext = next2AM.getTime() - now.getTime();
  
  console.log(`[Data Retention] Scheduling cleanup to run at 2 AM (in ${Math.round(timeUntilNext / 1000 / 60)} minutes)`);
  
  // Schedule first cleanup
  setTimeout(() => {
    runDataRetentionCleanup();
    
    // Then schedule to run every 24 hours
    setInterval(() => {
      runDataRetentionCleanup();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
  }, timeUntilNext);
}

/**
 * Manual trigger for data retention cleanup (useful for testing)
 */
export async function triggerManualCleanup(): Promise<void> {
  console.log('[Data Retention] Manual cleanup triggered');
  await runDataRetentionCleanup();
}
