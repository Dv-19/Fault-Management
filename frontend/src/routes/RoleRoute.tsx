import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, landingPathForRole } from '../context/AuthContext';
import { Role } from '../types/domain';

export default function RoleRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth();

  // ProtectedRoute (the parent) already guarantees `user` is set here, but
  // keep this check self-contained in case RoleRoute is ever used alone.
  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role)) {
    return <Navigate to={landingPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
