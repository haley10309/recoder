import { JwtConfig } from '../types/auth.types';

const jwtConfig: JwtConfig = {
  secret: (process.env.JWT_SECRET || 'your-secret-key-change-this-in-production') as string,
  expiresIn: (process.env.JWT_EXPIRES_IN || 12) as number
};

export default jwtConfig;