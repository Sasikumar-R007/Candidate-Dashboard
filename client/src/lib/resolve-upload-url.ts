const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Resolve resume/profile upload paths to the API host (never the Vercel/static frontend).
 * Uses /api/files/resumes/:name so production hits the backend even when /uploads/* 404s on CDN.
 */
export function resolveUploadAssetUrl(
  filePath?: string | null,
  defaultSubdir = "uploads",
): string | null {
  if (!filePath) return null;
  let url = filePath.trim();
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/api/profile-media")) {
    return `${API_BASE_URL}${url}`;
  }

  if (url.startsWith("/api/files/")) {
    return `${API_BASE_URL}${url}`;
  }

  if (!url.startsWith("/")) {
    if (url.startsWith("uploads/")) url = `/${url}`;
    else url = `/${defaultSubdir}/${url}`;
  }

  const resumeMatch = url.match(/\/uploads\/resumes\/([^/?#]+)/i);
  if (resumeMatch?.[1]) {
    return `${API_BASE_URL}/api/files/resumes/${encodeURIComponent(resumeMatch[1])}`;
  }

  if (url.startsWith("/uploads/") || url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/uploads/${url}`;
}
