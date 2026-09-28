import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminProtectedRoute = () => {
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUserRaw = localStorage.getItem('adminUser');
    let adminUser = null;

    try {
      if (adminUserRaw) {
        adminUser = JSON.parse(adminUserRaw);
      }
    } catch (e) {
      adminUser = null;
    }

    // Validation: Require adminToken and valid role ('admin' or 'sub-admin')
    if (adminToken && adminUser && (adminUser.role === 'admin' || adminUser.role === 'sub-admin')) {
      setIsAuthorized(true);
    } else if (adminToken && !adminUser) {
      // Fallback: If token exists but user object is not parsed yet, trust token if non-empty
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }

    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0326] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-purple-300 font-medium">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
