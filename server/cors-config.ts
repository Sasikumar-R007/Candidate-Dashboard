import type { CorsOptions } from "cors";
import type { Request, Response } from "express";

/** Origins allowed to call the API with credentials (cookies). */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return false;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const frontendUrl = (process.env.FRONTEND_URL || "").trim();
  if (frontendUrl && origin === frontendUrl) {
    return true;
  }

  const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (extraOrigins.includes(origin)) {
    return true;
  }

  if (/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin)) {
    return true;
  }

  if (/^https:\/\/(www\.)?staffos\.io$/i.test(origin)) {
    return true;
  }

  if (/^http:\/\/localhost:\d+$/i.test(origin)) {
    return true;
  }

  if (/^http:\/\/127\.0\.0\.1:\d+$/i.test(origin)) {
    return true;
  }

  return false;
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Same-origin or non-browser clients (no Origin header)
    if (!origin) {
      callback(null, true);
      return;
    }
    if (isAllowedOrigin(origin)) {
      callback(null, origin);
      return;
    }
    console.warn(`[cors] Blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "Content-Type"],
  maxAge: 86400,
};

/** Ensure error/timeout responses still include CORS headers for browser clients. */
export function applyCorsHeaders(req: Request, res: Response): void {
  const origin = req.headers.origin;
  if (typeof origin === "string" && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
}
