import pool from '../lib/db.js';
import { encryptJSON } from '../lib/cryptoVault.js';

async function setupAD360Account() {
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up AD360 account:', error);
    process.exit(1);
  }
}

setupAD360Account();
