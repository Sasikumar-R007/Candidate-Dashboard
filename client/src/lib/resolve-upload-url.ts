const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  ""
).trim();

function getApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/+$/, "");
}

function decodeFileNameSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function extractFileNameFromPatterns(url: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return decodeFileNameSegment(match[1]);
    }
  }
  return null;
}

export function resolveAvatarFileUrl(filePath?: string | null): string | null {
  if (!filePath?.trim()) return null;
  const url = filePath.trim();
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  const legacyPatterns = [/\/uploads\/([^/?#]+)$/i];

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (shouldProxyStoredUrl(url, "avatars", legacyPatterns)) {
      return toStoredFileApiUrl(url, "avatars", legacyPatterns) ?? url;
    }
    return url;
  }

  if (url.startsWith("/api/files/avatars/") || url.startsWith("/api/profile-media/")) {
    return `${getApiBaseUrl()}${url}`;
  }

  let normalized = url;
  if (!normalized.startsWith("/")) {
    normalized = normalized.startsWith("uploads/") ? `/${normalized}` : `/uploads/${normalized}`;
  }

  const fileName = extractFileNameFromPatterns(normalized, [/\/uploads\/([^/?#]+)$/i]);
  const apiBase = getApiBaseUrl();
  if (fileName && apiBase) {
    return `${apiBase}/api/files/avatars/${encodeURIComponent(fileName)}`;
  }
  return apiBase ? `${apiBase}${normalized}` : normalized;
}

function toStoredFileApiUrl(
  storedUrl: string,
  apiFolder: "resumes" | "jds" | "logos" | "chat" | "avatars",
  legacyPatterns: RegExp[],
): string | null {
  const apiBase = getApiBaseUrl();
  if (!apiBase) return null;
  if (storedUrl.includes(`/api/files/${apiFolder}/`)) {
    return storedUrl;
  }

  const r2Patterns = [new RegExp(`/${apiFolder}/([^/?#]+)$`, "i")];
  const fileName =
    extractFileNameFromPatterns(storedUrl, [...r2Patterns, ...legacyPatterns]) ??
    null;
  if (!fileName) return null;
  return `${apiBase}/api/files/${apiFolder}/${encodeURIComponent(fileName)}`;
}

function shouldProxyStoredUrl(url: string, apiFolder: string, legacyPatterns: RegExp[]): boolean {
  if (url.includes(`/api/files/${apiFolder}/`)) return false;
  // Proxy any remote object URL under /<folder>/… (R2 public URL, custom CDN domain, etc.)
  if (/^https?:\/\//i.test(url) && new RegExp(`/${apiFolder}/[^/?#]+`, "i").test(url)) {
    return true;
  }
  return legacyPatterns.some((pattern) => pattern.test(url));
}

/** R2 blocks cross-origin iframe embedding — serve via the API in production. */
export function resolveJdFileUrl(filePath?: string | null): string | null {
  if (!filePath?.trim()) return null;
  const url = filePath.trim();
  const legacyPatterns = [
    /\/uploads\/chat\/([^/?#]+)$/i,
    /\/uploads\/([^/?#]+)$/i,
  ];

  if (url.startsWith("data:") || url.startsWith("blob:")) return null;

  if (/^jds\/[^/]+/i.test(url)) {
    const fileName = url.replace(/^jds\//i, "");
    const apiBase = getApiBaseUrl();
    if (apiBase && fileName) {
      return `${apiBase}/api/files/jds/${encodeURIComponent(fileName)}`;
    }
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (shouldProxyStoredUrl(url, "jds", legacyPatterns)) {
      return toStoredFileApiUrl(url, "jds", legacyPatterns) ?? url;
    }
    return url;
  }

  if (url.startsWith("/api/files/jds/")) {
    return `${getApiBaseUrl()}${url}`;
  }

  let normalized = url;
  if (!normalized.startsWith("/")) {
    normalized = normalized.startsWith("uploads/") ? `/${normalized}` : `/uploads/${normalized}`;
  }

  const fileName = extractFileNameFromPatterns(normalized, [
    /\/uploads\/chat\/([^/?#]+)$/i,
    /\/uploads\/([^/?#]+)$/i,
  ]);
  const apiBase = getApiBaseUrl();
  if (fileName && apiBase) {
    return `${apiBase}/api/files/jds/${encodeURIComponent(fileName)}`;
  }
  return apiBase ? `${apiBase}${normalized}` : normalized;
}

export function resolveLogoFileUrl(filePath?: string | null): string | null {
  if (!filePath?.trim()) return null;
  const url = filePath.trim();
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  const legacyPatterns = [/\/uploads\/([^/?#]+)$/i];

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (shouldProxyStoredUrl(url, "logos", legacyPatterns)) {
      return toStoredFileApiUrl(url, "logos", legacyPatterns) ?? url;
    }
    return url;
  }

  if (url.startsWith("/api/files/logos/")) {
    return `${getApiBaseUrl()}${url}`;
  }

  let normalized = url;
  if (!normalized.startsWith("/")) {
    normalized = normalized.startsWith("uploads/") ? `/${normalized}` : `/uploads/${normalized}`;
  }

  const fileName = extractFileNameFromPatterns(normalized, [/\/uploads\/([^/?#]+)$/i]);
  const apiBase = getApiBaseUrl();
  if (fileName && apiBase) {
    return `${apiBase}/api/files/logos/${encodeURIComponent(fileName)}`;
  }
  return apiBase ? `${apiBase}${normalized}` : normalized;
}

export function resolveChatFileUrl(filePath?: string | null): string | null {
  if (!filePath?.trim()) return null;
  const url = filePath.trim();
  const legacyPatterns = [/\/uploads\/chat\/([^/?#]+)$/i];

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (shouldProxyStoredUrl(url, "chat", legacyPatterns)) {
      return toStoredFileApiUrl(url, "chat", legacyPatterns) ?? url;
    }
    return url;
  }

  if (url.startsWith("/api/files/chat/")) {
    return `${getApiBaseUrl()}${url}`;
  }

  let normalized = url;
  if (!normalized.startsWith("/")) {
    normalized = normalized.startsWith("uploads/")
      ? `/${normalized}`
      : `/uploads/chat/${normalized}`;
  }

  const fileName = extractFileNameFromPatterns(normalized, [/\/uploads\/chat\/([^/?#]+)$/i]);
  const apiBase = getApiBaseUrl();
  if (fileName && apiBase) {
    return `${apiBase}/api/files/chat/${encodeURIComponent(fileName)}`;
  }
  return apiBase ? `${apiBase}${normalized}` : normalized;
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
    const legacyResumePatterns = [
      /\/api\/files\/resumes\/([^/?#]+)$/i,
      /\/uploads\/resumes\/([^/?#]+)$/i,
      /\/resumes\/([^/?#]+)$/i,
    ];
    if (shouldProxyStoredUrl(url, "resumes", legacyResumePatterns)) {
      const apiBase = getApiBaseUrl();
      if (!apiBase) return url;
      const fileName = extractFileNameFromPatterns(url, legacyResumePatterns);
      if (fileName) {
        return `${apiBase}/api/files/resumes/${encodeURIComponent(fileName)}`;
      }
    }
    if (url.includes("/api/files/resumes/")) {
      return url;
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

  const resumeMatch = url.match(
    /(?:\/api\/files\/resumes|\/uploads\/resumes|\/resumes)\/([^/?#]+)/i,
  );
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
