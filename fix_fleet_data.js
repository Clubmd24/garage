#!/usr/bin/env node
import fs from 'fs/promises';
import mysql from 'mysql2/promise';

// Database connection string
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function fixFleetData() {
  console.log('🔧 Fixing Fleet Data with Complete Information...');
  
  let db;
  
  try {
    // Connect to database
    db = await mysql.createConnection(DB_URL);
    console.log('✅ Connected to database');
    
    // Read CSV file to get fleet data
    console.log('📖 Reading CSV file for fleet information...');
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
    
    // Group data by fleet company_name to get unique fleet information
    const fleetData = new Map();
    
    for (const row of dataRows) {
      const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowData = {};
      
      // Map values to headers
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      // Only process if company_name exists
      if (rowData.company_name && rowData.company_name.trim()) {
        const companyName = rowData.company_name.trim();
        
        if (!fleetData.has(companyName)) {
          // Store the first occurrence of this fleet's data
          fleetData.set(companyName, {
            company_name: companyName,
            garage_name: rowData.garage_name || '',
            fleet_street_address: rowData.fleet_street_address || '',
            contact_number_1: rowData.contact_number_1 || '',
            contact_number_2: rowData.contact_number_2 || '',
            email_1: rowData.email_1 || '',
            email_2: rowData.email_2 || '',
            credit_limit: rowData.credit_limit || null,
            tax_number: rowData.tax_number || '',
            contact_name_1: rowData.contact_name_1 || '',
            contact_name_2: rowData.contact_name_2 || ''
          });
        }
      }
    }
    
    console.log(`🏢 Found ${fleetData.size} unique fleet companies`);
    
    // Update each fleet with complete information
    let updatedCount = 0;
    
    for (const [companyName, fleetInfo] of fleetData) {
      try {
        // Update the existing fleet record
        await db.execute(`
          UPDATE fleets SET
            garage_name = ?,
            street_address = ?,
            contact_number_1 = ?,
            contact_number_2 = ?,
            email_1 = ?,
            email_2 = ?,
            credit_limit = ?,
            tax_number = ?,
            contact_name_1 = ?,
            contact_name_2 = ?
          WHERE company_name = ?
        `, [
          fleetInfo.garage_name,
          fleetInfo.fleet_street_address,
          fleetInfo.contact_number_1,
          fleetInfo.contact_number_2,
          fleetInfo.email_1,
          fleetInfo.email_2,
          fleetInfo.credit_limit,
          fleetInfo.tax_number,
          fleetInfo.contact_name_1,
          fleetInfo.contact_name_2,
          companyName
        ]);
        
        updatedCount++;
        console.log(`   ✅ Updated fleet: ${companyName}`);
        
        // Show what was updated
        if (fleetInfo.garage_name || fleetInfo.fleet_street_address || fleetInfo.contact_number_1) {
          console.log(`      📍 Address: ${fleetInfo.fleet_street_address || 'N/A'}`);
          console.log(`      📞 Phone: ${fleetInfo.contact_number_1 || 'N/A'}`);
          console.log(`      📧 Email: ${fleetInfo.email_1 || 'N/A'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Failed to update fleet ${companyName}: ${error.message}`);
      }
    }
    
    // Final summary
    console.log('\n🎉 Fleet data update completed!');
    console.log(`✅ Updated ${updatedCount} fleet companies with complete information`);
    
    // Verify the updates
    console.log('\n🔍 Verifying fleet data...');
    const [fleets] = await db.execute(`
      SELECT id, company_name, garage_name, street_address, contact_number_1, email_1, tax_number
      FROM fleets 
      ORDER BY company_name
    `);
    
    console.log('\n📊 Updated Fleet Information:');
    fleets.forEach(fleet => {
      console.log(`\n🏢 ${fleet.company_name} (ID: ${fleet.id})`);
      console.log(`   Garage: ${fleet.garage_name || 'N/A'}`);
      console.log(`   Address: ${fleet.street_address || 'N/A'}`);
      console.log(`   Phone: ${fleet.contact_number_1 || 'N/A'}`);
      console.log(`   Email: ${fleet.email_1 || 'N/A'}`);
      console.log(`   Tax: ${fleet.tax_number || 'N/A'}`);
    });
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Refresh your application pages');
    console.log('2. Check Office > Fleets to see complete fleet information');
    console.log('3. The Clients and Vehicles pages should now work properly');
    
  } catch (error) {
    console.error('❌ Fleet data fix failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the fix
fixFleetData();
