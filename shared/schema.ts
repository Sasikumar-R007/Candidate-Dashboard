import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  education: text("education"),
  portfolio: text("portfolio"),
  mobile: text("mobile"),
  whatsapp: text("whatsapp"),
  primaryEmail: text("primary_email"),
  secondaryEmail: text("secondary_email"),
  currentLocation: text("current_location"),
  preferredLocation: text("preferred_location"),
  dateOfBirth: text("date_of_birth"),
  portfolioUrl: text("portfolio_url"),
  websiteUrl: text("website_url"),
  linkedinUrl: text("linkedin_url"),
  profilePicture: text("profile_picture"),
  bannerImage: text("banner_image"),
  resumeFile: text("resume_file"),
  appliedJobsCount: text("applied_jobs_count").default("0"),
  // Education fields
  highestQualification: text("highest_qualification"),
  collegeName: text("college_name"),
  skills: text("skills"),
  // Job details fields
  pedigreeLevel: text("pedigree_level"),
  noticePeriod: text("notice_period"),
  currentCompany: text("current_company"),
  currentRole: text("current_role"),
  currentDomain: text("current_domain"),
  companyLevel: text("company_level"),
  productService: text("product_service"),
});

export const jobPreferences = pgTable("job_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  jobTitles: text("job_titles").notNull(),
  workMode: text("work_mode").notNull(),
  employmentType: text("employment_type").notNull(),
  locations: text("locations").notNull(),
  startDate: text("start_date").notNull(),
  instructions: text("instructions"),
});

export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // primary, secondary, knowledge
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  type: text("type").notNull(), // resume_update, job_applied
  description: text("description").notNull(),
  date: text("date").notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  jobType: text("job_type").notNull(),
  appliedDate: text("applied_date").notNull(),
  daysAgo: text("days_ago").notNull(),
});

export const savedJobs = pgTable("saved_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  jobType: text("job_type").notNull(),
  savedDate: text("saved_date").notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  salary: text("salary").notNull(),
  year: text("year").notNull(),
  profilesCount: text("profiles_count").notNull().default("0"),
});

export const teamLeaderProfile = pgTable("team_leader_profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  employeeId: text("employee_id").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  joiningDate: text("joining_date").notNull(),
  department: text("department").notNull(),
  reportingTo: text("reporting_to").notNull(),
  totalContribution: text("total_contribution").notNull().default("2,50,000"),
});

export const targetMetrics = pgTable("target_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currentQuarter: text("current_quarter").notNull(),
  minimumTarget: text("minimum_target").notNull(),
  targetAchieved: text("target_achieved").notNull(),
  incentiveEarned: text("incentive_earned").notNull(),
});

export const dailyMetrics = pgTable("daily_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  totalRequirements: text("total_requirements").notNull(),
  completedRequirements: text("completed_requirements").notNull(),
  avgResumesPerRequirement: text("avg_resumes_per_requirement").notNull(),
  requirementsPerRecruiter: text("requirements_per_recruiter").notNull(),
  dailyDeliveryDelivered: text("daily_delivery_delivered").notNull(),
  dailyDeliveryDefaulted: text("daily_delivery_defaulted").notNull(),
});

export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // TL's Meeting, CEO's Meeting
  count: text("count").notNull(),
});

export const ceoComments = pgTable("ceo_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  comment: text("comment").notNull(),
  date: text("date").notNull(),
});

export const requirements = pgTable("requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  position: text("position").notNull(),
  criticality: text("criticality").notNull(), // HIGH, MEDIUM, LOW
  company: text("company").notNull(),
  spoc: text("spoc").notNull(),
  talentAdvisor: text("talent_advisor"),
  teamLead: text("team_lead"),
  isArchived: boolean("is_archived").default(false),
  createdAt: text("created_at").notNull(),
});

export const archivedRequirements = pgTable("archived_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  position: text("position").notNull(),
  criticality: text("criticality").notNull(),
  company: text("company").notNull(),
  spoc: text("spoc").notNull(),
  talentAdvisor: text("talent_advisor"),
  teamLead: text("team_lead"),
  archivedAt: text("archived_at").notNull(),
  originalId: varchar("original_id").notNull(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull().unique(), // STTA001, STTL001, STCL001
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // recruiter, team_leader, client, admin
  age: text("age"),
  phone: text("phone"),
  department: text("department"),
  joiningDate: text("joining_date"),
  reportingTo: text("reporting_to"),
  isActive: boolean("is_active").default(true),
  createdAt: text("created_at").notNull(),
});

export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: text("candidate_id").notNull().unique(), // STCA001 format
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  // Additional candidate details
  phone: text("phone"),
  company: text("company"),
  designation: text("designation"),
  age: text("age"),
  location: text("location"),
  experience: text("experience"),
  skills: text("skills"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: text("created_at").notNull(),
});

export const candidateLoginAttempts = pgTable("candidate_login_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  attempts: text("attempts").notNull().default("0"),
  lastAttemptAt: text("last_attempt_at"),
  lockedUntil: text("locked_until"), // ISO timestamp for 30-minute lockout
  createdAt: text("created_at").notNull(),
});

export const interviewTracker = pgTable("interview_tracker", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateName: text("candidate_name").notNull(),
  position: text("position").notNull(),
  client: text("client").notNull(),
  interviewDate: text("interview_date").notNull(),
  interviewTime: text("interview_time").notNull(),
  interviewType: text("interview_type").notNull(), // video, phone, in-person
  interviewRound: text("interview_round").notNull(), // L1, L2, HR, etc.
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, rescheduled
  recruiterName: text("recruiter_name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
});

