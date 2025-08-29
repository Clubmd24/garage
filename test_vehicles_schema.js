#!/usr/bin/env node
import mysql from 'mysql2/promise';

// Database connection string
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function testVehiclesSchema() {
  console.log('🔍 Testing Vehicles Table Schema...');
  
  let db;
  
  try {
    // Connect to database
    db = await mysql.createConnection(DB_URL);
    console.log('✅ Connected to database');
    
    // Check vehicles table structure
    console.log('\n🔍 Checking vehicles table structure...');
    const [columns] = await db.execute('SHOW COLUMNS FROM vehicles');
    console.log('Vehicles table columns:', columns.map(c => c.Field).join(', '));
    
    // Check if vehicles table has data
    console.log('\n📊 Checking vehicles table data...');
    const [vehicleCount] = await db.execute('SELECT COUNT(*) as count FROM vehicles');
    console.log(`Vehicles count: ${vehicleCount[0].count}`);
    
    if (vehicleCount[0].count > 0) {
      const [sampleVehicles] = await db.execute('SELECT id, licence_plate, make, model, client_id, fleet_id FROM vehicles LIMIT 3');
      console.log('Sample vehicles:', sampleVehicles);
    }
    
    // Check clients table structure
    console.log('\n🔍 Checking clients table structure...');
    const [clientColumns] = await db.execute('SHOW COLUMNS FROM clients');
    console.log('Clients table columns:', clientColumns.map(c => c.Field).join(', '));
    
    // Test the exact query from clientsService
    console.log('\n🧪 Testing clients query...');
    try {
      const [rows] = await db.execute(
        `SELECT c.id, c.first_name, c.last_name, c.email, c.mobile, c.landline, c.nie_number,
                c.street_address, c.town, c.province, c.post_code,
                c.garage_name, c.vehicle_reg, c.pin,
                GROUP_CONCAT(DISTINCT v.licence_plate ORDER BY v.licence_plate SEPARATOR ', ') as licence_plates,
                GROUP_CONCAT(DISTINCT v.make ORDER BY v.make SEPARATOR ', ') as makes,
                GROUP_CONCAT(DISTINCT v.model ORDER BY v.model SEPARATOR ', ') as models,
                MAX(CASE WHEN v.fleet_id IS NOT NULL AND v.fleet_id != 2 THEN 1 ELSE 0 END) as has_fleet_vehicles,
                MAX(CASE WHEN v.fleet_id = 2 THEN 1 ELSE 0 END) as has_local_vehicles,
                MAX(CASE WHEN v.id IS NULL THEN 1 ELSE 0 END) as has_no_vehicles
           FROM clients c
      LEFT JOIN vehicles v ON v.client_id = c.id
          GROUP BY c.id
          ORDER BY c.first_name, c.last_name
          LIMIT 20`
      );
      console.log(`✅ Query successful, returned ${rows.length} rows`);
      if (rows.length > 0) {
        console.log('First row:', rows[0]);
      }
    } catch (error) {
      console.log('❌ Query failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the test
testVehiclesSchema();
