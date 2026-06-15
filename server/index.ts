import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer as createNetServer } from "node:net";
import cors from "cors";
import { applyCorsHeaders, corsOptions } from "./cors-config";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import {
  ensureAdminCriticalSchema,
  ensureCriticalPipelineColumns,
  ensureDeploymentSchema,
  ensurePerformanceIndexes,
  ensureRequirementManagementColumns,
  pool,
  verifyPoolConnection,
  warmPoolConnections,
} from "./db";
import {
  createPgSessionStore,
  ensureSessionStoreTable,
  warmSessionPool,
} from "./session-store";
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

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

function registerRequestLogging() {
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
}

async function registerSessionMiddleware() {
  const PgSession = connectPgSimple(session);
  const dbReady = await verifyPoolConnection();

  if (!dbReady) {
    const message =
      "Could not connect to PostgreSQL. Check DATABASE_URL, network/VPN, and that the database is running.";
    if (process.env.NODE_ENV === "production") {
      console.error(`[db] ${message}`);
      process.exit(1);
    }
    console.warn(`[db] ${message}`);
    console.warn(
      "[db] Using in-memory sessions for this dev run. Logins will not persist across server restarts.",
    );
    app.use(
      session({
        name: "staffos.sid",
        secret: process.env.SESSION_SECRET || "staffos-secret-key-change-in-production",
        resave: false,
        saveUninitialized: false,
        rolling: false,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "lax",
          path: "/",
        },
      }),
    );
    return;
  }

  try {
    await ensureSessionStoreTable(pool);
    await warmSessionPool(pool);
    log("Session table ready.", "db");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[session] Failed to prepare session table: ${message}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    console.warn("[session] Falling back to in-memory sessions for this dev run.");
    app.use(
      session({
        name: "staffos.sid",
        secret: process.env.SESSION_SECRET || "staffos-secret-key-change-in-production",
        resave: false,
        saveUninitialized: false,
        rolling: false,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "lax",
          path: "/",
        },
      }),
    );
    return;
  }

  log("PostgreSQL connected — using persistent session store.", "db");
  app.use(
    session({
      store: createPgSessionStore(PgSession, pool),
      name: "staffos.sid",
      secret: process.env.SESSION_SECRET || "staffos-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      rolling: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      },
    }),
  );
}

(async () => {
  await registerSessionMiddleware();
  registerRequestLogging();
  try {
    await ensureCriticalPipelineColumns();
    log("Critical pipeline columns verified.", "db");
  } catch (error) {
    console.error("Failed to ensure critical pipeline columns:", error);
  }

  try {
    await ensureAdminCriticalSchema();
    log("Admin critical schema verified.", "db");
  } catch (error) {
    console.error("Failed to ensure admin critical schema:", error);
  }

  try {
    await ensureDeploymentSchema();
    await ensurePerformanceIndexes();
    log("Deployment schema sync completed.", "db");
  } catch (error) {
    console.error("Failed to sync deployment schema:", error);
  }

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

  try {
    await warmPoolConnections(3);
    log("Database pool warmed for incoming requests.", "db");
  } catch (error) {
    console.warn(
      "[db] Pool warm-up failed (app will still start):",
      error instanceof Error ? error.message : error,
    );
  }

  const server = await registerRoutes(app);

  // Long-running uploads (bulk resume parse) — Render/proxy may still cap lower than this
  server.timeout = 5 * 60 * 1000;
  server.requestTimeout = 5 * 60 * 1000;
  server.headersTimeout = 5 * 60 * 1000;

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    applyCorsHeaders(req, res);
    const isSessionStoreFailure =
      /connection terminated|connection timeout/i.test(String(err?.message || "")) &&
      String(err?.stack || "").includes("connect-pg-simple");
    if (isSessionStoreFailure && !req.path.startsWith("/api")) {
      console.warn(
        `[session] Non-API request skipped after session store error: ${req.method} ${req.path}`,
      );
      if (!res.headersSent) {
        return res.status(503).send("Database is starting up. Please refresh in a few seconds.");
      }
      return;
    }
    const status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    if (err?.code === "LIMIT_FILE_SIZE") {
      message = "One or more files exceed the 10MB size limit.";
    } else if (err?.code === "LIMIT_FILE_COUNT") {
      message = "Too many files in one upload batch. Try fewer files per batch.";
    }

    console.error("Server error:", err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
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
})().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
