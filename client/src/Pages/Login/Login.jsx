import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import * as jwtDecodeLib from "jwt-decode";

import { nameEnState } from '@/recoil/atoms/state';
import defaultAxios from '@/apis/defaultAxios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const setNameEn = useSetRecoilState(nameEnState);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await defaultAxios.post('/admin/login', {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem('authToken', token);
      
      const decoded = jwtDecodeLib.jwtDecode(token);
      if (decoded?.name_en) {
        setNameEn(decoded.name_en);
      }
      
      navigate('/');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || '로그인 실패');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">로그인</h2>

        {errorMsg && <p className="text-red-500 mb-4 text-sm">{errorMsg}</p>}

        {/* 이메일 입력 */}
        <label className="block mb-2 text-sm font-medium text-gray-700">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />

        {/* 비밀번호 입력 */}
        <label className="block mb-2 text-sm font-medium text-gray-700">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 border border-gray-300 rounded"
          required
        />

        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="w-full bg-[#f4a262] text-white py-2 rounded hover:bg-orange-600 transition"
        >
          로그인
        </button>

        {/* 회원가입 유도 메시지 */}
        <p className="text-center text-sm text-gray-600 mt-6">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;