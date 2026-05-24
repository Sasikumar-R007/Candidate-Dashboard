import fs from "fs";
import { randomBytes } from "crypto";
import type { Request } from "express";
import multer from "multer";
import { eq } from "drizzle-orm";
import { profileMedia } from "@shared/schema";
import { db } from "./db";

/** In-memory uploads for profile pictures (persisted to Postgres, not local disk). */
export const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

export function resolveUploadBaseUrl(req?: Request): string {
  const fromEnv = (process.env.BACKEND_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production" && req?.get("host")) {
    return `https://${req.get("host")}`;
  }
  if (req?.get("host")) {
    return `http://${req.get("host")}`;
  }
  return "http://localhost:5000";
}

export function buildProfileMediaUrl(mediaId: string, req?: Request): string {
  return `${resolveUploadBaseUrl(req)}/api/profile-media/${mediaId}`;
}

export async function persistProfilePictureUpload(
  file: Express.Multer.File,
  req?: Request,
): Promise<string> {
  let buffer = file.buffer;
  if (!buffer?.length && file.path) {
    buffer = await fs.promises.readFile(file.path);
  }
  if (!buffer?.length) {
    throw new Error("Empty image upload");
  }

  const id = randomBytes(16).toString("hex");
  const mimeType = file.mimetype || "image/jpeg";

  await db.insert(profileMedia).values({
    id,
    mimeType,
    data: buffer.toString("base64"),
    createdAt: new Date(),
  });

  return buildProfileMediaUrl(id, req);
}

export async function fetchProfileMediaRecord(id: string) {
  const rows = await db
    .select()
    .from(profileMedia)
    .where(eq(profileMedia.id, id))
    .limit(1);
  return rows[0] ?? null;
}
