import { Request } from 'express';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name_en?: string;
  role?: string;
}

export interface UserPayload {
  id: number;
  email: string;
  name_en: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface JwtConfig {
  secret: string;
  expiresIn: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name_en: string;
    role: string;
  };
}