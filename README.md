# StaffOS - Recruitment Management System

A full-stack recruitment and staffing management application built with React, Express, Vite, and PostgreSQL.

## 🚀 Prerequisites

Before running this project locally in VS Code, ensure you have:

- **Node.js** (version 20 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (version 14 or higher) - [Download here](https://www.postgresql.org/download/)
  - OR **Docker** for running PostgreSQL in a container

## 📦 Installation Steps

### 1. Clone the Repository

You've already done this step! Your project should be in VS Code now.

### 2. Install Dependencies

Open the integrated terminal in VS Code (`` Ctrl+` `` or `` Cmd+` `` on Mac) and run:

```bash
npm install
```

This will install all required packages for both frontend and backend.

## 🗄️ Database Setup

This project uses **PostgreSQL** with **Drizzle ORM**. You have two options:

### Option A: Using Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL** on your system if you haven't already
2. **Create a new database**:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE staffos_dev;

# Exit
\q
```

3. **Create `.env` file** in the project root:

```bash
# Create .env file
touch .env
```

4. **Add database connection** to `.env`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/staffos_dev"
NODE_ENV=development
```

Replace `your_password` with your PostgreSQL password.

### Option B: Using Docker (Easier Setup)

1. **Create `docker-compose.yml`** in project root:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: staffos-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: staffos_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. **Start PostgreSQL**:

```bash
docker-compose up -d
```

3. **Create `.env` file**:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/staffos_dev"
NODE_ENV=development
```

### 3. Push Database Schema

After setting up your database and `.env` file, push the schema:

```bash
npm run db:push
```

This command will create all the necessary tables in your database.

## ▶️ Running the Project

### Start Development Server

In VS Code terminal, run:

```bash
npm run dev
```

This will start:
- **Backend** (Express server) on `http://localhost:5000`
- **Frontend** (Vite dev server) with hot-reload

The application will automatically open in your browser, or you can manually visit:
```
http://localhost:5000
```

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend

# Database
npm run db:push          # Push schema changes to database

# Build for Production
npm run build            # Build both frontend and backend
npm run start            # Start production server

# Type Checking
npm run check            # Run TypeScript type checking
```

## 📊 Database Schema Overview

The application includes the following main tables:

### User Management
- **users** - User authentication
- **employees** - Staff members (recruiters, team leads, clients)
- **candidates** - Job candidates
- **profiles** - Detailed candidate profiles

### Recruitment
- **requirements** - Job requirements
- **job_applications** - Candidate applications
- **saved_jobs** - Saved job postings
- **interview_tracker** - Interview scheduling and tracking

### Team Management
- **team_members** - Team member information
- **team_leader_profile** - Team leader details
- **target_metrics** - Performance targets
- **daily_metrics** - Daily performance tracking

### Bulk Operations
- **bulk_upload_jobs** - Bulk resume upload jobs
- **bulk_upload_files** - Individual file tracking
- **notifications** - System notifications

### Client Management
- **clients** - Client company information

## 🔍 VS Code Development Tips

### Recommended Extensions

Install these VS Code extensions for better development experience:

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - Tailwind class autocomplete
4. **PostgreSQL** - Database management in VS Code
5. **Thunder Client** or **REST Client** - API testing

### Debugging

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## 🛠️ Troubleshooting

### Windows: NODE_ENV Error

If you get `'NODE_ENV' is not recognized as an internal or external command` on Windows:

✅ **Already Fixed!** The package.json has been updated to use `cross-env` which works on all platforms (Windows, Mac, Linux).

Just run:
```bash
npm run dev
```

### Port Already in Use

If port 5000 is busy:

```bash
# Find and kill process on port 5000 (Unix/Mac)
lsof -ti:5000 | xargs kill

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Error

1. Verify PostgreSQL is running:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list                # Mac
```

2. Test connection:
```bash
psql -U postgres -d staffos_dev
```

3. Check your `.env` file has correct credentials

### Dependencies Issues

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure

```
staffos/
├── client/              # Frontend React application
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── lib/         # Utilities and helpers
│       └── App.tsx      # Main app component
├── server/              # Backend Express server
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server entry point
├── shared/              # Shared code
│   └── schema.ts        # Database schema (Drizzle)
├── migrations/          # Database migrations
├── .env                 # Environment variables (create this)
└── package.json         # Dependencies
```

## 🌐 Default Login Credentials

After setting up the database, you may need to create initial users. Check the application's user management section or seed scripts.

## 📚 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui, Wouter (routing)
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Validation**: Zod
- **Forms**: React Hook Form

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the error logs in the terminal
3. Ensure all environment variables are set correctly

---

Happy coding! 🎉
