# 🚀 StaffOS - Local Development Setup Guide

A complete guide to run the StaffOS recruitment management system locally on your laptop for testing and development.

---

## 📋 System Requirements

Before you start, ensure your laptop has:

| Requirement | Version | Why? |
|-------------|---------|------|
| **Node.js** | 20 or higher | Required for running both frontend and backend |
| **npm** | 10+ (comes with Node.js) | Package manager for dependencies |
| **PostgreSQL** | 14 or higher | Database for storing application data |
| **RAM** | 4GB minimum (8GB+ recommended) | For running dev servers smoothly |
| **Disk Space** | 2GB | For node_modules and database |

---

## ✅ Step 1: Install Prerequisites

### 1A. Install Node.js 20+

**Windows:**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (20 or higher)
3. Run the installer and follow prompts
4. Check installation:
   ```bash
   node --version
   npm --version
   ```

**Mac:**
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1B. Install PostgreSQL

**Windows:**
1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run installer
3. Remember the password you set for postgres user (default user)
4. Keep port 5432 (default)

**Mac:**
```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16

# Or download from postgresql.org
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Verify PostgreSQL Installation:
```bash
psql --version
```

---

## 📂 Step 2: Clone/Setup Project

### Option A: Clone from Git (if you have git URL)
```bash
git clone <your-repo-url>
cd staffos
```

### Option B: Copy Project Files
- Copy all project files to a folder on your laptop
- Open the folder in Cursor

---

## 📦 Step 3: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This installs all 89+ dependencies listed in `package.json`. Takes 2-3 minutes depending on internet speed.

---

## 🗄️ Step 4: Setup Database

### Create Database

Open PostgreSQL shell and create the database:

```bash
# On Windows/Mac/Linux
psql -U postgres

# Inside psql shell:
CREATE DATABASE staffos_dev;
\q
```

**For Mac users** (if you get connection error):
```bash
# You might need to run as postgres user
sudo -u postgres psql
# Then run the CREATE DATABASE command above
```

### Create `.env` File

In your project root folder, create a new file called `.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/staffos_dev"

# Environment
NODE_ENV=development

# Session & Security
SESSION_SECRET=dev-secret-key-change-in-production

# Email Service (Optional for development)
FROM_EMAIL=StaffOS <onboarding@resend.dev>

# Google OAuth (Optional - skip if not using)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Deployment (Not needed for local dev)
REPLIT_DEV_DOMAIN=localhost
FRONTEND_URL=http://localhost:5000
```

**Replace:**
- `your_postgres_password` → The password you set when installing PostgreSQL (default is often `postgres`)

### Push Database Schema

Run this command to create all tables:

```bash
npm run db:push
```

You should see output like:
```
✓ Performing 'push' migration
✓ [1/1] Creating tables...
Migration completed successfully
```

---

## ▶️ Step 5: Run the Project

### Start Development Server

```bash
npm run dev
```

You should see:
```
> rest-express@1.0.0 dev
> cross-env NODE_ENV=development tsx server/index.ts

[express] 🚀 Backend server running on http://0.0.0.0:5000
[vite] Vite dev server active
```

### Open in Browser

Visit: **http://localhost:5000**

You'll see the StaffOS homepage with navigation menu.

---

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start both frontend & backend with hot reload

# Database
npm run db:push         # Sync database schema with code changes

# Type Checking
npm run check           # Check for TypeScript errors

# Building for Production
npm run build           # Build frontend + backend for production
npm run start           # Run production build
```

---

## 🐛 Troubleshooting

### Issue: "DATABASE_URL not found"
**Solution:** 
- Check `.env` file exists in project root
- Check PostgreSQL is running
- Verify DATABASE_URL format in `.env`

### Issue: "Port 5000 already in use"
**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Issue: "psql: command not found" (Mac/Linux)
PostgreSQL path not in system PATH:
```bash
# Add to your .bashrc or .zshrc
export PATH="/usr/lib/postgresql/XX/bin:$PATH"
```

