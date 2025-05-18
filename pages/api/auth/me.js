import { verifyToken } from '../../../lib/auth';
export default function handler(req, res) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).end();
  try {
    const payload = verifyToken(token);
    res.status(200).json({ id:payload.sub, role: payload.role });
  } catch {
    res.status(401).end();
  }
}