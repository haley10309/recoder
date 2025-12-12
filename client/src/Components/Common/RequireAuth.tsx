import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

const RequireAuth = ({ children }) => {
  const { userEmail } = useAuth();

  if (!userEmail) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
