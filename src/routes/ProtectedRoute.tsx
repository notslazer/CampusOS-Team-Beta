import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Feedback';
import ForbiddenPage from '../pages/ForbiddenPage';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
  showForbidden?: boolean;
}

/**
 * ProtectedRoute: Role-Based Access Control (RBAC) component
 * 
 * Features:
 * - Checks authentication status
 * - Validates user role against allowed roles
 * - Handles loading states during auth initialization
 * - Redirects unauthorized users to 403 Forbidden page or fallback dashboard
 * 
 * @param children - Component to render if authorized
 * @param allowedRoles - Array of roles allowed to access the route
 * @param showForbidden - If true, show 403 page; if false, redirect to dashboard (default: true)
 */
export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  showForbidden = true 
}: ProtectedRouteProps) {
  
  // 1. Destructure the values from useAuth()
  const { user, isAuthenticated, role, isLoading } = useAuth();
  
  // 2. Define the location hook
  const location = useLocation();

  // Show loading state while auth context initializes
  if (isLoading) return <PageLoader />;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login/member" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    // We already have 'role' from the destructuring above
    const hasAccess = role ? allowedRoles.includes(role) : false;

    if (!hasAccess) {
      if (showForbidden) {
        return <ForbiddenPage />;
      }

      const fallbackPath = role === 'lead'
        ? '/app/lead'
        : role === 'faculty'
          ? '/app/faculty'
          : '/app/member';

      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}
