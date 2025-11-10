# Overview

This dual-dashboard job portal web application offers distinct interfaces for candidates and team leaders. It enables job seekers to manage profiles and team leaders to monitor recruitment, team performance, and targets. The application features a modern, responsive design, consistent styling across all dashboards, and a landing page for role selection. Key capabilities include comprehensive profile management, job application tracking, team performance analytics, and a WhatsApp-style chat system integrated across all dashboards for seamless communication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React.js with TypeScript, functional components, and hooks.
- **UI Components**: Radix UI primitives with shadcn/ui for a consistent design system.
- **Styling**: TailwindCSS with custom CSS variables for theming and responsiveness.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **Routing**: Wouter for lightweight client-side routing.
- **Form Handling**: React Hook Form with Zod for type-safe form validation.
- **UI/UX Decisions**: Consistent styling across dashboards, responsive layouts, modern design principles, enhanced card designs, interactive calendar pickers, and optimized grid layouts.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Pattern**: RESTful API endpoints returning consistent JSON.
- **File Uploads**: Multer middleware for handling file storage.
- **Error Handling**: Centralized middleware for structured error responses.

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Connection**: Neon Database for cloud-hosted PostgreSQL.
- **Schema Management**: Drizzle Kit for migrations and synchronization.
- **Development Storage**: In-memory storage for rapid development.

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store.
- **User System**: Username-based authentication with demo user support.
- **Authorization**: Profile-based access control.
- **Support Chat Authentication**:
  - **Guest Users**: Automatically assigned unique session-based `supportUserId` identifier.
  - **Logged-in Candidates**: Use their candidate email for conversation identification.
  - **Support Dashboard**: Protected by `requireEmployeeAuth` middleware - only authenticated staff can access.
  - **Conversation Isolation**: Each session maintains its own conversation ID preventing cross-user message leakage.
- **Employee Management System**:
  - **Two-Step Onboarding**: Employees can be created as data entries without login credentials, which can be configured separately later.
  - **Password Field**: Employee passwords are optional/nullable in the database schema.
  - **Admin Dashboard**: The "Add Employee" function stores employee details (name, email, role, etc.) without requiring password creation.
  - **Login Credential Setup**: Login credentials can be configured separately after employee creation (future enhancement).
  - **Login Authentication**: Employees without configured passwords receive a clear error message when attempting to login: "Login credentials not configured for this account. Please contact your administrator."
- **Client Login System**: 
  - **Client Companies**: Stored in the `clients` table with auto-generated codes (e.g., STCL001, STCL002). These represent business entities and do NOT have direct login credentials.
  - **Client User Accounts**: To enable login access for a client company, create an Employee record with `role="client"`. This employee account will have:
    - Email (used as login username)
    - Password (can be set during employee creation or configured later)
    - Employee ID (auto-generated with STCL prefix for client roles)
  - **Login Process**: Client company representatives login through the employee login page (`/employer-login`) using their employee email and password.

## System Design Choices
- **Dashboard Layout**: Sidebar navigation with main content area and tabbed interfaces.
- **Modal System**: Reusable components for editing profile sections.
- **File Management**: Drag-and-drop file upload with previews.
- **Form Components**: Modular sections with validation.
- **Landing Page**: Role selection interface.
- **Specialized Dashboards**:
    - **Candidate Dashboard**: Profile management, job preferences, resume upload.
    - **Team Leader Dashboard**: Team metrics, target tracking, performance monitoring.
    - **Admin Dashboard**: Team oversight, target & incentives tracking, daily metrics, user management, and reporting.
- **Daily Metrics System**: 
    - **Real-time Calculations**: API endpoint `/api/admin/daily-metrics` calculates metrics on-demand from database.
    - **Total Requirements**: Count of requirements created on target date.
    - **Avg. Resumes per Requirement**: Weighted average based on criticality (HIGH=1, MEDIUM=3, LOW/EASY=5).
    - **Requirements per Recruiter**: Total requirements divided by active recruiters (role="recruiter", isActive=true).
    - **Completed Requirements**: Count of requirements with status="completed" and completedAt matching target date (counts requirements completed today regardless of creation date).
