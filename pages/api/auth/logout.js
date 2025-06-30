export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `auth_token=; HttpOnly; Path=/; Max-Age=0${secure}`);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true });
}
