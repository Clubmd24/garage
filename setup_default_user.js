#!/usr/bin/env node
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// New database connection string
const NEW_DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function setupDefaultUser() {
  console.log('🚀 Setting up default admin user...');
  
  let db;
  
  try {
    // Connect to new database
    db = await mysql.createConnection(NEW_DB_URL);
    console.log('✅ Connected to new database');
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.execute(`
      INSERT INTO users (username, email, password, role, first_name, surname, employee_id)
      VALUES ('admin', 'admin@garagevision.com', ?, 'admin', 'Admin', 'User', 'EMP001')
      ON DUPLICATE KEY UPDATE 
        password = VALUES(password),
        role = VALUES(role)
    `, [hashedPassword]);
    
    console.log('✅ Default admin user created successfully!');
    console.log('📝 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@garagevision.com');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the setup
setupDefaultUser();
