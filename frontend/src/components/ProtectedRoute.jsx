import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        {/* Navy/Gold themed loading state */}
        <div className="text-center">
          <div className="relative inline-block">
            {/* Main Spinner - Navy */}
            <div className="animate-spin rounded-xl h-14 w-14 border-2 border-[#1B2F4E] border-t-transparent shadow-sm"></div>
            {/* Decorative Gold Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#8A6C2A] rounded-full animate-pulse"></div>
          </div>
          <p className="mt-6 text-[#1B2F4E] font-black uppercase tracking-[0.2em] text-[10px]">
            Verifying Credentials
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};