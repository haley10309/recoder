import { Router } from 'express';
import * as authController from '../controllers/auth/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// 회원가입
router.post('/register', authController.register);

// 로그인
router.post('/login', authController.login);

// 내 정보 조회 (인증 필요)
router.get('/me', authenticate, authController.getMe);

export default router;