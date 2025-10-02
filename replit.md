# Overview

This is a dual-dashboard job portal web application featuring both candidate and team leader interfaces. The system provides comprehensive dashboards for job seekers to manage their profiles and for team leaders to monitor recruitment metrics, team performance, and targets. The application features a modern, responsive design with consistent styling across both dashboards and a landing page for role selection.

**Latest Setup Verification (October 2, 2025)**: Successfully verified and configured GitHub import in Replit environment:
- ✅ Workflow 'Start application' properly configured with webview output type on port 5000
- ✅ Server running correctly on 0.0.0.0:5000 with Express backend and Vite dev server
- ✅ PostgreSQL database connected (DATABASE_URL configured to helium database)
- ✅ Database schema synchronized and up to date (drizzle-kit push completed)
- ✅ All pages loading correctly: Homepage, Candidate dashboard, Employee login
- ✅ Vite HMR disabled (as configured for Replit HTTPS environment)
- ✅ Deployment configuration set for autoscale with proper build/start commands
- ✅ Application fully functional in preview with no critical errors

**Latest Database Migration (October 2, 2025)**: Successfully migrated from in-memory storage to PostgreSQL with full persistence:
- ✅ PostgreSQL database provisioned via Neon with DATABASE_URL configured
- ✅ Migrated from MemStorage to DatabaseStorage with full IStorage interface implementation
- ✅ Implemented comprehensive RBAC (Role-Based Access Control) middleware with four role levels:
  - Admin: Full system access including user management, financial data, and all operations
  - Team Leader: Team data access, metrics, pipeline, and performance tracking
  - Recruiter: Candidate management, requirements, and own activity data
  - Client: Own requirements and candidate lists only
- ✅ Created automated data retention policies running daily at 2 AM:
  - Login attempts: 30-day retention for security auditing
  - Activities: 90-day retention with text-date parsing support
  - Meetings: Placeholder for future implementation when schema includes date fields
  - Archived requirements: 5+ year retention for compliance
- ✅ All CRUD operations now persist to PostgreSQL database
- ✅ Application running successfully with database persistence and scheduled cleanup

**Previous Import Status (October 2, 2025 - Fresh Import)**: Successfully imported fresh GitHub repository clone to Replit environment. Complete setup includes:
- ✅ Verified Node.js 20 installation and all npm dependencies installed correctly
- ✅ Confirmed Vite dev server configuration with allowedHosts: true for Replit proxy compatibility
- ✅ Configured workflow 'Start application' running `npm run dev` on port 5000 with webview output type
- ✅ Verified Express backend server running on 0.0.0.0:5000 for proper host binding
- ✅ Confirmed full-stack application: Express backend + Vite dev server + React frontend
- ✅ Updated .gitignore to exclude uploaded files (.jpg, .png, .pdf, .webp, .docx, .avif) and environment files
- ✅ Database schema defined using Drizzle ORM (PostgreSQL support ready but not active)
- ✅ Configured autoscale deployment with proper build and start commands for production
- ✅ All systems operational: StaffOS landing page loading correctly, authentication system working
- ✅ File upload system configured with multer (5MB limit, supports images/PDFs/DOCX)
- ✅ Application features: Candidate portal, Employee portal (recruiter/team leader/admin roles)
- ✅ Bulk resume upload and parsing functionality with OTP verification system
- ✅ No critical errors in console, proper Vite HMR connection established

**Previous Migration Status**: Successfully migrated from Replit Agent to standard Replit environment on August 21, 2025. All functionality preserved with enhanced UI design for team leader dashboard components. Migration completed with working Admin dashboard implementation. All image upload features fully functional across all dashboards. Added admin-specific sidebar with "Report" option and replaced shield icons with crown icons for CEO role display.

**Latest Migration Update (August 14, 2025)**: Successfully completed project migration from Replit Agent to standard Replit environment. All systems operational with Node.js backend, React frontend, and in-memory storage. Enhanced candidate dashboard UI with improved resume preview height matching and job preferences section centering with rounded borders and styled input fields.

