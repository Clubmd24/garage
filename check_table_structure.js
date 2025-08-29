#!/usr/bin/env node
import mysql from 'mysql2/promise';

// Database connection string
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function checkTableStructure() {
  console.log('🔍 Checking Table Structure...');
  
  let db;
  
  try {
    // Connect to database
    db = await mysql.createConnection(DB_URL);
    console.log('✅ Connected to database');
    
    // Check clients table structure
    console.log('\n🔍 Clients table structure:');
    const [clientColumns] = await db.execute('SHOW COLUMNS FROM clients');
    console.log('Columns:', clientColumns.map(c => c.Field).join(', '));
    
    // Check vehicles table structure
    console.log('\n🔍 Vehicles table structure:');
    const [vehicleColumns] = await db.execute('SHOW COLUMNS FROM vehicles');
    console.log('Columns:', vehicleColumns.map(c => c.Field).join(', '));
    
    // Check fleets table structure
    console.log('\n🔍 Fleets table structure:');
    const [fleetColumns] = await db.execute('SHOW COLUMNS FROM fleets');
    console.log('Columns:', fleetColumns.map(c => c.Field).join(', '));
    
    // Check if we need to add missing columns
    console.log('\n🔍 Checking for missing columns...');
    
    const clientHasFleetId = clientColumns.some(c => c.Field === 'fleet_id');
    const vehiclesHasFleetId = vehicleColumns.some(c => c.Field === 'fleet_id');
    const vehiclesHasClientId = vehicleColumns.some(c => c.Field === 'client_id');
    
    console.log(`Clients table has fleet_id: ${clientHasFleetId ? 'YES' : 'NO'}`);
    console.log(`Vehicles table has fleet_id: ${vehiclesHasFleetId ? 'YES' : 'NO'}`);
    console.log(`Vehicles table has client_id: ${vehiclesHasClientId ? 'YES' : 'NO'}`);
    
    if (!clientHasFleetId) {
      console.log('➕ Need to add fleet_id to clients table');
    }
    
    if (!vehiclesHasFleetId) {
      console.log('➕ Need to add fleet_id to vehicles table');
    }
    
    if (!vehiclesHasClientId) {
      console.log('➕ Need to add client_id to vehicles table');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the check
checkTableStructure();
