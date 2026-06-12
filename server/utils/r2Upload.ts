import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || "",
    secretAccessKey: process.env.R2_SECRET_KEY || "",
  },
});

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
): Promise<string> {
  const key = `resumes/${Date.now()}-${fileName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: fileType,
    }),
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
