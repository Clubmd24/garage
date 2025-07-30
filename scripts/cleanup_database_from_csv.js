import fs from 'fs';
import csv from 'csv-parser';
import pool from '../lib/db.js';
import bcrypt from 'bcryptjs';

async function cleanupDatabaseFromCSV() {
  try {
    console.log('🧹 Starting database cleanup from clean CSV...\n');
    
    const csvData = [];
    const csvFilePath = './docs/clean_clients_data.csv';
    
    // Read CSV file
    console.log('📖 Reading clean CSV file...');
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Found ${csvData.length} records in clean CSV\n`);
    
    // Create a set of valid licence plates from CSV
    const validLicencePlates = new Set();
    const validClientVehicles = new Map(); // client_id -> Set of licence plates
    
    csvData.forEach(record => {
      if (record.licence_plate) {
        const cleanPlate = record.licence_plate.trim().toUpperCase();
        validLicencePlates.add(cleanPlate);
        
        // Group by client_id for later use
        const clientId = record.client_id;
        if (!validClientVehicles.has(clientId)) {
          validClientVehicles.set(clientId, new Set());
        }
        validClientVehicles.get(clientId).add(cleanPlate);
      }
    });
    
    console.log(`🔍 Found ${validLicencePlates.size} unique licence plates in clean CSV`);
    
    // Get all vehicles from database
    console.log('🔍 Checking database vehicles...');
    const [allVehicles] = await pool.query('SELECT id, licence_plate, customer_id FROM vehicles');
    console.log(`📊 Found ${allVehicles.length} vehicles in database`);
    
    // Find vehicles to remove (not in clean CSV)
    const vehiclesToRemove = allVehicles.filter(vehicle => {
      const cleanPlate = vehicle.licence_plate?.trim().toUpperCase();
      return !validLicencePlates.has(cleanPlate);
    });
    
    console.log(`🗑️  Found ${vehiclesToRemove.length} vehicles to remove`);
    
    // Remove invalid vehicles
    if (vehiclesToRemove.length > 0) {
      const vehicleIds = vehiclesToRemove.map(v => v.id);
      await pool.query('DELETE FROM vehicles WHERE id IN (?)', [vehicleIds]);
      console.log(`✅ Removed ${vehiclesToRemove.length} invalid vehicles`);
    }
    
    // Get all clients from database
    console.log('🔍 Checking database clients...');
    const [allClients] = await pool.query('SELECT id, first_name, mobile FROM clients');
    console.log(`📊 Found ${allClients.length} clients in database`);
    
    // Find clients to remove (those with no valid vehicles)
    const clientsWithValidVehicles = new Set();
    const [remainingVehicles] = await pool.query('SELECT DISTINCT customer_id FROM vehicles WHERE customer_id IS NOT NULL');
    remainingVehicles.forEach(v => clientsWithValidVehicles.add(v.customer_id));
    
    const clientsToRemove = allClients.filter(client => !clientsWithValidVehicles.has(client.id));
    
    console.log(`🗑️  Found ${clientsToRemove.length} clients to remove (no valid vehicles)`);
    
    // Remove invalid clients
    if (clientsToRemove.length > 0) {
      const clientIds = clientsToRemove.map(c => c.id);
      await pool.query('DELETE FROM clients WHERE id IN (?)', [clientIds]);
      console.log(`✅ Removed ${clientsToRemove.length} invalid clients`);
    }
    
    // Now update/insert clean data
    console.log('\n🔄 Updating database with clean data...');
    
    let updatedClients = 0;
    let updatedVehicles = 0;
    let newClients = 0;
    let newVehicles = 0;
    
    for (const record of csvData) {
      try {
        if (!record.licence_plate || !record.first_name) {
          continue;
        }
        
        // Clean and normalize data
        const clientData = {
          first_name: record.first_name?.trim() || '',
          last_name: record.last_name?.trim() || '',
          email: record.email?.trim() || '',
          mobile: record.mobile?.trim() || '',
          landline: record.landline?.trim() || '',
          nie_number: record.nie_number?.trim() || '',
          street_address: record.street_address?.trim() || '',
          town: record.town?.trim() || '',
          province: record.province?.trim() || '',
          post_code: record.post_code?.trim() || '',
          garage_name: record.garage_name?.trim() || 'car fix',
          pin: record.pin?.trim() || '',
        };
        
        const vehicleData = {
          licence_plate: record.licence_plate?.trim().toUpperCase() || '',
          make: record.make?.trim() || '',
          model: record.model?.trim() || '',
          color: record.color?.trim() || '',
          company_vehicle_id: record.company_vehicle_id?.trim() || '',
          fleet_id: record.fleet_id ? parseInt(record.fleet_id) : null,
        };
        
        // Check if client exists (by name and mobile)
        let clientId = null;
        const [existingClients] = await pool.query(
          `SELECT id FROM clients WHERE first_name = ? AND mobile = ?`,
          [clientData.first_name, clientData.mobile]
        );
        
        if (existingClients.length > 0) {
          // Update existing client
          clientId = existingClients[0].id;
          await pool.query(
            `UPDATE clients SET 
               last_name = ?,
               email = ?,
               landline = ?,
               nie_number = ?,
               street_address = ?,
               town = ?,
               province = ?,
               post_code = ?,
               garage_name = ?,
               pin = ?
             WHERE id = ?`,
            [
              clientData.last_name, clientData.email, clientData.landline,
              clientData.nie_number, clientData.street_address, clientData.town,
              clientData.province, clientData.post_code, clientData.garage_name,
              clientData.pin, clientId
            ]
          );
          updatedClients++;
        } else {
          // Create new client
          const hashedPassword = await bcrypt.hash('password123', 10);
          const [result] = await pool.query(
            `INSERT INTO clients 
               (first_name, last_name, email, mobile, landline, nie_number,
                street_address, town, province, post_code, garage_name, pin,
                password_hash, must_change_password)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              clientData.first_name, clientData.last_name, clientData.email,
              clientData.mobile, clientData.landline, clientData.nie_number,
              clientData.street_address, clientData.town, clientData.province,
              clientData.post_code, clientData.garage_name, clientData.pin,
              hashedPassword
            ]
          );
          clientId = result.insertId;
          newClients++;
        }
        
        // Check if vehicle exists (by licence plate)
        const [existingVehicles] = await pool.query(
          `SELECT id FROM vehicles WHERE licence_plate = ?`,
          [vehicleData.licence_plate]
        );
        
        if (existingVehicles.length > 0) {
          // Update existing vehicle
          const vehicleId = existingVehicles[0].id;
          await pool.query(
            `UPDATE vehicles SET 
               make = ?,
               model = ?,
               color = ?,
               company_vehicle_id = ?,
               fleet_id = ?,
               customer_id = ?
             WHERE id = ?`,
            [
              vehicleData.make, vehicleData.model, vehicleData.color,
              vehicleData.company_vehicle_id, vehicleData.fleet_id,
              clientId, vehicleId
            ]
          );
          updatedVehicles++;
        } else {
          // Create new vehicle
          await pool.query(
            `INSERT INTO vehicles 
               (licence_plate, make, model, color, company_vehicle_id, fleet_id, customer_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              vehicleData.licence_plate, vehicleData.make, vehicleData.model,
              vehicleData.color, vehicleData.company_vehicle_id,
              vehicleData.fleet_id, clientId
            ]
          );
          newVehicles++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing record:`, record, error.message);
      }
    }
    
    // Final cleanup: remove any orphaned vehicles
    console.log('\n🧹 Final cleanup: removing orphaned vehicles...');
    const [orphanedVehicles] = await pool.query(
      'DELETE FROM vehicles WHERE customer_id IS NULL OR customer_id NOT IN (SELECT id FROM clients)'
    );
    console.log(`✅ Removed ${orphanedVehicles.affectedRows} orphaned vehicles`);
    
    console.log('\n✅ Database cleanup completed!\n');
    console.log('📈 Summary:');
    console.log(`   Removed vehicles: ${vehiclesToRemove.length}`);
    console.log(`   Removed clients: ${clientsToRemove.length}`);
    console.log(`   Updated clients: ${updatedClients}`);
    console.log(`   Updated vehicles: ${updatedVehicles}`);
    console.log(`   New clients: ${newClients}`);
    console.log(`   New vehicles: ${newVehicles}`);
    console.log(`   Total processed: ${csvData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupDatabaseFromCSV(); 