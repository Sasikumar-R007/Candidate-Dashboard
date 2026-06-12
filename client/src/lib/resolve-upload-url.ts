const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  ""
).trim();

function getApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/+$/, "");
}

function extractResumeFileName(url: string): string | null {
  const match = url.match(/\/resumes\/([^/?#]+)$/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function isExternalResumeStorageUrl(url: string): boolean {
  if (url.includes("/api/files/resumes/")) return false;
  if (!/\/resumes\/[^/?#]+$/i.test(url)) return false;
  if (/\.r2\.dev\b/i.test(url) || /r2\.cloudflarestorage\.com/i.test(url)) return true;
  const apiBase = getApiBaseUrl();
  if (apiBase && url.startsWith(`${apiBase}/uploads/resumes/`)) return true;
  if (url.includes("/uploads/resumes/")) return true;
  return false;
}

/** R2 blocks cross-origin iframe embedding — always serve previews via the API. */
function toResumeApiPreviewUrl(storedUrl: string): string | null {
  const apiBase = getApiBaseUrl();
  if (!apiBase) {
    if (import.meta.env.PROD && /\.r2\.dev\b/i.test(storedUrl)) {
      console.error(
        "[resume] VITE_API_URL is not set. Resume iframe preview will fail. Add VITE_API_URL to Vercel env.",
      );
    }
    return null;
  }
  const fileName = extractResumeFileName(storedUrl);
  if (!fileName) return null;
  return `${apiBase}/api/files/resumes/${encodeURIComponent(fileName)}`;
}

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
    if (isExternalResumeStorageUrl(url)) {
      return toResumeApiPreviewUrl(url) ?? url;
    }
    return url;
  }

  if (url.startsWith("/api/profile-media")) {
    return `${getApiBaseUrl()}${url}`;
  }

  if (url.startsWith("/api/files/")) {
    return `${getApiBaseUrl()}${url}`;
  }

  if (!url.startsWith("/")) {
    if (url.startsWith("uploads/")) url = `/${url}`;
    else url = `/${defaultSubdir}/${url}`;
  }

  const resumeMatch = url.match(/\/uploads\/resumes\/([^/?#]+)/i);
  if (resumeMatch?.[1]) {
    const apiBase = getApiBaseUrl();
    if (!apiBase) return null;
    return `${apiBase}/api/files/resumes/${encodeURIComponent(resumeMatch[1])}`;
  }

  const apiBase = getApiBaseUrl();
  if (!apiBase) return url.startsWith("/") ? url : `/${url}`;

  if (url.startsWith("/uploads/") || url.startsWith("/")) {
    return `${apiBase}${url}`;
  }

  return `${apiBase}/uploads/${url}`;
}
