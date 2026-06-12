import fs from "fs";
import path from "path";
import type { Request } from "express";
import { resolveUploadBaseUrl } from "./profile-media";
import { getR2FileByFolderAndName, uploadToR2Folder } from "./utils/r2Upload";

export type R2FileFolder = "jds" | "logos" | "chat";

export async function getUploadedFileBuffer(file: Express.Multer.File): Promise<Buffer> {
  if (file.buffer?.length) {
    return file.buffer;
  }
  if (file.path && fs.existsSync(file.path)) {
    return fs.promises.readFile(file.path);
  }
  throw new Error("Empty file upload");
}

function buildLocalDevUrl(
  file: Express.Multer.File,
  req: Request | undefined,
  localSubdir: "uploads" | "uploads/chat",
): string {
  const baseUrl = resolveUploadBaseUrl(req);
  const filename = file.filename || path.basename(file.path || "");
  if (localSubdir === "uploads/chat") {
    return `${baseUrl}/uploads/chat/${filename}`;
  }
  return `${baseUrl}/uploads/${filename}`;
}

async function removeLocalMulterFile(file: Express.Multer.File): Promise<void> {
  if (file.path && fs.existsSync(file.path)) {
    await fs.promises.unlink(file.path).catch(() => {});
  }
}

/** Persist uploaded file to R2 in production, local disk in development. */
export async function storeR2FolderFile(
  file: Express.Multer.File,
  folder: R2FileFolder,
  req?: Request,
  localSubdir: "uploads" | "uploads/chat" = "uploads",
): Promise<string> {
  if (process.env.NODE_ENV === "production") {
    const buffer = await getUploadedFileBuffer(file);
    const fileUrl = await uploadToR2Folder(buffer, file.originalname, file.mimetype, folder);
    await removeLocalMulterFile(file);
    return fileUrl;
  }

  return buildLocalDevUrl(file, req, localSubdir);
}

export { getR2FileByFolderAndName };
