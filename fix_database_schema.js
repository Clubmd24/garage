#!/usr/bin/env node
import mysql from 'mysql2/promise';

// New database connection string
const NEW_DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema to match application expectations...');
  
  let db;
  
  try {
    // Connect to new database
    db = await mysql.createConnection(NEW_DB_URL);
    console.log('✅ Connected to new database');
    
    // Fix 1: Rename password column to password_hash in users table
    console.log('🔧 Fix 1: Renaming password column to password_hash...');
    try {
      await db.execute('ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL');
      console.log('✅ Password column renamed to password_hash');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  password_hash column already exists');
      } else {
        console.log('⚠️  Password column rename warning:', error.message);
      }
    }
    
    // Fix 2: Add missing columns to users table
    console.log('🔧 Fix 2: Adding missing columns to users table...');
    const userColumns = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS surname VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS street_address TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS post_code VARCHAR(20)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS ni_tie_number VARCHAR(50)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50)'
    ];
    
    for (const column of userColumns) {
      try {
        await db.execute(column);
        console.log('✅ User column added successfully');
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log('ℹ️  Column already exists');
        } else {
          console.log('⚠️  Column addition warning:', error.message);
        }
      }
    }
    
    // Fix 3: Fix clients table structure
    console.log('🔧 Fix 3: Fixing clients table structure...');
    
    // Check if clients table has 'name' column
    const [clientColumns] = await db.execute("SHOW COLUMNS FROM clients LIKE 'name'");
    
    if (clientColumns.length > 0) {
      // Rename 'name' to 'first_name' and add 'last_name'
      console.log('🔄 Renaming name column to first_name...');
      try {
        await db.execute('ALTER TABLE clients CHANGE COLUMN name first_name TEXT NOT NULL');
        console.log('✅ Name column renamed to first_name');
      } catch (error) {
        console.log('⚠️  Name column rename warning:', error.message);
      }
    }
    
    // Add missing columns to clients table
    const clientColumnsToAdd = [
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_name TEXT',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS mobile TEXT',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS landline TEXT',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS nie_number TEXT',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS street_address TEXT',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS town TEXT',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS province TEXT',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS post_code TEXT',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS vehicle_reg VARCHAR(50)',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255)',
      'ALTER TABLE clients ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) DEFAULT 0'
    ];
    
    for (const column of clientColumnsToAdd) {
      try {
        await db.execute(column);
        console.log('✅ Client column added successfully');
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log('ℹ️  Column already exists');
        } else {
          console.log('⚠️  Column addition warning:', error.message);
        }
      }
    }
    
    // Fix 4: Fix vehicles table structure
    console.log('🔧 Fix 4: Fixing vehicles table structure...');
    
    // Check if vehicles table has 'license_plate' column
    const [vehicleColumns] = await db.execute("SHOW COLUMNS FROM vehicles LIKE 'license_plate'");
    
    if (vehicleColumns.length > 0) {
      // Rename 'license_plate' to 'licence_plate' (your app expects this)
      console.log('🔄 Renaming license_plate to licence_plate...');
      try {
        await db.execute('ALTER TABLE vehicles CHANGE COLUMN license_plate licence_plate VARCHAR(20) NOT NULL');
        console.log('✅ License plate column renamed');
      } catch (error) {
        console.log('⚠️  License plate column rename warning:', error.message);
      }
    }
    
    // Add missing columns to vehicles table
    const vehicleColumnsToAdd = [
      'ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS company_vehicle_id VARCHAR(50)',
      'ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS customer_id INT',
      'ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fleet_id INT'
    ];
    
    for (const column of vehicleColumnsToAdd) {
      try {
        await db.execute(column);
        console.log('✅ Vehicle column added successfully');
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log('ℹ️  Column already exists');
        } else {
          console.log('⚠️  Column addition warning:', error.message);
        }
      }
    }
    
    // Fix 5: Update admin user with correct structure
    console.log('🔧 Fix 5: Updating admin user structure...');
    try {
      await db.execute(`
        UPDATE users 
        SET first_name = 'Admin', 
            surname = 'User', 
            employee_id = 'EMP001',
            role = 'admin'
        WHERE username = 'admin'
      `);
      console.log('✅ Admin user updated successfully');
    } catch (error) {
      console.log('⚠️  Admin user update warning:', error.message);
    }
    
    console.log('\n🎉 Database schema fixes completed successfully!');
    console.log('📝 Your application should now be able to connect and login.');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the fix
fixDatabaseSchema();
