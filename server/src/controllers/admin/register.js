

const bcrypt = require('bcrypt');
const db = require("../../config/db");
const { isValidEmail } = require('../../utils/validator');

exports.register = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호는 필수입니다.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: '올바른 이메일 형식이 아닙니다. (a.b@cheilpengtai.com 형식만 허용)',
    });
  }

  try {
    db.query("SELECT id FROM AdminUsers WHERE email = ? AND deleted_at IS NULL", [email], async (err, existing) => {
      if (err) {
        console.error("회원가입 오류:", err);
        return res.status(500).json({ message: "서버 오류" });
      }

      if (existing.length > 0) {
        return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const nameEn = email.split("@")[0].split(".")[0];

      const insertUserQuery =
        "INSERT INTO AdminUsers (email, password, name_en) VALUES (?, ?, ?)";
      db.query(insertUserQuery, [email, hashedPassword, nameEn], async (err, result) => {
        if (err) {
          console.error("회원가입 오류:", err);
          return res.status(500).json({ message: "서버 오류" });
        }
        const adminId = result.insertId;
        return res.status(201).json({ message: "회원가입 성공", id: adminId });
      });
    });
  } catch (err) {
    console.error("회원가입 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};
