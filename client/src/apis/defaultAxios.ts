import { BASE_URL } from "@/utils/routePath";
import axios from "axios";

const defaultAxios = axios.create({
  baseURL: BASE_URL,
});

// 요청 시 자동으로 토큰 추가
defaultAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 에러 공통 처리
defaultAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message 
      || error.response?.data?.error 
      || "알 수 없는 오류가 발생했습니다.";

    console.error("[API Error]", {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    // 상태 코드별 처리
    switch (status) {
      case 401:
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        break;
      case 403:
        alert("접근 권한이 없습니다.");
        break;
      case 404:
        alert(message);
        break;
      case 500:
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        break;
      default:
        alert(message);
    }

    return Promise.reject(error);
  }
);

export default defaultAxios;
