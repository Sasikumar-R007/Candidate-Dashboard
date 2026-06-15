import { isNetworkError } from '@/lib/api-error-message';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;

/** Reuse a successful verify-session response for this long unless forced. */
export const VERIFY_SESSION_STALE_MS = 5 * 60 * 1000;

export type VerifySessionResponse = {
  authenticated?: boolean;
  userType?: string;
  user?: unknown;
  accountHeld?: boolean;
  holdMessage?: string;
  holdUntilLabel?: string;
  logoutInSeconds?: number;
  holdPending?: {
    inGracePeriod?: boolean;
    holdMessage?: string;
    holdUntilLabel?: string;
    logoutInSeconds?: number;
  };
};

let cached: { data: VerifySessionResponse; at: number } | null = null;
let inflight: Promise<VerifySessionResponse> | null = null;

export function clearVerifySessionCache(): void {
  cached = null;
  inflight = null;
}

async function fetchVerifySessionFromNetwork(): Promise<VerifySessionResponse> {
  const response = await fetch(createApiUrl('/api/auth/verify-session'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`verify-session failed with status ${response.status}`);
  }

  return (await response.json()) as VerifySessionResponse;
}

/**
 * Shared verify-session fetch with in-flight deduplication and short-lived cache.
 * Concurrent callers share one network request; cached results skip the network unless `force`.
 */
export async function requestVerifySession(options?: {
  force?: boolean;
}): Promise<VerifySessionResponse> {
  const force = options?.force ?? false;
  const now = Date.now();

  if (!force && cached && now - cached.at < VERIFY_SESSION_STALE_MS) {
    return cached.data;
  }

  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    try {
      const data = await fetchVerifySessionFromNetwork();
      cached = { data, at: Date.now() };
      return data;
    } catch (error) {
      if (isNetworkError(error) && cached) {
        return cached.data;
      }
      throw error;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
