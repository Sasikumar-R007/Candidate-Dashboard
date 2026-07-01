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

  // After login the session cookie may lag; forced checks must not reuse a pre-login in-flight request.
  if (!force && inflight) {
    return inflight;
  }

  if (force) {
    cached = null;
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

/** Delays after login before re-checking session (cookie + Postgres session store). */
const POST_AUTH_VERIFY_DELAYS_MS = [0, 250, 600, 1200];

/**
 * Retry verify-session after auth login. Handles brief cookie/session propagation delays
 * without clearing the client user when the server session is still settling.
 */
export async function confirmSessionAfterAuth(): Promise<VerifySessionResponse | null> {
  clearVerifySessionCache();

  for (const delay of POST_AUTH_VERIFY_DELAYS_MS) {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    clearVerifySessionCache();
    try {
      const data = await requestVerifySession({ force: true });
      if (data.authenticated) {
        return data;
      }
    } catch {
      // try again
    }
  }

  return null;
}
