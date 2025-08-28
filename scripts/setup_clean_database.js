#!/usr/bin/env node
import mysql from 'mysql2/promise';

// New database connection string
const NEW_DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

// Old database connection (from environment)
const OLD_DB_URL = process.env.DATABASE_URL;

async function setupCleanDatabase() {
  console.log('🚀 Setting up clean database schema...');
  
  let newDb, oldDb;
  
  try {
    // Connect to new database
    newDb = await mysql.createConnection(NEW_DB_URL);
    console.log('✅ Connected to new database');
    
    // Connect to old database if available
    if (OLD_DB_URL) {
      oldDb = await mysql.createConnection(OLD_DB_URL);
      console.log('✅ Connected to old database');
    }
    
    // Create clean schema
    await createCleanSchema(newDb);
    
    // Migrate data if old database is available
    if (oldDb) {
      await migrateData(oldDb, newDb);
    }
    
    console.log('🎉 Clean database setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    if (newDb) await newDb.end();
    if (oldDb) await oldDb.end();
  }
}

async function createCleanSchema(db) {
  console.log('📋 Creating clean database schema...');
  
  const tables = [
    // Core business tables
    `CREATE TABLE IF NOT EXISTS \`clients\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      \`phone\` varchar(50) DEFAULT NULL,
      \`address\` text,
      \`postcode\` varchar(20) DEFAULT NULL,
      \`garage_name\` varchar(255) DEFAULT NULL,
      \`pin\` varchar(10) DEFAULT NULL,
      \`password\` varchar(255) DEFAULT NULL,
      \`password_change_required\` tinyint(1) DEFAULT 0,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_email\` (\`email\`),
      KEY \`idx_garage_name\` (\`garage_name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`vehicles\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`client_id\` int(11) NOT NULL,
      \`license_plate\` varchar(20) NOT NULL,
      \`make\` varchar(100) DEFAULT NULL,
      \`model\` varchar(100) DEFAULT NULL,
      \`year\` int(4) DEFAULT NULL,
      \`vin_number\` varchar(50) DEFAULT NULL,
      \`color\` varchar(50) DEFAULT NULL,
      \`mileage\` int(11) DEFAULT NULL,
      \`service_date\` date DEFAULT NULL,
      \`itv_date\` date DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_client_id\` (\`client_id\`),
      KEY \`idx_license_plate\` (\`license_plate\`),
      KEY \`idx_vin\` (\`vin_number\`),
      CONSTRAINT \`fk_vehicles_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`fleets\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`contact_person\` varchar(255) DEFAULT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      \`phone\` varchar(50) DEFAULT NULL,
      \`address\` text,
      \`postcode\` varchar(20) DEFAULT NULL,
      \`garage_name\` varchar(255) DEFAULT NULL,
      \`pin\` varchar(10) DEFAULT NULL,
      \`password\` varchar(255) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_name\` (\`name\`),
      KEY \`idx_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`fleet_vehicles\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`fleet_id\` int(11) NOT NULL,
      \`vehicle_id\` int(11) NOT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_fleet_vehicle\` (\`fleet_id\`, \`vehicle_id\`),
      CONSTRAINT \`fk_fleet_vehicles_fleet\` FOREIGN KEY (\`fleet_id\`) REFERENCES \`fleets\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_fleet_vehicles_vehicle\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`username\` varchar(100) NOT NULL,
      \`email\` varchar(255) NOT NULL,
      \`password\` varchar(255) NOT NULL,
      \`role\` varchar(50) DEFAULT 'engineer',
      \`first_name\` varchar(100) DEFAULT NULL,
      \`surname\` varchar(100) DEFAULT NULL,
      \`street_address\` text,
      \`post_code\` varchar(20) DEFAULT NULL,
      \`ni_tie_number\` varchar(50) DEFAULT NULL,
      \`contact_phone\` varchar(50) DEFAULT NULL,
      \`date_of_birth\` date DEFAULT NULL,
      \`job_title\` varchar(100) DEFAULT NULL,
      \`department\` varchar(100) DEFAULT NULL,
      \`hourly_rate\` decimal(10,2) DEFAULT NULL,
      \`employee_id\` varchar(50) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_username\` (\`username\`),
      UNIQUE KEY \`uk_email\` (\`email\`),
      UNIQUE KEY \`uk_employee_id\` (\`employee_id\`),
      KEY \`idx_role\` (\`role\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`user_roles\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) NOT NULL,
      \`description\` text,
      \`permissions\` json DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_name\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`job_statuses\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) NOT NULL,
      \`color\` varchar(7) DEFAULT '#000000',
      \`is_active\` tinyint(1) DEFAULT 1,
      \`sort_order\` int(11) DEFAULT 0,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_name\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`jobs\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`client_id\` int(11) NOT NULL,
      \`vehicle_id\` int(11) NOT NULL,
      \`fleet_id\` int(11) DEFAULT NULL,
      \`status_id\` int(11) NOT NULL,
      \`title\` varchar(255) NOT NULL,
      \`description\` text,
      \`defect_description\` text,
      \`customer_reference\` varchar(255) DEFAULT NULL,
      \`purchase_order_number\` varchar(255) DEFAULT NULL,
      \`terms\` text,
      \`bank_details\` text,
      \`created_by\` int(11) DEFAULT NULL,
      \`assigned_to\` int(11) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_client_id\` (\`client_id\`),
      KEY \`idx_vehicle_id\` (\`vehicle_id\`),
      KEY \`idx_fleet_id\` (\`fleet_id\`),
      KEY \`idx_status_id\` (\`status_id\`),
      KEY \`idx_created_by\` (\`created_by\`),
      KEY \`idx_assigned_to\` (\`assigned_to\`),
      CONSTRAINT \`fk_jobs_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_jobs_vehicle\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_jobs_fleet\` FOREIGN KEY (\`fleet_id\`) REFERENCES \`fleets\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_jobs_status\` FOREIGN KEY (\`status_id\`) REFERENCES \`job_statuses\` (\`id\`),
      CONSTRAINT \`fk_jobs_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_jobs_assigned_to\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`job_assignments\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`job_id\` int(11) NOT NULL,
      \`user_id\` int(11) NOT NULL,
      \`assigned_by\` int(11) DEFAULT NULL,
      \`assigned_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`started_at\` timestamp NULL DEFAULT NULL,
      \`finished_at\` timestamp NULL DEFAULT NULL,
      \`notes\` text,
      PRIMARY KEY (\`id\`),
      KEY \`idx_job_id\` (\`job_id\`),
      KEY \`idx_user_id\` (\`user_id\`),
      KEY \`idx_assigned_by\` (\`assigned_by\`),
      CONSTRAINT \`fk_assignments_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_assignments_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_assignments_assigned_by\` FOREIGN KEY (\`assigned_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`job_work_logs\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`job_id\` int(11) NOT NULL,
      \`user_id\` int(11) NOT NULL,
      \`action\` varchar(100) NOT NULL,
      \`details\` text,
      \`timestamp\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_job_id\` (\`job_id\`),
      KEY \`idx_user_id\` (\`user_id\`),
      KEY \`idx_timestamp\` (\`timestamp\`),
      CONSTRAINT \`fk_work_logs_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_work_logs_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`quotes\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`client_id\` int(11) NOT NULL,
      \`vehicle_id\` int(11) NOT NULL,
      \`fleet_id\` int(11) DEFAULT NULL,
      \`job_id\` int(11) DEFAULT NULL,
      \`reference\` varchar(255) DEFAULT NULL,
      \`revision\` int(11) DEFAULT 1,
      \`status\` enum('draft','sent','accepted','rejected','expired') DEFAULT 'draft',
      \`total_amount\` decimal(10,2) DEFAULT 0.00,
      \`terms\` text,
      \`bank_details\` text,
      \`valid_until\` date DEFAULT NULL,
      \`created_by\` int(11) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_client_id\` (\`client_id\`),
      KEY \`idx_vehicle_id\` (\`vehicle_id\`),
      KEY \`idx_fleet_id\` (\`fleet_id\`),
      KEY \`idx_job_id\` (\`job_id\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_created_by\` (\`created_by\`),
      CONSTRAINT \`fk_quotes_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_quotes_vehicle\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_quotes_fleet\` FOREIGN KEY (\`fleet_id\`) REFERENCES \`fleets\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_quotes_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_quotes_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`quote_items\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`quote_id\` int(11) NOT NULL,
      \`part_id\` int(11) DEFAULT NULL,
      \`description\` varchar(500) NOT NULL,
      \`part_number\` varchar(100) DEFAULT NULL,
      \`quantity\` decimal(10,2) DEFAULT 1.00,
      \`unit_cost\` decimal(10,2) DEFAULT 0.00,
      \`unit_price\` decimal(10,2) DEFAULT 0.00,
      \`markup_percentage\` decimal(5,2) DEFAULT 0.00,
      \`line_total\` decimal(10,2) DEFAULT 0.00,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_quote_id\` (\`quote_id\`),
      KEY \`idx_part_id\` (\`part_id\`),
      CONSTRAINT \`fk_quote_items_quote\` FOREIGN KEY (\`quote_id\`) REFERENCES \`quotes\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_quote_items_part\` FOREIGN KEY (\`part_id\`) REFERENCES \`parts\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`invoices\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`quote_id\` int(11) DEFAULT NULL,
      \`job_id\` int(11) DEFAULT NULL,
      \`client_id\` int(11) NOT NULL,
      \`vehicle_id\` int(11) NOT NULL,
      \`fleet_id\` int(11) DEFAULT NULL,
      \`invoice_number\` varchar(255) NOT NULL,
      \`status\` enum('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
      \`total_amount\` decimal(10,2) DEFAULT 0.00,
      \`terms\` text,
      \`bank_details\` text,
      \`due_date\` date DEFAULT NULL,
      \`paid_date\` date DEFAULT NULL,
      \`created_by\` int(11) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_invoice_number\` (\`invoice_number\`),
      KEY \`idx_quote_id\` (\`quote_id\`),
      KEY \`idx_job_id\` (\`job_id\`),
      KEY \`idx_client_id\` (\`client_id\`),
      KEY \`idx_vehicle_id\` (\`vehicle_id\`),
      KEY \`idx_fleet_id\` (\`fleet_id\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_created_by\` (\`created_by\`),
      CONSTRAINT \`fk_invoices_quote\` FOREIGN KEY (\`quote_id\`) REFERENCES \`quotes\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_invoices_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_invoices_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_invoices_vehicle\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_invoices_fleet\` FOREIGN KEY (\`fleet_id\`) REFERENCES \`fleets\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_invoices_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`invoice_items\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`invoice_id\` int(11) NOT NULL,
      \`description\` varchar(500) NOT NULL,
      \`part_number\` varchar(100) DEFAULT NULL,
      \`quantity\` decimal(10,2) DEFAULT 1.00,
      \`unit_price\` decimal(10,2) DEFAULT 0.00,
      \`line_total\` decimal(10,2) DEFAULT 0.00,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_invoice_id\` (\`invoice_id\`),
      CONSTRAINT \`fk_invoice_items_invoice\` FOREIGN KEY (\`invoice_id\`) REFERENCES \`invoices\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`invoice_statuses\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) NOT NULL,
      \`color\` varchar(7) DEFAULT '#000000',
      \`is_active\` tinyint(1) DEFAULT 1,
      \`sort_order\` int(11) DEFAULT 0,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_name\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`parts\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`part_number\` varchar(100) DEFAULT NULL,
      \`description\` text,
      \`category_id\` int(11) DEFAULT NULL,
      \`supplier_id\` int(11) DEFAULT NULL,
      \`unit_cost\` decimal(10,2) DEFAULT 0.00,
      \`unit_price\` decimal(10,2) DEFAULT 0.00,
      \`markup_percentage\` decimal(5,2) DEFAULT 0.00,
      \`stock_level\` int(11) DEFAULT 0,
      \`min_stock_level\` int(11) DEFAULT 0,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_part_number\` (\`part_number\`),
      KEY \`idx_category_id\` (\`category_id\`),
      KEY \`idx_supplier_id\` (\`supplier_id\`),
      KEY \`idx_name\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`part_categories\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) NOT NULL,
      \`description\` text,
      \`parent_id\` int(11) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_name\` (\`name\`),
      KEY \`idx_parent_id\` (\`parent_id\`),
      CONSTRAINT \`fk_categories_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`part_categories\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`suppliers\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`contact_person\` varchar(255) DEFAULT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      \`phone\` varchar(50) DEFAULT NULL,
      \`address\` text,
      \`postcode\` varchar(20) DEFAULT NULL,
      \`base_url\` varchar(500) DEFAULT NULL,
      \`credit_limit\` decimal(12,2) DEFAULT 0.00,
      \`current_credit_balance\` decimal(12,2) DEFAULT 0.00,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_name\` (\`name\`),
      KEY \`idx_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`purchase_orders\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`supplier_id\` int(11) NOT NULL,
      \`job_id\` int(11) DEFAULT NULL,
      \`reference\` varchar(255) DEFAULT NULL,
      \`status\` enum('draft','sent','confirmed','received','cancelled') DEFAULT 'draft',
      \`total_amount\` decimal(10,2) DEFAULT 0.00,
      \`notes\` text,
      \`created_by\` int(11) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_supplier_id\` (\`supplier_id\`),
      KEY \`idx_job_id\` (\`job_id\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_created_by\` (\`created_by\`),
      CONSTRAINT \`fk_purchase_orders_supplier\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_purchase_orders_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_purchase_orders_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`purchase_order_items\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`purchase_order_id\` int(11) NOT NULL,
      \`part_id\` int(11) DEFAULT NULL,
      \`description\` varchar(500) NOT NULL,
      \`part_number\` varchar(100) DEFAULT NULL,
      \`quantity\` decimal(10,2) DEFAULT 1.00,
      \`unit_price\` decimal(10,2) DEFAULT 0.00,
      \`line_total\` decimal(10,2) DEFAULT 0.00,
      \`received_quantity\` decimal(10,2) DEFAULT 0.00,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_purchase_order_id\` (\`purchase_order_id\`),
      KEY \`idx_part_id\` (\`part_id\`),
      CONSTRAINT \`fk_po_items_po\` FOREIGN KEY (\`purchase_order_id\`) REFERENCES \`purchase_orders\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_po_items_part\` FOREIGN KEY (\`part_id\`) REFERENCES \`parts\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`time_entries\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`user_id\` int(11) NOT NULL,
      \`job_id\` int(11) NOT NULL,
      \`start_time\` timestamp NOT NULL,
      \`end_time\` timestamp NULL DEFAULT NULL,
      \`duration_minutes\` int(11) DEFAULT NULL,
      \`notes\` text,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_user_id\` (\`user_id\`),
      KEY \`idx_job_id\` (\`job_id\`),
      KEY \`idx_start_time\` (\`start_time\`),
      CONSTRAINT \`fk_time_entries_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_time_entries_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`company_settings\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`setting_key\` varchar(100) NOT NULL,
      \`setting_value\` text,
      \`description\` text,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_setting_key\` (\`setting_key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`smtp_settings\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`host\` varchar(255) NOT NULL,
      \`port\` int(11) NOT NULL,
      \`username\` varchar(255) DEFAULT NULL,
      \`password\` varchar(255) DEFAULT NULL,
      \`encryption\` enum('none','ssl','tls') DEFAULT 'none',
      \`from_email\` varchar(255) NOT NULL,
      \`from_name\` varchar(255) DEFAULT NULL,
      \`is_active\` tinyint(1) DEFAULT 1,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`email_templates\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`subject\` varchar(500) NOT NULL,
      \`body\` longtext NOT NULL,
      \`variables\` json DEFAULT NULL,
      \`is_active\` tinyint(1) DEFAULT 1,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_name\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`follow_up_reminders\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`client_id\` int(11) DEFAULT NULL,
      \`fleet_id\` int(11) DEFAULT NULL,
      \`type\` enum('quote','invoice','service') NOT NULL,
      \`reference_id\` int(11) DEFAULT NULL,
      \`due_date\` date NOT NULL,
      \`status\` enum('pending','sent','completed','cancelled') DEFAULT 'pending',
      \`notes\` text,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_client_id\` (\`client_id\`),
      KEY \`idx_fleet_id\` (\`fleet_id\`),
      KEY \`idx_type\` (\`type\`),
      KEY \`idx_due_date\` (\`due_date\`),
      KEY \`idx_status\` (\`status\`),
      CONSTRAINT \`fk_reminders_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_reminders_fleet\` FOREIGN KEY (\`fleet_id\`) REFERENCES \`fleets\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`vehicle_condition_reports\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`vehicle_id\` int(11) NOT NULL,
      \`job_id\` int(11) DEFAULT NULL,
      \`condition_details\` text,
      \`photos\` json DEFAULT NULL,
      \`created_by\` int(11) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_vehicle_id\` (\`vehicle_id\`),
      KEY \`idx_job_id\` (\`job_id\`),
      KEY \`idx_created_by\` (\`created_by\`),
      CONSTRAINT \`fk_condition_reports_vehicle\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_condition_reports_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_condition_reports_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`vehicle_mileage\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`vehicle_id\` int(11) NOT NULL,
      \`mileage\` int(11) NOT NULL,
      \`date_recorded\` date NOT NULL,
      \`notes\` text,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_vehicle_id\` (\`vehicle_id\`),
      KEY \`idx_date_recorded\` (\`date_recorded\`),
      CONSTRAINT \`fk_mileage_vehicle\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`payments\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`invoice_id\` int(11) NOT NULL,
      \`amount\` decimal(10,2) NOT NULL,
      \`payment_method\` varchar(100) DEFAULT NULL,
      \`reference\` varchar(255) DEFAULT NULL,
      \`notes\` text,
      \`payment_date\` date NOT NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_invoice_id\` (\`invoice_id\`),
      KEY \`idx_payment_date\` (\`payment_date\`),
      CONSTRAINT \`fk_payments_invoice\` FOREIGN KEY (\`invoice_id\`) REFERENCES \`invoices\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    
    `CREATE TABLE IF NOT EXISTS \`job_requests\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`client_id\` int(11) DEFAULT NULL,
      \`fleet_id\` int(11) DEFAULT NULL,
      \`vehicle_id\` int(11) DEFAULT NULL,
      \`description\` text NOT NULL,
      \`priority\` enum('low','medium','high','urgent') DEFAULT 'medium',
      \`status\` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
      \`requested_by\` varchar(255) DEFAULT NULL,
      \`requested_date\` date NOT NULL,
      \`approved_by\` int(11) DEFAULT NULL,
      \`approved_date\` date DEFAULT NULL,
      \`notes\` text,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_client_id\` (\`client_id\`),
      KEY \`idx_fleet_id\` (\`fleet_id\`),
      KEY \`idx_vehicle_id\` (\`vehicle_id\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_priority\` (\`priority\`),
      KEY \`idx_approved_by\` (\`approved_by\`),
      CONSTRAINT \`fk_job_requests_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_job_requests_fleet\` FOREIGN KEY (\`fleet_id\`) REFERENCES \`fleets\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_job_requests_vehicle\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_job_requests_approved_by\` FOREIGN KEY (\`approved_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];
  
  for (const table of tables) {
    try {
      await db.execute(table);
      console.log('✅ Table created successfully');
    } catch (error) {
      console.log('⚠️  Table creation warning:', error.message);
    }
  }
  
  // Insert default data
  await insertDefaultData(db);
  
  console.log('✅ Clean database schema created successfully!');
}

async function insertDefaultData(db) {
  console.log('📝 Inserting default data...');
  
  try {
    // Insert default job statuses
    await db.execute(`
      INSERT IGNORE INTO \`job_statuses\` (\`name\`, \`color\`, \`sort_order\`) VALUES
      ('New', '#007bff', 1),
      ('In Progress', '#ffc107', 2),
      ('Awaiting Parts', '#fd7e14', 3),
      ('Awaiting Customer', '#6f42c1', 4),
      ('Completed', '#28a745', 5),
      ('Cancelled', '#dc3545', 6)
    `);
    
    // Insert default invoice statuses
    await db.execute(`
      INSERT IGNORE INTO \`invoice_statuses\` (\`name\`, \`color\`, \`sort_order\`) VALUES
      ('Draft', '#6c757d', 1),
      ('Sent', '#007bff', 2),
      ('Paid', '#28a745', 3),
      ('Overdue', '#dc3545', 4),
      ('Cancelled', '#6c757d', 5)
    `);
    
    // Insert default part categories
    await db.execute(`
      INSERT IGNORE INTO \`part_categories\` (\`name\`, \`description\`) VALUES
      ('Engine Parts', 'Engine components and accessories'),
      ('Brake System', 'Brake pads, discs, and related parts'),
      ('Suspension', 'Shocks, springs, and suspension components'),
      ('Electrical', 'Batteries, alternators, and electrical parts'),
      ('Body & Interior', 'Body panels, trim, and interior components'),
      ('General', 'General automotive parts and supplies')
    `);
    
    // Insert default user roles
    await db.execute(`
      INSERT IGNORE INTO \`user_roles\` (\`name\`, \`description\`) VALUES
      ('admin', 'Full system access'),
      ('manager', 'Management and oversight'),
      ('engineer', 'Job execution and time tracking'),
      ('office', 'Office and administrative tasks')
    `);
    
    console.log('✅ Default data inserted successfully!');
  } catch (error) {
    console.log('⚠️  Default data insertion warning:', error.message);
  }
}

async function migrateData(oldDb, newDb) {
  console.log('🔄 Migrating data from old database...');
  
  try {
    // Migrate clients
    await migrateTable(oldDb, newDb, 'clients', 'clients');
    
    // Migrate vehicles
    await migrateTable(oldDb, newDb, 'vehicles', 'vehicles');
    
    // Migrate fleets
    await migrateTable(oldDb, newDb, 'fleets', 'fleets');
    
    // Migrate users
    await migrateTable(oldDb, newDb, 'users', 'users');
    
    // Migrate parts
    await migrateTable(oldDb, newDb, 'parts', 'parts');
    
    // Migrate part categories
    await migrateTable(oldDb, newDb, 'part_categories', 'part_categories');
    
    // Migrate suppliers
    await migrateTable(oldDb, newDb, 'suppliers', 'suppliers');
    
    // Migrate jobs
    await migrateTable(oldDb, newDb, 'jobs', 'jobs');
    
    // Migrate quotes
    await migrateTable(oldDb, newDb, 'quotes', 'quotes');
    
    // Migrate invoices
    await migrateTable(oldDb, newDb, 'invoices', 'invoices');
    
    console.log('✅ Data migration completed successfully!');
    
  } catch (error) {
    console.log('⚠️  Data migration warning:', error.message);
  }
}

async function migrateTable(oldDb, newDb, oldTableName, newTableName) {
  try {
    const [rows] = await oldDb.execute(`SELECT * FROM \`${oldTableName}\``);
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
    }
  } catch (error) {
    console.log(`⚠️  Migration warning for ${oldTableName}:`, error.message);
  }
}

// Run the setup
setupCleanDatabase();
