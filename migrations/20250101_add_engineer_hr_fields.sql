-- Add comprehensive HR fields to users table for engineers
-- This will allow storing detailed employee information

-- Add new HR fields to users table
ALTER TABLE users ADD COLUMN employee_id VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN surname VARCHAR(100);
ALTER TABLE users ADD COLUMN hourly_rate DECIMAL(10,2);
ALTER TABLE users ADD COLUMN street_address TEXT;
ALTER TABLE users ADD COLUMN post_code VARCHAR(20);
ALTER TABLE users ADD COLUMN ni_tie_number VARCHAR(50);
ALTER TABLE users ADD COLUMN contact_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN date_of_birth DATE;
ALTER TABLE users ADD COLUMN job_title VARCHAR(100);
ALTER TABLE users ADD COLUMN department VARCHAR(100);

-- Create index on employee_id for quick lookups
CREATE INDEX idx_users_employee_id ON users(employee_id);

-- Note: Employee ID generation will be handled in the application code
-- to avoid MariaDB compatibility issues with functions and triggers
