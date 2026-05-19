import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer as createNetServer } from "node:net";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { ensureRequirementManagementColumns, pool } from "./db";
import {
  ensureClientOrgSchema,
  migrateLegacyClientLogins,
  migrateClientEmployeeIdFormats,
} from "./client-org";

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

async function canListenOnPort(port: number, host: string): Promise<boolean> {
  return await new Promise((resolve) => {
    const tester = createNetServer();

    tester.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE" || error.code === "EACCES") {
        resolve(false);
        return;
      }

      resolve(false);
    });

    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, host);
  });
}

async function resolvePort(preferredPort: number, host: string): Promise<number> {
  if (process.env.NODE_ENV === "production") {
    return preferredPort;
  }

  if (await canListenOnPort(preferredPort, host)) {
    return preferredPort;
  }

  for (let offset = 1; offset <= 10; offset += 1) {
    const candidatePort = preferredPort + offset;
    if (await canListenOnPort(candidatePort, host)) {
      log(`Port ${preferredPort} is already in use, switching to ${candidatePort} for development.`);
      return candidatePort;
    }
  }

  throw new Error(
    `No available development port found between ${preferredPort} and ${preferredPort + 10}.`,
  );
}

const app = express();

// Trust proxy for proper host/protocol handling on cloud platforms
app.set('trust proxy', 1);

// CORS configuration for cross-origin requests
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://your-app.vercel.app',
        'https://www.staffos.io',  // Production domain
        'https://staffos.io',       // Production domain (without www)
        /\.vercel\.app$/,  // Allow all Vercel preview deployments
        /localhost:\d+$/   // Allow localhost for development
      ]
    : true, // Allow all origins in development
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));
// Handle CORS preflight requests
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration with PostgreSQL store for persistence (shared app pool)
const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  name: 'staffos.sid', // Unique session cookie name for this app
  secret: process.env.SESSION_SECRET || 'staffos-secret-key-change-in-production',
  resave: false, // Don't resave unchanged sessions
  saveUninitialized: false, // Don't save empty sessions
  rolling: false, // Don't reset expiration on activity (better for multi-user)
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF protection
    path: '/' // Ensure cookie is available for all routes
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await ensureRequirementManagementColumns();
    log("Requirement management columns verified.", "db");
  } catch (error) {
    console.error("Failed to verify requirement management columns:", error);
  }

  try {
    await ensureClientOrgSchema();
    log("Client org schema verified.", "db");
    const migration = await migrateLegacyClientLogins();
    if (migration.migrated > 0) {
      log(`Migrated ${migration.migrated} legacy client login(s).`, "db");
    }
    const idMigration = await migrateClientEmployeeIdFormats();
    if (idMigration.updated > 0) {
      log(`Normalized ${idMigration.updated} client employee ID(s).`, "db");
    }
  } catch (error) {
    console.error("Failed to initialize client org schema/migration:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Server error:', err);
    res.status(status).json({ message });
    // Don't throw err to prevent process crashes in production
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const preferredPort = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  const port = await resolvePort(preferredPort, host);

  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server, port);
  } else {
    // In production (Render), do NOT serve frontend
    log("Static frontend disabled — using Vercel frontend.");
  }


  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Windows doesn't support reusePort, so only use it on non-Windows systems
  const isWindows = process.platform === 'win32';
  const listenOptions: any = {
    port,
    host,
  };
  
  if (!isWindows) {
    listenOptions.reusePort = true;
  }
  
  server.listen(listenOptions, () => {
    log(`🚀 Backend server running on http://${host}:${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.FRONTEND_URL) {
      log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    }
  });
})();
