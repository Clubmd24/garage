-- Current Database Schema for Garage Vision
-- This represents the clean, working database structure as of January 2025

-- Core Tables
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  surname VARCHAR(255),
  street_address TEXT,
  post_code VARCHAR(20),
  ni_tie_number VARCHAR(50),
  contact_phone VARCHAR(50),
  date_of_birth DATE,
  job_title VARCHAR(255),
  department VARCHAR(255),
  hourly_rate DECIMAL(10,2),
  employee_id VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fleets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  postcode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  mobile VARCHAR(50),
  landline VARCHAR(50),
  nie_number VARCHAR(50),
  street_address TEXT,
  town VARCHAR(255),
  province VARCHAR(255),
  post_code VARCHAR(20),
  garage_name VARCHAR(255),
  fleet_id INT,
  client_type ENUM('fleet', 'local') DEFAULT 'fleet',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (fleet_id) REFERENCES fleets(id)
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  licence_plate VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(100),
  model VARCHAR(100),
  year INT,
  color VARCHAR(50),
  vin VARCHAR(50),
  engine_size VARCHAR(20),
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  mileage INT,
  client_id INT,
  fleet_id INT,
  company_vehicle_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (fleet_id) REFERENCES fleets(id)
);

CREATE TABLE IF NOT EXISTS parts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  part_number VARCHAR(100) UNIQUE,
  description TEXT NOT NULL,
  unit_cost DECIMAL(10,2),
  unit_sale_price DECIMAL(10,2),
  markup_percentage DECIMAL(5,2),
  category_id INT,
  supplier_id INT,
  stock_quantity INT DEFAULT 0,
  min_stock_level INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  postcode VARCHAR(20),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(12,2),
  current_balance DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(100) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  client_id INT,
  vehicle_id INT,
  assigned_engineer_id INT,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  start_date DATE,
  completion_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (assigned_engineer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  client_id INT,
  vehicle_id INT,
  total_amount DECIMAL(12,2),
  status VARCHAR(100) DEFAULT 'draft',
  valid_until DATE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quote_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quote_id INT NOT NULL,
  part_id INT,
  description TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id),
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  quote_id INT,
  client_id INT,
  total_amount DECIMAL(12,2),
  status VARCHAR(100) DEFAULT 'pending',
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Insert essential data
INSERT IGNORE INTO fleets (id, company_name, name) VALUES 
(2, 'LOCAL', 'Local Individual Clients'),
(4, 'LOCAL', 'Local Individual Clients');

INSERT IGNORE INTO users (id, username, email, password_hash, created_at) VALUES 
(1, 'devkieran', 'kieranj1989@sky.com', '$2a$10$OcC.LM2ph63Y1sPlcf3zVOLJGusWbe.9H8k8vO8Ovqw2/jrXtkrZq', '2025-05-18 22:45:55'),
(6, 'pauldev', 'paul.dev@garagevision.app', '$2a$10$DSor.8uXlUqJDbnEpXPFHORjlK//UL/ybDFHtMchFS6Wnqg/vSWbm', '2025-05-20 01:59:36');

-- Update client types based on fleet association
UPDATE clients SET client_type = 'local' WHERE fleet_id = 4 OR fleet_id IS NULL;
UPDATE clients SET client_type = 'fleet' WHERE fleet_id IS NOT NULL AND fleet_id != 4;
