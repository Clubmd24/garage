CREATE TABLE IF NOT EXISTS ad360_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  supplier_id INT NOT NULL,
  vehicle_key VARCHAR(128) NOT NULL,   -- e.g. "VIN:WVW...|REG:1234ABC"
  payload JSON NOT NULL,               -- normalized items array
  fetched_at DATETIME NOT NULL,
  UNIQUE KEY uniq_cache (tenant_id, supplier_id, vehicle_key)
); 