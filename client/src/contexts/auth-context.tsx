import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const verifySession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(createApiUrl('/api/auth/verify-session'), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        setUser(null);
        setIsVerified(true);
        localStorage.removeItem('auth_user');
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
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        return true;
      } else {
        setUser(null);
        setIsVerified(true);
        localStorage.removeItem('auth_user');
        return false;
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      setUser(null);
      setIsVerified(true);
      localStorage.removeItem('auth_user');
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      setIsVerified(false);
      
      await verifySession();
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [verifySession]);

  useEffect(() => {
    if (user && isVerified) {
      localStorage.setItem('auth_user', JSON.stringify(user));
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
      setUser(null);
      setIsVerified(false);
      localStorage.clear();
      sessionStorage.clear();
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
