import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('shared/schema.ts');
let content = fs.readFileSync(schemaPath, 'utf-8');

const insertPoint = 'export const insertUserSchema';
const missingTables = '\n' +
'export const interviewTracker = pgTable("interview_tracker", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  candidateName: text("candidate_name").notNull(),\n' +
'  position: text("position").notNull(),\n' +
'  client: text("client").notNull(),\n' +
'  interviewDate: text("interview_date").notNull(),\n' +
'  interviewTime: text("interview_time").notNull(),\n' +
'  interviewType: text("interview_type").notNull(), // video, phone, in-person\n' +
'  interviewRound: text("interview_round").notNull(), // L1, L2, HR, etc.\n' +
'  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, rescheduled\n' +
'  recruiterName: text("recruiter_name").notNull(),\n' +
'  createdAt: text("created_at").notNull(),\n' +
'  updatedAt: text("updated_at"),\n' +
'});\n' +
'\n' +
'export const interviewTrackerCounts = pgTable("interview_tracker_counts", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  todayScheduled: text("today_scheduled").notNull().default("0"),\n' +
'  pendingCases: text("pending_cases").notNull().default("0"),\n' +
'  completedToday: text("completed_today").notNull().default("0"),\n' +
'  rescheduledToday: text("rescheduled_today").notNull().default("0"),\n' +
'  cancelledToday: text("cancelled_today").notNull().default("0"),\n' +
'  recruiterName: text("recruiter_name").notNull(),\n' +
'  date: text("date").notNull(),\n' +
'  updatedAt: text("updated_at"),\n' +
'});\n' +
'\n' +
'export const notifications = pgTable("notifications", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  userId: text("user_id").notNull(),\n' +
'  type: text("type").notNull(), // bulk_upload_complete, bulk_upload_failed, general\n' +
'  title: text("title").notNull(),\n' +
'  message: text("message").notNull(),\n' +
'  status: text("status").notNull().default("unread"), // read, unread\n' +
'  relatedJobId: text("related_job_id"), // For bulk upload notifications\n' +
'  createdAt: text("created_at").notNull(),\n' +
'  readAt: text("read_at"),\n' +
'});\n' +
'\n' +
'export const impactMetrics = pgTable("impact_metrics", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  clientId: text("client_id"), // Optional - can be null for global metrics\n' +
'  speedToHire: real("speed_to_hire").notNull().default(15),\n' +
'  revenueImpactOfDelay: real("revenue_impact_of_delay").notNull().default(75000),\n' +
'  clientNps: real("client_nps").notNull().default(60),\n' +
'  candidateNps: real("candidate_nps").notNull().default(70),\n' +
'  feedbackTurnAround: real("feedback_turn_around").notNull().default(2),\n' +
'  feedbackTurnAroundAvgDays: real("feedback_turn_around_avg_days").notNull().default(5),\n' +
'  firstYearRetentionRate: real("first_year_retention_rate").notNull().default(90),\n' +
'  fulfillmentRate: real("fulfillment_rate").notNull().default(20),\n' +
'  revenueRecovered: real("revenue_recovered").notNull().default(1.5),\n' +
'});\n' +
'\n' +
'export const clients = pgTable("clients", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  clientCode: text("client_code").notNull().unique(),\n' +
'  brandName: text("brand_name").notNull(),\n' +
'  incorporatedName: text("incorporated_name"),\n' +
'  gstin: text("gstin"),\n' +
'  address: text("address"),\n' +
'  location: text("location"),\n' +
'  spoc: text("spoc"),\n' +
'  email: text("email"),\n' +
'  website: text("website"),\n' +
'  linkedin: text("linkedin"),\n' +
'  agreement: text("agreement"),\n' +
'  percentage: text("percentage"),\n' +
'  category: text("category"),\n' +
'  paymentTerms: text("payment_terms"),\n' +
'  source: text("source"),\n' +
'  startDate: text("start_date"),\n' +
'  referral: text("referral"),\n' +
'  currentStatus: text("current_status").default("active"), // active, frozen, churned\n' +
'  isLoginOnly: boolean("is_login_only").default(false), // true = User Management login only, false = Master Data client\n' +
'  logo: text("logo"), // Company logo URL\n' +
'  createdAt: text("created_at").notNull(),\n' +
'});\n' +
'\n' +
'export const chatRooms = pgTable("chat_rooms", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  name: text("name").notNull(),\n' +
'  type: text("type").notNull(), // direct, group\n' +
'  isPinned: boolean("is_pinned").default(false),\n' +
'  createdBy: text("created_by").notNull(), // employee ID\n' +
'  lastMessageAt: text("last_message_at"),\n' +
'  createdAt: text("created_at").notNull(),\n' +
'});\n' +
'\n' +
'export const chatParticipants = pgTable("chat_participants", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  roomId: varchar("room_id").notNull(),\n' +
'  participantId: text("participant_id").notNull(), // employee ID\n' +
'  participantName: text("participant_name").notNull(),\n' +
'  participantRole: text("participant_role").notNull(),\n' +
'  joinedAt: text("joined_at").notNull(),\n' +
'});\n' +
'\n' +
'export const chatMessages = pgTable("chat_messages", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  roomId: varchar("room_id").notNull(),\n' +
'  senderId: text("sender_id").notNull(), // employee ID\n' +
'  senderName: text("sender_name").notNull(),\n' +
'  messageType: text("message_type").notNull(), // text, image, file, link\n' +
'  content: text("content").notNull(),\n' +
'  createdAt: text("created_at").notNull(),\n' +
'  deliveredAt: text("delivered_at"), // When message was delivered to recipient\n' +
'  readAt: text("read_at"), // When message was read by recipient\n' +
'});\n' +
'\n' +
'export const chatAttachments = pgTable("chat_attachments", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  messageId: varchar("message_id").notNull(),\n' +
'  fileName: text("file_name").notNull(),\n' +
'  fileUrl: text("file_url").notNull(),\n' +
'  fileType: text("file_type").notNull(), // image, pdf, doc, etc\n' +
'  fileSize: integer("file_size").notNull(),\n' +
'  uploadedAt: text("uploaded_at").notNull(),\n' +
'});\n' +
'\n' +
'export const chatUnreadCounts = pgTable("chat_unread_counts", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  roomId: varchar("room_id").notNull(),\n' +
'  participantId: text("participant_id").notNull(), // employee ID\n' +
'  unreadCount: integer("unread_count").notNull().default(0),\n' +
'  lastReadAt: text("last_read_at"), // Last time user read messages in this room\n' +
'  updatedAt: text("updated_at").notNull(),\n' +
'});\n' +
'\n' +
'export const revenueMappings = pgTable("revenue_mappings", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  talentAdvisorId: varchar("talent_advisor_id").notNull(),\n' +
'  talentAdvisorName: text("talent_advisor_name").notNull(),\n' +
'  teamLeadId: varchar("team_lead_id").notNull(),\n' +
'  teamLeadName: text("team_lead_name").notNull(),\n' +
'  candidateName: text("candidate_name"), // Name of the candidate who was placed\n' +
'  year: integer("year").notNull(),\n' +
'  quarter: text("quarter").notNull(), // JFM, AMJ, JAS, OND\n' +
'  position: text("position").notNull(),\n' +
'  clientId: varchar("client_id").notNull(),\n' +
'  clientName: text("client_name").notNull(),\n' +
'  clientType: text("client_type").notNull(), // Direct, Partner\n' +
'  partnerName: text("partner_name"),\n' +
'  offeredDate: text("offered_date"),\n' +
'  closureDate: text("closure_date"),\n' +
'  percentage: real("percentage").notNull(),\n' +
'  revenue: real("revenue").notNull(),\n' +
'  incentivePlan: text("incentive_plan").notNull(), // TL, TA, Business Development\n' +
'  incentive: real("incentive").notNull(),\n' +
'  source: text("source").notNull(), // LinkedIn, Naukri, Referral, Other\n' +
'  invoiceDate: text("invoice_date"),\n' +
'  invoiceNumber: text("invoice_number"),\n' +
'  receivedPayment: real("received_payment"),\n' +
'  paymentDetails: text("payment_details"), // Fully paid, Part paid\n' +
'  paymentStatus: text("payment_status"),\n' +
'  incentivePaidMonth: text("incentive_paid_month"),\n' +
'  createdAt: text("created_at").notNull(),\n' +
'});\n' +
'\n' +
'export const cashOutflows = pgTable("cash_outflows", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  month: text("month").notNull(),\n' +
'  year: integer("year").notNull(),\n' +
'  employeesCount: integer("employees_count").notNull(),\n' +
'  totalSalary: integer("total_salary").notNull(),\n' +
'  incentive: integer("incentive").notNull().default(0),\n' +
'  toolsCost: integer("tools_cost").notNull().default(0),\n' +
'  rent: integer("rent").notNull().default(0),\n' +
'  otherExpenses: integer("other_expenses").notNull().default(0),\n' +
'  createdAt: text("created_at").notNull(),\n' +
'});\n';

