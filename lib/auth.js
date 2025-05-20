import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

export async function hashPassword(p) {
  return bcrypt.hash(p, 10);
}

export async function verifyPassword(p, h) {
  return bcrypt.compare(p, h);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/** Extract & verify our JWT from the 'auth_token' cookie */
export function getTokenFromReq(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.auth_token;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
