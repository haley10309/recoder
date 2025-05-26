
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // 'Bearer token값' 에서 token만 추출

  if (!token) {
    return res.status(401).json({ message: "토큰이 만료되었거나 없어요. 로그인 후 다시 시도해주세요." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // 필요하면 req에 정보 추가
    next(); // 통과
  } catch (err) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};

module.exports = authenticateToken;
