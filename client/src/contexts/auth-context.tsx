import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    logout,
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

// Helper functions to get typed user data
export function useEmployeeAuth() {
  const { user } = useAuth();
  return user?.type === 'employee' ? (user.data as Employee) : null;
}

export function useCandidateAuth() {
  const { user } = useAuth();
  return user?.type === 'candidate' ? (user.data as Candidate) : null;
}