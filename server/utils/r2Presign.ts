import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sanitizeFileName } from "./r2Upload";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || "",
    secretAccessKey: process.env.R2_SECRET_KEY || "",
  },
});

function buildR2PublicUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/${encodedKey}`;
}

export const PRESIGN_UPLOAD_FOLDERS = ["resumes", "jds", "logos", "chat", "avatars"] as const;
export type PresignUploadFolder = (typeof PRESIGN_UPLOAD_FOLDERS)[number];

export async function createPresignedUploadUrl(
  folder: PresignUploadFolder,
  fileName: string,
  contentType: string,
  expiresInSeconds = 600,
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const key = `${folder}/${Date.now()}-${sanitizeFileName(fileName)}`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentDisposition: "inline",
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  return {
    uploadUrl,
    publicUrl: buildR2PublicUrl(key),
    key,
  };
}
