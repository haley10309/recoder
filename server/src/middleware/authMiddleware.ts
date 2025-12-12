import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt';
import { AuthRequest, UserPayload, ApiResponse } from '../types/auth.types';

// JWT 토큰 검증
export const authenticate = (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // "Bearer " 제거

    // 토큰 검증
    const decoded = jwt.verify(token, jwtConfig.secret) as UserPayload;
    
    // req 객체에 사용자 정보 추가
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// 권한 체크 미들웨어
export const authorize = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions'
      });
      return;
    }
    
    next();
  };
};