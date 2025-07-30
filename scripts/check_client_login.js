import pool from '../lib/db.js';
import bcrypt from 'bcryptjs';

async function checkClientLogin() {
  try {
    console.log('🔍 Checking client login setup...\n');
    
    // Get all clients with their vehicles
    const [clients] = await pool.query(`
      SELECT 
        c.id as client_id,
        c.garage_name,
        c.password_hash,
        c.must_change_password,
        v.id as vehicle_id,
        v.licence_plate
      FROM clients c
      LEFT JOIN vehicles v ON v.customer_id = c.id
      ORDER BY c.id, v.id
    `);
    
    console.log(`📊 Found ${clients.length} client-vehicle combinations\n`);
    
    // Group by client
    const clientMap = new Map();
    clients.forEach(row => {
      if (!clientMap.has(row.client_id)) {
        clientMap.set(row.client_id, {
          id: row.client_id,
          garage_name: row.garage_name,
          password_hash: row.password_hash,
          must_change_password: row.must_change_password,
          vehicles: []
        });
      }
      if (row.vehicle_id) {
        clientMap.get(row.client_id).vehicles.push({
          id: row.vehicle_id,
          licence_plate: row.licence_plate
        });
      }
    });
    
    console.log('👥 Client Login Information:');
    console.log('================================\n');
    
    for (const [clientId, client] of clientMap) {
      console.log(`🏢 Client ID: ${client.id}`);
      console.log(`   Garage Name: "${client.garage_name}"`);
      console.log(`   Has Password: ${client.password_hash ? '✅ Yes' : '❌ No'}`);
      console.log(`   Must Change Password: ${client.must_change_password ? '✅ Yes' : '❌ No'}`);
      
      if (client.vehicles.length > 0) {
        console.log(`   🚗 Vehicles:`);
        client.vehicles.forEach(vehicle => {
          console.log(`      - ${vehicle.licence_plate} (ID: ${vehicle.id})`);
        });
      } else {
        console.log(`   🚗 Vehicles: None`);
      }
      
      // Test login with default password
      if (client.password_hash) {
        const defaultPassword = 'password123';
        const isValid = await bcrypt.compare(defaultPassword, client.password_hash);
        console.log(`   🔑 Default Password Test: ${isValid ? '✅ Works' : '❌ Fails'}`);
      }
      
      console.log('');
    }
    
    console.log('💡 Login Instructions:');
    console.log('======================');
    console.log('1. Use the Garage Name exactly as shown above');
    console.log('2. Use any Vehicle Registration from the client\'s vehicles');
    console.log('3. Use password: password123');
    console.log('4. If login fails, check that the garage name and vehicle registration match exactly');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking client login:', error);
    process.exit(1);
  }
}

checkClientLogin(); 