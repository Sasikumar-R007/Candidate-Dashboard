import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Employee, Candidate } from '@shared/schema';
import { isNetworkError } from '@/lib/api-error-message';
import {
  clearVerifySessionCache,
  requestVerifySession,
  type VerifySessionResponse,
} from '@/lib/verify-session-client';

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
  isSigningOut: boolean;
  beginSignOut: () => void;
  endSignOut: () => void;
  logout: () => Promise<void>;
  verifySession: (options?: { force?: boolean }) => Promise<boolean>;
  isVerified: boolean;
  holdPending: HoldPendingState | null;
  accountHeldMessage: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Use sessionStorage instead of localStorage for per-tab isolation
// This prevents one user's login from affecting another user's tab
const AUTH_STORAGE_KEY = 'auth_user';

/** Survives AuthProvider remounts (e.g. React Strict Mode) so init runs only once per tab session. */
let authBootstrapDone = false;

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

function mapHoldPending(data: VerifySessionResponse): HoldPendingState | null {
  const pending = data.holdPending;
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

function applyAccountHeldState(
  data: VerifySessionResponse,
  setAccountHeldMessage: (message: string | null) => void,
  setHoldPending: (state: HoldPendingState | null) => void,
  setUser: (user: AuthUser | null) => void,
): boolean {
  setHoldPending(null);
  setAccountHeldMessage(
    String(
      data.holdMessage ||
        "Your account is on hold. Please contact your administrator.",
    ),
  );
  setUser(null);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  return false;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [holdPending, setHoldPending] = useState<HoldPendingState | null>(null);
  const [accountHeldMessage, setAccountHeldMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const applyVerifySessionData = useCallback((data: VerifySessionResponse): boolean => {
    if (data.accountHeld) {
      setIsVerified(true);
      return applyAccountHeldState(data, setAccountHeldMessage, setHoldPending, setUser);
    }

    if (data.authenticated && data.user) {
      const authUser: AuthUser = {
        type: data.userType as UserType,
        data: data.user as Employee | Candidate,
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
  }, []);

  const verifySession = useCallback(async (options?: { force?: boolean }): Promise<boolean> => {
    try {
      const data = await requestVerifySession({ force: options?.force });
      return applyVerifySessionData(data);
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
    }
  }, [applyVerifySessionData]);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      setIsLoading(true);
      setIsVerified(false);
      setUser(null);

      const forceInitialVerify = !authBootstrapDone;
      authBootstrapDone = true;

      await verifySession({ force: forceInitialVerify });

      if (!cancelled) {
        setIsLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user && isVerified) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user, isVerified]);

  const applyHoldCheckResult = useCallback((data: VerifySessionResponse) => {
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
        applyAccountHeldState(data, setAccountHeldMessage, setHoldPending, setUser);
      }
      return;
    }

    const pending = mapHoldPending(data);
    if (pending) {
      setHoldPending(pending);
    }
  }, []);

  useEffect(() => {
    if (!user || user.type !== "employee" || holdPending) {
      return;
    }

    const checkHoldOnVisible = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void requestVerifySession({ force: true })
        .then(applyHoldCheckResult)
        .catch(() => {
          // ignore visibility check errors
        });
    };

    document.addEventListener("visibilitychange", checkHoldOnVisible);
    return () => document.removeEventListener("visibilitychange", checkHoldOnVisible);
  }, [user, holdPending, applyHoldCheckResult]);

  const beginSignOut = useCallback(() => {
    setIsSigningOut(true);
  }, []);

  const endSignOut = useCallback(() => {
    setIsSigningOut(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      setIsVerified(true);
      setHoldPending(null);
      setIsLoading(false);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem('employee');
      clearVerifySessionCache();
      authBootstrapDone = false;
    }
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isSigningOut,
    beginSignOut,
    endSignOut,
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
