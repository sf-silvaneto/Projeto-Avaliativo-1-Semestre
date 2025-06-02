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

  if (restricted && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PublicRoute;