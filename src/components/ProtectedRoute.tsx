import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { FullPageSpinner } from '@/components/LoadingStates';

export const ProtectedRoute = () => {
  const { data: user, isLoading, isError } = useUser();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
