import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsAdmin } from '../features/auth/authSlice';

export function PrivateRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function AdminRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export function PublicRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  if (isAuth) return <Navigate to="/" replace />;
  return children;
}
