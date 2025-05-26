import { BASE_URL } from "@/utils/routePath";
import axios from "axios";

const defaultAxios = axios.create({
  baseURL: BASE_URL,
});

// 요청 시 자동으로 토큰 추가
defaultAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    console.log('token',token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('error....')
    return Promise.reject(error);
  } // TODO: 만료됐을 때 어떻게 보여줄건지 처리
);

export default defaultAxios;