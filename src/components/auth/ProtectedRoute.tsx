import { Navigate } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'admin';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, profile } = useAuthState();

  if (isLoading) {
    return (
      <EmployeeLayout centered hasBottomNav={false} hasHeader={false}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </EmployeeLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirements
  if (requiredRole && profile?.role !== requiredRole) {
    const defaultRedirect = profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={defaultRedirect} replace />;
  }

  // Check if profile is pending approval
  if (profile?.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (profile?.status === 'suspended') {
    return <Navigate to="/account-suspended" replace />;
  }

  return <>{children}</>;
}