### Issue: "Cannot connect to database"
```bash
# Test connection manually
psql -U postgres -d staffos_dev -h localhost

# If that fails, check PostgreSQL is running
# Mac:
brew services list

# Linux:
sudo systemctl status postgresql

# Windows: Check Services app
```

### Issue: "npm install fails"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Module errors during development
```bash
# Restart development server
# Press Ctrl+C to stop, then:
npm run dev
```

---

## 📊 Database Schema Overview

The application includes these main tables:

**Users & Access:**
- `users` - User accounts
- `employees` - Staff members (recruiters, team leads, admins)
- `candidates` - Job applicants

**Recruitment:**
- `requirements` - Job postings
- `job_applications` - Applications from candidates
- `interview_tracker` - Interview scheduling

**Team Management:**
- `team_members` - Team information
- `target_metrics` - Performance targets
- `daily_metrics` - Performance tracking

**File Management:**
- `bulk_upload_jobs` - Resume bulk uploads
- `bulk_upload_files` - File references

---

## 🔧 Cursor IDE Setup Tips

### Recommended Extensions
Install these for better development:
- **PostgreSQL** - Database management
- **Thunder Client** or **REST Client** - Test API endpoints
- **Tailwind CSS IntelliSense** - Tailwind suggestions
- **TypeScript Vue Plugin** - Type support
- **Prettier** - Code formatting

### Keyboard Shortcuts
```
Ctrl+` (backtick)  → Open integrated terminal
Ctrl+Shift+B       → Run build task
F5                 → Debug (if configured)
Ctrl+Shift+F       → Find in files
```

---

## 🎯 Project Structure

```
staffos/
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, Dashboard, etc)
│   │   ├── lib/            # Utilities & helpers
│   │   └── App.tsx         # Main app component
│   └── index.css           # Global styles & Tailwind
│
├── server/                  # Backend (Express)
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
│
├── shared/                  # Shared code
│   └── schema.ts           # Database schema (Drizzle ORM)
│
├── migrations/             # Database migrations
├── drizzle.config.ts       # Drizzle configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── .env                    # Environment variables (create this)
├── .env.example            # Template for .env
└── package.json            # Dependencies & scripts
```

---

## 📚 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | User interface |
| **Build** | Vite | Fast development & build |
| **Styling** | Tailwind CSS + shadcn/ui | Styling & components |
| **Routing** | Wouter | Client-side navigation |
| **Backend** | Express.js + Node.js | REST API |
| **Database** | PostgreSQL + Drizzle ORM | Data persistence |
| **State** | TanStack Query | API data management |
| **Forms** | React Hook Form + Zod | Form handling & validation |

---

## 🚀 Next Steps After Setup

1. **Verify it works** - Visit http://localhost:5000
2. **Explore the UI** - Click through pages
3. **Test database** - Add sample data through the app
4. **Read the code** - Start in `client/src/App.tsx`
5. **Make changes** - Edit files, see hot reload in action

---

## 📝 Notes

- **Hot Reload:** Changes to code files auto-reload in browser (frontend) and restart server (backend)
- **Database Changes:** After schema changes, run `npm run db:push`
- **Node_modules:** Can be 500MB+, be patient during `npm install`
- **Windows Users:** Install PostgreSQL with default settings, easiest setup
- **Mac M1/M2:** May need specific Node.js build, download universal binary from nodejs.org

---

## 🆘 Still Having Issues?

1. **Check error message** - Read the terminal output carefully
2. **Verify all 4 prerequisites** - Node 20+, npm, PostgreSQL, .env file
3. **Test database** - Run `psql -U postgres -d staffos_dev`
4. **Check logs** - Look in terminal for detailed error messages
5. **Restart everything** - Stop server, close terminal, open new terminal, run `npm run dev`

---

## ✨ Happy Coding!

You're all set! Start developing the StaffOS application on your local machine. Happy coding!

For questions, refer to the main README.md or check the error messages in your terminal.
