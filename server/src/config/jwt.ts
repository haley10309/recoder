import { JwtConfig } from '../types/auth.types';

const jwtConfig: JwtConfig = {
  secret: (process.env.JWT_SECRET || 'ptk-seoul-center-secret-key') as string,
  expiresIn: (process.env.JWT_EXPIRES_IN || (60 * 60 * 12)) as number // 12h
};

export default jwtConfig;