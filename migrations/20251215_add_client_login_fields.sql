ALTER TABLE clients
  ADD COLUMN garage_name VARCHAR(255),
  ADD COLUMN vehicle_reg VARCHAR(50),
  ADD COLUMN password_hash VARCHAR(255);