export const interviewTrackerCounts = pgTable("interview_tracker_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  todayScheduled: text("today_scheduled").notNull().default("0"),
  pendingCases: text("pending_cases").notNull().default("0"),
  completedToday: text("completed_today").notNull().default("0"),
  rescheduledToday: text("rescheduled_today").notNull().default("0"),
  cancelledToday: text("cancelled_today").notNull().default("0"),
  recruiterName: text("recruiter_name").notNull(),
  date: text("date").notNull(),
  updatedAt: text("updated_at"),
});

// Bulk upload tables
export const bulkUploadJobs = pgTable("bulk_upload_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: text("job_id").notNull().unique(),
  adminId: text("admin_id").notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  totalFiles: text("total_files").notNull(),
  processedFiles: text("processed_files").notNull().default("0"),
  successfulFiles: text("successful_files").notNull().default("0"),
  failedFiles: text("failed_files").notNull().default("0"),
  errorReportUrl: text("error_report_url"),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const bulkUploadFiles = pgTable("bulk_upload_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: text("job_id").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: text("file_size").notNull(),
  fileType: text("file_type").notNull(), // pdf, docx
  status: text("status").notNull().default("pending"), // pending, processing, success, failed
  candidateId: text("candidate_id"), // Created candidate ID if successful
  errorMessage: text("error_message"),
  parsedText: text("parsed_text"),
  extractedName: text("extracted_name"),
  extractedEmail: text("extracted_email"),
  extractedPhone: text("extracted_phone"),
  resumeUrl: text("resume_url"),
  processedAt: text("processed_at"),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // bulk_upload_complete, bulk_upload_failed, general
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"), // read, unread
  relatedJobId: text("related_job_id"), // For bulk upload notifications
  createdAt: text("created_at").notNull(),
  readAt: text("read_at"),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientCode: text("client_code").notNull().unique(),
  brandName: text("brand_name").notNull(),
  incorporatedName: text("incorporated_name"),
  gstin: text("gstin"),
  address: text("address"),
  location: text("location"),
  spoc: text("spoc"),
  email: text("email"),
  website: text("website"),
  linkedin: text("linkedin"),
  agreement: text("agreement"),
  percentage: text("percentage"),
  category: text("category"),
  paymentTerms: text("payment_terms"),
  source: text("source"),
  startDate: text("start_date"),
  referral: text("referral"),
  currentStatus: text("current_status").default("active"), // active, frozen, churned
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
});

export const insertJobPreferencesSchema = createInsertSchema(jobPreferences).omit({
  id: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
});

export const insertSavedJobSchema = createInsertSchema(savedJobs).omit({
  id: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
});

export const insertTeamLeaderProfileSchema = createInsertSchema(teamLeaderProfile).omit({
  id: true,
});

export const insertTargetMetricsSchema = createInsertSchema(targetMetrics).omit({
  id: true,
});

export const insertDailyMetricsSchema = createInsertSchema(dailyMetrics).omit({
  id: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
});

export const insertCeoCommentSchema = createInsertSchema(ceoComments).omit({
  id: true,
});

export const insertRequirementSchema = createInsertSchema(requirements).omit({
  id: true,
});

export const insertArchivedRequirementSchema = createInsertSchema(archivedRequirements).omit({
  id: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
});

export const insertCandidateLoginAttemptsSchema = createInsertSchema(candidateLoginAttempts).omit({
  id: true,
});

export const insertInterviewTrackerSchema = createInsertSchema(interviewTracker).omit({
  id: true,
});

export const insertInterviewTrackerCountsSchema = createInsertSchema(interviewTrackerCounts).omit({
  id: true,
});

export const insertBulkUploadJobSchema = createInsertSchema(bulkUploadJobs).omit({
  id: true,
});

export const insertBulkUploadFileSchema = createInsertSchema(bulkUploadFiles).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertJobPreferences = z.infer<typeof insertJobPreferencesSchema>;
export type JobPreferences = typeof jobPreferences.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamLeaderProfile = z.infer<typeof insertTeamLeaderProfileSchema>;
export type TeamLeaderProfile = typeof teamLeaderProfile.$inferSelect;
export type InsertTargetMetrics = z.infer<typeof insertTargetMetricsSchema>;
export type TargetMetrics = typeof targetMetrics.$inferSelect;
export type InsertDailyMetrics = z.infer<typeof insertDailyMetricsSchema>;
export type DailyMetrics = typeof dailyMetrics.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertCeoComment = z.infer<typeof insertCeoCommentSchema>;
export type CeoComment = typeof ceoComments.$inferSelect;
export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type Requirement = typeof requirements.$inferSelect;
export type InsertArchivedRequirement = z.infer<typeof insertArchivedRequirementSchema>;
export type ArchivedRequirement = typeof archivedRequirements.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidateLoginAttempts = z.infer<typeof insertCandidateLoginAttemptsSchema>;
export type CandidateLoginAttempts = typeof candidateLoginAttempts.$inferSelect;
export type InsertInterviewTracker = z.infer<typeof insertInterviewTrackerSchema>;
export type InterviewTracker = typeof interviewTracker.$inferSelect;
export type InsertInterviewTrackerCounts = z.infer<typeof insertInterviewTrackerCountsSchema>;
export type InterviewTrackerCounts = typeof interviewTrackerCounts.$inferSelect;
export type InsertBulkUploadJob = z.infer<typeof insertBulkUploadJobSchema>;
export type BulkUploadJob = typeof bulkUploadJobs.$inferSelect;
export type InsertBulkUploadFile = z.infer<typeof insertBulkUploadFileSchema>;
export type BulkUploadFile = typeof bulkUploadFiles.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
