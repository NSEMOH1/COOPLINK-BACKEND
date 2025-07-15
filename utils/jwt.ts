import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from '../config/env'

export const generateToken = (payload: object): string => {
  const options: SignOptions = {
  expiresIn: config.jwtExpiresIn as '1d' | '7d' | '30d'
};
  
  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret)
}