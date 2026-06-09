type ApiErrorPayload = {
  message?: unknown;
  error?: unknown;
  errors?: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Extract a user-facing message from a JSON API error body. */
export function getMessageFromApiPayload(payload: unknown): string | null {
  if (payload == null) return null;

  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return getMessageFromApiPayload(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const message = getMessageFromApiPayload(item);
      if (message) return message;
    }
    return null;
  }

  if (!isRecord(payload)) return null;

  const data = payload as ApiErrorPayload;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (isRecord(first) && typeof first.message === "string" && first.message.trim()) {
      return first.message.trim();
    }
  }

  return null;
}

export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("err_connection") ||
    message.includes("load failed")
  );
}

/** Turn thrown errors and raw API responses into plain readable text. */
export function formatApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error == null) return fallback;

  if (typeof error === "string") {
    return parseRawErrorMessage(error) || fallback;
  }

  if (error instanceof Error) {
    return parseRawErrorMessage(error.message) || fallback;
  }

  const fromPayload = getMessageFromApiPayload(error);
  if (fromPayload) return fromPayload;

  return fallback;
}

function parseRawErrorMessage(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const statusPrefix = trimmed.match(/^(\d{3}):\s*(.+)$/s);
  if (statusPrefix) {
    const body = statusPrefix[2].trim();
    const fromJson = getMessageFromApiPayload(body);
    if (fromJson) return fromJson;

    if (!body.startsWith("{") && !body.startsWith("[")) {
      return body;
    }
  }

  const fromJson = getMessageFromApiPayload(trimmed);
  if (fromJson) return fromJson;

  if (isNetworkError(new Error(trimmed))) {
    return "Unable to reach the server. Please check your connection and try again in a moment.";
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return null;
  }

  return trimmed;
}
