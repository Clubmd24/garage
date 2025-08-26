-- Add comprehensive HR fields to users table for engineers
-- This will allow storing detailed employee information

-- Add new HR fields to users table (only if they don't exist)
-- Using IF NOT EXISTS pattern for MariaDB compatibility

-- Check and add employee_id column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'employee_id') = 0,
    'ALTER TABLE users ADD COLUMN employee_id VARCHAR(20) UNIQUE',
    'SELECT "employee_id column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add first_name column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'first_name') = 0,
    'ALTER TABLE users ADD COLUMN first_name VARCHAR(100)',
    'SELECT "first_name column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add surname column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'surname') = 0,
    'ALTER TABLE users ADD COLUMN surname VARCHAR(100)',
    'SELECT "surname column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add hourly_rate column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'hourly_rate') = 0,
    'ALTER TABLE users ADD COLUMN hourly_rate DECIMAL(10,2)',
    'SELECT "hourly_rate column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add street_address column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'street_address') = 0,
    'ALTER TABLE users ADD COLUMN street_address TEXT',
    'SELECT "street_address column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add post_code column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'post_code') = 0,
    'ALTER TABLE users ADD COLUMN post_code VARCHAR(20)',
    'SELECT "post_code column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add ni_tie_number column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'ni_tie_number') = 0,
    'ALTER TABLE users ADD COLUMN ni_tie_number VARCHAR(50)',
    'SELECT "ni_tie_number column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add contact_phone column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'contact_phone') = 0,
    'ALTER TABLE users ADD COLUMN contact_phone VARCHAR(20)',
    'SELECT "contact_phone column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add date_of_birth column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'date_of_birth') = 0,
    'ALTER TABLE users ADD COLUMN date_of_birth DATE',
    'SELECT "date_of_birth column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add job_title column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'job_title') = 0,
    'ALTER TABLE users ADD COLUMN job_title VARCHAR(100)',
    'SELECT "job_title column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add department column
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'department') = 0,
    'ALTER TABLE users ADD COLUMN department VARCHAR(100)',
    'SELECT "department column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index on employee_id for quick lookups (only if it doesn't exist)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND INDEX_NAME = 'idx_users_employee_id') = 0,
    'CREATE INDEX idx_users_employee_id ON users(employee_id)',
    'SELECT "index already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Note: Employee ID generation will be handled in the application code
-- to avoid MariaDB compatibility issues with functions and triggers
