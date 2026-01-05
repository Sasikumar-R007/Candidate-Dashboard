import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import type { Employee, Candidate } from '@shared/schema';

export type UserType = 'employee' | 'candidate';

export interface AuthUser {
  type: UserType;
  data: Employee | Candidate;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  isVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// API base URL - uses environment variable in production, empty string (relative) in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;

// Use sessionStorage instead of localStorage for per-tab isolation
// This prevents one user's login from affecting another user's tab
const AUTH_STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  
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
        const response = await fetch(createApiUrl('/api/auth/verify-session'), {
          credentials: 'include'
        });
        
        if (!response.ok) {
          setUser(null);
          setIsVerified(true);
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
          return false;
        }
        
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          const authUser: AuthUser = {
            type: data.userType as UserType,
            data: data.user
          };
          setUser(authUser);
          setIsVerified(true);
          // Use sessionStorage for per-tab isolation
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          return true;
        } else {
          setUser(null);
          setIsVerified(true);
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
          return false;
        }
      } catch (error) {
        console.error('Session verification failed:', error);
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
