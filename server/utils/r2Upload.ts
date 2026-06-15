import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || "",
    secretAccessKey: process.env.R2_SECRET_KEY || "",
  },
});

/** All R2 env vars must be set — missing R2_PUBLIC_URL yields broken relative URLs. */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_BUCKET?.trim() &&
      process.env.R2_ENDPOINT?.trim() &&
      process.env.R2_ACCESS_KEY?.trim() &&
      process.env.R2_SECRET_KEY?.trim() &&
      process.env.R2_PUBLIC_URL?.trim(),
  );
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[[\]#?%\\]/g, "_");
}

function buildR2PublicUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/${encodedKey}`;
}

export async function uploadToR2Folder(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  folder: string,
): Promise<string> {
  const key = `${folder}/${Date.now()}-${sanitizeFileName(fileName)}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: fileType,
      ContentDisposition: "inline",
    }),
  );

  return buildR2PublicUrl(key);
}

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
): Promise<string> {
  return uploadToR2Folder(fileBuffer, fileName, fileType, "resumes");
}

export async function getR2FileByFolderAndName(
  folder: string,
  fileName: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  let decoded = fileName;
  try {
    decoded = decodeURIComponent(fileName);
  } catch {
    decoded = fileName;
  }
  const objectName = decoded.startsWith(`${folder}/`)
    ? decoded.slice(folder.length + 1)
    : decoded;
  const baseName = path.basename(objectName);

  const keyCandidates = [`${folder}/${objectName}`, `${folder}/${baseName}`];
  const seen = new Set<string>();
  for (const key of keyCandidates) {
    if (seen.has(key)) continue;
    seen.add(key);
    const object = await getR2Object(key);
    if (object) return object;
  }

  try {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET,
        Prefix: `${folder}/`,
        MaxKeys: 1000,
      }),
    );
    const match = response.Contents?.find((item) => {
      if (!item.Key) return false;
      const itemBase = item.Key.split("/").pop() || "";
      return (
        itemBase === baseName ||
        itemBase === decoded ||
        item.Key.endsWith(`/${baseName}`) ||
        item.Key.endsWith(`/${decoded}`)
      );
    });
    if (match?.Key) {
      return getR2Object(match.Key);
    }
  } catch (error) {
    console.error(`R2 list fallback failed for ${folder}/${baseName}:`, error);
  }

  return null;
}

export async function getR2ResumeByFileName(
  fileName: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  return getR2FileByFolderAndName("resumes", fileName);
}

export async function getR2Object(
  key: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  try {
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      }),
    );
    if (!response.Body) {
      return null;
    }
    const body = Buffer.from(await response.Body.transformToByteArray());
    return {
      body,
      contentType: response.ContentType || "application/octet-stream",
    };
  } catch (error: unknown) {
    const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
}
