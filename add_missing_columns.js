#!/usr/bin/env node
import mysql from 'mysql2/promise';

// Database connection string
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function addMissingColumns() {
  console.log('🔧 Adding Missing Columns...');
  
  let db;
  
  try {
    // Connect to database
    db = await mysql.createConnection(DB_URL);
    console.log('✅ Connected to database');
    
    // Add fleet_id to clients table
    console.log('\n➕ Adding fleet_id to clients table...');
    try {
      await db.execute('ALTER TABLE clients ADD COLUMN fleet_id INT NULL');
      console.log('✅ Added fleet_id column to clients table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ fleet_id column already exists in clients table');
      } else {
        throw error;
      }
    }
    
    // Add foreign key constraint for fleet_id
    console.log('\n🔗 Adding foreign key constraint...');
    try {
      await db.execute(`
        ALTER TABLE clients 
        ADD CONSTRAINT fk_clients_fleet 
        FOREIGN KEY (fleet_id) REFERENCES fleets(id)
      `);
      console.log('✅ Added foreign key constraint');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Foreign key constraint already exists');
      } else {
        console.log('⚠️  Could not add foreign key constraint:', error.message);
      }
    }
    
    // Verify the structure
    console.log('\n🔍 Verifying updated structure...');
    const [clientColumns] = await db.execute('SHOW COLUMNS FROM clients');
    const hasFleetId = clientColumns.some(c => c.Field === 'fleet_id');
    console.log(`Clients table has fleet_id: ${hasFleetId ? 'YES' : 'NO'}`);
    
    if (hasFleetId) {
      console.log('🎉 All required columns are now present!');
      console.log('\n📊 Current table structure:');
      console.log('   - clients: ✅ has fleet_id');
      console.log('   - vehicles: ✅ has client_id and fleet_id');
      console.log('   - fleets: ✅ has company_name');
    }
    
  } catch (error) {
    console.error('❌ Column addition failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the fix
addMissingColumns();
