import fs from 'fs';
import csv from 'csv-parser';
import pool from '../lib/db.js';
import bcrypt from 'bcryptjs';

async function importClientVehicleData() {
  try {
    console.log('🚀 Starting client/vehicle data import...\n');
    
    const csvData = [];
    const csvFilePath = './docs/MasterJobCards_Table eddited to remove nul.xlsx - Sheet1.csv';
    
    // Read CSV file
    console.log('📖 Reading CSV file...');
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Found ${csvData.length} records in CSV\n`);
    
    // Process each record
    let updatedClients = 0;
    let updatedVehicles = 0;
    let newClients = 0;
    let newVehicles = 0;
    let skippedRecords = 0;
    
    for (const record of csvData) {
      try {
        // Skip records without essential data
        if (!record.licence_plate || !record['Customer Name']) {
          skippedRecords++;
          continue;
        }
        
        // Clean and normalize data
        const clientData = {
          first_name: record['Customer Name']?.trim() || '',
          mobile: record['Customer Mobile']?.trim() || '',
          garage_name: record.company_name?.trim() || 'car fix',
        };
        
        const vehicleData = {
          licence_plate: record.licence_plate?.trim().toUpperCase() || '',
          make: record['Car Make']?.trim() || '',
          model: record['Car Model']?.trim() || '',
          vin_number: record['Car VIN']?.trim() || '',
          // Parse year if available
          year: record.Year ? parseInt(record.Year) : null,
          // Parse mileage if available
          mileage: record.Mileage ? parseInt(record.Mileage.replace(/[^\d]/g, '')) : null,
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
               garage_name = ?,
               mobile = ?
             WHERE id = ?`,
            [clientData.garage_name, clientData.mobile, clientId]
          );
          updatedClients++;
        } else {
          // Create new client
          const hashedPassword = await bcrypt.hash('password123', 10);
          const [result] = await pool.query(
            `INSERT INTO clients 
               (first_name, mobile, garage_name, password_hash, must_change_password)
             VALUES (?, ?, ?, ?, 1)`,
            [clientData.first_name, clientData.mobile, clientData.garage_name, hashedPassword]
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
               vin_number = ?,
               customer_id = ?
             WHERE id = ?`,
            [vehicleData.make, vehicleData.model, vehicleData.vin_number, clientId, vehicleId]
          );
          updatedVehicles++;
        } else {
          // Create new vehicle
          await pool.query(
            `INSERT INTO vehicles 
               (licence_plate, make, model, vin_number, customer_id)
             VALUES (?, ?, ?, ?, ?)`,
            [vehicleData.licence_plate, vehicleData.make, vehicleData.model, vehicleData.vin_number, clientId]
          );
          newVehicles++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing record:`, record, error.message);
        skippedRecords++;
      }
    }
    
    console.log('✅ Import completed!\n');
    console.log('📈 Summary:');
    console.log(`   Updated clients: ${updatedClients}`);
    console.log(`   Updated vehicles: ${updatedVehicles}`);
    console.log(`   New clients: ${newClients}`);
    console.log(`   New vehicles: ${newVehicles}`);
    console.log(`   Skipped records: ${skippedRecords}`);
    console.log(`   Total processed: ${csvData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importClientVehicleData(); 