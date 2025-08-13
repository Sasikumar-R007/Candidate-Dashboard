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