**Latest Updates (August 21, 2025)**: Enhanced recruiter dashboard with comprehensive sections matching team leader design patterns:
- Added Archives and View More buttons below Active Candidates table for better navigation
- Implemented Target section with 4-column layout showing current quarter, minimum target, target achieved, and incentive earned
- Created Daily Metrics section with date picker, 2x2 grid layout, overall performance indicator, and daily delivery tracking
- Added CEO Comments section with pink background for management feedback display
- Implemented Pending Meetings section with table format showing meeting type, date, and person details
- All sections use API data endpoints and maintain consistent styling with rounded corners and proper button designs
- Updated button styling to use 'rounded' instead of 'rounded-lg' for consistency with design specifications

**Recent Updates (August 14, 2025)**: Completed comprehensive Admin dashboard implementation with all major sections:
- Requirements section: Priority Distribution cards, detailed requirements table with criticality levels
- Pipeline section: Multi-stage candidate tracking with closure reports matching team leader design  
- Metrics section: Overall performance gauge, growth/financial metrics, cash outflow tracking with input forms
- Master Data section: Resume Database, Employees Master, and Client Master with status indicators
- Performance section: Team Performance table with talent advisor metrics and List of Closures with revenue tracking
- User Management section: Complete user table with roles, status, and online activity tracking cards
- Applied global styling: rounded borders for buttons/inputs, shaded input backgrounds, consistent design patterns
All admin dashboard sections now fully functional with proper data visualization and management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React.js with TypeScript using functional components and hooks
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design system
- **Styling**: TailwindCSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod schema validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Pattern**: RESTful API endpoints with consistent JSON responses
- **File Uploads**: Multer middleware for handling multipart form data and file storage
- **Error Handling**: Centralized error middleware with structured error responses

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations (ACTIVE)
- **Connection**: Neon Database serverless PostgreSQL for cloud-hosted database
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Storage Implementation**: DatabaseStorage class implementing IStorage interface for all CRUD operations
- **Data Retention**: Automated cleanup scheduler running daily at 2 AM for compliance and performance

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User System**: Username-based authentication with demo user support
- **RBAC System**: Role-based access control with four permission levels:
  - Admin: Full system access (user management, financial data, all operations)
  - Team Leader: Team oversight (metrics, pipeline, performance tracking)
  - Recruiter: Candidate management (requirements, candidates, own activities)
  - Client: Limited access (own requirements and candidate lists)
- **Middleware**: Permission guards on all API endpoints ensuring role-appropriate access

## Component Organization
- **Dashboard Layout**: Sidebar navigation with main content area and tabbed interface (shared across both dashboards)
- **Modal System**: Reusable modal components for editing different sections (profile, preferences, etc.)
- **File Management**: Drag-and-drop file upload components with preview capabilities
- **Form Components**: Modular form sections with validation and error handling
- **Landing Page**: Role selection interface for choosing between candidate, team leader, and admin dashboards
- **Team Leader Components**: Specialized components for team metrics, target tracking, and performance monitoring with enhanced card designs, interactive calendar picker, and optimized grid layouts matching user specifications
- **Admin Components**: Comprehensive admin interface with team oversight, target & incentives tracking, daily metrics management, messaging system, and meeting scheduler with proper header layout and file upload capabilities

## Development Tools
- **Build System**: Vite for fast development server and optimized production builds
- **Development Experience**: Hot module replacement with runtime error overlay for Replit environment
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Asset Management**: Static file serving with development-time asset handling

# External Dependencies

- **UI Framework**: Radix UI for accessible, unstyled UI primitives
- **Database Provider**: Neon Database for serverless PostgreSQL hosting
- **File Storage**: Local filesystem storage with multer for file upload handling
- **Fonts**: Google Fonts (Inter) for typography
- **Icons**: Font Awesome and Lucide React for iconography
- **Development Platform**: Replit-specific plugins for enhanced development experience
- **Date Handling**: date-fns library for date manipulation and formatting
- **Validation**: Zod for runtime type validation and schema definition