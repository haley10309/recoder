export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      name_en: string;
      role: string;
    };
  };
}

export interface User {
  id: number;
  email: string;
  name_en: string;
  role: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  name_en: string;
  role: string;
  iat: number;
  exp: number;
}