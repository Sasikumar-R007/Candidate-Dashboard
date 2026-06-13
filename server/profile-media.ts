import fs from "fs";
import { randomBytes } from "crypto";
import type { Request } from "express";
import multer from "multer";
import { eq } from "drizzle-orm";
import { profileMedia } from "@shared/schema";
import { db } from "./db";
import { uploadToR2Folder } from "./utils/r2Upload";

/** In-memory uploads for profile pictures (metadata in Postgres, bytes in R2 or legacy base64). */
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

function extractR2FileName(url: string, folder: string): string | null {
  const match = url.match(new RegExp(`/${folder}/([^/?#]+)$`, "i"));
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** Prefer API proxy for R2 avatars (consistent with other stored files). */
export function buildAvatarServeUrl(avatarUrl: string, req?: Request): string {
  const fileName = extractR2FileName(avatarUrl, "avatars");
  if (fileName) {
    return `${resolveUploadBaseUrl(req)}/api/files/avatars/${encodeURIComponent(fileName)}`;
  }
  return avatarUrl;
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
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";

  let avatarUrl: string | null = null;
  let data = buffer.toString("base64");

  if (process.env.NODE_ENV === "production" && process.env.R2_BUCKET) {
    avatarUrl = await uploadToR2Folder(buffer, `avatar-${id}.${ext}`, mimeType, "avatars");
    data = "";
  }

  await db.insert(profileMedia).values({
    id,
    mimeType,
    data,
    avatarUrl,
    createdAt: new Date(),
  });

  return buildProfileMediaUrl(id, req);
}

export async function fetchProfileMediaMeta(id: string) {
  const rows = await db
    .select({
      id: profileMedia.id,
      mimeType: profileMedia.mimeType,
      avatarUrl: profileMedia.avatarUrl,
    })
    .from(profileMedia)
    .where(eq(profileMedia.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function fetchProfileMediaData(id: string) {
  const rows = await db
    .select({
      data: profileMedia.data,
      mimeType: profileMedia.mimeType,
    })
    .from(profileMedia)
    .where(eq(profileMedia.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** @deprecated Use fetchProfileMediaMeta / fetchProfileMediaData for smaller reads. */
export async function fetchProfileMediaRecord(id: string) {
  const rows = await db
    .select()
    .from(profileMedia)
    .where(eq(profileMedia.id, id))
    .limit(1);
  return rows[0] ?? null;
}