- **Chat System**: Standalone WhatsApp-style chat page with three-column layout (user profiles, conversation list, chat area, group details).
- **Support Chat System**: 
    - **User Side**: Floating chat dock available on all public pages for users to contact support.
    - **Support Team Side**: Dedicated dashboard at `/support-dashboard` for viewing and replying to user queries.
    - **Security**: Session-based user identification with unique guest IDs, protected support endpoints requiring employee authentication.
    - **Storage**: All conversations and messages stored permanently in PostgreSQL database.
    - **Real-time**: Polling mechanism (conversations poll every 5 seconds, messages every 3 seconds) for real-time message updates.

## Development Tools
- **Build System**: Vite for fast development and optimized builds.
- **Development Experience**: Hot module replacement and runtime error overlay.
- **Code Quality**: TypeScript strict mode.

# External Dependencies

- **UI Framework**: Radix UI
- **Database Provider**: Neon Database (PostgreSQL)
- **File Storage**: Local filesystem (via Multer)
- **Fonts**: Google Fonts (Inter)
- **Icons**: Font Awesome, Lucide React
- **Date Handling**: date-fns
- **Validation**: Zod

# Support Chat System

## How Conversations Are Stored

All support chat conversations are permanently stored in the PostgreSQL database across two tables:

### Database Tables

1. **`support_conversations`** - Stores conversation metadata
   - `id` (serial): Unique conversation identifier
   - `userId`: Session-based identifier (candidateId, supportUserId, or null)
   - `userEmail`: Email address for identification
   - `userName`: Display name (e.g., "Candidate", "Guest User")
   - `subject`: First 100 characters of initial message
   - `status`: Conversation status ('open', 'in_progress', or 'closed')
   - `createdAt`: ISO timestamp of conversation creation
   - `lastMessageAt`: ISO timestamp of most recent message

2. **`support_messages`** - Stores all individual messages
   - `id` (serial): Unique message identifier
   - `conversationId`: References parent conversation
   - `senderType`: Either 'user' or 'support'
   - `senderName`: Display name of message sender
   - `message`: Message content (text)
   - `sentAt`: ISO timestamp when message was sent

## How to View Conversations

### For Support Team Members

1. **Login as Employee**: Access the Support Dashboard requires authentication
   - Login at `/employer-login` using employee credentials
   - Must have employee role with proper authentication

2. **Access Support Dashboard**: Navigate to `/support-dashboard`
   - View all conversations in chronological order (most recent first)
   - See conversation details: user email, subject, status, message count
   - Filter/search conversations by email or subject

3. **View and Reply to Messages**:
   - Click on any conversation to view full message history
   - Messages are displayed in chronological order with sender identification
   - Use the reply box to send responses to users
   - All replies are stored permanently in the database

### For End Users

Users interact with support through the floating chat dock:
- Available on all public pages (bottom-right corner)
- Automatically creates a conversation on first message
- Session-based identification ensures privacy and isolation
- Messages poll every 3 seconds to show new support replies

#### Automatic Response Features

When users send messages, the chat provides immediate feedback:
1. **Welcome Message**: First-time users see "Hello! How can we help you today?"
2. **Typing Indicator**: After sending a message, a 3-dot animation appears for 1.5 seconds
3. **Auto-Response**: System automatically responds with "Thank you for your message. Our team will get back to you shortly."
4. These features work across all user profiles (candidate, recruiter, admin, client, team leader) since ChatDock is a shared component

## Security Features

- **Session Isolation**: Each user session has a unique `supportUserId` preventing message cross-contamination
- **Authentication Required**: All support dashboard endpoints protected by `requireEmployeeAuth` middleware
- **No Client-Side Storage**: User identification handled server-side via sessions (no localStorage)
- **Conversation Persistence**: `conversationId` stored in session for continuity across page refreshes

## Message Retention

- All conversations and messages are stored indefinitely in PostgreSQL
- No automatic deletion or archiving
- Can be manually closed via support dashboard (status change only, messages preserved)
- Future enhancements could include conversation archiving or deletion workflows