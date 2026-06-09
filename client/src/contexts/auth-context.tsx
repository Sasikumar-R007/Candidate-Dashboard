import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import type { Employee, Candidate } from '@shared/schema';
import { isNetworkError } from '@/lib/api-error-message';

export type UserType = 'employee' | 'candidate';

export interface AuthUser {
  type: UserType;
  data: Employee | Candidate;
}

export type HoldPendingState = {
  holdMessage: string;
  holdUntilLabel?: string;
  logoutInSeconds: number;
};

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  isVerified: boolean;
  holdPending: HoldPendingState | null;
  accountHeldMessage: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// API base URL - uses environment variable in production, empty string (relative) in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;

const VERIFY_SESSION_RETRIES = 3;
const VERIFY_SESSION_RETRY_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readCachedAuthUser(): AuthUser | null {
  const cached = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!cached) return null;

  try {
    return JSON.parse(cached) as AuthUser;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

async function fetchVerifySession(): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < VERIFY_SESSION_RETRIES; attempt++) {
    try {
      return await fetch(createApiUrl('/api/auth/verify-session'), {
        credentials: 'include',
      });
    } catch (error) {
      lastError = error;
      if (!isNetworkError(error) || attempt === VERIFY_SESSION_RETRIES - 1) {
        throw error;
      }
      await sleep(VERIFY_SESSION_RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Session verification failed');
}

// Use sessionStorage instead of localStorage for per-tab isolation
// This prevents one user's login from affecting another user's tab
const AUTH_STORAGE_KEY = 'auth_user';

function mapHoldPending(data: Record<string, unknown>): HoldPendingState | null {
  const pending = data.holdPending as Record<string, unknown> | undefined;
  if (!pending?.inGracePeriod) return null;
  const logoutInSeconds = Number(pending.logoutInSeconds || 0);
  if (!Number.isFinite(logoutInSeconds) || logoutInSeconds <= 0) return null;
  return {
    holdMessage: String(
      pending.holdMessage ||
        "Your account has been placed on hold by an administrator.",
    ),
    holdUntilLabel: pending.holdUntilLabel
      ? String(pending.holdUntilLabel)
      : undefined,
    logoutInSeconds,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [holdPending, setHoldPending] = useState<HoldPendingState | null>(null);
  const [accountHeldMessage, setAccountHeldMessage] = useState<string | null>(null);
  
  // Prevent race conditions by tracking in-flight requests
  const verifyingRef = useRef<Promise<boolean> | null>(null);
  const initializedRef = useRef(false);

  const verifySession = useCallback(async (): Promise<boolean> => {
    // Deduplicate concurrent verifySession calls
    if (verifyingRef.current) {
      return verifyingRef.current;
    }

    const verifyPromise = (async (): Promise<boolean> => {
      try {
        const response = await fetchVerifySession();

        if (!response.ok) {
          setUser(null);
          setIsVerified(true);
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
          return false;
        }

        const data = await response.json();

        if (data.accountHeld) {
          setHoldPending(null);
          setAccountHeldMessage(
            String(
              data.holdMessage ||
                "Your account is on hold. Please contact your administrator.",
            ),
          );
          setUser(null);
          setIsVerified(true);
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
          return false;
        }

        if (data.authenticated && data.user) {
          const authUser: AuthUser = {
            type: data.userType as UserType,
            data: data.user
          };
          setUser(authUser);
          setIsVerified(true);
          setAccountHeldMessage(null);
          setHoldPending(mapHoldPending(data));
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          return true;
        }

        setUser(null);
        setHoldPending(null);
        setIsVerified(true);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return false;
      } catch (error) {
        console.error('Session verification failed:', error);

        if (isNetworkError(error)) {
          const cachedUser = readCachedAuthUser();
          if (cachedUser) {
            setUser(cachedUser);
            setIsVerified(true);
            return true;
          }
        }

        setUser(null);
        setIsVerified(true);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return false;
      } finally {
        verifyingRef.current = null;
      }
    })();

    verifyingRef.current = verifyPromise;
    return verifyPromise;
  }, []);

  useEffect(() => {
    // Only initialize once to prevent infinite loops
    if (initializedRef.current) {
      return;
    }

    const initializeAuth = async () => {
      initializedRef.current = true;
      setIsLoading(true);
      setIsVerified(false);
      // CRITICAL: Don't restore from sessionStorage until verified
      // This prevents showing stale/wrong user data
      setUser(null);
      
      // Always verify with backend FIRST (source of truth)
      // This ensures:
      // 1. Session cookies are properly validated
      // 2. No stale data is shown
      // 3. Multi-user scenarios work correctly
      const isValid = await verifySession();
      
      // Only after backend verification, sessionStorage can be used as cache
      // But verifySession already handles sessionStorage, so we're good
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []); // Remove verifySession from dependencies to prevent loops

  useEffect(() => {
    if (user && isVerified) {
      // Use sessionStorage for per-tab isolation
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user, isVerified]);

  useEffect(() => {
    if (!user || user.type !== "employee" || holdPending) {
      return;
    }

    const pollHoldStatus = async () => {
      try {
        const response = await fetchVerifySession();
        if (!response.ok) return;
        const data = await response.json();
        if (data.accountHeld) {
          const logoutInSeconds = Number(data.logoutInSeconds || 0);
          if (logoutInSeconds > 0) {
            setHoldPending({
              holdMessage: String(
                data.holdMessage ||
                  "Your account has been placed on hold by an administrator.",
              ),
              holdUntilLabel: data.holdUntilLabel
                ? String(data.holdUntilLabel)
                : undefined,
              logoutInSeconds,
            });
          } else {
            setAccountHeldMessage(
              String(
                data.holdMessage ||
                  "Your account is on hold. Please contact your administrator.",
              ),
            );
            setUser(null);
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
          }
          return;
        }
        const pending = mapHoldPending(data);
        if (pending) {
          setHoldPending(pending);
        }
      } catch {
        // ignore polling errors
      }
    };

    const interval = setInterval(() => {
      void pollHoldStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [user, holdPending]);

  const logout = useCallback(async () => {
    try {
      await fetch(createApiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear all auth state immediately
      setUser(null);
      setIsVerified(false);
      setHoldPending(null);
      // Clear all auth-related storage
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem('employee');
      // Reset initialization flag so auth re-initializes if user navigates back
      initializedRef.current = false;
    }
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    logout,
    verifySession,
    isVerified,
    holdPending,
    accountHeldMessage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useEmployeeAuth() {
  const { user } = useAuth();
  return user?.type === 'employee' ? (user.data as Employee) : null;
}

export function useCandidateAuth() {
  const { user } = useAuth();
  return user?.type === 'candidate' ? (user.data as Candidate) : null;
}
