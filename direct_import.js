#!/usr/bin/env node
import fs from 'fs/promises';
import mysql from 'mysql2/promise';

// Database connection string
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function directImport() {
  console.log('🚀 Starting Direct CSV Import...');
  
  let db;
  
  try {
    // Connect to database
    console.log('🔍 Connecting to database...');
    db = await mysql.createConnection(DB_URL);
    console.log('✅ Connected to database');
    
    // Read CSV file
    console.log('📖 Reading CSV file...');
    const csvContent = await fs.readFile('./import_ready_clients.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      console.log('❌ CSV file is empty or invalid');
      return;
    }
    
    // Parse headers and data
    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);
    
    console.log(`📊 Found ${dataRows.length} data rows`);
    console.log(`📋 Headers: ${headers.join(', ')}`);
    
    // Start import process
    console.log('\n🔄 Starting data import...');
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowData = {};
      
      // Map values to headers
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      try {
        // Import Fleet (if company_name exists)
        let fleetId = null;
        if (rowData.company_name && rowData.company_name.trim()) {
          try {
            // Check if fleet exists
            const [existingFleets] = await db.execute(
              'SELECT id FROM fleets WHERE company_name = ?',
              [rowData.company_name]
            );
            
            if (existingFleets.length > 0) {
              fleetId = existingFleets[0].id;
              console.log(`   Fleet exists: ${rowData.company_name} (ID: ${fleetId})`);
            } else {
              // Create new fleet
              const [fleetResult] = await db.execute(`
                INSERT INTO fleets (company_name, garage_name, street_address, contact_number_1, contact_number_2, email_1, email_2, credit_limit, tax_number, contact_name_1, contact_name_2)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                rowData.company_name,
                rowData.garage_name,
                rowData.fleet_street_address,
                rowData.contact_number_1,
                rowData.contact_number_2,
                rowData.email_1,
                rowData.email_2,
                rowData.credit_limit || null,
                rowData.tax_number,
                rowData.contact_name_1,
                rowData.contact_name_2
              ]);
              
              fleetId = fleetResult.insertId;
              console.log(`   ✅ Created fleet: ${rowData.company_name} (ID: ${fleetId})`);
            }
          } catch (error) {
            console.log(`   ⚠️  Fleet error: ${error.message}`);
          }
        }
        
        // Import Client
        let clientId = null;
        if (rowData.first_name && rowData.first_name.trim()) {
          try {
            // Check if client exists
            const [existingClients] = await db.execute(
              'SELECT id FROM clients WHERE first_name = ? AND last_name = ?',
              [rowData.first_name, rowData.last_name]
            );
            
            if (existingClients.length > 0) {
              clientId = existingClients[0].id;
              console.log(`   Client exists: ${rowData.first_name} ${rowData.last_name} (ID: ${clientId})`);
            } else {
              // Create new client
              const [clientResult] = await db.execute(`
                INSERT INTO clients (first_name, last_name, email, mobile, landline, nie_number, street_address, town, province, post_code, garage_name, vehicle_reg)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                rowData.first_name,
                rowData.last_name,
                rowData.email,
                rowData.mobile,
                rowData.landline,
                rowData.nie_number,
                rowData.street_address,
                rowData.town,
                rowData.province,
                rowData.post_code,
                rowData.garage_name,
                rowData.vehicle_reg
              ]);
              
              clientId = clientResult.insertId;
              console.log(`   ✅ Created client: ${rowData.first_name} ${rowData.last_name} (ID: ${clientId})`);
            }
          } catch (error) {
            console.log(`   ⚠️  Client error: ${error.message}`);
          }
        }
        
        // Import Vehicle
        if (rowData.licence_plate && rowData.licence_plate.trim()) {
          try {
            // Check if vehicle exists
            const [existingVehicles] = await db.execute(
              'SELECT id FROM vehicles WHERE licence_plate = ?',
              [rowData.licence_plate]
            );
            
            if (existingVehicles.length > 0) {
              console.log(`   Vehicle exists: ${rowData.licence_plate}`);
            } else {
              // Create new vehicle
              await db.execute(`
                INSERT INTO vehicles (client_id, fleet_id, licence_plate, make, model, color, company_vehicle_id, service_date, itv_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                clientId,
                fleetId,
                rowData.licence_plate,
                rowData.make,
                rowData.model,
                rowData.color,
                rowData.company_vehicle_id,
                rowData.service_date || null,
                rowData.itv_date || null
              ]);
              
              console.log(`   ✅ Created vehicle: ${rowData.licence_plate}`);
            }
          } catch (error) {
            console.log(`   ⚠️  Vehicle error: ${error.message}`);
          }
        }
        
        importedCount++;
        
        // Progress indicator
        if ((i + 1) % 50 === 0) {
          console.log(`   📊 Progress: ${i + 1}/${dataRows.length} records processed`);
        }
        
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Row ${i + 1} error: ${error.message}`);
      }
    }
    
    // Final summary
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully processed: ${importedCount} records`);
    if (errorCount > 0) {
      console.log(`❌ Errors encountered: ${errorCount} records`);
    }
    
    // Verify import
    console.log('\n🔍 Verifying import...');
    const [fleetCount] = await db.execute('SELECT COUNT(*) as count FROM fleets');
    const [clientCount] = await db.execute('SELECT COUNT(*) as count FROM clients');
    const [vehicleCount] = await db.execute('SELECT COUNT(*) as count FROM vehicles');
    
    console.log('📊 Database Summary:');
    console.log(`   - Fleets: ${fleetCount[0].count}`);
    console.log(`   - Clients: ${clientCount[0].count}`);
    console.log(`   - Vehicles: ${vehicleCount[0].count}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Log into your application (admin/admin123)');
    console.log('2. Check Office > Clients to see your imported data');
    console.log('3. Check Office > Vehicles to see your imported vehicles');
    console.log('4. Check Office > Fleets to see your imported fleet companies');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the import
directImport();
