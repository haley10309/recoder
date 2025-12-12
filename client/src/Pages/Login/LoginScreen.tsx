import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios, { AxiosError } from 'axios';

import { BASE_URL } from '@/utils/routePath';
import type { LoginRequest, LoginResponse, JwtPayload } from '@/types/auth.types';
import { useAuth } from '@/hooks/useAuth';
import { useAuthLogin } from './hooks/useAuthLogin';

interface ErrorResponse {
  success: boolean;
  message: string;
}

const LoginScreen = () => {
  const { } = useAuthLogin(); // TODO: hook으로 옮기는 리팩토링

  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userEmail, setUserEmail, setNameEn } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const requestData: LoginRequest = { email, password };
      
      const res = await axios.post<LoginResponse>(
        `${BASE_URL}/auth/login`,
        requestData
      );

      if (res.data.success) {
        const token = res.data.data.token;
        localStorage.setItem('authToken', token);
        
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded?.name_en) {
          setNameEn(decoded.name_en);
        }
        if (decoded?.email) {
          setUserEmail(decoded.email);
        }

        navigate('/');
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setErrorMsg(error?.response?.data?.message || '로그인 실패');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  if (userEmail) {
    return (
      <div>이미 로그인했어요.</div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">로그인</h2>

        {errorMsg && (
          <p className="text-red-500 mb-4 text-sm">{errorMsg}</p>
        )}

        <label className="block mb-2 text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="example@cheilpengtai.com"
          required
          disabled={isLoading}
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          className="w-full p-2 mb-6 border border-gray-300 rounded"
          required
          disabled={isLoading}
        />

        <button
          type="submit"
          className="w-full bg-[#f4a262] text-white py-2 rounded hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
                
        <p className="text-center text-sm text-gray-600 mt-6">
          아직 계정이 없으신가요?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginScreen;