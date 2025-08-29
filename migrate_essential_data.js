#!/usr/bin/env node
import mysql from 'mysql2/promise';

// Database connection strings
const OLD_DB_URL = 'mysql://o440rstxpdvnykf9:liqa0rgjlw3m7xdy@p2d0untihotgr5f6.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/qhfjj26d1hhuo6jm';
const NEW_DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function migrateEssentialData() {
  console.log('🚀 Migrating essential data from old to new database...');
  
  let oldDb, newDb;
  
  try {
    // Connect to both databases
    oldDb = await mysql.createConnection(OLD_DB_URL);
    console.log('✅ Connected to old database');
    
    newDb = await mysql.createConnection(NEW_DB_URL);
    console.log('✅ Connected to new database');
    
    // Migrate users (excluding the admin we just created)
    await migrateTable(oldDb, newDb, 'users', 'users', 'id != 1');
    
    // Migrate clients
    await migrateTable(oldDb, newDb, 'clients', 'clients');
    
    // Migrate vehicles
    await migrateTable(oldDb, newDb, 'vehicles', 'vehicles');
    
    // Migrate fleets
    await migrateTable(oldDb, newDb, 'fleets', 'fleets');
    
    // Migrate parts
    await migrateTable(oldDb, newDb, 'parts', 'parts');
    
    // Migrate suppliers
    await migrateTable(oldDb, newDb, 'suppliers', 'suppliers');
    
    // Migrate jobs
    await migrateTable(oldDb, newDb, 'jobs', 'jobs');
    
    // Migrate quotes
    await migrateTable(oldDb, newDb, 'quotes', 'quotes');
    
    // Migrate invoices
    await migrateTable(oldDb, newDb, 'invoices', 'invoices');
    
    console.log('✅ Essential data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (oldDb) await oldDb.end();
    if (newDb) await newDb.end();
  }
}

async function migrateTable(oldDb, newDb, oldTableName, newTableName, whereClause = '') {
  try {
    const whereSQL = whereClause ? `WHERE ${whereClause}` : '';
    const [rows] = await oldDb.execute(`SELECT * FROM \`${oldTableName}\` ${whereSQL}`);
    
    if (rows.length > 0) {
      console.log(`📦 Migrating ${rows.length} rows from ${oldTableName} to ${newTableName}`);
      
      for (const row of rows) {
        const columns = Object.keys(row).filter(key => key !== 'id');
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(col => row[col]);
        
        const insertSql = `INSERT INTO \`${newTableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;
        await newDb.execute(insertSql, values);
      }
      
      console.log(`✅ ${oldTableName} migration completed`);
    } else {
      console.log(`ℹ️  No data to migrate from ${oldTableName}`);
    }
  } catch (error) {
    console.log(`⚠️  Migration warning for ${oldTableName}:`, error.message);
  }
}

// Run the migration
migrateEssentialData();
