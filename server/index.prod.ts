import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { applyCorsHeaders, corsOptions } from "./cors-config";
import session from "express-session";
import { registerRoutes } from "./routes";

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();

app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'staffos-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none'
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
  const server = await registerRoutes(app);

  server.timeout = 5 * 60 * 1000;
  server.requestTimeout = 5 * 60 * 1000;
  server.headersTimeout = 5 * 60 * 1000;

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    applyCorsHeaders(req, res);
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

  log("Production mode — frontend served from Vercel");

  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen({
    port,
    host: '0.0.0.0',
    reusePort: true,
  }, () => {
    log(`Backend server running on http://0.0.0.0:${port}`);
    if (process.env.FRONTEND_URL) {
      log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    }
  });
})();
