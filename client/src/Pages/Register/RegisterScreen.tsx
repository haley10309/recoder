import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';

import { useAuth } from '@/hooks/useAuth';
import { useAuthRegister } from './hooks/useAuthRegister';
import defaultAxios from '@/apis/defaultAxios';

interface RegisterRequest {
  email: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
  };
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

const RegisterScreen = () => {
  const { } = useAuthRegister(); // TODO: hook으로 옮기는 리팩토링

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userEmail } = useAuth();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const requestData: RegisterRequest = { email, password };
      
      const res = await defaultAxios.post<RegisterResponse>(
        `/auth/register`,
        requestData
      );

      if (res.data.success) {
        setSuccessMsg('회원가입이 완료되었습니다! 로그인해주세요.');
        // 성공 후 입력 필드 초기화
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setErrorMsg(error?.response?.data?.message || '회원가입 실패');
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
        onSubmit={handleRegister}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">회원가입</h2>

        {errorMsg && (
          <p className="text-red-500 mb-4 text-sm">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-green-500 mb-4 text-sm">{successMsg}</p>
        )}

        <label className="block mb-2 text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
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
          {isLoading ? '처리 중...' : '회원가입'}
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterScreen;