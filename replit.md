# Overview

This is a dual-dashboard job portal web application featuring both candidate and team leader interfaces. The system provides comprehensive dashboards for job seekers to manage their profiles and for team leaders to monitor recruitment metrics, team performance, and targets. The application features a modern, responsive design with consistent styling across both dashboards and a landing page for role selection.

**Migration Status**: Successfully migrated from Replit Agent to standard Replit environment on August 14, 2025. All functionality preserved with enhanced UI design for team leader dashboard components. Migration completed with working Admin dashboard implementation. All image upload features fully functional across all dashboards. Added admin-specific sidebar with "Report" option and replaced shield icons with crown icons for CEO role display.

**Recent Updates (August 13, 2025)**: Added Admin dashboard with comprehensive team management features, target tracking, daily metrics with calendar picker, messaging system, and meeting scheduler. Fixed layout issues and properly implemented profile header with banner/profile image upload capabilities matching team leader dashboard pattern. All three dashboards (Candidate, Team Leader, Admin) now fully functional.

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