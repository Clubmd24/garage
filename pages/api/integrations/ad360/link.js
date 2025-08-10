import pool from '../../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { tenantId, supplierId, username, password, consent } = req.body;

    // Validate required fields
    if (!tenantId || !supplierId || !username || !password || consent !== true) {
      return res.status(400).json({ error: 'Missing required fields or consent not given' });
    }

    // Assert consent and upsert consent fields
    if (!consent) {
      return res.status(400).json({ error: 'Consent is required for automated fetching' });
    }

    // For now, we'll simulate a successful link without actual browser automation
    // This allows us to test the integration flow while we work on the browser automation
    // In production, this would be replaced with actual AD360 authentication
    
    // Create a mock session object
    const sessionObj = { 
      username,
      linkedAt: new Date().toISOString(),
      status: 'active',
      mock: true // Flag to indicate this is a test session
    };
    
    // Save encrypted session
    const { encryptJSON } = await import('../../../../lib/cryptoVault.js');
    const encrypted = encryptJSON(sessionObj);
    
    await pool.query(
      `INSERT INTO supplier_accounts (tenant_id, supplier_id, encrypted_session, last_session_at, consent_automated_fetch, consent_at)
       VALUES (?, ?, ?, NOW(), 1, NOW())
       ON DUPLICATE KEY UPDATE encrypted_session=VALUES(encrypted_session), last_session_at=NOW(), consent_automated_fetch=1, consent_at=NOW()`,
      [tenantId, supplierId, encrypted]
    );

    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.link', JSON.stringify({ supplierId, success: true, mock: true })]
    );
    
    return res.status(200).json({ 
      status: 'linked',
      message: 'AD360 account linked successfully (test mode)',
      mock: true
    });

  } catch (error) {
    console.error('AD360 link error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 