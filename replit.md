# Overview

This is a dual-dashboard job portal web application featuring both candidate and team leader interfaces. The system provides comprehensive dashboards for job seekers to manage their profiles and for team leaders to monitor recruitment metrics, team performance, and targets. The application features a modern, responsive design with consistent styling across both dashboards and a landing page for role selection.

**Latest Updates (October 17, 2025)**: 

*Client Dashboard Redesign with Chat Integration*:
- Replaced right sidebar (CandidateMetricsSidebar) with ProfileMenu component in header matching admin dashboard design
- Created shared ProfileMenu component for reuse across admin and client dashboards
- Implemented profile dropdown with user avatar, name, role, and settings access
- Added floating chat button (bottom-right) that opens functional chat interface
- Created ChatDock component with message sending/receiving capability
- Added "Start Chat" button in ProfileSettingsModal for direct messaging (visible for candidates and client employees)
- All chat entry points (floating button, profile dropdown, profile modal) properly wired to ChatDock
- Maintained consistent design patterns with admin dashboard header layout
- Full-width content area with sticky header for better space utilization
- Help button and profile controls positioned in top-right corner

*Profile Edit Functionality Enhancement*:
- Implemented fully functional edit modals for all profile sections (About You, Online Presence, Your Journey, Your Strengths)
- Added form validation and error handling for all edit modals with proper toast notifications
- Made protected fields (email, ID) read-only in edit forms to prevent accidental modification
- All edit modals properly update profile data via API and refresh UI after successful updates
- Enhanced error handling to display actual backend error messages instead of generic failures

*Navigation & UX Improvements*:
- Reordered sidebar navigation to move Job Preferences (Settings) to the last position for better user flow
- Updated navigation icons and labels for improved clarity
- Maintained consistent design patterns across all dashboard sections

*Save Jobs Error Fix*:
- Enhanced save/remove job mutations to properly handle API responses and display actual error messages
- Fixed error handling in useSaveJob and useRemoveSavedJob hooks to use apiRequest helper
- Improved user feedback with descriptive error messages from backend instead of generic failures
- Bookmark functionality now provides clear feedback for all success and error states

*OTP Verification Page Redesign*:
- Completely redesigned OTP verification page with split-layout design
- Left panel features dark blue background (#1e3a8a) with 2FA security illustration
- Right panel contains OTP input form with modern styling and clear instructions
- Implemented responsive design with proper spacing and visual hierarchy
- Added proper data-testid attributes for testing

*Previous Save Jobs Feature Fix*:
- Fixed GET /api/saved-jobs endpoint to return actual saved jobs from database instead of empty array
- Updated endpoint to properly authenticate candidates and fetch their saved jobs via storage.getSavedJobsByProfile()
- Save jobs functionality now fully operational with proper data persistence and retrieval
- Bookmark buttons in job board now correctly save and unsave jobs for authenticated candidates

*Profile Page Redesign*:
- Removed old profile page and replaced with new Edit & View page accessible via User icon in sidebar
- Implemented comprehensive profile header with avatar, name, job title, and contact information
- Created left sidebar navigation for easy section switching (About you, Online Presence, Your Journey, Your Strengths, Resume, Job Preferences)
- Designed About you section displaying personal details (name, contact, location, DOB)
- Built Online Presence section with portfolio, LinkedIn, and website links
- Implemented Your Journey section showing current company, role, and product details
- Added Your Strengths section with education info and three skill categories (Primary Skills in green, Secondary Skills in cyan, Knowledge Only in orange)
- Created Upload Resume section with drag & drop interface and paste option
- Built View Job Preferences section displaying job search criteria and instructions
- All sections include Edit buttons with proper data-testid attributes for testing
- Component properly handles missing profile data with fallback values

**Latest Import Status (October 3, 2025 - Fresh GitHub Import Complete)**: Successfully imported fresh GitHub clone and configured for Replit environment. Complete setup includes:
- ✅ Node.js 20 environment already installed with all npm dependencies in place
- ✅ PostgreSQL database connected via existing DATABASE_URL environment variable
- ✅ Database schema verified and synchronized using `npm run db:push` (schema in sync, no changes needed)
- ✅ Vite configuration verified with allowedHosts: true in server/vite.ts for Replit proxy compatibility
- ✅ Workflow 'Start application' configured with webview output type on port 5000
- ✅ Express backend server running successfully on http://0.0.0.0:5000 in development mode
- ✅ Vite development server with HMR (Hot Module Replacement) connected and operational
- ✅ StaffOS landing page verified and loading correctly with candidate and employer login options
- ✅ Full-stack application operational: React frontend + Express backend + PostgreSQL database
- ✅ Deployment configuration set to autoscale with build (`npm run build`) and start (`npm run start`) scripts
- ✅ Database storage implementation verified for production-ready data persistence
- ✅ File upload directory (uploads/) exists with existing sample images
- ✅ All API routes configured in server/routes.ts with authentication and file handling
- ✅ Complete recruitment platform features available: candidate profiles, job applications, employer dashboards, team leader metrics, admin oversight
- ✅ Fresh import completed successfully - application ready for immediate use

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
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud-hosted database
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Development Storage**: In-memory storage implementation for rapid development and testing

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User System**: Username-based authentication with demo user support
- **Authorization**: Profile-based access control where users can only access their own data

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