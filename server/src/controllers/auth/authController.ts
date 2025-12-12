import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/db';
import jwtConfig from '../../config/jwt';
import { 
  LoginRequest, 
  AuthRequest, 
  ApiResponse, 
  LoginResponse,
  UserPayload 
} from '../../types/auth.types';

interface DbUser {
  id: number;
  email: string;
  password: string;
  name_en: string;
  role: string;
}

// 로그인
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<ApiResponse<LoginResponse>>
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // 입력 검증
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // 사용자 조회
    db.query(
      'SELECT id, email, password, name_en, role FROM AdminUsers WHERE email = ? AND deleted_at IS NULL',
      [email],
      async (err, results: any) => {
        // TODO: results: any 수정
        if (err) {
          console.error('Login error:', err);
          res.status(500).json({
            success: false,
            message: 'Server error during login'
          });
          return;
        }

        if (results.length === 0) {
          res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
          return;
        }

        const user = results[0];

        // 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
          return;
        }

        // last_logged_in_at 업데이트
        db.query(
          'UPDATE AdminUsers SET last_logged_in_at = NOW() WHERE id = ?',
          [user.id],
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating last_logged_in_at:', updateErr);
            }
          }
        );

        // JWT 토큰 생성
        const payload: UserPayload = {
          id: user.id,
          email: user.email,
          name_en: user.name_en,
          role: user.role
        };

        const token = jwt.sign(payload, jwtConfig.secret, { 
          expiresIn: jwtConfig.expiresIn
        });

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              name_en: user.name_en,
              role: user.role
            }
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// 내 정보 조회
export const getMe = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    db.query(
      'SELECT id, email, name_en, role, created_at, last_logged_in_at FROM AdminUsers WHERE id = ? AND deleted_at IS NULL',
      [req.user.id],
      (err, results: any[]) => {
        if (err) {
          console.error('GetMe error:', err);
          res.status(500).json({
            success: false,
            message: 'Server error'
          });
          return;
        }

        if (results.length === 0) {
          res.status(404).json({
            success: false,
            message: 'User not found'
          });
          return;
        }

        res.json({
          success: true,
          data: results[0]
        });
      }
    );
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};