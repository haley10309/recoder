// @ts-nocheck // TODO: 추후 삭제하고 타입 맞추기

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from "../../config/db";
import { isValidEmail } from '../../utils/validator';

export const login = async (req, res) => {
  const { email, password } = req.body;

  // 필수 입력 검사
  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호는 필수입니다.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: '올바른 이메일 형식이 아닙니다. (a.b@cheilpengtai.com 형식만 허용)',
    });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    // 사용자 조회
    db.query(
      "SELECT * FROM AdminUsers WHERE email = ? AND deleted_at IS NULL",
      [email],
      async (err, results) => {
        if (err) {
          console.error("로그인 오류:", err);
          return res.status(500).json({ message: "서버 오류" });
        }

        if (results.length === 0) {
          return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
        }

        const admin = results[0];

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
        }

        db.query("UPDATE AdminUsers SET last_logged_in_at = NOW() WHERE id = ?", [admin.id]);

        // JWT 생성
        const token = jwt.sign(
          {
            id: admin.id,
            email: admin.email,
            name_en: admin.name_en,
            last_logged_in_at: admin.last_logged_in_at
          },
          JWT_SECRET,
          { expiresIn: '12h' }
        );

        return res.status(200).json({ message: "로그인 성공", token });
      }
    );
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};
