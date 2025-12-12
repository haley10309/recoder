import { userEmailState } from '@/recoil/atoms/state';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

const RequireAuth = ({ children }) => {
  // const token = localStorage.getItem('authToken');
  const userEmail = useRecoilValue(userEmailState);

  // if (!token || !nameEn) {
  if (!userEmail) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
