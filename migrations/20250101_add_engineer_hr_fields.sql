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

-- Create a function to generate unique employee IDs
DELIMITER //
CREATE FUNCTION generate_employee_id() RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE new_id VARCHAR(20);
    DECLARE counter INT DEFAULT 1;
    
    REPEAT
        SET new_id = CONCAT('EMP', LPAD(counter, 6, '0'));
        SET counter = counter + 1;
    UNTIL NOT EXISTS (SELECT 1 FROM users WHERE employee_id = new_id)
    END REPEAT;
    
    RETURN new_id;
END //
DELIMITER ;

-- Create a trigger to auto-generate employee_id for new users
DELIMITER //
CREATE TRIGGER before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.employee_id IS NULL THEN
        SET NEW.employee_id = generate_employee_id();
    END IF;
END //
DELIMITER ;
