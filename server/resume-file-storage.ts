import fs from "fs";
import os from "os";
import path from "path";
import type { Request } from "express";
import { resolveUploadBaseUrl } from "./profile-media";
import { uploadToR2 } from "./utils/r2Upload";

export async function getResumeFileBuffer(file: Express.Multer.File): Promise<Buffer> {
  if (file.buffer?.length) {
    return file.buffer;
  }
  if (file.path && fs.existsSync(file.path)) {
    return fs.promises.readFile(file.path);
  }
  throw new Error("Empty resume upload");
}

function buildLocalResumeUrl(file: Express.Multer.File, req?: Request): string {
  const baseUrl = resolveUploadBaseUrl(req);
  const filename = file.filename || path.basename(file.path || "");
  const inResumesDir =
    file.path?.includes(`${path.sep}resumes${path.sep}`) ||
    file.destination?.includes("resumes");

  if (inResumesDir) {
    return `${baseUrl}/uploads/resumes/${filename}`;
  }
  return `${baseUrl}/uploads/${filename}`;
}

async function removeLocalMulterFile(file: Express.Multer.File): Promise<void> {
  if (file.path && fs.existsSync(file.path)) {
    await fs.promises.unlink(file.path).catch(() => {});
  }
}

/** Persist resume and return the public URL (R2 in production, local in development). */
export async function storeResumeFile(
  file: Express.Multer.File,
  req?: Request,
): Promise<string> {
  if (process.env.NODE_ENV === "production") {
    const buffer = await getResumeFileBuffer(file);
    const fileUrl = await uploadToR2(buffer, file.originalname, file.mimetype);
    await removeLocalMulterFile(file);
    return fileUrl;
  }

  return buildLocalResumeUrl(file, req);
}

/** Local path for parseResumeFile; uses a temp file in production before multer cleanup. */
export async function prepareResumeParsePath(
  file: Express.Multer.File,
): Promise<{ parsePath: string; cleanup: () => Promise<void> }> {
  if (process.env.NODE_ENV !== "production") {
    const parsePath =
      file.path || path.join(process.cwd(), "uploads", file.filename || file.originalname);
    return { parsePath, cleanup: async () => {} };
  }

  const buffer = await getResumeFileBuffer(file);
  const parsePath = path.join(
    os.tmpdir(),
    `staffos-resume-${Date.now()}-${path.basename(file.originalname)}`,
  );
  await fs.promises.writeFile(parsePath, buffer);

  return {
    parsePath,
    cleanup: async () => {
      if (fs.existsSync(parsePath)) {
        await fs.promises.unlink(parsePath).catch(() => {});
      }
    },
  };
}
