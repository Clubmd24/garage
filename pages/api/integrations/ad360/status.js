import pool from '../../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { tenantId, supplierId } = req.query;

    // Validate required fields
    if (!tenantId || !supplierId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if AD360 account is linked
    const [accountRows] = await pool.query(
      'SELECT last_session_at, consent_automated_fetch FROM supplier_accounts WHERE tenant_id = ? AND supplier_id = ?',
      [tenantId, supplierId]
    );

    if (!accountRows.length) {
      return res.status(404).json({ error: 'AD360 account not linked' });
    }

    const account = accountRows[0];

    return res.status(200).json({
      linked: true,
      lastSessionAt: account.last_session_at,
      consentAutomatedFetch: Boolean(account.consent_automated_fetch),
      status: 'active'
    });

  } catch (error) {
    console.error('AD360 status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 