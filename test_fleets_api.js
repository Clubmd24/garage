#!/usr/bin/env node
import mysql from 'mysql2/promise';

// Database connection string
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function testFleetsAPI() {
  console.log('🔍 Testing Fleets API and Database...');
  
  let db;
  
  try {
    // Connect to database
    db = await mysql.createConnection(DB_URL);
    console.log('✅ Connected to database');
    
    // Check fleets table structure
    console.log('\n🔍 Checking fleets table structure...');
    const [columns] = await db.execute('SHOW COLUMNS FROM fleets');
    console.log('Fleets table columns:', columns.map(c => c.Field).join(', '));
    
    // Check if fleets table has data
    console.log('\n📊 Checking fleets table data...');
    const [fleetCount] = await db.execute('SELECT COUNT(*) as count FROM fleets');
    console.log(`Fleets count: ${fleetCount[0].count}`);
    
    if (fleetCount[0].count > 0) {
      const [sampleFleets] = await db.execute('SELECT id, company_name, garage_name FROM fleets LIMIT 3');
      console.log('Sample fleets:', sampleFleets);
    }
    
    // Test the exact query from fleetsService
    console.log('\n🧪 Testing fleets query...');
    try {
      const [rows] = await db.execute(
        `SELECT id, company_name, garage_name, name, contact_person, email, phone, address, postcode,
                street_address, contact_number_1, contact_number_2,
                email_1, email_2, credit_limit, tax_number,
                contact_name_1, contact_name_2
           FROM fleets ORDER BY id`
      );
      console.log(`✅ Query successful, returned ${rows.length} rows`);
      if (rows.length > 0) {
        console.log('First row:', rows[0]);
      }
    } catch (error) {
      console.log('❌ Query failed:', error.message);
    }
    
    // Check clients table
    console.log('\n📊 Checking clients table...');
    const [clientCount] = await db.execute('SELECT COUNT(*) as count FROM clients');
    console.log(`Clients count: ${clientCount[0].count}`);
    
    // Check vehicles table
    console.log('\n📊 Checking vehicles table...');
    const [vehicleCount] = await db.execute('SELECT COUNT(*) as count FROM vehicles');
    console.log(`Vehicles count: ${vehicleCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the test
testFleetsAPI();
