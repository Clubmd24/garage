export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'auth_token=; HttpOnly; Path=/; Max-Age=0');
  res.status(200).json({ ok:true });
}