const candidatesTruncatedPart = '  productDomain: text("product_domain"), // Web Development, Mobile Apps, etc.\n' +
'  employmentType: text("employment_type"), // Full-time, Part-time, Contract, etc.\n' +
'  ownerEmployeeId: varchar("owner_employee_id"), // Recruiter or team leader who sourced/uploaded this candidate\n' +
'  lastAttemptAt: text("last_attempt_at"),\n' +
'  lockedUntil: text("locked_until"), // ISO timestamp for 30-minute lockout\n' +
'  createdAt: text("created_at").notNull(),\n' +
'});';

const candidatesFixedPart = '  productDomain: text("product_domain"), // Web Development, Mobile Apps, etc.\n' +
'  employmentType: text("employment_type"), // Full-time, Part-time, Contract, etc.\n' +
'  ownerEmployeeId: varchar("owner_employee_id"), // Recruiter or team leader who sourced/uploaded this candidate\n' +
'  ownerRole: text("owner_role"), // recruiter or team_leader\n' +
'  isActive: boolean("is_active").default(true),\n' +
'  isVerified: boolean("is_verified").default(false),\n' +
'  phoneVerified: boolean("phone_verified").default(false),\n' +
'  createdAt: text("created_at").notNull(),\n' +
'  lastViewedAt: text("last_viewed_at"), // Track when profile was last viewed\n' +
'  registrationStage: text("registration_stage"),\n' +
'  onboardingSource: text("onboarding_source"),\n' +
'  parsedData: json("parsed_data"),\n' +
'});\n' +
'\n' +
'export const otps = pgTable("otps", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  email: text("email").notNull(),\n' +
'  otp: text("otp").notNull(),\n' +
'  expiresAt: text("expires_at").notNull(),\n' +
'  createdAt: text("created_at").notNull(),\n' +
'});\n' +
'\n' +
'export const candidateLoginAttempts = pgTable("candidate_login_attempts", {\n' +
'  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),\n' +
'  email: text("email").notNull(),\n' +
'  attempts: text("attempts").notNull().default("0"),\n' +
'  lastAttemptAt: text("last_attempt_at"),\n' +
'  lockedUntil: text("locked_until"), // ISO timestamp for 30-minute lockout\n' +
'  createdAt: text("created_at").notNull(),\n' +
'});';

// Normalizing line endings for comparison
const normalize = (s) => s.replace(/\\r\\n/g, '\\n');

content = normalize(content);
const target = normalize(candidatesTruncatedPart);

if (content.includes(target)) {
  console.log('Found truncated candidates table, fixing...');
  content = content.replace(target, normalize(candidatesFixedPart));
} else {
  console.log('Truncated candidates table not found, checking alternatives...');
}

if (content.includes(insertPoint)) {
  console.log('Adding missing tables...');
  content = content.replace(insertPoint, normalize(missingTables) + insertPoint);
}

fs.writeFileSync(schemaPath, content);
console.log('schema.ts operation finished');
