-- Add base_url field to suppliers table
ALTER TABLE suppliers ADD COLUMN base_url VARCHAR(255) AFTER name;

-- Seed AD360 supplier
INSERT INTO suppliers (id, name, base_url) 
VALUES (7, 'AD360', 'https://connect.ad360.es')
ON DUPLICATE KEY UPDATE name=VALUES(name), base_url=VALUES(base_url); 