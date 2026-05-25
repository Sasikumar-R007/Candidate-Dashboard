import { resolveUploadAssetUrl } from "@/lib/resolve-upload-url";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export { resolveUploadAssetUrl };

/** Resolve profile picture / avatar URLs from API (including DB-backed /api/profile-media). */
export function resolveProfilePictureUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/api/")) return `${API_BASE_URL}${trimmed}`;
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }
  return `${API_BASE_URL}/uploads/${trimmed}`;
}
