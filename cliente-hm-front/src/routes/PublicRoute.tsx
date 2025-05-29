import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  restricted?: boolean;
  redirectPath?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  restricted = false, 
  redirectPath = '/prontuarios' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin mx-auto" />
          <p className="mt-4 text-neutral-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // If route is restricted and user is authenticated, redirect to dashboard
  if (restricted && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise, render the public route
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PublicRoute;