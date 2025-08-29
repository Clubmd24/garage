#!/usr/bin/env node
import mysql from 'mysql2/promise';

// Database connection string
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function fixFleetsTable() {
  console.log('🔧 Fixing Fleets Table Schema...');
  
  let db;
  
  try {
    // Connect to database
    db = await mysql.createConnection(DB_URL);
    console.log('✅ Connected to database');
    
    // Check current fleets table structure
    console.log('🔍 Checking fleets table structure...');
    const [columns] = await db.execute('SHOW COLUMNS FROM fleets');
    console.log('Current columns:', columns.map(c => c.Field).join(', '));
    
    // Add missing company_name column if it doesn't exist
    const hasCompanyName = columns.some(col => col.Field === 'company_name');
    
    if (!hasCompanyName) {
      console.log('➕ Adding company_name column to fleets table...');
      await db.execute('ALTER TABLE fleets ADD COLUMN company_name VARCHAR(255) AFTER id');
      console.log('✅ company_name column added');
    } else {
      console.log('✅ company_name column already exists');
    }
    
    // Now re-run the fleet import for the company data
    console.log('\n🔄 Re-importing fleet data...');
    
    // Read CSV file again to get fleet data
    const fs = await import('fs/promises');
    const csvContent = await fs.readFile('./import_ready_clients.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      console.log('❌ CSV file is empty or invalid');
      return;
    }
    
    // Parse headers and data
    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);
    
    let fleetCount = 0;
    const processedCompanies = new Set();
    
    for (const row of dataRows) {
      const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowData = {};
      
      // Map values to headers
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      // Only process if company_name exists and hasn't been processed
      if (rowData.company_name && rowData.company_name.trim() && !processedCompanies.has(rowData.company_name)) {
        try {
          // Check if fleet exists
          const [existingFleets] = await db.execute(
            'SELECT id FROM fleets WHERE company_name = ?',
            [rowData.company_name]
          );
          
          if (existingFleets.length === 0) {
            // Create new fleet
            await db.execute(`
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
            
            fleetCount++;
            processedCompanies.add(rowData.company_name);
            console.log(`   ✅ Created fleet: ${rowData.company_name}`);
          }
        } catch (error) {
          console.log(`   ⚠️  Fleet error for ${rowData.company_name}: ${error.message}`);
        }
      }
    }
    
    // Final summary
    console.log('\n🎉 Fleet import completed!');
    console.log(`✅ Created ${fleetCount} fleet companies`);
    
    // Verify final counts
    const [fleetCountFinal] = await db.execute('SELECT COUNT(*) as count FROM fleets');
    const [clientCountFinal] = await db.execute('SELECT COUNT(*) as count FROM clients');
    const [vehicleCountFinal] = await db.execute('SELECT COUNT(*) as count FROM vehicles');
    
    console.log('\n📊 Final Database Summary:');
    console.log(`   - Fleets: ${fleetCountFinal[0].count}`);
    console.log(`   - Clients: ${clientCountFinal[0].count}`);
    console.log(`   - Vehicles: ${vehicleCountFinal[0].count}`);
    
    console.log('\n🎯 Your data migration is now complete!');
    console.log('1. Log into your application (admin/admin123)');
    console.log('2. Check Office > Clients to see your imported data');
    console.log('3. Check Office > Vehicles to see your imported vehicles');
    console.log('4. Check Office > Fleets to see your imported fleet companies');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the fix
fixFleetsTable();
