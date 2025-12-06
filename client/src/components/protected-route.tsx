import { useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import type { Employee } from '@shared/schema';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  userType?: 'employee' | 'candidate' | 'any';
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/employer-login',
  userType = 'any'
}: ProtectedRouteProps) {
  const { user, isLoading, isVerified } = useAuth();
  const [, setLocation] = useLocation();

  const authState = useMemo(() => {
    if (isLoading || !isVerified) {
      return { status: 'loading' as const };
    }

    if (!user) {
      return { status: 'unauthenticated' as const, redirect: redirectTo };
    }

    if (userType !== 'any' && user.type !== userType) {
      const loginPage = userType === 'employee' ? '/employer-login' : '/candidate-login';
      return { status: 'wrong_user_type' as const, redirect: loginPage };
    }

    if (allowedRoles && allowedRoles.length > 0 && user.type === 'employee') {
      const employee = user.data as Employee;
      if (!allowedRoles.includes(employee.role)) {
        return { status: 'unauthorized_role' as const, redirect: '/dashboard-selection' };
      }
    }

    return { status: 'authorized' as const };
  }, [user, isLoading, isVerified, allowedRoles, redirectTo, userType]);

  useEffect(() => {
    if (authState.status !== 'loading' && authState.status !== 'authorized' && 'redirect' in authState) {
      setLocation(authState.redirect);
    }
  }, [authState, setLocation]);

  if (authState.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-auth">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (authState.status !== 'authorized') {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="redirecting">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
