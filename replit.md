# Overview

This dual-dashboard job portal web application provides distinct interfaces for job candidates and team leaders. It enables job seekers to manage profiles and track applications, while team leaders can monitor recruitment, team performance, and targets. The application features a modern, responsive design, a landing page for role selection, comprehensive profile management, and a WhatsApp-style chat system for seamless communication across all dashboards. The project aims to streamline recruitment workflows, enhance team collaboration, and provide robust analytics for performance tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React.js with TypeScript, functional components, and hooks.
- **UI Components**: Radix UI primitives with shadcn/ui for a consistent design system.
- **Styling**: TailwindCSS with custom CSS variables for theming and responsiveness.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **Routing**: Wouter for lightweight client-side routing.
- **Form Handling**: React Hook Form with Zod for type-safe form validation.
- **UI/UX Decisions**: Consistent styling, responsive layouts, modern design principles, enhanced card designs, interactive calendar pickers, and optimized grid layouts.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Pattern**: RESTful API endpoints returning consistent JSON.
- **File Uploads**: Multer middleware.
- **Error Handling**: Centralized middleware for structured error responses.

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM.
- **Connection**: Neon Database for cloud-hosted PostgreSQL.
- **Schema Management**: Drizzle Kit for migrations.
- **Development Storage**: In-memory storage.

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store.
- **User System**: Username-based authentication, with support for demo users.
- **Authorization**: Profile-based access control.
- **Support Chat Authentication**: Guest users get unique session-based IDs; logged-in candidates use their email. Support dashboard is employee-authenticated.
- **Employee Management**: Two-step onboarding allows creating employee data entries without immediate login credentials. Client company representatives log in as employees with a 'client' role.

## System Design
- **Dashboard Layout**: Sidebar navigation with main content area and tabbed interfaces.
- **Modal System**: Reusable components for editing profile sections.
- **File Management**: Drag-and-drop file upload with previews.
- **Landing Page**: Role selection interface.
- **Specialized Dashboards**:
    - **Candidate**: Profile management, job preferences, resume upload.
    - **Team Leader**: Team metrics, target tracking, performance monitoring.
    - **Admin**: Team oversight, target & incentives tracking, daily metrics, user management, reporting, and revenue analytics.
- **Daily Metrics System**: Real-time calculation of total requirements, average resumes per requirement, requirements per recruiter, and completed requirements via API.
- **Team Chat System**: Internal, WhatsApp-style chat with direct, group, and pinned 'Team Chat'. Supports file sharing (images, PDFs, Word docs up to 10MB) and real-time messaging via WebSockets with session-based authentication.
- **Support Chat System**: Floating chat dock for users on public pages; dedicated `/support-dashboard` for support staff. Conversations and messages are stored permanently in PostgreSQL, with real-time updates via polling.
- **Target Mapping System**: Admin sets quarterly individual targets for recruiters, displayed on recruiter and team leader dashboards. Targets are stored in `targetMappings` table.
- **Master Database Resume Detail Drawer**: Right-side drawer for resume profiles in the Master Database. Displays candidate profile, resume viewing area (placeholder), share/download options, upload date, and a real-time comments section for collaboration.
- **Recruiter Job Management System**: Full CRUD operations for job postings (Active, Closed, Draft statuses). Provides a responsive grid layout with filtering and search, and integration with the candidate job board.
- **Recruiter Requirements System**: Recruiters see only requirements assigned to them by Team Leads (via the `talentAdvisor` field). The dashboard shows real delivery counts per requirement and priority distributions. Recruiters can only tag candidates to their assigned requirements via the Tag to Requirement modal.

## Development Tools
- **Build System**: Vite.
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