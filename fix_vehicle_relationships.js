#!/usr/bin/env node
import fs from 'fs/promises';
import mysql from 'mysql2/promise';

// Database connection string
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function fixVehicleRelationships() {
  console.log('🔧 Fixing Vehicle Relationships...');
  
  let db;
  
  try {
    // Connect to database
    db = await mysql.createConnection(DB_URL);
    console.log('✅ Connected to database');
    
    // Read CSV file to get the relationship data
    console.log('📖 Reading CSV file for relationship mapping...');
    const csvContent = await fs.readFile('./import_ready_clients.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      console.log('❌ CSV file is empty or invalid');
      return;
    }
    
    // Parse headers and data
    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);
    
    console.log(`📊 Found ${dataRows.length} data rows to process`);
    
    // First, let's get all existing fleets, clients, and vehicles
    console.log('\n🔍 Getting existing data from database...');
    
    const [fleets] = await db.execute('SELECT id, company_name FROM fleets');
    const [clients] = await db.execute('SELECT id, first_name, last_name FROM clients');
    const [vehicles] = await db.execute('SELECT id, licence_plate FROM vehicles');
    
    console.log(`   - Fleets: ${fleets.length}`);
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Vehicles: ${vehicles.length}`);
    
    // Create lookup maps for faster processing
    const fleetMap = new Map(fleets.map(f => [f.company_name, f.id]));
    const clientMap = new Map(clients.map(c => [`${c.first_name} ${c.last_name}`.trim(), c.id]));
    const vehicleMap = new Map(vehicles.map(v => [v.licence_plate, v.id]));
    
    console.log('\n🔄 Processing relationships...');
    
    let updatedVehicles = 0;
    let updatedClients = 0;
    let errors = 0;
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowData = {};
      
      // Map values to headers
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      try {
        // Get the fleet ID for this row
        const fleetName = rowData.company_name?.trim();
        const fleetId = fleetName ? fleetMap.get(fleetName) : null;
        
        // Get the client ID for this row
        const clientName = `${rowData.first_name} ${rowData.last_name}`.trim();
        const clientId = clientName ? clientMap.get(clientName) : null;
        
        // Get the vehicle ID for this row
        const licencePlate = rowData.licence_plate?.trim();
        const vehicleId = licencePlate ? vehicleMap.get(licencePlate) : null;
        
        if (vehicleId && (fleetId || clientId)) {
          // Update the vehicle with proper relationships
          const updateFields = [];
          const updateValues = [];
          
          if (fleetId) {
            updateFields.push('fleet_id = ?');
            updateValues.push(fleetId);
          }
          
          if (clientId) {
            updateFields.push('client_id = ?');
            updateValues.push(clientId);
          }
          
          if (updateFields.length > 0) {
            updateValues.push(vehicleId);
            
            await db.execute(`
              UPDATE vehicles SET ${updateFields.join(', ')} WHERE id = ?
            `, updateValues);
            
            updatedVehicles++;
            
            // Also update the client with fleet_id if we have both
            if (clientId && fleetId) {
              await db.execute(`
                UPDATE clients SET fleet_id = ? WHERE id = ?
              `, [fleetId, clientId]);
              updatedClients++;
            }
          }
        }
        
        // Progress indicator
        if ((i + 1) % 100 === 0) {
          console.log(`   📊 Progress: ${i + 1}/${dataRows.length} rows processed`);
        }
        
      } catch (error) {
        errors++;
        console.log(`   ❌ Row ${i + 1} error: ${error.message}`);
      }
    }
    
    // Final summary
    console.log('\n🎉 Relationship fix completed!');
    console.log(`✅ Updated ${updatedVehicles} vehicles with relationships`);
    console.log(`✅ Updated ${updatedClients} clients with fleet relationships`);
    if (errors > 0) {
      console.log(`❌ Errors encountered: ${errors}`);
    }
    
    // Verify the relationships
    console.log('\n🔍 Verifying relationships...');
    
    const [vehicleCounts] = await db.execute(`
      SELECT 
        COUNT(*) as total_vehicles,
        COUNT(CASE WHEN client_id IS NOT NULL THEN 1 END) as with_client,
        COUNT(CASE WHEN fleet_id IS NOT NULL THEN 1 END) as with_fleet,
        COUNT(CASE WHEN client_id IS NOT NULL AND fleet_id IS NOT NULL THEN 1 END) as with_both
      FROM vehicles
    `);
    
    const [clientCounts] = await db.execute(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN fleet_id IS NOT NULL THEN 1 END) as with_fleet
      FROM clients
    `);
    
    console.log('\n📊 Relationship Summary:');
    console.log(`   Vehicles: ${vehicleCounts[0].total_vehicles} total`);
    console.log(`     - With client: ${vehicleCounts[0].with_client}`);
    console.log(`     - With fleet: ${vehicleCounts[0].with_fleet}`);
    console.log(`     - With both: ${vehicleCounts[0].with_both}`);
    console.log(`   Clients: ${clientCounts[0].total_clients} total`);
    console.log(`     - With fleet: ${clientCounts[0].with_fleet}`);
    
    // Show some sample relationships
    console.log('\n🔍 Sample Relationships:');
    const [sampleVehicles] = await db.execute(`
      SELECT v.licence_plate, v.make, v.model, 
             c.first_name, c.last_name, f.company_name
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.id
      LEFT JOIN fleets f ON v.fleet_id = f.id
      WHERE v.client_id IS NOT NULL OR v.fleet_id IS NOT NULL
      LIMIT 5
    `);
    
    sampleVehicles.forEach(vehicle => {
      console.log(`\n🚗 ${vehicle.licence_plate} (${vehicle.make} ${vehicle.model})`);
      console.log(`   Client: ${vehicle.first_name || 'N/A'} ${vehicle.last_name || 'N/A'}`);
      console.log(`   Fleet: ${vehicle.company_name || 'N/A'}`);
    });
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Refresh your application pages');
    console.log('2. Check Office > Vehicles to see linked data');
    console.log('3. Check Office > Clients to see fleet associations');
    console.log('4. The data should now display properly with relationships');
    
  } catch (error) {
    console.error('❌ Relationship fix failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the fix
fixVehicleRelationships();
