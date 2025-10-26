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
- **Chat System**: Standalone WhatsApp-style chat page with three-column layout (user profiles, conversation list, chat area, group details).

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