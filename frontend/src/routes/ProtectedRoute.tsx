import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Redirects to /login if not authenticated.
 * Route guards are UX only — the backend enforces auth on every request.
 */
export default function ProtectedRoute() {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <LoadingSpinner label="Checking session…" fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
