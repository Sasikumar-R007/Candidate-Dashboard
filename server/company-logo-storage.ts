import { uploadToR2Folder } from "./utils/r2Upload";

/** Persist job/company logos: R2 URL in production; keep legacy base64 in development. */
export async function persistCompanyLogoValue(
  logo: string | null | undefined,
): Promise<string | null> {
  if (!logo?.trim()) return null;

  const trimmed = logo.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (!trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  const match = trimmed.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) {
    return trimmed;
  }

  if (process.env.NODE_ENV !== "production") {
    return trimmed;
  }

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) {
    return trimmed;
  }

  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "img";
  return uploadToR2Folder(buffer, `job-logo-${Date.now()}.${ext}`, mimeType, "logos");
}
