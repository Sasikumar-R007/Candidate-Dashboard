import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || "",
    secretAccessKey: process.env.R2_SECRET_KEY || "",
  },
});

function sanitizeResumeFileName(fileName: string): string {
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

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
): Promise<string> {
  const key = `resumes/${Date.now()}-${sanitizeResumeFileName(fileName)}`;

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

export async function getR2ResumeByFileName(
  fileName: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  const keyCandidates = [
    `resumes/${fileName}`,
    `resumes/${encodeURIComponent(fileName)}`,
  ];
  const seen = new Set<string>();
  for (const key of keyCandidates) {
    if (seen.has(key)) continue;
    seen.add(key);
    const object = await getR2Object(key);
    if (object) return object;
  }
  return null;
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
