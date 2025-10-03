# Overview

This is a dual-dashboard job portal web application featuring both candidate and team leader interfaces. The system provides comprehensive dashboards for job seekers to manage their profiles and for team leaders to monitor recruitment metrics, team performance, and targets. The application features a modern, responsive design with consistent styling across both dashboards and a landing page for role selection.

**Latest Import Status (October 3, 2025 - Fresh GitHub Import)**: Successfully imported GitHub repository to Replit environment. Complete setup includes:
- ✅ Verified Node.js 20 environment with all npm dependencies installed
- ✅ PostgreSQL database connection confirmed via DATABASE_URL environment variable
- ✅ Database schema synchronized using `npm run db:push` (no changes needed - schema already exists)
- ✅ Frontend configuration verified with allowedHosts: true in server/vite.ts for Replit proxy compatibility
- ✅ Workflow 'Start application' configured on port 5000 with webview output type
- ✅ Express backend server running on http://0.0.0.0:5000 in development mode
- ✅ Vite development server with HMR (Hot Module Replacement) connected successfully
- ✅ StaffOS landing page loading correctly with candidate and employer login options
- ✅ Full-stack application operational: React frontend + Express backend + PostgreSQL database
- ✅ Deployment configuration set for autoscale target with build and start scripts
- ✅ Using DatabaseStorage implementation (not in-memory) for production-ready data persistence
- ✅ File upload directory (uploads/) exists with sample images
- ✅ All API routes configured in server/routes.ts with authentication and file handling
- ✅ Complete recruitment platform features: candidate profiles, job applications, employer dashboards, team leader metrics, admin oversight

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