import { getTokenFromReq } from '../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const resp = await fetch(`${process.env.CODEX_API_URL || 'https://api.codex.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CODEX_API_KEY}`
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
  });

  if (!resp.ok) {
    const text = await resp.text();
    return res.status(500).json({ error: 'Codex API error', details: text });
  }

  const data = await resp.json();
  return res.status(200).json(data);
}
