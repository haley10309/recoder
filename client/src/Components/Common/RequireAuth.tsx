import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
