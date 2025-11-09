import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
    
  const isAuthenticated = useSelector((state) => Boolean(state.user.token));
  return isAuthenticated ? <Outlet /> : <Navigate to='/' replace />;
}

export default ProtectedRoute;
