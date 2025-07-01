ALTER TABLE fleets
  ADD COLUMN street_address TEXT,
  ADD COLUMN contact_number_1 VARCHAR(50),
  ADD COLUMN contact_number_2 VARCHAR(50),
  ADD COLUMN email_1 VARCHAR(255),
  ADD COLUMN email_2 VARCHAR(255),
  ADD COLUMN credit_limit DECIMAL(10,2),
  ADD COLUMN tax_number VARCHAR(100),
  ADD COLUMN contact_name_1 VARCHAR(255),
  ADD COLUMN contact_name_2 VARCHAR(255);
