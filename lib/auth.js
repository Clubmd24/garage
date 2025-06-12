import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const SECRET = process.env.JWT_SECRET;

export async function hashPassword(p) {
  return bcrypt.hash(p, 10);
}
export async function verifyPassword(p, h) {
  return bcrypt.compare(p, h);
}
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
export function getTokenFromReq(req) {
  const cookies = parse(req.headers.cookie || '');
  if (!cookies.auth_token) return null;
  try {
    return verifyToken(cookies.auth_token);
  } catch {
    return null;
  }
}
