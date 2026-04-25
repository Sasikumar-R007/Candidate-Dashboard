import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('shared/schema.ts');
let content = fs.readFileSync(schemaPath, 'utf-8');

// The file currently has candidates and some schemas
// We need to re-insert the missing tables before the schemas.

const insertPoint = 'export const insertUserSchema';
const missingTables = \`
export const interviewTracker = pgTable("interview_tracker", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
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
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  todayScheduled: text("today_scheduled").notNull().default("0"),
  pendingCases: text("pending_cases").notNull().default("0"),
  completedToday: text("completed_today").notNull().default("0"),
  rescheduledToday: text("rescheduled_today").notNull().default("0"),
  cancelledToday: text("cancelled_today").notNull().default("0"),
  recruiterName: text("recruiter_name").notNull(),
  date: text("date").notNull(),
  updatedAt: text("updated_at"),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // bulk_upload_complete, bulk_upload_failed, general
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"), // read, unread
  relatedJobId: text("related_job_id"), // For bulk upload notifications
  createdAt: text("created_at").notNull(),
  readAt: text("read_at"),
});

export const impactMetrics = pgTable("impact_metrics", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  clientId: text("client_id"), // Optional - can be null for global metrics
  speedToHire: real("speed_to_hire").notNull().default(15),
  revenueImpactOfDelay: real("revenue_impact_of_delay").notNull().default(75000),
  clientNps: real("client_nps").notNull().default(60),
  candidateNps: real("candidate_nps").notNull().default(70),
  feedbackTurnAround: real("feedback_turn_around").notNull().default(2),
  feedbackTurnAroundAvgDays: real("feedback_turn_around_avg_days").notNull().default(5),
  firstYearRetentionRate: real("first_year_retention_rate").notNull().default(90),
  fulfillmentRate: real("fulfillment_rate").notNull().default(20),
  revenueRecovered: real("revenue_recovered").notNull().default(1.5),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
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
  isLoginOnly: boolean("is_login_only").default(false), // true = User Management login only, false = Master Data client
  logo: text("logo"), // Company logo URL
  createdAt: text("created_at").notNull(),
});

export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  name: text("name").notNull(),
  type: text("type").notNull(), // direct, group
  isPinned: boolean("is_pinned").default(false),
  createdBy: text("created_by").notNull(), // employee ID
  lastMessageAt: text("last_message_at"),
  createdAt: text("created_at").notNull(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  roomId: varchar("room_id").notNull(),
  participantId: text("participant_id").notNull(), // employee ID
  participantName: text("participant_name").notNull(),
  participantRole: text("participant_role").notNull(),
  joinedAt: text("joined_at").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  roomId: varchar("room_id").notNull(),
  senderId: text("sender_id").notNull(), // employee ID
  senderName: text("sender_name").notNull(),
  messageType: text("message_type").notNull(), // text, image, file, link
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  deliveredAt: text("delivered_at"), // When message was delivered to recipient
  readAt: text("read_at"), // When message was read by recipient
});

export const chatAttachments = pgTable("chat_attachments", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  messageId: varchar("message_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // image, pdf, doc, etc
  fileSize: integer("file_size").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
});

export const chatUnreadCounts = pgTable("chat_unread_counts", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  roomId: varchar("room_id").notNull(),
  participantId: text("participant_id").notNull(), // employee ID
  unreadCount: integer("unread_count").notNull().default(0),
  lastReadAt: text("last_read_at"), // Last time user read messages in this room
  updatedAt: text("updated_at").notNull(),
});

export const revenueMappings = pgTable("revenue_mappings", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  talentAdvisorId: varchar("talent_advisor_id").notNull(),
  talentAdvisorName: text("talent_advisor_name").notNull(),
  teamLeadId: varchar("team_lead_id").notNull(),
  teamLeadName: text("team_lead_name").notNull(),
  candidateName: text("candidate_name"), // Name of the candidate who was placed
  year: integer("year").notNull(),
  quarter: text("quarter").notNull(), // JFM, AMJ, JAS, OND
  position: text("position").notNull(),
  clientId: varchar("client_id").notNull(),
  clientName: text("client_name").notNull(),
  clientType: text("client_type").notNull(), // Direct, Partner
  partnerName: text("partner_name"),
  offeredDate: text("offered_date"),
  closureDate: text("closure_date"),
  percentage: real("percentage").notNull(),
  revenue: real("revenue").notNull(),
  incentivePlan: text("incentive_plan").notNull(), // TL, TA, Business Development
  incentive: real("incentive").notNull(),
  source: text("source").notNull(), // LinkedIn, Naukri, Referral, Other
  invoiceDate: text("invoice_date"),
  invoiceNumber: text("invoice_number"),
  receivedPayment: real("received_payment"),
  paymentDetails: text("payment_details"), // Fully paid, Part paid
  paymentStatus: text("payment_status"),
  incentivePaidMonth: text("incentive_paid_month"),
  createdAt: text("created_at").notNull(),
});

export const cashOutflows = pgTable("cash_outflows", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  employeesCount: integer("employees_count").notNull(),
  totalSalary: integer("total_salary").notNull(),
  incentive: integer("incentive").notNull().default(0),
  toolsCost: integer("tools_cost").notNull().default(0),
  rent: integer("rent").notNull().default(0),
  otherExpenses: integer("other_expenses").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

\`;

if (content.includes(insertPoint)) {
  content = content.replace(insertPoint, missingTables + insertPoint);
  fs.writeFileSync(schemaPath, content);
  console.log('Fixed missing tables');
} else {
  console.log('Could not find insert point');
}
