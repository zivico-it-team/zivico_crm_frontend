import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessRoles, getDashboardPathForUser, isHRUser } from '@/lib/roleUtils';

const MOBILE_BREAKPOINT = 1024;
const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;

const RoleBasedRoute = ({ children, allowedRoles, employeeMobileLeaveOnly = false, disallowHR = false }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(isMobileViewport);

  React.useEffect(() => {
    const onResize = () => {
      setIsMobile(isMobileViewport());
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessRoles(currentUser, allowedRoles)) {
    return <Navigate to={getDashboardPathForUser(currentUser) || '/login'} replace />;
  }

  if (disallowHR && isHRUser(currentUser)) {
    return <Navigate to={getDashboardPathForUser(currentUser) || '/login'} replace />;
  }

  if (
    employeeMobileLeaveOnly &&
    currentUser?.role === 'employee' &&
    isMobile &&
    location.pathname !== '/employee/leave'
  ) {
    return <Navigate to="/employee/leave" replace />;
  }

  return children;
};

export default RoleBasedRoute;
