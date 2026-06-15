import { useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import type { Employee } from '@shared/schema';
import EmployeeAgreementFirstLoginModal from '@/components/employee-dashboard/employee-agreement-first-login-modal';
import { logConsent } from '@/lib/consent-log';
import { toast } from '@/hooks/use-toast';

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
  const { user, isLoading, isVerified, verifySession } = useAuth();
  const [, setLocation] = useLocation();

  const authState = useMemo(() => {
    // CRITICAL: Block ALL access until auth is fully verified
    // This prevents race conditions where page loads before auth check completes
    if (isLoading || !isVerified) {
      return { status: 'loading' as const };
    }

    // After verification is complete, check authentication
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
        return { status: 'unauthorized_role' as const, redirect: '/employer-login' };
      }
    }

    return { status: 'authorized' as const };
  }, [user, isLoading, isVerified, allowedRoles, redirectTo, userType]);

  const shouldGateEmployeeAgreement = useMemo(() => {
    if (authState.status !== 'authorized' || !user || user.type !== 'employee') {
      return false;
    }

    const employee = user.data as Employee & { employeeAgreementAccepted?: boolean };
    const normalizedRole = String(employee.role || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_');
    const gatedRoles = new Set([
      'recruiter',
      'talent_advisor',
      'ta',
      'teamlead',
      'team_leader',
      'teamleader',
      'tl',
      'admin',
    ]);
    return gatedRoles.has(normalizedRole) && employee.employeeAgreementAccepted !== true;
  }, [authState.status, user]);

  const handleAcceptEmployeeAgreement = async () => {
    if (user?.type !== 'employee') return;
    const employee = user.data as Employee;
    if (!employee?.id) return;
    const ok = await logConsent({
      user_id: employee.id,
      role: "employee",
      consent_type: "employee_agreement",
      policy_version: "2026-05-10",
    });
    if (ok) {
      await verifySession({ force: true });
    } else {
      toast({
        title: "Could not save agreement",
        description: "Check your connection or try again. If this keeps happening, contact support.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Immediately redirect if not authorized (no delay)
    if (authState.status !== 'loading' && authState.status !== 'authorized' && 'redirect' in authState) {
      setLocation(authState.redirect);
    }
  }, [authState, setLocation]);

  // NEVER render children until fully authorized
  // This is the security barrier
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
    // Show redirecting screen while redirect happens
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="redirecting">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Only render children when status is explicitly 'authorized'
  return (
    <>
      <EmployeeAgreementFirstLoginModal
        open={shouldGateEmployeeAgreement}
        onAccept={handleAcceptEmployeeAgreement}
      />
      <div
        className={shouldGateEmployeeAgreement ? "pointer-events-none select-none" : ""}
        aria-hidden={shouldGateEmployeeAgreement}
      >
        {children}
      </div>
    </>
  );
}
