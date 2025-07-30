import bcrypt from 'bcryptjs';
import pool from '../lib/db.js';

async function setupClientPasswords() {
  try {
    console.log('Setting up default passwords for clients...');
    
    // Get all clients with NULL password_hash
    const [clients] = await pool.query(
      'SELECT id, garage_name FROM clients WHERE password_hash IS NULL'
    );
    
    console.log(`Found ${clients.length} clients without passwords`);
    
    // Default password for all clients
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Update all clients with NULL password_hash
    const [result] = await pool.query(
      'UPDATE clients SET password_hash = ?, must_change_password = 1 WHERE password_hash IS NULL',
      [hashedPassword]
    );
    
    console.log(`Updated ${result.affectedRows} clients with default password`);
    console.log('Default password for all clients: password123');
    console.log('Clients will be prompted to change password on first login');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up client passwords:', error);
    process.exit(1);
  }
}

setupClientPasswords(); 