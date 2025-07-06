import { nameEnState } from '@/recoil/atoms/state';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

const RequireAuth = ({ children }) => {
  // const token = localStorage.getItem('authToken');
  // const nameEn = useRecoilValue(nameEnState);

  // if (!token || !nameEn) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};

export default RequireAuth;
