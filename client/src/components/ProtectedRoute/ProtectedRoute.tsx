// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve where the user was trying to go, so login can redirect back after success
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}