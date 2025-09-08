import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '@/utils/routePath';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axios.post(`${BASE_URL}/admin/register`, {
        email,
        password,
      });

      setSuccessMsg('회원가입이 완료되었습니다! 로그인해주세요.');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || '회원가입 실패');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">회원가입</h2>

        {errorMsg && <p className="text-red-500 mb-4 text-sm">{errorMsg}</p>}
        {successMsg && <p className="text-green-500 mb-4 text-sm">{successMsg}</p>}

        <label className="block mb-2 text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-[#f4a262] text-white py-2 rounded hover:bg-orange-600 transition"
        >
          회원가입
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterScreen;