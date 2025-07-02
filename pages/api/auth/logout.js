import apiHandler from '../../../lib/apiHandler.js';
function handler(req, res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `auth_token=; HttpOnly; Path=/; Max-Age=0${secure}`);
  res.status(200).json({ ok:true });
}

export default apiHandler(handler);
