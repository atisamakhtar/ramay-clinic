import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  // Check if user has required role
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    if (!user) return false;
    
    if (requiredRole === 'superadmin') {
      return user.role === 'superadmin';
    }
    
    return true; // Admin role or no specific role required
  };
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!hasRequiredRole()) {
    // Redirect to dashboard if doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}