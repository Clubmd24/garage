import pool from '../../../../lib/db.js';
import { encryptJSON } from '../../../../lib/cryptoVault.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Setting up AD360 account...');
    
    // Create a mock AD360 session
    const mockSession = {
      status: 'active',
      workflow: {
        distributor: 'AD Vicente',
        defaultTab: 'REPLACEMENT'
      },
      timestamp: new Date().toISOString()
    };
    
    // Encrypt the session
    const encryptedSession = encryptJSON(mockSession);
    
    // Check if AD360 account already exists
    const [existing] = await pool.query(
      'SELECT id FROM supplier_accounts WHERE tenant_id = ? AND supplier_id = ?',
      [1, 7]
    );
    
    if (existing.length > 0) {
      console.log('AD360 account already exists, updating session...');
      await pool.query(
        'UPDATE supplier_accounts SET encrypted_session = ? WHERE tenant_id = ? AND supplier_id = ?',
        [encryptedSession, 1, 7]
      );
    } else {
      console.log('Creating new AD360 account...');
      await pool.query(
        'INSERT INTO supplier_accounts (tenant_id, supplier_id, encrypted_session, created_at) VALUES (?, ?, ?, NOW())',
        [1, 7, encryptedSession]
      );
    }
    
    console.log('✅ AD360 account setup complete!');
    
    return res.status(200).json({
      success: true,
      message: 'AD360 account setup complete'
    });
    
  } catch (error) {
    console.error('❌ Error setting up AD360 account:', error);
    return res.status(500).json({ 
      error: 'Failed to setup AD360 account',
      details: error.message 
    });
  }
}
